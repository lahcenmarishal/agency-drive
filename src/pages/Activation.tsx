import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Key, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveLicenseActivation } from "@/hooks/useLicense";

interface ActivationProps {
  onActivated: () => void;
}

export default function Activation({ onActivated }: ActivationProps) {
  const { toast } = useToast();
  const [licenseKey, setLicenseKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;

    setIsSubmitting(true);
    const domain = window.location.hostname;

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/verify-license`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ license_key: licenseKey.trim(), domain }),
        }
      );

      const result = await response.json();

      if (result.valid) {
        saveLicenseActivation(domain, result.client_name);
        toast({
          title: "Licence activée !",
          description: "Votre application est maintenant activée sur ce domaine.",
        });
        onActivated();
      } else {
        toast({
          variant: "destructive",
          title: "Échec de l'activation",
          description: result.error || "Clé de licence invalide.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de vérifier la licence. Vérifiez votre connexion.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl premium-gradient mb-4">
            <Car className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">AutoRent</h1>
          <p className="text-muted-foreground mt-1">Activation de la licence</p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl flex items-center justify-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Activer votre licence
            </CardTitle>
            <CardDescription>
              Entrez votre clé de licence pour activer l'application sur ce domaine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleActivate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="license-key">Clé de licence</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="license-key"
                    type="text"
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    className="pl-10 font-mono tracking-wider"
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Domaine détecté : <span className="font-mono font-medium text-foreground">{window.location.hostname}</span>
                    <br />
                    La licence sera liée à ce domaine de façon permanente.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full premium-gradient hover:opacity-90"
                disabled={isSubmitting || !licenseKey.trim()}
              >
                {isSubmitting ? "Vérification..." : "Activer la licence"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Contactez votre fournisseur pour obtenir une clé de licence
        </p>
      </div>
    </div>
  );
}
