const LICENSE_STORAGE_KEY = "autorent_license_activated";

interface LicenseState {
  activated: boolean;
  domain: string;
  clientName?: string;
  activatedAt: string;
}

export function isLicenseActivated(): boolean {
  try {
    const stored = localStorage.getItem(LICENSE_STORAGE_KEY);
    if (!stored) return false;

    const state: LicenseState = JSON.parse(stored);
    // Verify current domain matches
    return state.activated && state.domain === window.location.hostname;
  } catch {
    return false;
  }
}

export function saveLicenseActivation(domain: string, clientName?: string) {
  const state: LicenseState = {
    activated: true,
    domain,
    clientName: clientName || undefined,
    activatedAt: new Date().toISOString(),
  };
  localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(state));
}

export function clearLicenseActivation() {
  localStorage.removeItem(LICENSE_STORAGE_KEY);
}
