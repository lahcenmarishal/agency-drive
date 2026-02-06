import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Play, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface DemoRequestFormProps {
  trigger?: React.ReactNode;
  variant?: "default" | "outline";
  size?: "default" | "lg";
  className?: string;
}

export const DemoRequestForm = ({ 
  trigger, 
  variant = "default", 
  size = "lg",
  className = ""
}: DemoRequestFormProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    agencyName: "",
    phone: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.agencyName.trim() || !formData.phone.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission - in production, this would send to a backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast.success("Demande envoyée avec succès ! Un conseiller vous contactera bientôt.");
    
    // Reset form after delay
    setTimeout(() => {
      setOpen(false);
      setIsSubmitted(false);
      setFormData({ name: "", agencyName: "", phone: "" });
    }, 2000);
  };

  const defaultTrigger = (
    <Button size={size} variant={variant} className={`gap-2 ${className}`}>
      <Play className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
      <span className="truncate">Demander une démo gratuite</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">
            Demander une démo gratuite
          </DialogTitle>
        </DialogHeader>
        
        {isSubmitted ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Demande envoyée !
            </h3>
            <p className="text-muted-foreground text-sm">
              Un conseiller vous contactera très bientôt.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm text-foreground font-medium mb-1">
                Démo gratuite valable jusqu'à 30 jours – sans engagement
              </p>
              <p className="text-sm text-muted-foreground">
                Découvrez AutoRent Pro en situation réelle.
              </p>
              <p className="text-sm text-muted-foreground">
                Un conseiller vous contacte pour une démonstration personnalisée.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  placeholder="Votre nom complet"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agencyName">Nom de l'agence</Label>
                <Input
                  id="agencyName"
                  placeholder="Nom de votre agence"
                  value={formData.agencyName}
                  onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+212 6XX XXX XXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full gap-2" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer ma demande
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
