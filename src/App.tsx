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
import { SubscriptionGuard } from "@/components/SubscriptionGuard";
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
                    <SubscriptionGuard>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </SubscriptionGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agences"
                element={
                  <ProtectedRoute>
                    <SubscriptionGuard>
                      <AppLayout>
                        <Agences />
                      </AppLayout>
                    </SubscriptionGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agences/:id"
                element={
                  <ProtectedRoute>
                    <SubscriptionGuard>
                      <AppLayout>
                        <AgenceDetails />
                      </AppLayout>
                    </SubscriptionGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employes"
                element={
                  <ProtectedRoute>
                    <SubscriptionGuard>
                      <AppLayout>
                        <Employes />
                      </AppLayout>
                    </SubscriptionGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chauffeurs"
                element={
                  <ProtectedRoute>
                    <SubscriptionGuard>
                      <AppLayout>
                        <Chauffeurs />
                      </AppLayout>
                    </SubscriptionGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vehicules"
                element={
                  <ProtectedRoute>
                    <SubscriptionGuard>
                      <AppLayout>
                        <Vehicules />
                      </AppLayout>
                    </SubscriptionGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clients"
                element={
                  <ProtectedRoute>
                    <SubscriptionGuard>
                      <AppLayout>
                        <Clients />
                      </AppLayout>
                    </SubscriptionGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reservations"
                element={
                  <ProtectedRoute>
                    <SubscriptionGuard>
                      <AppLayout>
                        <Reservations />
                      </AppLayout>
                    </SubscriptionGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/locations"
                element={
                  <ProtectedRoute>
                    <SubscriptionGuard>
                      <AppLayout>
                        <Locations />
                      </AppLayout>
                    </SubscriptionGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comptabilite"
                element={
                  <ProtectedRoute>
                    <SubscriptionGuard>
                      <AppLayout>
                        <Comptabilite />
                      </AppLayout>
                    </SubscriptionGuard>
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
                    <SubscriptionGuard>
                      <AppLayout>
                        <UsersManagement />
                      </AppLayout>
                    </SubscriptionGuard>
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
