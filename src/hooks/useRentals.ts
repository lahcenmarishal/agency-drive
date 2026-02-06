import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAgencyFilter } from "./useAgencyFilter";
import { Tables, TablesInsert, TablesUpdate, Enums } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Rental = Tables<"rentals"> & {
  clients?: { full_name: string } | null;
  vehicles?: { brand: string; model: string; registration: string } | null;
};
export type RentalInsert = TablesInsert<"rentals">;
export type RentalUpdate = TablesUpdate<"rentals">;

export function useRentals(statusFilter?: Enums<"rental_status">) {
  const { filterByAgency, isAdmin, agencyId } = useAgencyFilter();

  return useQuery({
    queryKey: ["rentals", filterByAgency, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("rentals")
        .select(`
          *,
          clients (full_name),
          vehicles (brand, model, registration)
        `);
      
      if (filterByAgency) {
        query = query.eq("agency_id", filterByAgency);
      }
      
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Vérifier les retards et mettre à jour le statut si nécessaire
      const today = new Date();
      const rentalsWithDelay = data?.map((rental) => {
        const endDate = new Date(rental.end_date);
        const isOverdue = rental.status === "active" && endDate < today;
        return {
          ...rental,
          isOverdue,
        };
      });
      
      return rentalsWithDelay as (Rental & { isOverdue: boolean })[];
    },
    enabled: isAdmin || !!agencyId,
  });
}

export function useCreateRental() {
  const queryClient = useQueryClient();
  const { agencyId } = useAgencyFilter();

  return useMutation({
    mutationFn: async (rental: Omit<RentalInsert, "agency_id">) => {
      if (!agencyId) throw new Error("Agency ID required");
      
      const { data, error } = await supabase
        .from("rentals")
        .insert({ ...rental, agency_id: agencyId })
        .select()
        .single();
      
      if (error) throw error;
      
      // Mettre à jour le statut du véhicule à "rented"
      if (rental.vehicle_id) {
        await supabase
          .from("vehicles")
          .update({ status: "rented" })
          .eq("id", rental.vehicle_id);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Location créée avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la création de la location");
      console.error(error);
    },
  });
}

export function useCompleteRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, amountPaid }: { id: string; amountPaid?: number }) => {
      // Récupérer la location pour avoir le vehicle_id
      const { data: rental } = await supabase
        .from("rentals")
        .select("vehicle_id")
        .eq("id", id)
        .single();

      const { data, error } = await supabase
        .from("rentals")
        .update({ 
          status: "completed",
          actual_return_date: new Date().toISOString().split('T')[0],
          amount_paid: amountPaid,
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Remettre le véhicule disponible
      if (rental?.vehicle_id) {
        await supabase
          .from("vehicles")
          .update({ status: "available" })
          .eq("id", rental.vehicle_id);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Location terminée");
    },
    onError: (error) => {
      toast.error("Erreur lors de la fin de location");
      console.error(error);
    },
  });
}

// Hook pour les locations en retard
export function useOverdueRentals() {
  const { filterByAgency, isAdmin, agencyId } = useAgencyFilter();

  return useQuery({
    queryKey: ["overdue-rentals", filterByAgency],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      let query = supabase
        .from("rentals")
        .select(`
          *,
          clients (full_name, phone),
          vehicles (brand, model, registration)
        `)
        .eq("status", "active")
        .lt("end_date", today);
      
      if (filterByAgency) {
        query = query.eq("agency_id", filterByAgency);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin || !!agencyId,
  });
}

// Hook pour les retours prévus aujourd'hui
export function useTodayReturns() {
  const { filterByAgency, isAdmin, agencyId } = useAgencyFilter();

  return useQuery({
    queryKey: ["today-returns", filterByAgency],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      let query = supabase
        .from("rentals")
        .select(`
          *,
          clients (full_name),
          vehicles (brand, model, registration)
        `)
        .eq("status", "active")
        .eq("end_date", today);
      
      if (filterByAgency) {
        query = query.eq("agency_id", filterByAgency);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin || !!agencyId,
  });
}
