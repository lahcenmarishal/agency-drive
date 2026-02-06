import { useAuth } from "@/contexts/AuthContext";
import { useAgencyFilterContext } from "@/contexts/AgencyFilterContext";

/**
 * Hook to get agency filter for queries
 * - Super Admin with selected agency: returns that agency_id
 * - Super Admin with no selection: returns null (sees all agencies)
 * - Admin with selected agency: returns that agency_id  
 * - Admin with no selection: returns accessibleAgencyIds for filtering
 * - Agent: returns their agency_id (only sees their agency)
 */
export function useAgencyFilter() {
  const { isAdmin, isSuperAdmin, agencyId: userAgencyId } = useAuth();
  
  // Try to use context, but handle case when not wrapped
  let effectiveAgencyId: string | null = null;
  let accessibleAgencyIds: string[] = [];
  
  try {
    const context = useAgencyFilterContext();
    effectiveAgencyId = context.effectiveAgencyId;
    accessibleAgencyIds = context.accessibleAgencyIds;
  } catch {
    // Context not available, use basic logic
    effectiveAgencyId = isAdmin ? null : userAgencyId;
  }

  return {
    // For filtering queries - if effectiveAgencyId is set, use it
    // Otherwise for non-super-admins, use accessibleAgencyIds
    filterByAgency: effectiveAgencyId,
    // For .in() queries when no specific agency selected
    filterByAgencies: effectiveAgencyId ? null : (isSuperAdmin ? null : accessibleAgencyIds),
    isAdmin,
    isSuperAdmin,
    agencyId: userAgencyId,
    accessibleAgencyIds,
  };
}
