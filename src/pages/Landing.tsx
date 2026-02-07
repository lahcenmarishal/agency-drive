import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
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

const Landing = () => {
  const whatsappNumber = "+212600000000"; // À personnaliser
  const whatsappLink = `https://wa.me/${whatsappNumber.replace('+', '')}?text=Bonjour, je souhaite demander une démonstration d'AutoRent Pro.`;

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
              <ThemeToggle />
              <Link to="/auth">
                <Button variant="ghost">Connexion</Button>
              </Link>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Contacter
                </Button>
              </a>
            </div>
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <Link to="/auth">
                <Button size="sm">Connexion</Button>
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
              <span className="text-sm text-primary font-medium">Solution SaaS Premium</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 animate-slide-up leading-tight">
              AutoRent Pro – La solution intelligente pour la{" "}
              <span className="text-primary">
                gestion des agences de location
              </span>{" "}
              de voitures
            </h1>
            
            <p className="text-base md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up px-2">
              Application web permettant de gérer facilement vos agences, véhicules, clients et locations 
              depuis un seul tableau de bord intuitif et moderne.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center animate-slide-up px-2">
              <DemoRequestForm className="w-full sm:w-auto" />
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="hidden sm:inline">Contacter via WhatsApp</span>
                  <span className="sm:hidden">WhatsApp</span>
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
                    { label: "Véhicules", value: "48", color: "bg-info/20 text-info" },
                    { label: "Clients", value: "156", color: "bg-success/20 text-success" },
                    { label: "Locations actives", value: "23", color: "bg-primary/20 text-primary" },
                    { label: "Revenus", value: "125K DH", color: "bg-accent text-foreground" },
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
            {/* Problems */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 mb-4">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive font-medium">Défis courants</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">
                Les défis rencontrés par les agences de location
              </h2>
              <div className="space-y-4">
                {[
                  "Mauvaise organisation et perte d'informations",
                  "Difficulté de suivi des véhicules en temps réel",
                  "Retards de retour non contrôlés",
                  "Perte de temps et d'argent significative",
                  "Gestion manuelle chronophage",
                ].map((problem, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/10">
                    <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-destructive text-sm font-bold">✕</span>
                    </div>
                    <p className="text-muted-foreground">{problem}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Solutions */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 mb-4">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm text-success font-medium">Solutions</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">
                AutoRent Pro apporte la solution
              </h2>
              <div className="space-y-4">
                {[
                  "Gestion centralisée de toutes vos opérations",
                  "Tableau de bord clair et intuitif",
                  "Alertes automatiques et notifications",
                  "Gain de temps et meilleure productivité",
                  "Rapports détaillés et analyses en temps réel",
                ].map((solution, i) => (
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
              Fonctionnalités principales
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer efficacement votre agence de location
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Building2, title: "Gestion multi-agences", desc: "Gérez plusieurs agences depuis un seul compte administrateur" },
              { icon: Car, title: "Gestion du parc automobile", desc: "Suivi complet de vos véhicules : état, disponibilité, documents" },
              { icon: Users, title: "Gestion des clients", desc: "Base de données clients avec historique et liste noire" },
              { icon: Calendar, title: "Réservations et locations", desc: "Planification intuitive et suivi des contrats de location" },
              { icon: BarChart3, title: "Tableaux de bord Admin/Agent", desc: "Statistiques et rapports pour une vision claire de l'activité" },
              { icon: Clock, title: "Alertes et suivi temps réel", desc: "Notifications automatiques pour documents et retards" },
            ].map((feature, i) => (
              <Card key={i} className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
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
              Comment ça fonctionne ?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Démarrez en 3 étapes simples
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Demande de démonstration", desc: "Contactez-nous via WhatsApp ou le formulaire pour planifier une démo personnalisée" },
              { step: "2", title: "Création du compte", desc: "Nous configurons votre espace avec vos agences et paramètres personnalisés" },
              { step: "3", title: "Utilisation immédiate", desc: "Commencez à gérer vos locations dès le premier jour avec notre support" },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-primary-foreground shadow-lg">
                  {item.step}
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border">
                    <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
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
              À qui s'adresse l'application ?
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Car, title: "Agences de location", desc: "De toute taille, débutantes ou établies" },
              { icon: Building2, title: "PME", desc: "Petites et moyennes entreprises du secteur" },
              { icon: Globe, title: "Multi-agences", desc: "Entreprises avec une ou plusieurs agences" },
            ].map((item, i) => (
              <Card key={i} className="text-center hover:border-primary/50 transition-all">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
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
              Pourquoi choisir AutoRent Pro ?
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Smartphone, title: "Interface moderne et premium", desc: "Design élégant adapté à tous les écrans" },
              { icon: CheckCircle2, title: "Facile à utiliser", desc: "Prise en main rapide, aucune formation requise" },
              { icon: Shield, title: "Sécurisée", desc: "Vos données sont protégées et sauvegardées" },
              { icon: MapPin, title: "Adaptée au marché marocain", desc: "Conçue pour les besoins locaux" },
              { icon: HeadphonesIcon, title: "Support client disponible", desc: "Assistance réactive via WhatsApp" },
              { icon: BarChart3, title: "Rapports complets", desc: "Statistiques détaillées pour vos décisions" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-all">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">Tarification</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-4">
                Une tarification annuelle simple et personnalisée
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-lg px-2">
                AutoRent Pro fonctionne sur un modèle d'abonnement annuel.{" "}
                Le tarif dépend de la taille de votre agence, du nombre d'agences, du nombre d'agents et des fonctionnalités souhaitées.{" "}
                <span className="text-foreground font-medium">Le prix exact est communiqué après une démonstration gratuite de l'application.</span>
              </p>
            </div>

            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
              <CardContent className="p-4 sm:p-8 md:p-10">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Points clés */}
                  <div className="space-y-4">
                    {[
                      { text: "Abonnement annuel" },
                      { text: "Offre personnalisée" },
                      { text: "Support inclus" },
                      { text: "Mises à jour continues" },
                      { text: "Sans frais cachés" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                          <BadgeCheck className="w-4 h-4 text-success" />
                        </div>
                        <span className="text-foreground font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="text-center md:text-left">
                    <div className="inline-block p-6 rounded-2xl bg-card border border-border shadow-lg">
                      <p className="text-muted-foreground mb-4 text-sm">
                        Découvrez notre solution adaptée à vos besoins
                      </p>
                      <DemoRequestForm className="w-full text-base" />
                    </div>
                  </div>
                </div>

                {/* Réassurance */}
                <div className="mt-8 pt-6 border-t border-border/50">
                  <div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-info/5 border border-info/10">
                    <Shield className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Transparence totale :</span> une offre claire et détaillée vous est proposée après la démonstration, en fonction de vos besoins réels.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
              Essayez AutoRent Pro et simplifiez la gestion de votre agence
            </h2>
            <p className="text-muted-foreground mb-8">
              Rejoignez les agences qui ont déjà optimisé leur gestion avec notre solution
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <DemoRequestForm className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-8" />
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto text-sm sm:text-base px-4 sm:px-8">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="truncate">Contact WhatsApp</span>
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
                La solution intelligente pour la gestion des agences de location de voitures au Maroc.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact</h4>
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
              <h4 className="font-semibold text-foreground mb-4">Accès rapide</h4>
              <div className="space-y-3">
                <Link to="/auth" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                  Connexion
                </Link>
                <span className="block text-muted-foreground hover:text-primary transition-colors text-sm cursor-pointer">
                  Demander une démo gratuite
                </span>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border text-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} AutoRent Pro. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
