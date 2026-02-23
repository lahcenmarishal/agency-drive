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
  Truck,
  Shield,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

export function MobileSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { profile, role, isAdmin, isSuperAdmin, signOut } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

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
    setOpen(false);
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
      return profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return profile?.email?.slice(0, 2).toUpperCase() || "??";
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg premium-gradient">
            <Car className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">AutoRent</span>
        </div>
        
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border">
            <div className="flex h-full flex-col">
              <div className="flex h-14 items-center justify-between px-4 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg premium-gradient">
                    <Car className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="font-display font-bold text-lg text-foreground">AutoRent</span>
                </div>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>

              <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin">
                {filteredNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className={cn("nav-item", isActive && "nav-item-active")}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-sidebar-border px-3 py-3">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="nav-item text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-5 w-5 shrink-0" />
                  <span>{t("nav.backToSite")}</span>
                </Link>
              </div>

              <div className="border-t border-sidebar-border p-4">
                <div className="flex items-center gap-3">
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
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title={t("nav.logout")}
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
