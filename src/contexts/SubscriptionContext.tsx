import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionData {
  subscribed: boolean;
  plan: string | null;
  status: string;
  subscription_end: string | null;
  max_vehicles: number;
  max_users: number;
  max_agencies: number;
  billing_interval: string | null;
  amount: number | null;
  currency: string | null;
}

interface SubscriptionContextType {
  subscription: SubscriptionData | null;
  isLoading: boolean;
  isActive: boolean;
  planName: string;
  refreshSubscription: () => Promise<void>;
}

const defaultSubscription: SubscriptionData = {
  subscribed: false,
  plan: null,
  status: "none",
  subscription_end: null,
  max_vehicles: 10,
  max_users: 3,
  max_agencies: 1,
  billing_interval: null,
  amount: null,
  currency: null,
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, agencyId, isSuperAdmin } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    // Super admins bypass subscription checks
    if (isSuperAdmin) {
      setSubscription({
        subscribed: true,
        plan: "enterprise",
        status: "active",
        subscription_end: null,
        max_vehicles: -1,
        max_users: -1,
        max_agencies: -1,
        billing_interval: null,
        amount: null,
        currency: null,
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        body: { agencyId },
      });

      if (error) {
        console.error("Error checking subscription:", error);
        setSubscription(defaultSubscription);
      } else {
        setSubscription(data);
      }
    } catch (err) {
      console.error("Subscription check failed:", err);
      setSubscription(defaultSubscription);
    } finally {
      setIsLoading(false);
    }
  }, [user, agencyId, isSuperAdmin]);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(refreshSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, refreshSubscription]);

  const isActive = subscription?.subscribed === true ||
    subscription?.status === "active" ||
    subscription?.status === "trialing" ||
    isSuperAdmin;

  const planName = subscription?.plan || "none";

  return (
    <SubscriptionContext.Provider value={{ subscription, isLoading, isActive, planName, refreshSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
