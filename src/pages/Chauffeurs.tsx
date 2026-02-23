import { useState } from "react";
import { Truck, Plus, Search, Phone, FileCheck, Calendar, Edit2, Trash2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DriverForm } from "@/components/drivers/DriverForm";
import {
  useDrivers,
  useCreateDriver,
  useUpdateDriver,
  useDeleteDriver,
  useToggleDriverStatus,
  useDriverLicenseAlerts,
  type Driver,
} from "@/hooks/useDrivers";
import { format, isAfter, addDays } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

export default function Chauffeurs() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "fr" ? fr : enUS;
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deletingDriver, setDeletingDriver] = useState<Driver | null>(null);

  const { data: drivers, isLoading } = useDrivers();
  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();
  const deleteDriver = useDeleteDriver();
  const toggleStatus = useToggleDriverStatus();
  const licenseAlerts = useDriverLicenseAlerts();

  const filteredDrivers = drivers?.filter((driver) =>
    driver.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.license_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (data: any) => {
    createDriver.mutate(data, {
      onSuccess: () => setIsFormOpen(false),
    });
  };

  const handleUpdate = (data: any) => {
    if (!editingDriver) return;
    updateDriver.mutate(
      { id: editingDriver.id, ...data },
      { onSuccess: () => setEditingDriver(null) }
    );
  };

  const handleDelete = () => {
    if (!deletingDriver) return;
    deleteDriver.mutate(deletingDriver.id, {
      onSuccess: () => setDeletingDriver(null),
    });
  };

  const isLicenseExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const warningDate = addDays(new Date(), 30);
    return isAfter(warningDate, expiry);
  };

  const isLicenseExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return isAfter(new Date(), new Date(expiryDate));
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">{t("drivers.title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            {t("drivers.subtitle")}
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4" />
          {t("drivers.addDriver")}
        </Button>
      </div>

      {/* License Alerts */}
      {licenseAlerts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">{t("drivers.licenseAlerts")}</span>
          </div>
          <ul className="space-y-1">
            {licenseAlerts.map((driver) => (
              <li key={driver.id} className="text-sm text-muted-foreground">
                {t("drivers.licenseExpiry", {
                  name: driver.full_name,
                  date: format(new Date(driver.license_expiry!), "d MMMM yyyy", { locale: dateLocale }),
                })}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("drivers.searchPlaceholder")}
          className="pl-10 bg-muted/30 border-border"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Drivers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : filteredDrivers?.length === 0 ? (
        <div className="text-center py-12">
          <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">{t("drivers.noDrivers")}</h3>
          <p className="text-muted-foreground mt-1">{t("drivers.startAdding")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers?.map((chauffeur) => (
            <div key={chauffeur.id} className="glass-card p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Truck className="h-7 w-7" />
                </div>
                <div className="flex items-center gap-2">
                  {chauffeur.is_active ? (
                    <Badge variant="outline" className="bg-green-500/15 text-green-400 border-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t("common.active")}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-500/15 text-red-400 border-red-500/30">
                      <XCircle className="h-3 w-3 mr-1" />
                      {t("common.inactive")}
                    </Badge>
                  )}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold font-display mb-1">{chauffeur.full_name}</h3>
              
              {chauffeur.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Phone className="h-4 w-4" />
                  <span>{chauffeur.phone}</span>
                </div>
              )}
              
              <div className="space-y-3 pt-4 border-t border-border">
                {chauffeur.license_number && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileCheck className="h-4 w-4" />
                      <span>{t("drivers.license")}</span>
                    </div>
                    <span className="font-medium">{chauffeur.license_number}</span>
                  </div>
                )}
                
                {chauffeur.license_expiry && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{t("drivers.expiry")}</span>
                    </div>
                    <span
                      className={cn(
                        "font-medium",
                        isLicenseExpired(chauffeur.license_expiry)
                          ? "text-red-500"
                          : isLicenseExpiringSoon(chauffeur.license_expiry)
                          ? "text-amber-500"
                          : ""
                      )}
                    >
                      {format(new Date(chauffeur.license_expiry), "dd/MM/yyyy")}
                      {isLicenseExpired(chauffeur.license_expiry) && (
                        <AlertTriangle className="h-3.5 w-3.5 inline ml-1" />
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditingDriver(chauffeur)}>
                  <Edit2 className="h-3.5 w-3.5 mr-1" />
                  {t("common.modify")}
                </Button>
                <Button
                  size="sm"
                  variant={chauffeur.is_active ? "outline" : "default"}
                  onClick={() => toggleStatus.mutate({ id: chauffeur.id, is_active: !chauffeur.is_active })}
                >
                  {chauffeur.is_active ? t("dashboard.deactivate") : t("dashboard.activate")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeletingDriver(chauffeur)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("drivers.addDriverTitle")}</DialogTitle>
          </DialogHeader>
          <DriverForm
            onSubmit={handleCreate}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createDriver.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingDriver} onOpenChange={() => setEditingDriver(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("drivers.editDriver")}</DialogTitle>
          </DialogHeader>
          <DriverForm
            driver={editingDriver}
            onSubmit={handleUpdate}
            onCancel={() => setEditingDriver(null)}
            isLoading={updateDriver.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingDriver} onOpenChange={() => setDeletingDriver(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("drivers.deleteDriver")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("drivers.deleteDriverDesc", { name: deletingDriver?.full_name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
