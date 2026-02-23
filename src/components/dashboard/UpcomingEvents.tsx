import { CalendarDays, ArrowDownToLine, ArrowUpFromLine, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpcomingEvents } from "@/hooks/useDashboardStats";
import { format, isToday, isTomorrow, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { useTranslation } from "react-i18next";

export function UpcomingEvents() {
  const { t } = useTranslation();
  const { data: events, isLoading } = useUpcomingEvents();

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return t("dashboard.today");
    if (isTomorrow(date)) return t("dashboard.tomorrow");
    const diff = differenceInDays(date, new Date());
    if (diff > 0) return t("dashboard.inDays", { count: diff });
    return format(date, "dd/MM", { locale: fr });
  };

  if (isLoading) {
    return (<div className="glass-card p-6 flex items-center justify-center min-h-[200px]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>);
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h3 className="section-title">{t("dashboard.agenda")}</h3>
      </div>
      {events && events.length > 0 ? (
        <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
          {events.map((event, index) => (
            <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className={cn("p-2 rounded-lg", event.type === "retour" ? "bg-blue-500/10 text-blue-400" : "bg-green-500/10 text-green-400")}>
                {event.type === "retour" ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{event.clientName}</p>
                <p className="text-xs text-muted-foreground truncate">{event.vehicleName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium">{getDateLabel(event.date)}</p>
                <p className="text-xs text-muted-foreground">{event.type === "retour" ? t("dashboard.return") : t("dashboard.departure")}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <CalendarDays className="h-8 w-8 mb-2 opacity-30" />
          <p className="text-sm">{t("dashboard.noEvents")}</p>
        </div>
      )}
    </div>
  );
}
