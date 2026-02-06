import { Settings, Building2, Bell, Shield, Palette, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const settingsSections = [
  {
    icon: Building2,
    title: "Informations de l'entreprise",
    description: "Nom, adresse, logo et coordonnées",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Alertes par email et notifications système",
  },
  {
    icon: Shield,
    title: "Sécurité",
    description: "Mot de passe et authentification",
  },
  {
    icon: Palette,
    title: "Apparence",
    description: "Thème et personnalisation de l'interface",
  },
  {
    icon: Database,
    title: "Données",
    description: "Export et sauvegarde des données",
  },
];

export default function Parametres() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display">Paramètres</h1>
        <p className="text-muted-foreground mt-1">
          Configuration de l'application
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingsSections.map((section) => (
          <div
            key={section.title}
            className="glass-card p-6 flex items-start gap-4 group hover:border-primary/30 transition-colors cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <section.icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold font-display mb-1">{section.title}</h3>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Settings */}
      <div className="glass-card p-6">
        <h3 className="section-title mb-6">Paramètres rapides</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifications par email</p>
              <p className="text-sm text-muted-foreground">
                Recevoir des alertes par email
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertes de retard</p>
              <p className="text-sm text-muted-foreground">
                Notifier en cas de retard de retour
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertes documents</p>
              <p className="text-sm text-muted-foreground">
                Rappels d'expiration des documents
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sauvegarde automatique</p>
              <p className="text-sm text-muted-foreground">
                Sauvegarder les données quotidiennement
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 border-red-500/20">
        <h3 className="section-title text-red-400 mb-4">Zone de danger</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Supprimer toutes les données</p>
            <p className="text-sm text-muted-foreground">
              Cette action est irréversible
            </p>
          </div>
          <Button variant="destructive" size="sm">
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
}
