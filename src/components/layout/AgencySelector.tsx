import { Building2, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccessibleAgencies } from "@/hooks/useAccessibleAgencies";
import { useAgencyFilterContext } from "@/contexts/AgencyFilterContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export function AgencySelector() {
  const { isSuperAdmin, isAdmin } = useAuth();
  const { data: agencies, isLoading } = useAccessibleAgencies();
  const { selectedAgencyId, setSelectedAgencyId } = useAgencyFilterContext();

  // Only show for admins (super admin or agency admin)
  if (!isAdmin) return null;

  // If only one agency, don't show selector (auto-selected)
  if (!isSuperAdmin && agencies?.length === 1) return null;

  const selectedAgency = agencies?.find((a) => a.id === selectedAgencyId);

  // Label for "all agencies" option
  const allLabel = isSuperAdmin ? "Toutes les agences" : "Mes agences";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 bg-muted/30 border-border min-w-[200px] justify-between"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="truncate">
              {selectedAgency ? selectedAgency.name : allLabel}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        {/* Only show "All" option if super admin OR admin with multiple agencies */}
        {(isSuperAdmin || (agencies && agencies.length > 1)) && (
          <DropdownMenuItem
            onClick={() => setSelectedAgencyId(null)}
            className={cn(!selectedAgencyId && "bg-accent")}
          >
            <div className="flex items-center justify-between w-full">
              <span>{allLabel}</span>
              {!selectedAgencyId && <Check className="h-4 w-4" />}
            </div>
          </DropdownMenuItem>
        )}
        {isLoading ? (
          <DropdownMenuItem disabled>Chargement...</DropdownMenuItem>
        ) : (
          agencies?.map((agency) => (
            <DropdownMenuItem
              key={agency.id}
              onClick={() => setSelectedAgencyId(agency.id)}
              className={cn(selectedAgencyId === agency.id && "bg-accent")}
            >
              <div className="flex items-center justify-between w-full">
                <span className="truncate">{agency.name}</span>
                {selectedAgencyId === agency.id && <Check className="h-4 w-4" />}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
