import { AlertTriangle, Clock, FileWarning, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVehicleDocumentAlerts } from "@/hooks/useVehicles";
import { useOverdueRentals } from "@/hooks/useRentals";

export function AlertsCard() {
  const { data: documentAlerts, isLoading: docsLoading } = useVehicleDocumentAlerts();
  const { data: overdueRentals, isLoading: overdueLoading } = useOverdueRentals();

  const isLoading = docsLoading || overdueLoading;

  const expiredDocs = documentAlerts?.filter((a) => a.isExpired).length || 0;
  const expiringDocs = documentAlerts?.filter((a) => !a.isExpired && a.daysRemaining <= 7).length || 0;
  const overdueCount = overdueRentals?.length || 0;

  const alerts = [
    {
      type: "Documents expirés/à expirer",
      count: expiredDocs + expiringDocs,
      icon: FileWarning,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      type: "Retards de retour",
      count: overdueCount,
      icon: Clock,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
    },
  ];

  const hasAlerts = alerts.some((a) => a.count > 0);

  if (isLoading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-amber-400" />
        <h3 className="section-title">Alertes</h3>
      </div>
      {hasAlerts ? (
        <div className="space-y-3">
          {alerts.map((alert) =>
            alert.count > 0 ? (
              <div
                key={alert.type}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  alert.bgColor
                )}
              >
                <div className="flex items-center gap-3">
                  <alert.icon className={cn("h-4 w-4", alert.color)} />
                  <span className="text-sm font-medium">{alert.type}</span>
                </div>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-semibold",
                    alert.bgColor,
                    alert.color
                  )}
                >
                  {alert.count}
                </span>
              </div>
            ) : null
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <div className="p-3 rounded-full bg-green-500/10 mb-3">
            <AlertTriangle className="h-6 w-6 text-green-400" />
          </div>
          <p className="text-sm">Aucune alerte</p>
        </div>
      )}
    </div>
  );
}
