import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAgencyFilter } from "./useAgencyFilter";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Employee = Tables<"employees">;
export type EmployeeInsert = TablesInsert<"employees">;
export type EmployeeUpdate = TablesUpdate<"employees">;

interface CreateEmployeeWithAccount {
  full_name: string;
  email?: string;
  phone?: string;
  position?: string;
  hire_date?: string;
  is_active?: boolean;
  agency_id: string;
  create_account?: boolean;
  account_email?: string;
  account_password?: string;
}

export function useEmployees() {
  const { filterByAgency, filterByAgencies, isSuperAdmin, agencyId } = useAgencyFilter();

  return useQuery({
    queryKey: ["employees", filterByAgency, filterByAgencies],
    queryFn: async () => {
      let query = supabase
        .from("employees")
        .select("*, agencies(name)")
        .order("created_at", { ascending: false });

      // Apply agency filtering
      if (filterByAgency) {
        // Specific agency selected
        query = query.eq("agency_id", filterByAgency);
      } else if (filterByAgencies && filterByAgencies.length > 0) {
        // No specific selection, but restricted to accessible agencies (admin)
        query = query.in("agency_id", filterByAgencies);
      }
      // If super admin with no selection, no filter applied (sees all)

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    // Super admin can query, Admin with agencies can query, Agent needs their agencyId
    enabled: isSuperAdmin || (filterByAgencies && filterByAgencies.length > 0) || !!agencyId,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeData: CreateEmployeeWithAccount) => {
      const { create_account, account_email, account_password, agency_id, ...employee } = employeeData;

      if (!agency_id) throw new Error("Agency ID not found");

      // First create the employee record
      const { data: newEmployee, error: employeeError } = await supabase
        .from("employees")
        .insert({ ...employee, agency_id })
        .select()
        .single();

      if (employeeError) throw employeeError;

      // If create_account is true, always create the user account via backend function
      if (create_account && account_email && account_password) {
        const response = await supabase.functions.invoke("create-user", {
          body: {
            email: account_email,
            password: account_password,
            full_name: employee.full_name,
            role: "agent",
            agency_id: agency_id,
          },
        });

        if (response.error) {
          // Delete the employee if account creation fails
          await supabase.from("employees").delete().eq("id", newEmployee.id);
          throw new Error(response.error.message || "Failed to create user account");
        }

        if (response.data?.error) {
          // Delete the employee if account creation fails
          await supabase.from("employees").delete().eq("id", newEmployee.id);
          throw new Error(response.data.error);
        }
      }

      return newEmployee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employé ajouté avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'ajout de l'employé");
      console.error(error);
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: EmployeeUpdate & { id: string }) => {
      // Remove account-related fields if they exist
      const { create_account, account_email, account_password, ...employeeUpdates } = updates as any;
      
      const { data, error } = await supabase
        .from("employees")
        .update(employeeUpdates)
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
