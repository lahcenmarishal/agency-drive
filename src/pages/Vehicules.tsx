import { useState } from "react";
import { Car, Plus, Filter, Search, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVehicles, useVehicleDocumentAlerts, VehicleStatus, Vehicle } from "@/hooks/useVehicles";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { VehicleForm } from "@/components/vehicles/VehicleForm";
import { DocumentAlerts } from "@/components/vehicles/DocumentAlerts";
import { useAgencyFilterContext } from "@/contexts/AgencyFilterContext";
import { useAgencies } from "@/hooks/useAgencies";
import { useAuth } from "@/contexts/AuthContext";
const statusFilters: { value: VehicleStatus | "all"; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "available", label: "Disponibles" },
  { value: "rented", label: "Loués" },
  { value: "reserved", label: "Réservés" },
  { value: "maintenance", label: "Maintenance" },
];

export default function Vehicules() {
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>();

  const { isAdmin } = useAuth();
  const { effectiveAgencyId } = useAgencyFilterContext();
  const { data: agencies } = useAgencies();
  const { data: vehicles, isLoading } = useVehicles(statusFilter);
  const { data: documentAlerts } = useVehicleDocumentAlerts();

  const selectedAgencyName = effectiveAgencyId
    ? agencies?.find((a) => a.id === effectiveAgencyId)?.name
    : null;

  // Filtrer par recherche
  const filteredVehicles = vehicles?.filter((v) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      v.brand.toLowerCase().includes(query) ||
      v.model.toLowerCase().includes(query) ||
      v.registration.toLowerCase().includes(query)
    );
  });

  // Véhicules avec alertes
  const vehiclesWithAlerts = new Set(documentAlerts?.map((a) => a.vehicleId) || []);

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedVehicle(undefined);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">Véhicules</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {vehicles?.length || 0} véhicules
            {selectedAgencyName && (
              <span className="ml-1">
                • <Building2 className="inline h-3.5 w-3.5 mr-1" />
                {selectedAgencyName}
              </span>
            )}
            {!selectedAgencyName && isAdmin && " dans toutes les agences"}
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          <span className="sm:inline">Ajouter un véhicule</span>
        </Button>
      </div>

      {/* Document Alerts */}
      {documentAlerts && documentAlerts.length > 0 && (
        <DocumentAlerts />
      )}

      {/* Status Filters */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as VehicleStatus | "all")}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="w-max">
              {statusFilters.map((filter) => (
                <TabsTrigger key={filter.value} value={filter.value} className="text-xs md:text-sm">
                  {filter.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="relative flex-1 max-w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-10 bg-muted/30 border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Tabs>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!filteredVehicles || filteredVehicles.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Car className="h-16 w-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">Aucun véhicule trouvé</p>
          <p className="text-sm">Ajoutez votre premier véhicule pour commencer</p>
          <Button className="mt-4" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un véhicule
          </Button>
        </div>
      )}

      {/* Vehicles Grid */}
      {!isLoading && filteredVehicles && filteredVehicles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={handleEdit}
              hasDocumentAlert={vehiclesWithAlerts.has(vehicle.id)}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <VehicleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        vehicle={selectedVehicle}
      />
    </div>
  );
}
