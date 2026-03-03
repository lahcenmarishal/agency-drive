import { useState, useEffect } from "react";
import { Loader2, Building2, CreditCard, Search, RefreshCw, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface TenantSub {
  id: string;
  agency_id: string;
  plan_name: string;
  status: string;
  billing_interval: string;
  current_period_end: string | null;
  max_vehicles: number;
  max_users: number;
  amount: number | null;
  currency: string | null;
  agencies?: { name: string } | null;
}

export function AdminBillingPanel() {
  const [subscriptions, setSubscriptions] = useState<TenantSub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
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
          Tenant Subscriptions
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agencies..."
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
          <p>No tenant subscriptions found</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Agency</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Billing</th>
                  <th>Amount</th>
                  <th>Next Billing</th>
                  <th>Limits</th>
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
                      {sub.amount != null ? `$${sub.amount}/${sub.billing_interval === "yearly" ? "yr" : "mo"}` : "—"}
                    </td>
                    <td>
                      {sub.current_period_end
                        ? format(new Date(sub.current_period_end), "MMM dd, yyyy")
                        : "—"}
                    </td>
                    <td className="text-xs">
                      V:{sub.max_vehicles === -1 ? "∞" : sub.max_vehicles} /
                      U:{sub.max_users === -1 ? "∞" : sub.max_users}
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(sub)}
                        title={sub.status === "active" ? "Deactivate" : "Activate"}
                      >
                        {sub.status === "active" ? (
                          <PowerOff className="h-4 w-4 text-destructive" />
                        ) : (
                          <Power className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
