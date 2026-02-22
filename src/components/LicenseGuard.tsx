import { useLicense } from "@/contexts/LicenseContext";
import Activation from "@/pages/Activation";
import { Car } from "lucide-react";

export function LicenseGuard({ children }: { children: React.ReactNode }) {
  const { isLicensed, isChecking } = useLicense();

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg premium-gradient animate-pulse">
            <Car className="h-6 w-6 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Vérification de la licence...</p>
        </div>
      </div>
    );
  }

  if (!isLicensed) {
    return <Activation />;
  }

  return <>{children}</>;
}
