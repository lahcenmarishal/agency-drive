import { useAuth } from "@/contexts/AuthContext";
import { useAgencyFilterContext } from "@/contexts/AgencyFilterContext";

/**
 * Hook to get agency filter for queries
 * - Admin with selected agency: returns that agency_id
 * - Admin with no selection: returns null (sees all agencies)
 * - Agent: returns their agency_id (only sees their agency)
 */
export function useAgencyFilter() {
  const { isAdmin, agencyId: userAgencyId } = useAuth();
  
  // Try to use context, but handle case when not wrapped
  let effectiveAgencyId: string | null = null;
  
  try {
    const context = useAgencyFilterContext();
    effectiveAgencyId = context.effectiveAgencyId;
  } catch {
    // Context not available, use basic logic
    effectiveAgencyId = isAdmin ? null : userAgencyId;
  }

  return {
    filterByAgency: effectiveAgencyId,
    isAdmin,
    agencyId: userAgencyId,
  };
}
