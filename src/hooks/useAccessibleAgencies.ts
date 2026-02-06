import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

export type Agency = Tables<"agencies">;

/**
 * Hook to get agencies accessible to the current user:
 * - Super Admin: all agencies
 * - Admin: only agencies from admin_agencies table
 * - Agent: only their assigned agency
 */
export function useAccessibleAgencies() {
  const { user, isSuperAdmin, isAdmin, agencyId } = useAuth();

  return useQuery({
    queryKey: ["accessible-agencies", user?.id, isSuperAdmin, agencyId],
    queryFn: async () => {
      if (!user) return [];

      // Super Admin sees all agencies
      if (isSuperAdmin) {
        const { data, error } = await supabase
          .from("agencies")
          .select("*")
          .order("name", { ascending: true });
        
        if (error) throw error;
        return data as Agency[];
      }

      // Admin sees only their assigned agencies
      if (isAdmin) {
        const { data: adminAgencies, error: adminError } = await supabase
          .from("admin_agencies")
          .select("agency_id")
          .eq("user_id", user.id);

        if (adminError) throw adminError;

        if (!adminAgencies || adminAgencies.length === 0) {
          return [];
        }

        const agencyIds = adminAgencies.map((aa) => aa.agency_id);
        
        const { data, error } = await supabase
          .from("agencies")
          .select("*")
          .in("id", agencyIds)
          .order("name", { ascending: true });

        if (error) throw error;
        return data as Agency[];
      }

      // Agent sees only their single agency
      if (agencyId) {
        const { data, error } = await supabase
          .from("agencies")
          .select("*")
          .eq("id", agencyId)
          .single();

        if (error) throw error;
        return data ? [data] : [];
      }

      return [];
    },
    enabled: !!user,
  });
}

/**
 * Get just the IDs of accessible agencies for filtering
 */
export function useAccessibleAgencyIds() {
  const { data: agencies, isLoading } = useAccessibleAgencies();
  
  return {
    agencyIds: agencies?.map((a) => a.id) || [],
    isLoading,
  };
}
