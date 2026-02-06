import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Car,
  Users,
  UserCheck,
  MapPin,
  Phone,
  Mail,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AgencyForm } from "@/components/agencies/AgencyForm";
import { useUpdateAgency, useDeleteAgency, type Agency } from "@/hooks/useAgencies";

export default function AgenceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignVehicleOpen, setAssignVehicleOpen] = useState(false);
  const [assignEmployeeOpen, setAssignEmployeeOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  const updateAgency = useUpdateAgency();
  const deleteAgency = useDeleteAgency();

  // Fetch agency details
  const { data: agency, isLoading: agencyLoading } = useQuery({
    queryKey: ["agency", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agencies")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as Agency;
    },
    enabled: !!id,
  });

  // Fetch agency vehicles
  const { data: vehicles } = useQuery({
    queryKey: ["agency-vehicles", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("agency_id", id!)
        .order("brand");
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch agency employees
  const { data: employees } = useQuery({
    queryKey: ["agency-employees", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("agency_id", id!)
        .order("full_name");
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch agency clients
  const { data: clients } = useQuery({
    queryKey: ["agency-clients", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("agency_id", id!)
        .order("full_name");
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch unassigned vehicles (for assignment)
  const { data: unassignedVehicles } = useQuery({
    queryKey: ["unassigned-vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .neq("agency_id", id!)
        .order("brand");
      if (error) throw error;
      return data;
    },
    enabled: !!id && assignVehicleOpen,
  });

  // Fetch unassigned employees (for assignment)
  const { data: unassignedEmployees } = useQuery({
    queryKey: ["unassigned-employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .neq("agency_id", id!)
        .order("full_name");
      if (error) throw error;
      return data;
    },
    enabled: !!id && assignEmployeeOpen,
  });

  // Assign vehicle mutation
  const assignVehicle = useMutation({
    mutationFn: async (vehicleId: string) => {
      const { error } = await supabase
        .from("vehicles")
        .update({ agency_id: id! })
        .eq("id", vehicleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency-vehicles", id] });
      queryClient.invalidateQueries({ queryKey: ["unassigned-vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["agencies-with-stats"] });
      setAssignVehicleOpen(false);
      setSelectedVehicleId("");
      toast.success("Véhicule assigné avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'assignation");
    },
  });

  // Unassign vehicle mutation
  const unassignVehicle = useMutation({
    mutationFn: async (vehicleId: string) => {
      // We need another agency to assign to, or handle differently
      // For now, we'll just show an error - in real app you'd move to a "pool" agency
      throw new Error("Cannot unassign - need target agency");
    },
  });

  // Assign employee mutation
  const assignEmployee = useMutation({
    mutationFn: async (employeeId: string) => {
      const { error } = await supabase
        .from("employees")
        .update({ agency_id: id! })
        .eq("id", employeeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency-employees", id] });
      queryClient.invalidateQueries({ queryKey: ["unassigned-employees"] });
      queryClient.invalidateQueries({ queryKey: ["agencies-with-stats"] });
      setAssignEmployeeOpen(false);
      setSelectedEmployeeId("");
      toast.success("Employé assigné avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'assignation");
    },
  });

  const handleUpdate = (data: any) => {
    if (!id) return;
    updateAgency.mutate(
      { id, ...data },
      { onSuccess: () => setEditFormOpen(false) }
    );
  };

  const handleDelete = () => {
    if (!id) return;
    deleteAgency.mutate(id, {
      onSuccess: () => navigate("/agences"),
    });
  };

  if (agencyLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Agence non trouvée</h3>
        <Button className="mt-4" onClick={() => navigate("/agences")}>
          Retour aux agences
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button
            variant="ghost"
            className="mb-4 -ml-2"
            onClick={() => navigate("/agences")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux agences
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">{agency.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                {(agency.address || agency.city) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {[agency.address, agency.city].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}
                {agency.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{agency.phone}</span>
                  </div>
                )}
                {agency.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>{agency.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditFormOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{vehicles?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Véhicules</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{employees?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Employés</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{clients?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Clients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="vehicles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="vehicles">Véhicules</TabsTrigger>
          <TabsTrigger value="employees">Employés</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Véhicules de l'agence ({vehicles?.length || 0})
            </h3>
            <Button onClick={() => setAssignVehicleOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Assigner un véhicule
            </Button>
          </div>
          {vehicles?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Car className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Aucun véhicule assigné à cette agence</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles?.map((vehicle) => (
                <div key={vehicle.id} className="glass-card p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">
                        {vehicle.brand} {vehicle.model}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.registration}
                      </p>
                    </div>
                    <Badge
                      variant={
                        vehicle.status === "available"
                          ? "default"
                          : vehicle.status === "rented"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {vehicle.status === "available"
                        ? "Disponible"
                        : vehicle.status === "rented"
                        ? "Loué"
                        : vehicle.status === "reserved"
                        ? "Réservé"
                        : "Maintenance"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Employés de l'agence ({employees?.length || 0})
            </h3>
            <Button onClick={() => setAssignEmployeeOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Assigner un employé
            </Button>
          </div>
          {employees?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Aucun employé assigné à cette agence</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees?.map((employee) => (
                <div key={employee.id} className="glass-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-foreground font-medium">
                      {employee.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h4 className="font-semibold">{employee.full_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {employee.position || "Agent"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <h3 className="text-lg font-semibold">
            Clients de l'agence ({clients?.length || 0})
          </h3>
          {clients?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Aucun client enregistré pour cette agence</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Téléphone</th>
                    <th>Email</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {clients?.map((client) => (
                    <tr key={client.id}>
                      <td className="font-medium">{client.full_name}</td>
                      <td>{client.phone || "-"}</td>
                      <td>{client.email || "-"}</td>
                      <td>
                        <Badge
                          variant={client.is_blacklisted ? "destructive" : "default"}
                        >
                          {client.is_blacklisted ? "Blacklisté" : "Actif"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Form */}
      <AgencyForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        onSubmit={handleUpdate}
        defaultValues={agency}
        isLoading={updateAgency.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'agence ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'agence "{agency.name}" et toutes
              ses données associées seront supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Vehicle Dialog */}
      <Dialog open={assignVehicleOpen} onOpenChange={setAssignVehicleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner un véhicule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un véhicule" />
              </SelectTrigger>
              <SelectContent>
                {unassignedVehicles?.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Aucun véhicule disponible
                  </SelectItem>
                ) : (
                  unassignedVehicles?.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.brand} {v.model} - {v.registration}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAssignVehicleOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={() => assignVehicle.mutate(selectedVehicleId)}
                disabled={!selectedVehicleId || assignVehicle.isPending}
              >
                Assigner
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Employee Dialog */}
      <Dialog open={assignEmployeeOpen} onOpenChange={setAssignEmployeeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner un employé</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un employé" />
              </SelectTrigger>
              <SelectContent>
                {unassignedEmployees?.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Aucun employé disponible
                  </SelectItem>
                ) : (
                  unassignedEmployees?.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.full_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAssignEmployeeOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={() => assignEmployee.mutate(selectedEmployeeId)}
                disabled={!selectedEmployeeId || assignEmployee.isPending}
              >
                Assigner
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
