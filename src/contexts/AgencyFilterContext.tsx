import { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface AgencyFilterContextType {
  selectedAgencyId: string | null;
  setSelectedAgencyId: (id: string | null) => void;
  effectiveAgencyId: string | null;
}

const AgencyFilterContext = createContext<AgencyFilterContextType | undefined>(undefined);

export function AgencyFilterProvider({ children }: { children: ReactNode }) {
  const { isAdmin, agencyId: userAgencyId, isLoading } = useAuth();
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);

  // For admins: use selected agency or null (all agencies)
  // For agents: always use their own agency
  // Important: Don't compute effectiveAgencyId until auth is loaded
  const effectiveAgencyId = isLoading ? null : (isAdmin ? selectedAgencyId : userAgencyId);

  return (
    <AgencyFilterContext.Provider
      value={{
        selectedAgencyId,
        setSelectedAgencyId,
        effectiveAgencyId,
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
