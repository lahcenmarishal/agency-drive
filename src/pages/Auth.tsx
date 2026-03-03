import { useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function Auth() {
  const { t } = useTranslation();
  const { user, isLoading, signIn } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const onboarded = searchParams.get("onboarded") === "true";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg premium-gradient animate-pulse">
            <Car className="h-6 w-6 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) {
      toast({ variant: "destructive", title: t("auth.loginError"), description: t("auth.invalidCredentials") });
    } else {
      toast({ title: t("auth.loginSuccess"), description: t("auth.welcome") });
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
          <p className="text-muted-foreground mt-1">{t("auth.vehicleRentalManagement")}</p>
        </div>

        {onboarded && (
          <div className="mb-4 p-4 rounded-lg bg-success/10 border border-success/20 text-center">
            <p className="text-sm font-medium text-success">🎉 Votre compte a été créé avec succès ! Connectez-vous avec vos identifiants.</p>
          </div>
        )}

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">{t("auth.loginTitle")}</CardTitle>
            <CardDescription>{t("auth.loginDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">{t("auth.email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="login-email" type="email" placeholder={t("auth.emailPlaceholder")} value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">{t("auth.password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="login-password" type="password" placeholder={t("auth.passwordPlaceholder")} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <Button type="submit" className="w-full premium-gradient hover:opacity-90" disabled={isSubmitting}>
                {isSubmitting ? t("auth.signingIn") : t("auth.signIn")}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground mt-6">{t("auth.contactAdmin")}</p>
      </div>
    </div>
  );
}
