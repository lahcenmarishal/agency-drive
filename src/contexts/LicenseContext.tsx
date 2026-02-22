import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const LICENSE_STORAGE_KEY = "autorent_license_activated";
const LICENSE_API_URL = "https://nxgjqdxdbzgbqcoifdgf.supabase.co/functions/v1/verify-license";

interface LicenseContextType {
  isLicensed: boolean;
  isChecking: boolean;
  activateLicense: (key: string) => Promise<{ success: boolean; error?: string }>;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export function LicenseProvider({ children }: { children: ReactNode }) {
  const [isLicensed, setIsLicensed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      setIsLicensed(true);
      setIsChecking(false);
      return;
    }
    const stored = localStorage.getItem(LICENSE_STORAGE_KEY);
    if (stored === "true") {
      setIsLicensed(true);
    }
    setIsChecking(false);
  }, []);

  const activateLicense = async (key: string) => {
    try {
      const domain = window.location.hostname;
      const res = await fetch(LICENSE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ license_key: key, domain }),
      });

      const data = await res.json();

      if (data.valid) {
        localStorage.setItem(LICENSE_STORAGE_KEY, "true");
        setIsLicensed(true);
        return { success: true };
      }

      return { success: false, error: data.error || "Clé invalide" };
    } catch {
      return { success: false, error: "Erreur de connexion au serveur de vérification" };
    }
  };

  return (
    <LicenseContext.Provider value={{ isLicensed, isChecking, activateLicense }}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const context = useContext(LicenseContext);
  if (!context) throw new Error("useLicense must be used within LicenseProvider");
  return context;
}
