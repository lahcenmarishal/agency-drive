import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useAccessibleAgencies } from "@/hooks/useAccessibleAgencies";

interface AgencyFilterContextType {
  selectedAgencyId: string | null;
  setSelectedAgencyId: (id: string | null) => void;
  effectiveAgencyId: string | null;
  accessibleAgencyIds: string[];
  isLoadingAgencies: boolean;
}

const AgencyFilterContext = createContext<AgencyFilterContextType | undefined>(undefined);

export function AgencyFilterProvider({ children }: { children: ReactNode }) {
  const { isSuperAdmin, isAdmin, agencyId: userAgencyId, isLoading: isAuthLoading } = useAuth();
  const { data: accessibleAgencies, isLoading: isAgenciesLoading } = useAccessibleAgencies();
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);

  const accessibleAgencyIds = accessibleAgencies?.map((a) => a.id) || [];

  // For non-super-admin users, auto-select first accessible agency if only one exists
  useEffect(() => {
    if (!isSuperAdmin && accessibleAgencies && accessibleAgencies.length === 1) {
      setSelectedAgencyId(accessibleAgencies[0].id);
    }
  }, [isSuperAdmin, accessibleAgencies]);

  // For super admins: use selected agency or null (all agencies)
  // For admins: use selected agency or null (all their accessible agencies)
  // For agents: always use their own agency
  const effectiveAgencyId = isAuthLoading 
    ? null 
    : (isSuperAdmin || isAdmin) 
      ? selectedAgencyId 
      : userAgencyId;

  return (
    <AgencyFilterContext.Provider
      value={{
        selectedAgencyId,
        setSelectedAgencyId,
        effectiveAgencyId,
        accessibleAgencyIds,
        isLoadingAgencies: isAgenciesLoading,
      }}
    >
      {children}
    </AgencyFilterContext.Provider>
  );
}

export function useAgencyFilterContext() {
  const context = useContext(AgencyFilterContext);
  if (context === undefined) {
    throw new Error("useAgencyFilterContext must be used within an AgencyFilterProvider");
  }
  return context;
}
