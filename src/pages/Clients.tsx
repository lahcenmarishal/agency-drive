import { useState } from "react";
import { UserCheck, Plus, Search, Phone, Mail, MoreVertical, Ban, Loader2, Eye, Edit, Trash2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useClients, useDeleteClient, Client } from "@/hooks/useClients";
import { ClientForm } from "@/components/clients/ClientForm";
import { BlacklistDialog } from "@/components/clients/BlacklistDialog";
import { ClientDetailsDialog } from "@/components/clients/ClientDetailsDialog";
import { useAgencyFilterContext } from "@/contexts/AgencyFilterContext";
import { useAgencies } from "@/hooks/useAgencies";
import { useAuth } from "@/contexts/AuthContext";

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showBlacklistOnly, setShowBlacklistOnly] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();
  const [blacklistDialogOpen, setBlacklistDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const { isAdmin } = useAuth();
  const { effectiveAgencyId } = useAgencyFilterContext();
  const { data: agencies } = useAgencies();
  const { data: clients, isLoading } = useClients(showBlacklistOnly);
  const deleteClient = useDeleteClient();

  const selectedAgencyName = effectiveAgencyId
    ? agencies?.find((a) => a.id === effectiveAgencyId)?.name
    : null;

  // Filtrer par recherche
  const filteredClients = clients?.filter((c) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(query) ||
      c.phone?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.id_number?.toLowerCase().includes(query)
    );
  });

  const handleAdd = () => {
    setSelectedClient(undefined);
    setFormOpen(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setFormOpen(true);
  };

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    setDetailsDialogOpen(true);
  };

  const handleBlacklist = (client: Client) => {
    setSelectedClient(client);
    setBlacklistDialogOpen(true);
  };

  // Compter les locations (à implémenter avec les vraies données)
  const getClientRentalsCount = (client: Client) => {
    // TODO: Implémenter le comptage réel des locations
    return 0;
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">Clients</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {clients?.length || 0} clients
            {selectedAgencyName && (
              <span className="ml-1">
                • <Building2 className="inline h-3.5 w-3.5 mr-1" />
                {selectedAgencyName}
              </span>
            )}
            {!selectedAgencyName && isAdmin && " dans toutes les agences"}
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          Nouveau client
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-10 bg-muted/30 border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="blacklist-filter"
            checked={showBlacklistOnly}
            onCheckedChange={setShowBlacklistOnly}
          />
          <Label htmlFor="blacklist-filter" className="text-sm text-muted-foreground whitespace-nowrap">
            Blacklistés
          </Label>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!filteredClients || filteredClients.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <UserCheck className="h-16 w-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">Aucun client trouvé</p>
          <p className="text-sm">Ajoutez votre premier client pour commencer</p>
          <Button className="mt-4" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau client
          </Button>
        </div>
      )}

      {/* Clients Table - Desktop */}
      {!isLoading && filteredClients && filteredClients.length > 0 && (
        <div className="glass-card overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Contact</th>
                  <th>CIN</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="group">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-foreground font-medium text-sm">
                        {client.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      </div>
                      <div>
                        <span className="font-medium">{client.full_name}</span>
                        {client.city && (
                          <p className="text-xs text-muted-foreground">{client.city}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1">
                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{client.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="font-mono text-sm">{client.id_number || "-"}</td>
                  <td>
                    {client.is_blacklisted ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-400">
                        <Ban className="h-3 w-3" />
                        Blacklisté
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-400">
                        Actif
                      </span>
                    )}
                  </td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(client)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(client)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBlacklist(client)}>
                          <Ban className="mr-2 h-4 w-4" />
                          {client.is_blacklisted ? "Retirer blacklist" : "Blacklister"}
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer le client ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. {client.full_name} sera définitivement supprimé.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteClient.mutate(client.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Clients Cards - Mobile */}
      {!isLoading && filteredClients && filteredClients.length > 0 && (
        <div className="md:hidden space-y-3">
          {filteredClients.map((client) => (
            <div key={client.id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-foreground font-medium text-sm shrink-0">
                    {client.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{client.full_name}</p>
                    {client.phone && (
                      <p className="text-sm text-muted-foreground">{client.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {client.is_blacklisted ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-400">
                      <Ban className="h-3 w-3" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-400">
                      Actif
                    </span>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(client)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir détails
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(client)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBlacklist(client)}>
                        <Ban className="mr-2 h-4 w-4" />
                        {client.is_blacklisted ? "Retirer blacklist" : "Blacklister"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ClientForm
        open={formOpen}
        onOpenChange={setFormOpen}
        client={selectedClient}
      />

      {selectedClient && (
        <>
          <BlacklistDialog
            open={blacklistDialogOpen}
            onOpenChange={setBlacklistDialogOpen}
            client={selectedClient}
          />
          <ClientDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            client={selectedClient}
            onEdit={() => {
              setDetailsDialogOpen(false);
              setFormOpen(true);
            }}
            onToggleBlacklist={() => {
              setDetailsDialogOpen(false);
              setBlacklistDialogOpen(true);
            }}
          />
        </>
      )}
    </div>
  );
}
