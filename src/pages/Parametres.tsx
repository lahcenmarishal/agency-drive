import { Settings, Building2, Bell, Shield, Palette, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";

export default function Parametres() {
  const { t } = useTranslation();

  const settingsSections = [
    { icon: Building2, title: t("settings.companyInfo"), description: t("settings.companyInfoDesc") },
    { icon: Bell, title: t("settings.notifications"), description: t("settings.notificationsDesc") },
    { icon: Shield, title: t("settings.security"), description: t("settings.securityDesc") },
    { icon: Palette, title: t("settings.appearance"), description: t("settings.appearanceDesc") },
    { icon: Database, title: t("settings.data"), description: t("settings.dataDesc") },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold font-display">{t("settings.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("settings.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingsSections.map((section) => (
          <div key={section.title} className="glass-card p-6 flex items-start gap-4 group hover:border-primary/30 transition-colors cursor-pointer">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0"><section.icon className="h-6 w-6" /></div>
            <div className="flex-1"><h3 className="font-semibold font-display mb-1">{section.title}</h3><p className="text-sm text-muted-foreground">{section.description}</p></div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h3 className="section-title mb-6">{t("settings.quickSettings")}</h3>
        <div className="space-y-6">
          {[
            { title: t("settings.emailNotifications"), desc: t("settings.emailNotificationsDesc"), checked: true },
            { title: t("settings.delayAlerts"), desc: t("settings.delayAlertsDesc"), checked: true },
            { title: t("settings.documentAlerts"), desc: t("settings.documentAlertsDesc"), checked: true },
            { title: t("settings.autoBackup"), desc: t("settings.autoBackupDesc"), checked: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div><p className="font-medium">{item.title}</p><p className="text-sm text-muted-foreground">{item.desc}</p></div>
              <Switch defaultChecked={item.checked} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
