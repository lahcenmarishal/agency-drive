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

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agences", href: "/agences", icon: Building2, adminOnly: true },
  { name: "Employés", href: "/employes", icon: Users },
  { name: "Chauffeurs", href: "/chauffeurs", icon: Truck },
  { name: "Véhicules", href: "/vehicules", icon: Car },
  { name: "Clients", href: "/clients", icon: UserCheck },
  { name: "Réservations", href: "/reservations", icon: CalendarClock },
  { name: "Locations", href: "/locations", icon: Key },
  { name: "Comptabilité", href: "/comptabilite", icon: Wallet },
  { name: "Paramètres", href: "/parametres", icon: Settings },
];

export function MobileSidebar() {
  const location = useLocation();
  const { profile, role, isAdmin, signOut } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setOpen(false);
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès.",
    });
  };

  // Filter navigation based on role
  const filteredNavigation = navigation.filter((item) => {
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
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg premium-gradient">
            <Car className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            AutoRent
          </span>
        </div>
        
        <div className="flex items-center gap-2">
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
              {/* Header */}
              <div className="flex h-14 items-center justify-between px-4 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg premium-gradient">
                    <Car className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="font-display font-bold text-lg text-foreground">
                    AutoRent
                  </span>
                </div>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin">
                {filteredNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "nav-item",
                        isActive && "nav-item-active"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Back to site */}
              <div className="border-t border-sidebar-border px-3 py-3">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="nav-item text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-5 w-5 shrink-0" />
                  <span>Retour au site</span>
                </Link>
              </div>

              {/* User section */}
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
                      {profile?.full_name || profile?.email || "Utilisateur"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      {role === "admin" ? (
                        <span className="text-primary">Admin</span>
                      ) : (
                        <span>Agent</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Déconnexion"
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