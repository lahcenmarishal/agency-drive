import { AlertTriangle, FileWarning, Car } from "lucide-react";
import { useVehicleDocumentAlerts } from "@/hooks/useVehicles";
import { cn } from "@/lib/utils";

export function DocumentAlerts() {
  const { data: alerts, isLoading } = useVehicleDocumentAlerts();

  if (isLoading) return null;
  if (!alerts || alerts.length === 0) return null;

  const expiredAlerts = alerts.filter((a) => a.isExpired);
  const expiringAlerts = alerts.filter((a) => !a.isExpired);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-amber-400" />
        <h3 className="section-title">Alertes documents véhicules</h3>
        <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
          {alerts.length}
        </span>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
        {expiredAlerts.map((alert, index) => (
          <div
            key={`expired-${index}`}
            className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <FileWarning className="h-4 w-4 text-red-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{alert.vehicleName}</p>
              <p className="text-xs text-red-400">
                {alert.documentType} expiré depuis {Math.abs(alert.daysRemaining)} jours
              </p>
            </div>
          </div>
        ))}

        {expiringAlerts.map((alert, index) => (
          <div
            key={`expiring-${index}`}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg",
              alert.daysRemaining <= 7
                ? "bg-amber-500/10 border border-amber-500/20"
                : "bg-muted/30"
            )}
          >
            <FileWarning className={cn(
              "h-4 w-4 flex-shrink-0",
              alert.daysRemaining <= 7 ? "text-amber-400" : "text-muted-foreground"
            )} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{alert.vehicleName}</p>
              <p className={cn(
                "text-xs",
                alert.daysRemaining <= 7 ? "text-amber-400" : "text-muted-foreground"
              )}>
                {alert.documentType} expire dans {alert.daysRemaining} jours
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
