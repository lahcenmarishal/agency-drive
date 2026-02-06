import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAgencyFilter } from "./useAgencyFilter";
import { toast } from "sonner";
import { isAfter, addDays } from "date-fns";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Driver = Tables<"drivers">;
export type DriverInsert = TablesInsert<"drivers">;
export type DriverUpdate = TablesUpdate<"drivers">;

export function useDrivers() {
  const { filterByAgency, filterByAgencies, isSuperAdmin, agencyId } = useAgencyFilter();

  return useQuery({
    queryKey: ["drivers", filterByAgency, filterByAgencies],
    queryFn: async () => {
      let query = supabase
        .from("drivers")
        .select("*, agencies(name)")
        .order("created_at", { ascending: false });

      if (filterByAgency) {
        query = query.eq("agency_id", filterByAgency);
      } else if (filterByAgencies && filterByAgencies.length > 0) {
        query = query.in("agency_id", filterByAgencies);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: isSuperAdmin || (filterByAgencies && filterByAgencies.length > 0) || !!agencyId,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();
  const { agencyId } = useAgencyFilter();

  return useMutation({
    mutationFn: async (driver: Omit<DriverInsert, "agency_id">) => {
      if (!agencyId) throw new Error("Agency ID not found");

      const { data, error } = await supabase
        .from("drivers")
        .insert({ ...driver, agency_id: agencyId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Chauffeur ajouté avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ajout du chauffeur");
      console.error(error);
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: DriverUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("drivers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Chauffeur mis à jour avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("drivers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Chauffeur supprimé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    },
  });
}

export function useToggleDriverStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from("drivers")
        .update({ is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success(data.is_active ? "Chauffeur activé" : "Chauffeur désactivé");
    },
    onError: (error) => {
      toast.error("Erreur lors du changement de statut");
      console.error(error);
    },
  });
}

export function useDriverLicenseAlerts() {
  const { data: drivers } = useDrivers();

  const alerts = drivers?.filter((driver) => {
    if (!driver.license_expiry) return false;
    const expiryDate = new Date(driver.license_expiry);
    const warningDate = addDays(new Date(), 30);
    return isAfter(warningDate, expiryDate);
  });

  return alerts || [];
}
