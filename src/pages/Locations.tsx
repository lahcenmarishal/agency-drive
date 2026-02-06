import { useState } from "react";
import { Key, Plus, Search, Clock, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useRentals, useCompleteRental, useTodayReturns, useOverdueRentals, Rental } from "@/hooks/useRentals";
import { RentalForm } from "@/components/rentals/RentalForm";
import { format, differenceInDays } from "date-fns";
import { Enums } from "@/integrations/supabase/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const statusLabels: Record<string, string> = {
  active: "En cours",
  completed: "Terminée",
  overdue: "En retard",
};

const statusClasses: Record<string, string> = {
  active: "bg-blue-500/15 text-blue-400",
  completed: "bg-green-500/15 text-green-400",
  overdue: "bg-red-500/15 text-red-400",
};

const statusFilters: { value: Enums<"rental_status"> | "all"; label: string }[] = [
  { value: "all" as any, label: "Toutes" },
  { value: "active", label: "En cours" },
  { value: "completed", label: "Terminées" },
];

export default function Locations() {
  const [statusFilter, setStatusFilter] = useState<Enums<"rental_status"> | "all">("all" as any);
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [amountPaid, setAmountPaid] = useState<string>("");

  const { data: rentals, isLoading } = useRentals(statusFilter === "all" ? undefined : statusFilter);
  const { data: todayReturns } = useTodayReturns();
  const { data: overdueRentals } = useOverdueRentals();
  const completeRental = useCompleteRental();

  // Filtrer par recherche
  const filteredRentals = rentals?.filter((r) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.clients?.full_name?.toLowerCase().includes(query) ||
      r.vehicles?.brand?.toLowerCase().includes(query) ||
      r.vehicles?.model?.toLowerCase().includes(query) ||
      r.vehicles?.registration?.toLowerCase().includes(query)
    );
  });

  const handleComplete = (rental: Rental) => {
    setSelectedRental(rental);
    setAmountPaid(rental.total_amount?.toString() || "");
    setCompleteDialogOpen(true);
  };

  const confirmComplete = async () => {
    if (selectedRental) {
      await completeRental.mutateAsync({ 
        id: selectedRental.id, 
        amountPaid: parseFloat(amountPaid) || undefined 
      });
      setCompleteDialogOpen(false);
      setSelectedRental(null);
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    return differenceInDays(end, today);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">Locations</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Suivez les locations en cours et passées
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Nouvelle location
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        <div className="glass-card p-3 md:p-5 flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-blue-500/10">
            <Key className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-xl md:text-2xl font-bold font-display">
              {rentals?.filter((r) => r.status === "active").length || 0}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">Actives</p>
          </div>
        </div>
        <div className="glass-card p-3 md:p-5 flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-amber-500/10">
            <Clock className="h-5 w-5 md:h-6 md:w-6 text-amber-400" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-xl md:text-2xl font-bold font-display">{todayReturns?.length || 0}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Retours</p>
          </div>
        </div>
        <div className="glass-card p-3 md:p-5 flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-red-500/10">
            <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-red-400" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-xl md:text-2xl font-bold font-display">{overdueRentals?.length || 0}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Retards</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="w-max">
              {statusFilters.map((filter) => (
                <TabsTrigger key={filter.value} value={filter.value} className="text-xs md:text-sm">
                  {filter.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="relative flex-1 max-w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-10 bg-muted/30 border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Tabs>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!filteredRentals || filteredRentals.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Key className="h-16 w-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">Aucune location trouvée</p>
          <p className="text-sm">Créez votre première location</p>
          <Button className="mt-4" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle location
          </Button>
        </div>
      )}

      {/* Locations Table - Desktop */}
      {!isLoading && filteredRentals && filteredRentals.length > 0 && (
        <div className="glass-card overflow-hidden hidden lg:block">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Véhicule</th>
                  <th>Période</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
            <tbody>
              {filteredRentals.map((rental) => {
                const daysRemaining = getDaysRemaining(rental.end_date);
                const isOverdue = rental.status === "active" && daysRemaining < 0;

                return (
                  <tr key={rental.id} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-foreground font-medium text-sm">
                          {rental.clients?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?"}
                        </div>
                        <span className="font-medium">{rental.clients?.full_name || "Client"}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium">
                          {rental.vehicles?.brand} {rental.vehicles?.model}
                        </p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {rental.vehicles?.registration}
                        </p>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm">
                        {format(new Date(rental.start_date), "dd/MM/yyyy")} → {format(new Date(rental.end_date), "dd/MM/yyyy")}
                      </p>
                      {rental.status === "active" && (
                        <p className={cn(
                          "text-xs mt-1",
                          isOverdue ? "text-red-400" : daysRemaining <= 1 ? "text-amber-400" : "text-muted-foreground"
                        )}>
                          {isOverdue 
                            ? `${Math.abs(daysRemaining)} jour(s) de retard`
                            : daysRemaining === 0 
                            ? "Retour aujourd'hui"
                            : `${daysRemaining} jour(s) restant(s)`
                          }
                        </p>
                      )}
                    </td>
                    <td>
                      <p className="font-semibold text-primary">
                        {rental.total_amount || 0} MAD
                      </p>
                      {rental.amount_paid && rental.amount_paid > 0 && (
                        <p className="text-xs text-green-400">
                          Payé: {rental.amount_paid} MAD
                        </p>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium",
                            isOverdue 
                              ? statusClasses["overdue"]
                              : statusClasses[rental.status || "active"]
                          )}
                        >
                          {isOverdue ? "En retard" : statusLabels[rental.status || "active"]}
                        </span>
                      </div>
                    </td>
                    <td>
                      {rental.status === "active" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleComplete(rental)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Terminer
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Locations Cards - Mobile */}
      {!isLoading && filteredRentals && filteredRentals.length > 0 && (
        <div className="lg:hidden space-y-3">
          {filteredRentals.map((rental) => {
            const daysRemaining = getDaysRemaining(rental.end_date);
            const isOverdue = rental.status === "active" && daysRemaining < 0;

            return (
              <div key={rental.id} className="glass-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-foreground font-medium text-sm shrink-0">
                      {rental.clients?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{rental.clients?.full_name || "Client"}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {rental.vehicles?.brand} {rental.vehicles?.model}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium shrink-0",
                      isOverdue 
                        ? statusClasses["overdue"]
                        : statusClasses[rental.status || "active"]
                    )}
                  >
                    {isOverdue ? "Retard" : statusLabels[rental.status || "active"]}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {format(new Date(rental.start_date), "dd/MM")} → {format(new Date(rental.end_date), "dd/MM/yyyy")}
                  </span>
                  <span className="font-semibold text-primary">{rental.total_amount || 0} MAD</span>
                </div>
                {rental.status === "active" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => handleComplete(rental)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Terminer
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <RentalForm open={formOpen} onOpenChange={setFormOpen} />

      {/* Complete Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Terminer la location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">Client</p>
              <p className="font-medium">{selectedRental?.clients?.full_name}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">Véhicule</p>
              <p className="font-medium">
                {selectedRental?.vehicles?.brand} {selectedRental?.vehicles?.model}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground">Montant total</p>
              <p className="text-xl font-bold font-display text-primary">
                {selectedRental?.total_amount || 0} MAD
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount-paid">Montant payé (MAD)</Label>
              <Input
                id="amount-paid"
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="Entrez le montant payé"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmComplete} disabled={completeRental.isPending}>
              {completeRental.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer le retour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
