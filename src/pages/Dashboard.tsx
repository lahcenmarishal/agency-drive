import { Users, Car, CalendarClock, Wallet, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { FleetStatus } from "@/components/dashboard/FleetStatus";
import { AlertsCard } from "@/components/dashboard/AlertsCard";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { BlacklistNotes } from "@/components/dashboard/BlacklistNotes";
import { AgentsList } from "@/components/dashboard/AgentsList";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { isAdmin } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  const dateLocale = i18n.language === "fr" ? fr : enUS;
  const currentMonth = format(new Date(), "MMMM yyyy", { locale: dateLocale });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">{t("dashboard.title")}</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          {t("dashboard.overview")} • {currentMonth}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          title={t("dashboard.newClients")}
          value={stats?.newClients || 0}
          icon={Users}
          trend={stats?.clientsTrend ? { value: stats.clientsTrend, isPositive: stats.clientsTrend >= 0 } : undefined}
        />
        <StatCard title={t("dashboard.activeRentals")} value={stats?.activeRentals || 0} icon={Car} />
        <StatCard title={t("dashboard.reservations")} value={stats?.pendingReservations || 0} icon={CalendarClock} />
        <StatCard
          title={t("dashboard.revenue")}
          value={stats?.totalRevenue?.toLocaleString() || "0"}
          subtitle={t("common.thisMonth")}
          icon={Wallet}
          trend={stats?.revenueTrend ? { value: stats.revenueTrend, isPositive: stats.revenueTrend >= 0 } : undefined}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-muted-foreground">{t("dashboard.totalRevenue")}</p>
              <p className="text-xl md:text-3xl font-bold font-display text-green-400 mt-1">
                {(stats?.totalRevenue || 0).toLocaleString()} MAD
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {stats?.transactionsCount || 0} {t("dashboard.transactionsThisMonth")}
              </p>
            </div>
            <div className="flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-xl bg-green-500/10">
              <TrendingUp className="h-5 w-5 md:h-7 md:w-7 text-green-400" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-muted-foreground">{t("dashboard.totalExpenses")}</p>
              <p className="text-xl md:text-3xl font-bold font-display text-red-400 mt-1">
                {(stats?.totalExpenses || 0).toLocaleString()} MAD
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {t("dashboard.netBalance")}: {((stats?.totalRevenue || 0) - (stats?.totalExpenses || 0)).toLocaleString()} MAD
              </p>
            </div>
            <div className="flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-xl bg-red-500/10">
              <TrendingDown className="h-5 w-5 md:h-7 md:w-7 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <FleetStatus />
        <AlertsCard />
        <UpcomingEvents />
      </div>

      <BlacklistNotes />
      {isAdmin && <AgentsList />}
    </div>
  );
}
