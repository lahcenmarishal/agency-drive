import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAgencyFilter } from "./useAgencyFilter";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Employee = Tables<"employees">;
export type EmployeeInsert = TablesInsert<"employees">;
export type EmployeeUpdate = TablesUpdate<"employees">;

export function useEmployees() {
  const { filterByAgency, isAdmin, agencyId } = useAgencyFilter();

  return useQuery({
    queryKey: ["employees", filterByAgency],
    queryFn: async () => {
      let query = supabase
        .from("employees")
        .select("*, agencies(name)")
        .order("created_at", { ascending: false });

      if (filterByAgency) {
        query = query.eq("agency_id", filterByAgency);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    // Admin can query (filterByAgency null or set), Agent needs their agencyId
    enabled: isAdmin || !!agencyId,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const { agencyId } = useAgencyFilter();

  return useMutation({
    mutationFn: async (employee: Omit<EmployeeInsert, "agency_id">) => {
      if (!agencyId) throw new Error("Agency ID not found");

      const { data, error } = await supabase
        .from("employees")
        .insert({ ...employee, agency_id: agencyId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employé ajouté avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ajout de l'employé");
      console.error(error);
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: EmployeeUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("employees")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employé mis à jour avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employé supprimé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    },
  });
}

export function useToggleEmployeeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from("employees")
        .update({ is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success(data.is_active ? "Employé activé" : "Employé désactivé");
    },
    onError: (error) => {
      toast.error("Erreur lors du changement de statut");
      console.error(error);
    },
  });
}
