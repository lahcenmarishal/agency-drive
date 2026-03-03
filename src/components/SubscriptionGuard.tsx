import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { isSuperAdmin, isLoading: authLoading } = useAuth();
  const { isLoading: subLoading, isActive } = useSubscription();
  const location = useLocation();

  // Super admins bypass all subscription checks
  if (isSuperAdmin) return <>{children}</>;

  // Pages accessible without active subscription
  const allowedPaths = ["/billing", "/parametres", "/auth"];
  const isAllowedPath = allowedPaths.some((p) => location.pathname.startsWith(p));
  if (isAllowedPath) return <>{children}</>;

  if (authLoading || subLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If subscription is not active, redirect to billing
  if (!isActive) {
    return <Navigate to="/billing" replace />;
  }

  return <>{children}</>;
}
