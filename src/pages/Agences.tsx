import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  MapPin,
  Users,
  Car,
  MoreVertical,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import { AgencyForm } from "@/components/agencies/AgencyForm";
import {
  useAgencyWithStats,
  useCreateAgency,
  useUpdateAgency,
  useDeleteAgency,
  type Agency,
} from "@/hooks/useAgencies";
import { useAuth } from "@/contexts/AuthContext";

export default function Agences() {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [deleteAgencyId, setDeleteAgencyId] = useState<string | null>(null);

  const { data: agencies, isLoading } = useAgencyWithStats();
  const createAgency = useCreateAgency();
  const updateAgency = useUpdateAgency();
  const deleteAgency = useDeleteAgency();

  const handleCreate = (data: Omit<Agency, "id" | "created_at" | "updated_at">) => {
    createAgency.mutate(data, {
      onSuccess: () => setFormOpen(false),
    });
  };

  const handleUpdate = (data: Omit<Agency, "id" | "created_at" | "updated_at">) => {
    if (!editingAgency) return;
    updateAgency.mutate(
      { id: editingAgency.id, ...data },
      {
        onSuccess: () => setEditingAgency(null),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteAgencyId) return;
    deleteAgency.mutate(deleteAgencyId, {
      onSuccess: () => setDeleteAgencyId(null),
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">Agences</h1>
          <p className="text-muted-foreground mt-1">
            {isSuperAdmin ? "Gérez toutes les agences" : "Vos agences de location"}
          </p>
        </div>
        {/* Only super admin can create new agencies */}
        {isSuperAdmin && (
          <Button className="gap-2" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Nouvelle agence
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6">
              <Skeleton className="h-12 w-12 rounded-xl mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && agencies?.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune agence</h3>
          <p className="text-muted-foreground mb-4">
            {isSuperAdmin 
              ? "Commencez par créer votre première agence"
              : "Aucune agence ne vous est assignée"}
          </p>
          {isSuperAdmin && (
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle agence
            </Button>
          )}
        </div>
      )}

      {/* Agences Grid */}
      {!isLoading && agencies && agencies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agencies.map((agence) => (
            <div
              key={agence.id}
              className="glass-card p-6 group cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
              onClick={() => navigate(`/agences/${agence.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-6 w-6" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/agences/${agence.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir détails
                    </DropdownMenuItem>
                    {/* Only super admin can edit/delete agencies */}
                    {isSuperAdmin && (
                      <>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAgency(agence);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteAgencyId(agence.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h3 className="text-lg font-semibold font-display mb-2">
                {agence.name}
              </h3>

              {(agence.address || agence.city) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {[agence.address, agence.city].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}

              {agence.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{agence.phone}</span>
                </div>
              )}

              {agence.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{agence.email}</span>
                </div>
              )}

              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Car className="h-4 w-4 text-primary" />
                  <span>{agence.vehicleCount} véhicules</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{agence.employeeCount} employés</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Form */}
      <AgencyForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isLoading={createAgency.isPending}
      />

      {/* Edit Form */}
      <AgencyForm
        open={!!editingAgency}
        onOpenChange={(open) => !open && setEditingAgency(null)}
        onSubmit={handleUpdate}
        defaultValues={editingAgency}
        isLoading={updateAgency.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteAgencyId}
        onOpenChange={(open) => !open && setDeleteAgencyId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette agence ? Cette action est
              irréversible et supprimera également toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAgency.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
