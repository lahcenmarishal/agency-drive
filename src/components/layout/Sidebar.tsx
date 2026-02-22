import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  Car,
  UserCheck,
  CalendarClock,
  Key,
  KeyRound,
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

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Utilisateurs", href: "/utilisateurs", icon: Shield, superAdminOnly: true },
  { name: "Licences", href: "/licences", icon: KeyRound, superAdminOnly: true },
  { name: "Agences", href: "/agences", icon: Building2, adminOnly: true },
  { name: "Employés", href: "/employes", icon: Users, adminOnly: true },
  { name: "Chauffeurs", href: "/chauffeurs", icon: Truck },
  { name: "Véhicules", href: "/vehicules", icon: Car },
  { name: "Clients", href: "/clients", icon: UserCheck },
  { name: "Réservations", href: "/reservations", icon: CalendarClock },
  { name: "Locations", href: "/locations", icon: Key },
  { name: "Comptabilité", href: "/comptabilite", icon: Wallet, adminOnly: true },
  { name: "Paramètres", href: "/parametres", icon: Settings, adminOnly: true },
];

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { profile, role, isAdmin, isSuperAdmin, signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès.",
    });
  };

  // Filter navigation based on role
  const filteredNavigation = navigation.filter((item) => {
    if ((item as any).superAdminOnly && !isSuperAdmin) return false;
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  // Get user initials
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
        "hidden md:block", // Hide on mobile
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
            title={collapsed ? "Retour au site" : undefined}
          >
            <ExternalLink className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Retour au site</span>}
          </Link>
          <div className={collapsed ? "" : ""}>
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
                  {profile?.full_name || profile?.email || "Utilisateur"}
                </p>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                  {role === "super_admin" ? (
                    <span className="text-destructive">Super Admin</span>
                  ) : role === "admin" ? (
                    <span className="text-primary">Admin Agence</span>
                  ) : (
                    <span>Employé</span>
                  )}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Déconnexion"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
          {collapsed && (
            <button
              onClick={handleLogout}
              className="mt-3 mx-auto flex p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Déconnexion"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
