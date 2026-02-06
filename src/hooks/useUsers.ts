import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role: "admin" | "agent";
  agency_ids: string[]; // Changed from agency_id to agency_ids
}

interface UserWithProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  agency_id: string | null;
  is_active: boolean;
  role: string | null;
  agency_name: string | null;
  agency_names?: string[]; // For admins with multiple agencies
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateUserData) => {
      if (!session?.access_token) {
        throw new Error("Not authenticated");
      }

      const response = await supabase.functions.invoke("create-user", {
        body: data,
      });

      if (response.error) {
        throw new Error(response.error.message || "Error creating user");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Utilisateur créé avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la création de l'utilisateur");
      console.error(error);
    },
  });
}

export function useUsers() {
  const { isSuperAdmin, agencyId, isAdmin } = useAuth();

  return useQuery({
    queryKey: ["users", isSuperAdmin, agencyId],
    queryFn: async (): Promise<UserWithProfile[]> => {
      // Fetch profiles with their roles
      let profilesQuery = supabase
        .from("profiles")
        .select(`
          id,
          user_id,
          full_name,
          email,
          agency_id,
          is_active,
          agencies(name)
        `)
        .order("created_at", { ascending: false });

      // If not super admin, only show users from the same agency
      if (!isSuperAdmin && agencyId) {
        profilesQuery = profilesQuery.eq("agency_id", agencyId);
      }

      const { data: profiles, error: profilesError } = await profilesQuery;
      if (profilesError) throw profilesError;

      // Fetch roles for these users
      const userIds = profiles?.map(p => p.user_id) || [];
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds);

      if (rolesError) throw rolesError;

      // Fetch admin_agencies for users who are admins
      const { data: adminAgencies, error: adminAgenciesError } = await supabase
        .from("admin_agencies")
        .select("user_id, agency_id, agencies(name)")
        .in("user_id", userIds);

      if (adminAgenciesError) throw adminAgenciesError;

      // Create a map of user_id to agency names
      const adminAgencyMap = new Map<string, string[]>();
      adminAgencies?.forEach((aa) => {
        const current = adminAgencyMap.get(aa.user_id) || [];
        const agencyName = (aa.agencies as any)?.name;
        if (agencyName) {
          current.push(agencyName);
        }
        adminAgencyMap.set(aa.user_id, current);
      });

      // Combine profiles with roles
      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      return (profiles || []).map(profile => {
        const role = roleMap.get(profile.user_id) || null;
        const agencyNames = adminAgencyMap.get(profile.user_id) || [];
        
        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: profile.full_name,
          email: profile.email,
          agency_id: profile.agency_id,
          is_active: profile.is_active,
          role,
          agency_name: agencyNames.length > 0 
            ? agencyNames.join(", ") 
            : (profile.agencies as any)?.name || null,
          agency_names: agencyNames.length > 0 ? agencyNames : undefined,
        };
      });
    },
    enabled: isSuperAdmin || isAdmin,
  });
}
