import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Client, useClientRentals } from "@/hooks/useClients";
import { Phone, Mail, MapPin, CreditCard, FileText, Ban, UserCheck, Edit, Key } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  onEdit: () => void;
  onToggleBlacklist: () => void;
}

export function ClientDetailsDialog({ 
  open, 
  onOpenChange, 
  client, 
  onEdit,
  onToggleBlacklist 
}: ClientDetailsDialogProps) {
  const { data: rentals, isLoading: rentalsLoading } = useClientRentals(client.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-foreground font-semibold">
                {client.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </div>
              <div>
                <DialogTitle className="font-display flex items-center gap-2">
                  {client.full_name}
                  {client.is_blacklisted && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-400">
                      <Ban className="h-3 w-3" />
                      Blacklisté
                    </span>
                  )}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Client depuis {format(new Date(client.created_at), "MMMM yyyy", { locale: fr })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-1" />
                Modifier
              </Button>
              <Button 
                variant={client.is_blacklisted ? "outline" : "destructive"} 
                size="sm"
                onClick={onToggleBlacklist}
              >
                {client.is_blacklisted ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-1" />
                    Retirer blacklist
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4 mr-1" />
                    Blacklister
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="rentals">Historique ({rentals?.length || 0})</TabsTrigger>
            <TabsTrigger value="notes">Notes internes</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Contact</h4>
                <div className="space-y-2">
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {(client.address || client.city) && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{[client.address, client.city].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Documents</h4>
                <div className="space-y-2">
                  {client.id_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span>CIN: {client.id_number}</span>
                    </div>
                  )}
                  {client.license_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Permis: {client.license_number}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {client.is_blacklisted && client.blacklist_reason && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <h4 className="text-sm font-medium text-red-400 mb-2">Raison du blacklistage</h4>
                <p className="text-sm text-foreground/80">{client.blacklist_reason}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rentals" className="mt-4">
            {rentalsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : rentals && rentals.length > 0 ? (
              <div className="space-y-3">
                {rentals.map((rental) => (
                  <div
                    key={rental.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Key className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {rental.vehicles?.brand} {rental.vehicles?.model}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(rental.start_date), "dd/MM/yyyy")} → {format(new Date(rental.end_date), "dd/MM/yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">${rental.total_amount || 0}</p>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        rental.status === "completed" ? "bg-green-500/15 text-green-400" :
                        rental.status === "active" ? "bg-blue-500/15 text-blue-400" :
                        "bg-red-500/15 text-red-400"
                      )}>
                        {rental.status === "completed" ? "Terminée" :
                         rental.status === "active" ? "En cours" : "En retard"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Key className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucune location enregistrée</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            {client.notes ? (
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucune note interne</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
