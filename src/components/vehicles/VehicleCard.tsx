import { Car, Fuel, Users, MoreVertical, Edit, Trash2, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Vehicle, useDeleteVehicle } from "@/hooks/useVehicles";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const statusLabels: Record<string, string> = {
  available: "Disponible",
  rented: "Loué",
  reserved: "Réservé",
  maintenance: "Maintenance",
};

const statusClasses: Record<string, string> = {
  available: "status-available",
  rented: "status-rented",
  reserved: "status-reserved",
  maintenance: "status-maintenance",
};

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  hasDocumentAlert?: boolean;
}

export function VehicleCard({ vehicle, onEdit, hasDocumentAlert }: VehicleCardProps) {
  const deleteVehicle = useDeleteVehicle();

  return (
    <div className="glass-card overflow-hidden group">
      {/* Vehicle Image Placeholder */}
      <div className="h-40 bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center relative">
        <Car className="h-16 w-16 text-muted-foreground/30" />
        {hasDocumentAlert && (
          <div className="absolute top-3 right-3">
            <div className="p-1.5 rounded-full bg-amber-500/20">
              <FileWarning className="h-4 w-4 text-amber-400" />
            </div>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold font-display">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-sm text-muted-foreground font-mono">
              {vehicle.registration}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("status-badge", statusClasses[vehicle.status || "available"])}>
              {statusLabels[vehicle.status || "available"]}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(vehicle)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer le véhicule ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Le véhicule {vehicle.brand} {vehicle.model} sera définitivement supprimé.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteVehicle.mutate(vehicle.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          {vehicle.fuel_type && (
            <div className="flex items-center gap-1.5">
              <Fuel className="h-4 w-4" />
              <span>{vehicle.fuel_type}</span>
            </div>
          )}
          {vehicle.seats && (
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{vehicle.seats} places</span>
            </div>
          )}
          {vehicle.year && (
            <span>{vehicle.year}</span>
          )}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-xl font-bold font-display text-primary">
              {vehicle.daily_rate || 0} MAD
            </p>
            <p className="text-xs text-muted-foreground">par jour</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onEdit(vehicle)}>
            Voir détails
          </Button>
        </div>
      </div>
    </div>
  );
}
