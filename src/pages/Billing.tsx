import { useState } from "react";
import { Check, CreditCard, Loader2, Crown, Zap, Building2, RefreshCw, ExternalLink, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PLANS } from "@/config/subscriptionPlans";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Navigate } from "react-router-dom";

export default function Billing() {
  const { t } = useTranslation();
  const { subscription, isLoading, isActive, planName, refreshSubscription } = useSubscription();
  const { agencyId, isAdmin, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [yearlyBilling, setYearlyBilling] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Super admin should not see billing page - redirect to dashboard
  if (isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubscribe = async (planKey: string) => {
    if (!agencyId) {
      toast({ title: "Error", description: "No agency found. Please contact support.", variant: "destructive" });
      return;
    }

    const plan = PLANS[planKey];
    if (!plan) return;

    setLoadingPlan(planKey);
    try {
      const priceId = yearlyBilling ? plan.yearlyPriceId : plan.monthlyPriceId;
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId, agencyId },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create checkout session", variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to open billing portal", variant: "destructive" });
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSubscription();
    setRefreshing(false);
    toast({ title: "Refreshed", description: "Subscription status updated." });
  };

  const planIcons: Record<string, typeof Crown> = {
    basic: Zap,
    pro: Crown,
    enterprise: Building2,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Expired subscription warning */}
      {!isActive && !isLoading && (
        <div className="glass-card p-6 border-destructive/50 bg-destructive/5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-destructive">Abonnement expiré</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Votre abonnement a expiré. Veuillez renouveler votre plan pour continuer à utiliser toutes les fonctionnalités de l'application.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">Billing & Subscription</h1>
          <p className="text-muted-foreground mt-1">Manage your subscription and billing details</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {isActive && subscription?.subscribed && (
            <Button variant="outline" size="sm" onClick={handleManageSubscription} disabled={loadingPortal}>
              {loadingPortal ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ExternalLink className="h-4 w-4 mr-2" />}
              Manage Billing
            </Button>
          )}
        </div>
      </div>

      {/* Current plan status */}
      {subscription?.subscribed && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold font-display">Current Plan</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="font-semibold capitalize">{subscription.plan}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={subscription.status === "active" ? "default" : "secondary"} className="capitalize">
                {subscription.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Billing</p>
              <p className="font-semibold capitalize">{subscription.billing_interval || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Billing</p>
              <p className="font-semibold">
                {subscription.subscription_end
                  ? format(new Date(subscription.subscription_end), "MMM dd, yyyy")
                  : "N/A"}
              </p>
            </div>
          </div>
          {subscription.max_vehicles !== -1 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Plan Limits</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span>Vehicles: <strong>{subscription.max_vehicles}</strong></span>
                <span>Users: <strong>{subscription.max_users}</strong></span>
                <span>Agencies: <strong>{subscription.max_agencies}</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={`text-sm font-medium ${!yearlyBilling ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
        <Switch checked={yearlyBilling} onCheckedChange={setYearlyBilling} />
        <span className={`text-sm font-medium ${yearlyBilling ? "text-foreground" : "text-muted-foreground"}`}>
          Yearly <Badge variant="secondary" className="ml-1 text-xs">Save 17%</Badge>
        </span>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(PLANS).map(([key, plan]) => {
          const Icon = planIcons[key] || Zap;
          const isCurrentPlan = planName === key;
          const price = yearlyBilling ? plan.yearlyPrice : plan.monthlyPrice;
          const interval = yearlyBilling ? "/year" : "/month";

          return (
            <Card
              key={key}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                key === "pro" ? "border-primary/50 shadow-[var(--shadow-gold)]" : ""
              } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
            >
              {key === "pro" && (
                <div className="absolute top-0 right-0 px-3 py-1 premium-gradient text-xs font-bold text-primary-foreground rounded-bl-lg">
                  POPULAR
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute top-0 left-0 px-3 py-1 bg-primary text-xs font-bold text-primary-foreground rounded-br-lg">
                  YOUR PLAN
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${key === "pro" ? "premium-gradient" : "bg-primary/10"}`}>
                    <Icon className={`h-5 w-5 ${key === "pro" ? "text-primary-foreground" : "text-primary"}`} />
                  </div>
                  <CardTitle className="text-xl font-display">{plan.name}</CardTitle>
                </div>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">${price}</span>
                  <span className="text-muted-foreground">{interval}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrentPlan ? (
                  <Button className="w-full" variant="outline" onClick={handleManageSubscription} disabled={loadingPortal}>
                    {loadingPortal ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Manage Plan
                  </Button>
                ) : (
                  <Button
                    className={`w-full ${key === "pro" ? "premium-gradient text-primary-foreground hover:opacity-90" : ""}`}
                    variant={key === "pro" ? "default" : "outline"}
                    onClick={() => handleSubscribe(key)}
                    disabled={loadingPlan === key}
                  >
                    {loadingPlan === key ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    {subscription?.subscribed ? "Switch to " : "Subscribe to "}{plan.name}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
