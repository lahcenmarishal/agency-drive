import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAgencyFilter } from "./useAgencyFilter";
import { toast } from "sonner";
import { startOfMonth, endOfMonth, format, subMonths } from "date-fns";
import type { Tables, TablesInsert, Enums } from "@/integrations/supabase/types";

export type Transaction = Tables<"transactions">;
export type TransactionInsert = TablesInsert<"transactions">;
export type TransactionType = Enums<"transaction_type">;

export function useTransactions(month?: Date) {
  const { filterByAgency, isAdmin, agencyId } = useAgencyFilter();
  const targetMonth = month || new Date();

  return useQuery({
    queryKey: ["transactions", filterByAgency, format(targetMonth, "yyyy-MM")],
    queryFn: async () => {
      const start = startOfMonth(targetMonth);
      const end = endOfMonth(targetMonth);

      let query = supabase
        .from("transactions")
        .select("*, rentals(clients(full_name), vehicles(brand, model))")
        .gte("transaction_date", start.toISOString())
        .lte("transaction_date", end.toISOString())
        .order("transaction_date", { ascending: false });

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

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { agencyId } = useAgencyFilter();

  return useMutation({
    mutationFn: async (transaction: Omit<TransactionInsert, "agency_id">) => {
      if (!agencyId) throw new Error("Agency ID not found");

      const { data, error } = await supabase
        .from("transactions")
        .insert({ ...transaction, agency_id: agencyId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction ajoutée avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ajout de la transaction");
      console.error(error);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction supprimée avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    },
  });
}

export function useFinancialSummary(month?: Date) {
  const { filterByAgency, isAdmin, agencyId } = useAgencyFilter();
  const targetMonth = month || new Date();

  return useQuery({
    queryKey: ["financial-summary", filterByAgency, format(targetMonth, "yyyy-MM")],
    queryFn: async () => {
      const start = startOfMonth(targetMonth);
      const end = endOfMonth(targetMonth);

      let query = supabase
        .from("transactions")
        .select("type, amount")
        .gte("transaction_date", start.toISOString())
        .lte("transaction_date", end.toISOString());

      if (filterByAgency) {
        query = query.eq("agency_id", filterByAgency);
      }

      const { data, error } = await query;
      if (error) throw error;

      const income = data
        ?.filter((t) => t.type === "income")
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      
      const expenses = data
        ?.filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      return {
        income,
        expenses,
        balance: income - expenses,
      };
    },
    enabled: isAdmin || !!agencyId,
  });
}

export function useMonthlyReport() {
  const { filterByAgency, isAdmin, agencyId } = useAgencyFilter();

  return useQuery({
    queryKey: ["monthly-report", filterByAgency],
    queryFn: async () => {
      const months = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const month = subMonths(now, i);
        const start = startOfMonth(month);
        const end = endOfMonth(month);

        let query = supabase
          .from("transactions")
          .select("type, amount")
          .gte("transaction_date", start.toISOString())
          .lte("transaction_date", end.toISOString());

        if (filterByAgency) {
          query = query.eq("agency_id", filterByAgency);
        }

        const { data, error } = await query;
        if (error) throw error;

        const income = data
          ?.filter((t) => t.type === "income")
          .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
        
        const expenses = data
          ?.filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

        months.push({
          month: format(month, "MMM yyyy"),
          income,
          expenses,
          balance: income - expenses,
        });
      }

      return months;
    },
    enabled: isAdmin || !!agencyId,
  });
}

export function useCategoryBreakdown(month?: Date) {
  const { filterByAgency, isAdmin, agencyId } = useAgencyFilter();
  const targetMonth = month || new Date();

  return useQuery({
    queryKey: ["category-breakdown", filterByAgency, format(targetMonth, "yyyy-MM")],
    queryFn: async () => {
      const start = startOfMonth(targetMonth);
      const end = endOfMonth(targetMonth);

      let query = supabase
        .from("transactions")
        .select("type, category, amount")
        .gte("transaction_date", start.toISOString())
        .lte("transaction_date", end.toISOString());

      if (filterByAgency) {
        query = query.eq("agency_id", filterByAgency);
      }

      const { data, error } = await query;
      if (error) throw error;

      const breakdown: Record<string, { income: number; expense: number }> = {};
      
      data?.forEach((t) => {
        const cat = t.category || "Autre";
        if (!breakdown[cat]) {
          breakdown[cat] = { income: 0, expense: 0 };
        }
        if (t.type === "income") {
          breakdown[cat].income += t.amount || 0;
        } else {
          breakdown[cat].expense += t.amount || 0;
        }
      });

      return Object.entries(breakdown).map(([category, values]) => ({
        category,
        ...values,
      }));
    },
    enabled: isAdmin || !!agencyId,
  });
}
