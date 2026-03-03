import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Car, Building2, User, Mail, Lock, Phone, MapPin, Loader2, ArrowLeft, Check, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PLANS } from "@/config/subscriptionPlans";

const planIcons: Record<string, typeof Zap> = {
  basic: Zap,
  pro: Crown,
  enterprise: Building2,
};

export default function Onboarding() {
  const [searchParams] = useSearchParams();
  const preselectedPlan = searchParams.get("plan") || "";
  const cancelled = searchParams.get("cancelled") === "true";
  const { toast } = useToast();

  const [step, setStep] = useState<"plan" | "form">(preselectedPlan && PLANS[preselectedPlan] ? "form" : "plan");
  const [selectedPlan, setSelectedPlan] = useState(preselectedPlan || "basic");
  const [yearlyBilling, setYearlyBilling] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [agencyCity, setAgencyCity] = useState("");
  const [agencyAddress, setAgencyAddress] = useState("");
  const [agencyPhone, setAgencyPhone] = useState("");
  const [agencyEmail, setAgencyEmail] = useState("");

  const handleSelectPlan = (key: string) => {
    setSelectedPlan(key);
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password.trim() || !agencyName.trim()) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères.", variant: "destructive" });
      return;
    }

    const plan = PLANS[selectedPlan];
    if (!plan) return;

    setLoading(true);
    try {
      const priceId = yearlyBilling ? plan.yearlyPriceId : plan.monthlyPriceId;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/onboard-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            full_name: fullName,
            email,
            password,
            agency_name: agencyName,
            agency_city: agencyCity,
            agency_address: agencyAddress,
            agency_phone: agencyPhone,
            agency_email: agencyEmail,
            plan_key: selectedPlan,
            price_id: priceId,
            billing_interval: yearlyBilling ? "yearly" : "monthly",
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la création");

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const plan = PLANS[selectedPlan];
  const price = plan ? (yearlyBilling ? plan.yearlyPrice : plan.monthlyPrice) : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Car className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">AutoRent Pro</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost" size="sm">Se connecter</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {cancelled && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            Le paiement a été annulé. Vous pouvez réessayer quand vous le souhaitez.
          </div>
        )}

        {step === "plan" ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-2">
                Choisissez votre plan
              </h1>
              <p className="text-muted-foreground">Sélectionnez le plan qui correspond à vos besoins</p>
            </div>

            <div className="flex items-center justify-center gap-3 mb-8">
              <span className={`text-sm font-medium ${!yearlyBilling ? "text-foreground" : "text-muted-foreground"}`}>Mensuel</span>
              <Switch checked={yearlyBilling} onCheckedChange={setYearlyBilling} />
              <span className={`text-sm font-medium ${yearlyBilling ? "text-foreground" : "text-muted-foreground"}`}>
                Annuel <Badge variant="secondary" className="ml-1 text-xs">-17%</Badge>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(PLANS).map(([key, p]) => {
                const Icon = planIcons[key] || Zap;
                const pr = yearlyBilling ? p.yearlyPrice : p.monthlyPrice;
                return (
                  <Card
                    key={key}
                    className={`relative cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${
                      key === "pro" ? "border-primary/50" : ""
                    }`}
                    onClick={() => handleSelectPlan(key)}
                  >
                    {key === "pro" && (
                      <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-xs font-bold text-primary-foreground rounded-bl-lg">
                        POPULAIRE
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-lg ${key === "pro" ? "bg-primary" : "bg-primary/10"}`}>
                          <Icon className={`h-5 w-5 ${key === "pro" ? "text-primary-foreground" : "text-primary"}`} />
                        </div>
                        <CardTitle className="text-xl font-display">{p.name}</CardTitle>
                      </div>
                      <CardDescription>
                        <span className="text-3xl font-bold text-foreground">${pr}</span>
                        <span className="text-muted-foreground">/{yearlyBilling ? "an" : "mois"}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {p.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full mt-6" variant={key === "pro" ? "default" : "outline"}>
                        Choisir {p.name}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" className="mb-4" onClick={() => setStep("plan")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Changer de plan
            </Button>

            {plan && (
              <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {(() => { const Icon = planIcons[selectedPlan] || Zap; return <Icon className="h-5 w-5 text-primary" />; })()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Plan {plan.name}</p>
                    <p className="text-sm text-muted-foreground">${price}/{yearlyBilling ? "an" : "mois"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${!yearlyBilling ? "text-foreground font-medium" : "text-muted-foreground"}`}>Mensuel</span>
                  <Switch checked={yearlyBilling} onCheckedChange={setYearlyBilling} />
                  <span className={`text-xs ${yearlyBilling ? "text-foreground font-medium" : "text-muted-foreground"}`}>Annuel</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-primary" />
                    Informations personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Nom complet *</Label>
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ahmed Benali" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@monagence.com" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="password">Mot de passe *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="password" type="password" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 caractères" required minLength={6} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Agency info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                    Informations de l'agence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="agencyName">Nom de l'agence *</Label>
                    <Input id="agencyName" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} placeholder="Mon Agence de Location" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="agencyCity">Ville</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="agencyCity" className="pl-10" value={agencyCity} onChange={(e) => setAgencyCity(e.target.value)} placeholder="Casablanca" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="agencyPhone">Téléphone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="agencyPhone" className="pl-10" value={agencyPhone} onChange={(e) => setAgencyPhone(e.target.value)} placeholder="+212..." />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="agencyAddress">Adresse</Label>
                    <Input id="agencyAddress" value={agencyAddress} onChange={(e) => setAgencyAddress(e.target.value)} placeholder="123 Rue Mohammed V" />
                  </div>
                  <div>
                    <Label htmlFor="agencyEmail">Email de l'agence</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="agencyEmail" type="email" className="pl-10" value={agencyEmail} onChange={(e) => setAgencyEmail(e.target.value)} placeholder="contact@monagence.com" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="lg:col-span-2">
                <Button type="submit" size="lg" className="w-full text-lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Redirection vers le paiement...
                    </>
                  ) : (
                    <>
                      Procéder au paiement — ${price}/{yearlyBilling ? "an" : "mois"}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Paiement sécurisé via Stripe. Votre compte sera créé automatiquement après le paiement.
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
