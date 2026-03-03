import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LicenseProvider } from "@/contexts/LicenseContext";
import { AgencyFilterProvider } from "@/contexts/AgencyFilterContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LicenseGuard } from "@/components/LicenseGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Agences from "./pages/Agences";
import AgenceDetails from "./pages/AgenceDetails";
import Employes from "./pages/Employes";
import Chauffeurs from "./pages/Chauffeurs";
import Vehicules from "./pages/Vehicules";
import Clients from "./pages/Clients";
import Reservations from "./pages/Reservations";
import Locations from "./pages/Locations";
import Comptabilite from "./pages/Comptabilite";
import Parametres from "./pages/Parametres";
import Auth from "./pages/Auth";
import AdminAuth from "./pages/AdminAuth";
import UsersManagement from "./pages/UsersManagement";
import Billing from "./pages/Billing";
import Onboarding from "./pages/Onboarding";

import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LicenseProvider>
          <AuthProvider>
          <SubscriptionProvider>
          <AgencyFilterProvider>
            <LicenseGuard>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/admin" element={<AdminAuth />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agences"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Agences />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agences/:id"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <AgenceDetails />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employes"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Employes />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chauffeurs"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Chauffeurs />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vehicules"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Vehicules />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clients"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Clients />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reservations"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Reservations />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/locations"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Locations />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comptabilite"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Comptabilite />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parametres"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Parametres />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/utilisateurs"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <UsersManagement />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Billing />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </LicenseGuard>
          </AgencyFilterProvider>
          </SubscriptionProvider>
        </AuthProvider>
        </LicenseProvider>
      </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
