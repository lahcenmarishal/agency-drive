import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";

interface PlanLimits {
  canAddVehicle: boolean;
  canAddUser: boolean;
  canAddAgency: boolean;
  vehiclesRemaining: number | null; // null = unlimited
  usersRemaining: number | null;
  agenciesRemaining: number | null;
  isSubscriptionExpired: boolean;
  requiresUpgrade: boolean;
}

export function usePlanLimits(currentCounts?: {
  vehicles?: number;
  users?: number;
  agencies?: number;
}): PlanLimits {
  const { subscription, isActive } = useSubscription();
  const { isSuperAdmin } = useAuth();

  // Super admins have no limits
  if (isSuperAdmin) {
    return {
      canAddVehicle: true,
      canAddUser: true,
      canAddAgency: true,
      vehiclesRemaining: null,
      usersRemaining: null,
      agenciesRemaining: null,
      isSubscriptionExpired: false,
      requiresUpgrade: false,
    };
  }

  const maxVehicles = subscription?.max_vehicles ?? 10;
  const maxUsers = subscription?.max_users ?? 3;
  const maxAgencies = subscription?.max_agencies ?? 1;

  const isUnlimited = (limit: number) => limit === -1;

  const vehiclesRemaining = isUnlimited(maxVehicles) ? null : Math.max(0, maxVehicles - (currentCounts?.vehicles || 0));
  const usersRemaining = isUnlimited(maxUsers) ? null : Math.max(0, maxUsers - (currentCounts?.users || 0));
  const agenciesRemaining = isUnlimited(maxAgencies) ? null : Math.max(0, maxAgencies - (currentCounts?.agencies || 0));

  return {
    canAddVehicle: isUnlimited(maxVehicles) || (vehiclesRemaining ?? 1) > 0,
    canAddUser: isUnlimited(maxUsers) || (usersRemaining ?? 1) > 0,
    canAddAgency: isUnlimited(maxAgencies) || (agenciesRemaining ?? 1) > 0,
    vehiclesRemaining,
    usersRemaining,
    agenciesRemaining,
    isSubscriptionExpired: !isActive,
    requiresUpgrade: !isActive || (!isUnlimited(maxVehicles) && (vehiclesRemaining ?? 1) <= 0),
  };
}
