import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAgencyFilter } from "./useAgencyFilter";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Client = Tables<"clients">;
export type ClientInsert = TablesInsert<"clients">;
export type ClientUpdate = TablesUpdate<"clients">;

export function useClients(showBlacklistedOnly?: boolean) {
  const { filterByAgency, filterByAgencies, isSuperAdmin, agencyId } = useAgencyFilter();

  return useQuery({
    queryKey: ["clients", filterByAgency, filterByAgencies, showBlacklistedOnly],
    queryFn: async () => {
      let query = supabase.from("clients").select("*");
      
      if (filterByAgency) {
        query = query.eq("agency_id", filterByAgency);
      } else if (filterByAgencies && filterByAgencies.length > 0) {
        query = query.in("agency_id", filterByAgencies);
      }
      
      if (showBlacklistedOnly) {
        query = query.eq("is_blacklisted", true);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Client[];
    },
    enabled: isSuperAdmin || (filterByAgencies && filterByAgencies.length > 0) || !!agencyId,
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as Client;
    },
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { agencyId } = useAgencyFilter();

  return useMutation({
    mutationFn: async (client: Omit<ClientInsert, "agency_id">) => {
      if (!agencyId) throw new Error("Agency ID required");
      
      const { data, error } = await supabase
        .from("clients")
        .insert({ ...client, agency_id: agencyId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client ajouté avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ajout du client");
      console.error(error);
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...client }: ClientUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("clients")
        .update(client)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client mis à jour avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
    },
  });
}

export function useToggleBlacklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isBlacklisted, reason }: { id: string; isBlacklisted: boolean; reason?: string }) => {
      const { data, error } = await supabase
        .from("clients")
        .update({ 
          is_blacklisted: isBlacklisted,
          blacklist_reason: isBlacklisted ? reason : null
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success(data.is_blacklisted ? "Client blacklisté" : "Client retiré de la blacklist");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client supprimé");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    },
  });
}

// Récupérer l'historique des locations d'un client
export function useClientRentals(clientId: string) {
  return useQuery({
    queryKey: ["client-rentals", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rentals")
        .select(`
          *,
          vehicles (brand, model, registration)
        `)
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });
}
