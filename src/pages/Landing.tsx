import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DemoRequestForm } from "@/components/landing/DemoRequestForm";
import { 
  Car, 
  Users, 
  Calendar, 
  BarChart3, 
  Shield, 
  Clock, 
  Building2, 
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Play,
  Smartphone,
  Globe,
  HeadphonesIcon,
  MapPin,
  Mail,
  Phone,
  BadgeCheck,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Landing = () => {
  const { t } = useTranslation();
  const whatsappNumber = "+212600000000";
  const whatsappLink = `https://wa.me/${whatsappNumber.replace('+', '')}?text=Hello, I would like to request a demo of AutoRent Pro.`;

  const problems = t("landing.problems", { returnObjects: true }) as string[];
  const solutionsList = t("landing.solutionsList", { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold text-foreground">AutoRent Pro</span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <LanguageSwitcher />
              <ThemeToggle />
              <Link to="/auth">
                <Button variant="ghost">{t("nav.login")}</Button>
              </Link>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {t("nav.contact")}
                </Button>
              </a>
            </div>
            <div className="md:hidden flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
              <Link to="/auth">
                <Button size="sm">{t("nav.login")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-primary font-medium">{t("landing.premiumSaas")}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 animate-slide-up leading-tight">
              {t("landing.heroTitle")}{" "}
              <span className="text-primary">
                {t("landing.heroTitleHighlight")}
              </span>
            </h1>
            
            <p className="text-base md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up px-2">
              {t("landing.heroDescription")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center animate-slide-up px-2">
              <DemoRequestForm className="w-full sm:w-auto" />
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="hidden sm:inline">{t("landing.contactWhatsApp")}</span>
                  <span className="sm:hidden">{t("landing.whatsapp")}</span>
                </Button>
              </a>
            </div>
          </div>
          
          {/* Dashboard Mockup */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="glass-card p-2 md:p-4 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-card rounded-xl p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: t("landing.mockStats.vehicles"), value: "48", color: "bg-info/20 text-info" },
                    { label: t("landing.mockStats.clients"), value: "156", color: "bg-success/20 text-success" },
                    { label: t("landing.mockStats.activeRentals"), value: "23", color: "bg-primary/20 text-primary" },
                    { label: t("landing.mockStats.revenue"), value: "125K DH", color: "bg-accent text-foreground" },
                  ].map((stat, i) => (
                    <div key={i} className={`p-4 rounded-lg ${stat.color}`}>
                      <p className="text-xs opacity-70">{stat.label}</p>
                      <p className="text-xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="h-32 md:h-48 bg-muted/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems & Solutions */}
      <section className="py-16 md:py-24 px-4 bg-muted/20">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 mb-4">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive font-medium">{t("landing.commonChallenges")}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">
                {t("landing.challengesTitle")}
              </h2>
              <div className="space-y-4">
                {problems.map((problem, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/10">
                    <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-destructive text-sm font-bold">✕</span>
                    </div>
                    <p className="text-muted-foreground">{problem}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 mb-4">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm text-success font-medium">{t("landing.solutions")}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">
                {t("landing.solutionsTitle")}
              </h2>
              <div className="space-y-4">
                {solutionsList.map((solution, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-success/5 border border-success/10">
                    <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    </div>
                    <p className="text-foreground">{solution}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-4">
              {t("landing.mainFeatures")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("landing.featuresSubtitle")}
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Building2, key: "multiAgency" },
              { icon: Car, key: "fleet" },
              { icon: Users, key: "clients" },
              { icon: Calendar, key: "reservations" },
              { icon: BarChart3, key: "dashboards" },
              { icon: Clock, key: "alerts" },
            ].map((feature, i) => (
              <Card key={i} className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t(`landing.features.${feature.key}.title`)}</h3>
                  <p className="text-muted-foreground text-sm">{t(`landing.features.${feature.key}.desc`)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 px-4 bg-muted/20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-4">
              {t("landing.howItWorks")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("landing.getStarted3Steps")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {["step1", "step2", "step3"].map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-primary-foreground shadow-lg">
                  {i + 1}
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border">
                    <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-foreground mb-2">{t(`landing.steps.${step}.title`)}</h3>
                <p className="text-muted-foreground text-sm">{t(`landing.steps.${step}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-4">
              {t("landing.targetAudience")}
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Car, key: "agencies" },
              { icon: Building2, key: "sme" },
              { icon: Globe, key: "multi" },
            ].map((item, i) => (
              <Card key={i} className="text-center hover:border-primary/50 transition-all">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t(`landing.audiences.${item.key}.title`)}</h3>
                  <p className="text-muted-foreground text-sm">{t(`landing.audiences.${item.key}.desc`)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 md:py-24 px-4 bg-muted/20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-4">
              {t("landing.whyChoose")}
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Smartphone, key: "modern" },
              { icon: CheckCircle2, key: "easyToUse" },
              { icon: Shield, key: "secure" },
              { icon: MapPin, key: "localMarket" },
              { icon: HeadphonesIcon, key: "support" },
              { icon: BarChart3, key: "reports" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-all">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{t(`landing.advantages.${item.key}.title`)}</h3>
                  <p className="text-muted-foreground text-sm">{t(`landing.advantages.${item.key}.desc`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">{t("landing.pricing")}</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-4">
                {t("landing.pricingTitle")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-lg px-2">
                {t("landing.pricingDescription")}{" "}
                <span className="text-foreground font-medium">{t("landing.pricingExact")}</span>
              </p>
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { key: "basic", icon: CheckCircle2, price: 29, features: ["10 véhicules", "3 utilisateurs", "1 agence", "Rapports basiques", "Support email"] },
                { key: "pro", icon: BadgeCheck, price: 59, popular: true, features: ["50 véhicules", "10 utilisateurs", "3 agences", "Analytics avancés", "Support prioritaire", "Branding personnalisé"] },
                { key: "enterprise", icon: Building2, price: 99, features: ["Véhicules illimités", "Utilisateurs illimités", "Agences illimitées", "Suite analytics complète", "Support dédié", "Intégrations personnalisées"] },
              ].map((plan) => (
                <Card key={plan.key} className={`relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${plan.popular ? "border-primary/50 shadow-xl" : ""}`}>
                  {plan.popular && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-xs font-bold text-primary-foreground rounded-bl-lg">
                      POPULAIRE
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-2 rounded-lg ${plan.popular ? "bg-primary" : "bg-primary/10"}`}>
                        <plan.icon className={`w-5 h-5 ${plan.popular ? "text-primary-foreground" : "text-primary"}`} />
                      </div>
                      <h3 className="text-xl font-display font-bold text-foreground capitalize">{plan.key}</h3>
                    </div>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                      <span className="text-muted-foreground">/mois</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to={`/onboarding?plan=${plan.key}`}>
                      <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                        Commencer avec {plan.key === "basic" ? "Basic" : plan.key === "pro" ? "Pro" : "Enterprise"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-info/5 border border-info/10 max-w-4xl mx-auto">
              <Shield className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{t("landing.transparency")}</span> {t("landing.transparencyDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="demo" className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center glass-card p-5 sm:p-8 md:p-12 rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-6">
              <Car className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
              {t("landing.finalCTA")}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t("landing.finalCTADesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <DemoRequestForm className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-8" />
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto text-sm sm:text-base px-4 sm:px-8">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="truncate">{t("landing.contactWhatsAppShort")}</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border bg-card/50">
        <div className="container mx-auto">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <Car className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-display font-bold text-foreground">AutoRent Pro</span>
              </div>
              <p className="text-muted-foreground text-sm">
                {t("landing.footer.description")}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t("landing.footer.contact")}</h4>
              <div className="space-y-3">
                <a href={`mailto:contact@autorentpro.ma`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
                  <Mail className="w-4 h-4" />
                  contact@autorentpro.ma
                </a>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
                  <Phone className="w-4 h-4" />
                  {whatsappNumber}
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t("landing.footer.quickAccess")}</h4>
              <div className="space-y-3">
                <Link to="/auth" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t("nav.login")}
                </Link>
                <span className="block text-muted-foreground hover:text-primary transition-colors text-sm cursor-pointer">
                  {t("landing.footer.requestFreeDemo")}
                </span>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border text-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} AutoRent Pro. {t("landing.footer.allRightsReserved")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
