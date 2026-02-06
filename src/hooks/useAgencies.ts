import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAccessibleAgencies } from "./useAccessibleAgencies";
import { useAuth } from "@/contexts/AuthContext";

export type Agency = Tables<"agencies">;
export type AgencyInsert = TablesInsert<"agencies">;
export type AgencyUpdate = TablesUpdate<"agencies">;

// Use accessible agencies hook - returns only agencies the user can access
export function useAgencies() {
  return useAccessibleAgencies();
}

export function useAgencyWithStats() {
  const { isSuperAdmin } = useAuth();
  const { data: accessibleAgencies, isLoading: isAccessibleLoading } = useAccessibleAgencies();

  return useQuery({
    queryKey: ["agencies-with-stats", accessibleAgencies?.map(a => a.id)],
    queryFn: async () => {
      if (!accessibleAgencies || accessibleAgencies.length === 0) {
        return [];
      }

      // Get vehicle and employee counts for each accessible agency
      const agenciesWithStats = await Promise.all(
        accessibleAgencies.map(async (agency) => {
          const [vehiclesResult, employeesResult] = await Promise.all([
            supabase
              .from("vehicles")
              .select("id", { count: "exact", head: true })
              .eq("agency_id", agency.id),
            supabase
              .from("employees")
              .select("id", { count: "exact", head: true })
              .eq("agency_id", agency.id),
          ]);

          return {
            ...agency,
            vehicleCount: vehiclesResult.count || 0,
            employeeCount: employeesResult.count || 0,
          };
        })
      );

      return agenciesWithStats;
    },
    enabled: !isAccessibleLoading && !!accessibleAgencies,
  });
}

export function useCreateAgency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agency: AgencyInsert) => {
      const { data, error } = await supabase
        .from("agencies")
        .insert(agency)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agencies"] });
      queryClient.invalidateQueries({ queryKey: ["agencies-with-stats"] });
      toast.success("Agence créée avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la création de l'agence");
      console.error("Create agency error:", error);
    },
  });
}

export function useUpdateAgency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...agency }: AgencyUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("agencies")
        .update(agency)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agencies"] });
      queryClient.invalidateQueries({ queryKey: ["agencies-with-stats"] });
      toast.success("Agence mise à jour avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour de l'agence");
      console.error("Update agency error:", error);
    },
  });
}

export function useDeleteAgency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agencies").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agencies"] });
      queryClient.invalidateQueries({ queryKey: ["agencies-with-stats"] });
      toast.success("Agence supprimée avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression de l'agence");
      console.error("Delete agency error:", error);
    },
  });
}
