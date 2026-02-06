import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAgencyFilter } from "./useAgencyFilter";

export function useDashboardStats() {
  const { filterByAgency, isAdmin, agencyId } = useAgencyFilter();

  return useQuery({
    queryKey: ["dashboard-stats", filterByAgency],
    queryFn: async () => {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

      // Clients ce mois
      let clientsQuery = supabase
        .from("clients")
        .select("id, created_at", { count: "exact" });
      
      if (filterByAgency) {
        clientsQuery = clientsQuery.eq("agency_id", filterByAgency);
      }

      const { count: totalClients } = await clientsQuery;
      
      let newClientsQuery = supabase
        .from("clients")
        .select("id", { count: "exact" })
        .gte("created_at", firstDayOfMonth.toISOString());
      
      if (filterByAgency) {
        newClientsQuery = newClientsQuery.eq("agency_id", filterByAgency);
      }
      
      const { count: newClients } = await newClientsQuery;

      let lastMonthClientsQuery = supabase
        .from("clients")
        .select("id", { count: "exact" })
        .gte("created_at", lastMonth.toISOString())
        .lt("created_at", firstDayOfMonth.toISOString());
      
      if (filterByAgency) {
        lastMonthClientsQuery = lastMonthClientsQuery.eq("agency_id", filterByAgency);
      }
      
      const { count: lastMonthClients } = await lastMonthClientsQuery;

      // Locations actives
      let activeRentalsQuery = supabase
        .from("rentals")
        .select("id", { count: "exact" })
        .eq("status", "active");
      
      if (filterByAgency) {
        activeRentalsQuery = activeRentalsQuery.eq("agency_id", filterByAgency);
      }
      
      const { count: activeRentals } = await activeRentalsQuery;

      // Réservations en attente/confirmées
      let reservationsQuery = supabase
        .from("reservations")
        .select("id", { count: "exact" })
        .in("status", ["pending", "confirmed"]);
      
      if (filterByAgency) {
        reservationsQuery = reservationsQuery.eq("agency_id", filterByAgency);
      }
      
      const { count: pendingReservations } = await reservationsQuery;

      // Revenus ce mois
      let revenueQuery = supabase
        .from("transactions")
        .select("amount")
        .eq("type", "income")
        .gte("transaction_date", firstDayOfMonth.toISOString().split('T')[0]);
      
      if (filterByAgency) {
        revenueQuery = revenueQuery.eq("agency_id", filterByAgency);
      }
      
      const { data: revenueData } = await revenueQuery;
      const totalRevenue = revenueData?.reduce((acc, t) => acc + (t.amount || 0), 0) || 0;

      // Revenus mois dernier
      let lastMonthRevenueQuery = supabase
        .from("transactions")
        .select("amount")
        .eq("type", "income")
        .gte("transaction_date", lastMonth.toISOString().split('T')[0])
        .lt("transaction_date", firstDayOfMonth.toISOString().split('T')[0]);
      
      if (filterByAgency) {
        lastMonthRevenueQuery = lastMonthRevenueQuery.eq("agency_id", filterByAgency);
      }
      
      const { data: lastMonthRevenueData } = await lastMonthRevenueQuery;
      const lastMonthRevenue = lastMonthRevenueData?.reduce((acc, t) => acc + (t.amount || 0), 0) || 0;

      // Dépenses ce mois
      let expensesQuery = supabase
        .from("transactions")
        .select("amount")
        .eq("type", "expense")
        .gte("transaction_date", firstDayOfMonth.toISOString().split('T')[0]);
      
      if (filterByAgency) {
        expensesQuery = expensesQuery.eq("agency_id", filterByAgency);
      }
      
      const { data: expensesData } = await expensesQuery;
      const totalExpenses = expensesData?.reduce((acc, t) => acc + (t.amount || 0), 0) || 0;

      // Transactions ce mois
      let transactionsCountQuery = supabase
        .from("transactions")
        .select("id", { count: "exact" })
        .gte("transaction_date", firstDayOfMonth.toISOString().split('T')[0]);
      
      if (filterByAgency) {
        transactionsCountQuery = transactionsCountQuery.eq("agency_id", filterByAgency);
      }
      
      const { count: transactionsCount } = await transactionsCountQuery;

      // Calcul des tendances
      const clientsTrend = lastMonthClients ? Math.round(((newClients || 0) - lastMonthClients) / lastMonthClients * 100) : 0;
      const revenueTrend = lastMonthRevenue ? Math.round((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;

      return {
        newClients: newClients || 0,
        totalClients: totalClients || 0,
        activeRentals: activeRentals || 0,
        pendingReservations: pendingReservations || 0,
        totalRevenue,
        totalExpenses,
        transactionsCount: transactionsCount || 0,
        clientsTrend,
        revenueTrend,
      };
    },
    enabled: isAdmin || !!agencyId,
  });
}

export function useFleetStatus() {
  const { filterByAgency, isAdmin, agencyId } = useAgencyFilter();

  return useQuery({
    queryKey: ["fleet-status", filterByAgency],
    queryFn: async () => {
      let query = supabase.from("vehicles").select("status");
      
      if (filterByAgency) {
        query = query.eq("agency_id", filterByAgency);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const statusCounts = {
        available: 0,
        rented: 0,
        reserved: 0,
        maintenance: 0,
      };
      
      data?.forEach((vehicle) => {
        if (vehicle.status && statusCounts.hasOwnProperty(vehicle.status)) {
          statusCounts[vehicle.status as keyof typeof statusCounts]++;
        }
      });
      
      return statusCounts;
    },
    enabled: isAdmin || !!agencyId,
  });
}

export function useUpcomingEvents() {
  const { filterByAgency, isAdmin, agencyId } = useAgencyFilter();

  return useQuery({
    queryKey: ["upcoming-events", filterByAgency],
    queryFn: async () => {
      const today = new Date();
      const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
      
      // Retours prévus
      let rentalsQuery = supabase
        .from("rentals")
        .select(`
          id,
          end_date,
          clients (full_name),
          vehicles (brand, model)
        `)
        .eq("status", "active")
        .gte("end_date", today.toISOString().split('T')[0])
        .lte("end_date", threeDaysFromNow.toISOString().split('T')[0]);
      
      if (filterByAgency) {
        rentalsQuery = rentalsQuery.eq("agency_id", filterByAgency);
      }
      
      const { data: rentals } = await rentalsQuery;

      // Réservations à venir
      let reservationsQuery = supabase
        .from("reservations")
        .select(`
          id,
          start_date,
          clients (full_name),
          vehicles (brand, model)
        `)
        .eq("status", "confirmed")
        .gte("start_date", today.toISOString().split('T')[0])
        .lte("start_date", threeDaysFromNow.toISOString().split('T')[0]);
      
      if (filterByAgency) {
        reservationsQuery = reservationsQuery.eq("agency_id", filterByAgency);
      }
      
      const { data: reservations } = await reservationsQuery;

      const events: Array<{
        type: "retour" | "reservation";
        clientName: string;
        vehicleName: string;
        date: string;
      }> = [];

      rentals?.forEach((rental) => {
        events.push({
          type: "retour",
          clientName: rental.clients?.full_name || "Client inconnu",
          vehicleName: `${rental.vehicles?.brand || ""} ${rental.vehicles?.model || ""}`.trim() || "Véhicule inconnu",
          date: rental.end_date,
        });
      });

      reservations?.forEach((reservation) => {
        events.push({
          type: "reservation",
          clientName: reservation.clients?.full_name || "Client inconnu",
          vehicleName: `${reservation.vehicles?.brand || ""} ${reservation.vehicles?.model || ""}`.trim() || "Véhicule inconnu",
          date: reservation.start_date,
        });
      });

      // Trier par date
      events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return events;
    },
    enabled: isAdmin || !!agencyId,
  });
}
