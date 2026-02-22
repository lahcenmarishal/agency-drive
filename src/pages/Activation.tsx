import { useState } from "react";
import { useLicense } from "@/contexts/LicenseContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Activation() {
  const { activateLicense } = useLicense();
  const [key, setKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const result = await activateLicense(key.trim());

    if (result.success) {
      setSuccess(true);
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setError(result.error || "Clé invalide");
    }

    setIsSubmitting(false);
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
              <KeyRound className="h-5 w-5 text-primary" />
              Activer votre licence
            </CardTitle>
            <CardDescription>
              Entrez votre clé d'activation pour utiliser l'application sur ce domaine
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <p className="text-green-500 font-medium">Licence activée avec succès !</p>
                <p className="text-sm text-muted-foreground">Redirection en cours...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="license-key">Clé de licence</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="license-key"
                      type="text"
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      className="pl-10 font-mono tracking-wider"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full premium-gradient hover:opacity-90"
                  disabled={isSubmitting || !key.trim()}
                >
                  {isSubmitting ? "Vérification..." : "Activer la licence"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Domaine : <span className="font-mono text-foreground">{window.location.hostname}</span>
        </p>
      </div>
    </div>
  );
}
