import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  Car,
  UserCheck,
  CalendarClock,
  Key,
  Wallet,
  Settings,
  LogOut,
  ChevronLeft,
  Truck,
  Shield,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { profile, role, isAdmin, isSuperAdmin, signOut } = useAuth();
  const { toast } = useToast();

  const navigation = [
    { name: t("nav.dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { name: t("nav.users"), href: "/utilisateurs", icon: Shield, superAdminOnly: true },
    { name: t("nav.agencies"), href: "/agences", icon: Building2, adminOnly: true },
    { name: t("nav.employees"), href: "/employes", icon: Users, adminOnly: true },
    { name: t("nav.drivers"), href: "/chauffeurs", icon: Truck },
    { name: t("nav.vehicles"), href: "/vehicules", icon: Car },
    { name: t("nav.clients"), href: "/clients", icon: UserCheck },
    { name: t("nav.reservations"), href: "/reservations", icon: CalendarClock },
    { name: t("nav.rentals"), href: "/locations", icon: Key },
    { name: t("nav.accounting"), href: "/comptabilite", icon: Wallet, adminOnly: true },
    { name: t("nav.settings"), href: "/parametres", icon: Settings, adminOnly: true },
  ];

  const handleLogout = async () => {
    await signOut();
    toast({
      title: t("auth.loggedOut"),
      description: t("auth.loggedOutDesc"),
    });
  };

  const filteredNavigation = navigation.filter((item) => {
    if ((item as any).superAdminOnly && !isSuperAdmin) return false;
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return profile?.email?.slice(0, 2).toUpperCase() || "??";
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out",
        "bg-sidebar border-r border-sidebar-border",
        "hidden md:block",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg premium-gradient">
                <Car className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">
                AutoRent
              </span>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg premium-gradient">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
              collapsed && "mx-auto mt-4"
            )}
          >
            <ChevronLeft
              className={cn(
                "h-5 w-5 transition-transform duration-300",
                collapsed && "rotate-180"
              )}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "nav-item",
                  isActive && "nav-item-active",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Back to site & Theme toggle */}
        <div className={cn(
          "border-t border-sidebar-border px-3 py-3 space-y-1",
          collapsed && "flex flex-col items-center"
        )}>
          <Link
            to="/"
            className={cn(
              "nav-item text-muted-foreground hover:text-foreground",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? t("nav.backToSite") : undefined}
          >
            <ExternalLink className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{t("nav.backToSite")}</span>}
          </Link>
          <div className={cn("flex items-center gap-1", collapsed ? "flex-col" : "")}>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        {/* User section */}
        <div className="border-t border-sidebar-border p-4">
          <div
            className={cn(
              "flex items-center gap-3",
              collapsed && "justify-center"
            )}
          >
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-foreground font-medium text-sm">
                {getInitials()}
              </div>
              {isAdmin && (
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                  <Shield className="h-2.5 w-2.5 text-primary-foreground" />
                </div>
              )}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.full_name || profile?.email || t("nav.user")}
                </p>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                  {role === "super_admin" ? (
                    <span className="text-destructive">{t("nav.superAdmin")}</span>
                  ) : role === "admin" ? (
                    <span className="text-primary">{t("nav.agencyAdmin")}</span>
                  ) : (
                    <span>{t("nav.employee")}</span>
                  )}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title={t("nav.logout")}
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
          {collapsed && (
            <button
              onClick={handleLogout}
              className="mt-3 mx-auto flex p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title={t("nav.logout")}
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
