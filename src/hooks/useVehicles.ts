import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAgencyFilter } from "./useAgencyFilter";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Vehicle = Tables<"vehicles">;
export type VehicleInsert = TablesInsert<"vehicles">;
export type VehicleUpdate = TablesUpdate<"vehicles">;

import { Enums } from "@/integrations/supabase/types";

export type VehicleStatus = Enums<"vehicle_status">;

export function useVehicles(statusFilter?: VehicleStatus | "all") {
  const { filterByAgency, filterByAgencies, isSuperAdmin, agencyId } = useAgencyFilter();

  return useQuery({
    queryKey: ["vehicles", filterByAgency, filterByAgencies, statusFilter],
    queryFn: async () => {
      let query = supabase.from("vehicles").select("*");
      
      // Apply agency filtering
      if (filterByAgency) {
        query = query.eq("agency_id", filterByAgency);
      } else if (filterByAgencies && filterByAgencies.length > 0) {
        query = query.in("agency_id", filterByAgencies);
      }
      
      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter as VehicleStatus);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Vehicle[];
    },
    enabled: isSuperAdmin || (filterByAgencies && filterByAgencies.length > 0) || !!agencyId,
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as Vehicle;
    },
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  const { agencyId } = useAgencyFilter();

  return useMutation({
    mutationFn: async (vehicle: Omit<VehicleInsert, "agency_id">) => {
      if (!agencyId) throw new Error("Agency ID required");
      
      const { data, error } = await supabase
        .from("vehicles")
        .insert({ ...vehicle, agency_id: agencyId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Véhicule ajouté avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ajout du véhicule");
      console.error(error);
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...vehicle }: VehicleUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("vehicles")
        .update(vehicle)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Véhicule mis à jour avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Véhicule supprimé");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    },
  });
}

// Hook pour les alertes d'expiration de documents
export function useVehicleDocumentAlerts() {
  const { filterByAgency, filterByAgencies, isSuperAdmin, agencyId } = useAgencyFilter();

  return useQuery({
    queryKey: ["vehicle-document-alerts", filterByAgency, filterByAgencies],
    queryFn: async () => {
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      let query = supabase.from("vehicles").select("*");
      
      if (filterByAgency) {
        query = query.eq("agency_id", filterByAgency);
      } else if (filterByAgencies && filterByAgencies.length > 0) {
        query = query.in("agency_id", filterByAgencies);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const alerts: Array<{
        vehicleId: string;
        vehicleName: string;
        documentType: string;
        expiryDate: string;
        daysRemaining: number;
        isExpired: boolean;
      }> = [];
      
      data?.forEach((vehicle) => {
        const checkDocument = (date: string | null, type: string) => {
          if (!date) return;
          const expiry = new Date(date);
          const daysRemaining = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysRemaining <= 30) {
            alerts.push({
              vehicleId: vehicle.id,
              vehicleName: `${vehicle.brand} ${vehicle.model}`,
              documentType: type,
              expiryDate: date,
              daysRemaining,
              isExpired: daysRemaining < 0,
            });
          }
        };
        
        checkDocument(vehicle.insurance_expiry, "Assurance");
        checkDocument(vehicle.registration_card_expiry, "Carte grise");
        checkDocument(vehicle.technical_visit_expiry, "Visite technique");
      });
      
      return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
    },
    enabled: isSuperAdmin || (filterByAgencies && filterByAgencies.length > 0) || !!agencyId,
  });
}
