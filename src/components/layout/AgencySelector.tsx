import { Building2, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAgencies } from "@/hooks/useAgencies";
import { useAgencyFilterContext } from "@/contexts/AgencyFilterContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export function AgencySelector() {
  const { isAdmin } = useAuth();
  const { data: agencies, isLoading } = useAgencies();
  const { selectedAgencyId, setSelectedAgencyId } = useAgencyFilterContext();

  // Only show for admins
  if (!isAdmin) return null;

  const selectedAgency = agencies?.find((a) => a.id === selectedAgencyId);

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
              {selectedAgency ? selectedAgency.name : "Toutes les agences"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        <DropdownMenuItem
          onClick={() => setSelectedAgencyId(null)}
          className={cn(!selectedAgencyId && "bg-accent")}
        >
          <div className="flex items-center justify-between w-full">
            <span>Toutes les agences</span>
            {!selectedAgencyId && <Check className="h-4 w-4" />}
          </div>
        </DropdownMenuItem>
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
