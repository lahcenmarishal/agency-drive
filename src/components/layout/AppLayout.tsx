import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";
import { AgencySelector } from "./AgencySelector";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAdmin, isSuperAdmin } = useAuth();

  // Show agency selector for super admins always, and for admins with multiple agencies
  // The AgencySelector component handles hiding itself when not needed
  const showAgencySelector = isAdmin;

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Sidebar & Header */}
      <MobileSidebar />
      
      {/* Main content - responsive padding */}
      <main className="md:pl-64 min-h-screen transition-all duration-300 pt-14 md:pt-0">
        <div className="p-4 md:p-8">
          {showAgencySelector && (
            <div className="mb-4 md:mb-6">
              <AgencySelector />
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
