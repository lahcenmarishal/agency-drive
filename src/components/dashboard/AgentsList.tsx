import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, Building2, Check, Loader2, MoreVertical, UserX, UserCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Agent {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  agency_id: string | null;
  agency_name?: string;
  is_active: boolean;
}

export function AgentsList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedAgencies, setSelectedAgencies] = useState<Record<string, string>>({});
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

  // Fetch all agents (users with role 'agent')
  const {
    data: agents,
    isLoading: agentsLoading,
    isFetching: agentsFetching,
    refetch: refetchAgents,
    error: agentsError,
  } = useQuery({
    queryKey: ["agents-list"],
    queryFn: async () => {
      // First get all agent user_ids
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "agent");

      if (rolesError) throw rolesError;
      if (!roles || roles.length === 0) return [];

      const userIds = roles.map((r) => r.user_id);

      // Get profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, email, agency_id, is_active")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Get agency names for those with agency_id
      const agencyIds = (profiles || [])
        .filter((p) => p.agency_id)
        .map((p) => p.agency_id) as string[];

      let agencyMap: Record<string, string> = {};
      if (agencyIds.length > 0) {
        const { data: agencies, error: agenciesError } = await supabase
          .from("agencies")
          .select("id, name")
          .in("id", agencyIds);

        if (agenciesError) throw agenciesError;

        if (agencies) {
          agencyMap = agencies.reduce((acc, a) => {
            acc[a.id] = a.name;
            return acc;
          }, {} as Record<string, string>);
        }
      }

      return (profiles || []).map((p) => ({
        ...p,
        agency_name: p.agency_id ? agencyMap[p.agency_id] : undefined,
      })) as Agent[];
    },
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });

  // Fetch all agencies for assignment
  const { data: agencies } = useQuery({
    queryKey: ["agencies-for-assignment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agencies")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Mutation to assign agency
  const assignAgencyMutation = useMutation({
    mutationFn: async ({
      profileId,
      agencyId,
    }: {
      profileId: string;
      agencyId: string;
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ agency_id: agencyId })
        .eq("id", profileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents-list"] });
      toast.success(t("dashboard.agencyAssigned"));
    },
    onError: () => {
      toast.error(t("dashboard.agencyAssignError"));
    },
  });

  // Mutation to toggle agent active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({
      profileId,
      isActive,
    }: {
      profileId: string;
      isActive: boolean;
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: isActive })
        .eq("id", profileId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agents-list"] });
      toast.success(
        variables.isActive
          ? t("dashboard.accountActivated")
          : t("dashboard.accountDeactivated")
      );
    },
    onError: () => {
      toast.error(t("dashboard.statusChangeError"));
    },
  });

  // Mutation to delete agent
  const deleteAgentMutation = useMutation({
    mutationFn: async (agent: Agent) => {
      // Delete user_roles entry
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", agent.user_id);

      if (roleError) throw roleError;

      // Delete profile entry
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", agent.id);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents-list"] });
      toast.success(t("dashboard.agentDeleted"));
      setAgentToDelete(null);
    },
    onError: () => {
      toast.error(t("dashboard.agentDeleteError"));
    },
  });

  const handleAssignAgency = (profileId: string) => {
    const agencyId = selectedAgencies[profileId];
    if (agencyId) {
      assignAgencyMutation.mutate({ profileId, agencyId });
    }
  };

  const handleToggleActive = (agent: Agent) => {
    toggleActiveMutation.mutate({
      profileId: agent.id,
      isActive: !agent.is_active,
    });
  };

  const handleDeleteAgent = () => {
    if (agentToDelete) {
      deleteAgentMutation.mutate(agentToDelete);
    }
  };

  if (agentsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("dashboard.agents")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (agentsError) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("dashboard.agents")}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchAgents()}
            disabled={agentsFetching}
          >
            {agentsFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("common.refresh")
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            {t("dashboard.unableToLoad")}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("dashboard.agents")}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchAgents()}
            disabled={agentsFetching}
          >
            {agentsFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("common.refresh")
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            {t("dashboard.noAgents")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("dashboard.agents")} ({agents.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchAgents()}
            disabled={agentsFetching}
          >
            {agentsFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("common.refresh")
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  agent.is_active ? "bg-muted/50" : "bg-destructive/10 opacity-60"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {agent.full_name || t("dashboard.noName")}
                    </p>
                    {!agent.is_active && (
                      <Badge variant="destructive" className="text-xs">
                        {t("common.disabled")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{agent.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  {agent.agency_id ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {agent.agency_name}
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedAgencies[agent.id] || ""}
                        onValueChange={(value) =>
                          setSelectedAgencies((prev) => ({
                            ...prev,
                            [agent.id]: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={t("dashboard.chooseAgency")} />
                        </SelectTrigger>
                        <SelectContent>
                          {agencies?.map((agency) => (
                            <SelectItem key={agency.id} value={agency.id}>
                              {agency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={() => handleAssignAgency(agent.id)}
                        disabled={
                          !selectedAgencies[agent.id] ||
                          assignAgencyMutation.isPending
                        }
                      >
                        {assignAgencyMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Actions dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleToggleActive(agent)}
                        disabled={toggleActiveMutation.isPending}
                      >
                        {agent.is_active ? (
                          <>
                            <UserX className="h-4 w-4 mr-2" />
                            {t("dashboard.deactivate")}
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            {t("dashboard.activate")}
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setAgentToDelete(agent)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t("common.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!agentToDelete} onOpenChange={(open) => !open && setAgentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.deleteAgent")}</AlertDialogTitle>
            <AlertDialogDescription dangerouslySetInnerHTML={{ __html: t("dashboard.deleteAgentDesc", { name: agentToDelete?.full_name || agentToDelete?.email }) }} />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAgent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteAgentMutation.isPending}
            >
              {deleteAgentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
