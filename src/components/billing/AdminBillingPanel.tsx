import { useState } from "react";
import { useEffect } from "react";
import { Loader2, Building2, CreditCard, Search, RefreshCw, Power, PowerOff, Pencil, Save, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { PLANS } from "@/config/subscriptionPlans";
import { cn } from "@/lib/utils";

interface TenantSub {
  id: string;
  agency_id: string;
  plan_name: string;
  status: string;
  billing_interval: string;
  current_period_end: string | null;
  current_period_start: string | null;
  max_vehicles: number;
  max_users: number;
  max_agencies: number;
  amount: number | null;
  currency: string | null;
  agencies?: { name: string } | null;
}

interface EditForm {
  plan_name: string;
  status: string;
  billing_interval: string;
  current_period_end: string;
  max_vehicles: number;
  max_users: number;
  max_agencies: number;
  amount: number;
}

export function AdminBillingPanel() {
  const [subscriptions, setSubscriptions] = useState<TenantSub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingSub, setEditingSub] = useState<TenantSub | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("tenant_subscriptions")
      .select("*, agencies(name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching subscriptions:", error);
      toast({ title: "Error", description: "Failed to fetch subscriptions", variant: "destructive" });
    } else {
      setSubscriptions((data as any[]) || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleToggleStatus = async (sub: TenantSub) => {
    const newStatus = sub.status === "active" ? "cancelled" : "active";
    const { error } = await supabase
      .from("tenant_subscriptions")
      .update({ status: newStatus })
      .eq("id", sub.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update subscription", variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `Subscription ${newStatus === "active" ? "activated" : "deactivated"} for ${(sub.agencies as any)?.name || sub.agency_id}` });
      fetchSubscriptions();
    }
  };

  const handleRenew = async (sub: TenantSub) => {
    const plan = PLANS[sub.plan_name];
    const now = new Date();
    const periodEnd = new Date();
    if (sub.billing_interval === "yearly") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const { error } = await supabase
      .from("tenant_subscriptions")
      .update({
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        max_vehicles: plan?.maxVehicles ?? sub.max_vehicles,
        max_users: plan?.maxUsers ?? sub.max_users,
        max_agencies: plan?.maxAgencies ?? sub.max_agencies,
      })
      .eq("id", sub.id);

    if (error) {
      toast({ title: "Erreur", description: "Impossible de renouveler l'abonnement", variant: "destructive" });
    } else {
      toast({ title: "Renouvelé", description: `Abonnement renouvelé pour ${(sub.agencies as any)?.name || sub.agency_id}` });
      fetchSubscriptions();
    }
  };

  const openEdit = (sub: TenantSub) => {
    setEditingSub(sub);
    setEditForm({
      plan_name: sub.plan_name,
      status: sub.status,
      billing_interval: sub.billing_interval,
      current_period_end: sub.current_period_end ? sub.current_period_end.slice(0, 10) : "",
      max_vehicles: sub.max_vehicles,
      max_users: sub.max_users,
      max_agencies: sub.max_agencies,
      amount: sub.amount ?? 0,
    });
  };

  const handlePlanChange = (planKey: string) => {
    if (!editForm) return;
    const plan = PLANS[planKey];
    if (plan) {
      const price = editForm.billing_interval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
      setEditForm({
        ...editForm,
        plan_name: planKey,
        max_vehicles: plan.maxVehicles,
        max_users: plan.maxUsers,
        max_agencies: plan.maxAgencies,
        amount: price,
      });
    }
  };

  const handleIntervalChange = (interval: string) => {
    if (!editForm) return;
    const plan = PLANS[editForm.plan_name];
    const price = plan ? (interval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice) : editForm.amount;
    setEditForm({ ...editForm, billing_interval: interval, amount: price });
  };

  const handleSaveEdit = async () => {
    if (!editingSub || !editForm) return;
    setSaving(true);

    const updateData: any = {
      plan_name: editForm.plan_name,
      status: editForm.status,
      billing_interval: editForm.billing_interval,
      max_vehicles: editForm.max_vehicles,
      max_users: editForm.max_users,
      max_agencies: editForm.max_agencies,
      amount: editForm.amount,
    };

    if (editForm.current_period_end) {
      updateData.current_period_end = new Date(editForm.current_period_end).toISOString();
    }

    const { error } = await supabase
      .from("tenant_subscriptions")
      .update(updateData)
      .eq("id", editingSub.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update subscription", variant: "destructive" });
    } else {
      toast({ title: "Mis à jour", description: `Abonnement modifié pour ${(editingSub.agencies as any)?.name || editingSub.agency_id}` });
      setEditingSub(null);
      setEditForm(null);
      fetchSubscriptions();
    }
    setSaving(false);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "active":
      case "trialing":
        return "default";
      case "past_due":
        return "destructive";
      case "cancelled":
      case "expired":
        return "secondary";
      default:
        return "outline";
    }
  };

  const filtered = subscriptions.filter((s) => {
    const agencyName = (s.agencies as any)?.name?.toLowerCase() || "";
    return agencyName.includes(search.toLowerCase()) || s.plan_name.includes(search.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold font-display flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Gestion des abonnements
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher agence..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchSubscriptions}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-8 text-center text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Aucun abonnement trouvé</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Agence</th>
                  <th>Plan</th>
                  <th>Statut</th>
                  <th>Facturation</th>
                  <th>Montant</th>
                  <th>Prochaine échéance</th>
                  <th>Limites</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => (
                  <tr key={sub.id}>
                    <td className="font-medium">{(sub.agencies as any)?.name || sub.agency_id.slice(0, 8)}</td>
                    <td className="capitalize">{sub.plan_name}</td>
                    <td>
                      <Badge variant={statusColor(sub.status) as any} className="capitalize">
                        {sub.status}
                      </Badge>
                    </td>
                    <td className="capitalize">{sub.billing_interval}</td>
                    <td>
                      {sub.amount != null ? `$${sub.amount}/${sub.billing_interval === "yearly" ? "an" : "mois"}` : "—"}
                    </td>
                    <td>
                      {sub.current_period_end
                        ? format(new Date(sub.current_period_end), "dd MMM yyyy")
                        : "—"}
                    </td>
                    <td className="text-xs">
                      V:{sub.max_vehicles === -1 ? "∞" : sub.max_vehicles} /
                      U:{sub.max_users === -1 ? "∞" : sub.max_users} /
                      A:{sub.max_agencies === -1 ? "∞" : sub.max_agencies}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(sub)}
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(sub)}
                          title={sub.status === "active" ? "Désactiver" : "Activer"}
                        >
                          {sub.status === "active" ? (
                            <PowerOff className="h-4 w-4 text-destructive" />
                          ) : (
                            <Power className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Subscription Dialog */}
      <Dialog open={!!editingSub} onOpenChange={(open) => { if (!open) { setEditingSub(null); setEditForm(null); } }}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Modifier l'abonnement — {(editingSub?.agencies as any)?.name || ""}
            </DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Plan</label>
                <Select value={editForm.plan_name} onValueChange={handlePlanChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PLANS).map(([key, p]) => (
                      <SelectItem key={key} value={key}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Statut</label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="trialing">Essai</SelectItem>
                    <SelectItem value="past_due">En retard</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                    <SelectItem value="expired">Expiré</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Facturation</label>
                <div className="flex items-center gap-3">
                  <span className={cn("text-sm", editForm.billing_interval === "monthly" ? "text-foreground font-medium" : "text-muted-foreground")}>Mensuel</span>
                  <Switch
                    checked={editForm.billing_interval === "yearly"}
                    onCheckedChange={(checked) => handleIntervalChange(checked ? "yearly" : "monthly")}
                  />
                  <span className={cn("text-sm", editForm.billing_interval === "yearly" ? "text-foreground font-medium" : "text-muted-foreground")}>Annuel</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Date d'échéance</label>
                <Input
                  type="date"
                  value={editForm.current_period_end}
                  onChange={(e) => setEditForm({ ...editForm, current_period_end: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Montant ($)</label>
                <Input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: Number(e.target.value) })}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Max véhicules</label>
                  <Input
                    type="number"
                    value={editForm.max_vehicles}
                    onChange={(e) => setEditForm({ ...editForm, max_vehicles: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">-1 = illimité</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Max users</label>
                  <Input
                    type="number"
                    value={editForm.max_users}
                    onChange={(e) => setEditForm({ ...editForm, max_users: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Max agences</label>
                  <Input
                    type="number"
                    value={editForm.max_agencies}
                    onChange={(e) => setEditForm({ ...editForm, max_agencies: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => { setEditingSub(null); setEditForm(null); }}>
                  <X className="h-4 w-4 mr-2" /> Annuler
                </Button>
                <Button onClick={handleSaveEdit} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Enregistrer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
