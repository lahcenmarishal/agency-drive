import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAgencyFilter } from "./useAgencyFilter";
import { Tables, TablesInsert, TablesUpdate, Enums } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Reservation = Tables<"reservations"> & {
  clients?: { full_name: string } | null;
  vehicles?: { brand: string; model: string; registration: string; daily_rate: number | null } | null;
};
export type ReservationInsert = TablesInsert<"reservations">;
export type ReservationUpdate = TablesUpdate<"reservations">;

export function useReservations(statusFilter?: Enums<"reservation_status">) {
  const { filterByAgency, filterByAgencies, isSuperAdmin, agencyId } = useAgencyFilter();

  return useQuery({
    queryKey: ["reservations", filterByAgency, filterByAgencies, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("reservations")
        .select(`
          *,
          clients (full_name),
          vehicles (brand, model, registration, daily_rate)
        `);
      
      if (filterByAgency) {
        query = query.eq("agency_id", filterByAgency);
      } else if (filterByAgencies && filterByAgencies.length > 0) {
        query = query.in("agency_id", filterByAgencies);
      }
      
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Reservation[];
    },
    enabled: isSuperAdmin || (filterByAgencies && filterByAgencies.length > 0) || !!agencyId,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  const { agencyId } = useAgencyFilter();

  return useMutation({
    mutationFn: async (reservation: Omit<ReservationInsert, "agency_id">) => {
      if (!agencyId) throw new Error("Agency ID required");
      
      const { data, error } = await supabase
        .from("reservations")
        .insert({ ...reservation, agency_id: agencyId })
        .select()
        .single();
      
      if (error) throw error;
      
      // Mettre à jour le statut du véhicule à "reserved"
      if (reservation.vehicle_id) {
        await supabase
          .from("vehicles")
          .update({ status: "reserved" })
          .eq("id", reservation.vehicle_id);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Réservation créée avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la création de la réservation");
      console.error(error);
    },
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...reservation }: ReservationUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("reservations")
        .update(reservation)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      toast.success("Réservation mise à jour");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // D'abord, récupérer la réservation pour avoir le vehicle_id
      const { data: reservation } = await supabase
        .from("reservations")
        .select("vehicle_id")
        .eq("id", id)
        .single();

      const { data, error } = await supabase
        .from("reservations")
        .update({ status: "cancelled" })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Remettre le véhicule disponible
      if (reservation?.vehicle_id) {
        await supabase
          .from("vehicles")
          .update({ status: "available" })
          .eq("id", reservation.vehicle_id);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Réservation annulée");
    },
    onError: (error) => {
      toast.error("Erreur lors de l'annulation");
      console.error(error);
    },
  });
}

// Convertir une réservation en location
export function useConvertToRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservationId: string) => {
      // Récupérer la réservation avec ses données
      const { data: reservation, error: fetchError } = await supabase
        .from("reservations")
        .select(`
          *,
          vehicles (daily_rate)
        `)
        .eq("id", reservationId)
        .single();
      
      if (fetchError) throw fetchError;
      if (!reservation) throw new Error("Réservation non trouvée");
      
      // Calculer le montant total
      const startDate = new Date(reservation.start_date);
      const endDate = new Date(reservation.end_date);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const dailyRate = reservation.vehicles?.daily_rate || 0;
      const totalAmount = days * dailyRate;
      
      // Créer la location
      console.log("Converting reservation to rental:", {
        agency_id: reservation.agency_id,
        reservation_id: reservationId,
        vehicle_id: reservation.vehicle_id,
        client_id: reservation.client_id,
        dailyRate,
        totalAmount,
        days,
      });
      
      const { data: rental, error: rentalError } = await supabase
        .from("rentals")
        .insert({
          agency_id: reservation.agency_id,
          reservation_id: reservationId,
          vehicle_id: reservation.vehicle_id,
          client_id: reservation.client_id,
          start_date: reservation.start_date,
          end_date: reservation.end_date,
          daily_rate: dailyRate,
          total_amount: totalAmount,
          status: "active",
        })
        .select()
        .single();
      
      if (rentalError) {
        console.error("Rental insert error:", rentalError);
        throw rentalError;
      }
      
      // Mettre à jour la réservation
      await supabase
        .from("reservations")
        .update({ status: "converted" })
        .eq("id", reservationId);
      
      // Mettre à jour le véhicule
      if (reservation.vehicle_id) {
        await supabase
          .from("vehicles")
          .update({ status: "rented" })
          .eq("id", reservation.vehicle_id);
      }
      
      return rental;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Réservation convertie en location");
    },
    onError: (error) => {
      toast.error("Erreur lors de la conversion");
      console.error(error);
    },
  });
}
