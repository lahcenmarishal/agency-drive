import { Car, Key, CalendarClock, Wrench, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFleetStatus } from "@/hooks/useDashboardStats";
import { useTranslation } from "react-i18next";

const statusConfig = [
  { key: "available" as const, statusKey: "available", icon: Car, color: "text-green-400", bgColor: "bg-green-500/10", borderColor: "border-green-500/20" },
  { key: "rented" as const, statusKey: "rented", icon: Key, color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20" },
  { key: "reserved" as const, statusKey: "reserved", icon: CalendarClock, color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20" },
  { key: "maintenance" as const, statusKey: "maintenance", icon: Wrench, color: "text-red-400", bgColor: "bg-red-500/10", borderColor: "border-red-500/20" },
];

export function FleetStatus() {
  const { t } = useTranslation();
  const { data: fleetData, isLoading } = useFleetStatus();
  const total = fleetData ? Object.values(fleetData).reduce((acc, count) => acc + count, 0) : 0;

  if (isLoading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="section-title mb-4">{t("dashboard.fleetStatus")}</h3>
      <div className="mb-4">
        <div className="flex h-3 rounded-full overflow-hidden bg-muted/50">
          {statusConfig.map((item, index) => {
            const count = fleetData?.[item.key] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <div
                key={item.key}
                className={cn("transition-all duration-500", index === 0 && "rounded-l-full", index === statusConfig.length - 1 && "rounded-r-full")}
                style={{ width: `${percentage}%`, backgroundColor: `hsl(var(--status-${item.key === "available" ? "available" : item.key === "rented" ? "rented" : item.key === "reserved" ? "reserved" : "maintenance"}))` }}
              />
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-right">{total} {t("dashboard.totalVehicles")}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {statusConfig.map((item) => (
          <div key={item.key} className={cn("flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border", item.bgColor, item.borderColor)}>
            <div className={cn("p-1.5 sm:p-2 rounded-lg shrink-0", item.bgColor)}>
              <item.icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", item.color)} />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-bold font-display">{fleetData?.[item.key] || 0}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{t(`dashboard.${item.statusKey}`)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
