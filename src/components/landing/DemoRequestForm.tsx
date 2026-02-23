import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface DemoRequestFormProps {
  trigger?: React.ReactNode;
  variant?: "default" | "outline";
  size?: "default" | "lg";
  className?: string;
}

export const DemoRequestForm = ({ trigger, variant = "default", size = "lg", className = "" }: DemoRequestFormProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", agencyName: "", phone: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.agencyName.trim() || !formData.phone.trim()) {
      toast.error(t("landing.demoForm.fillAllFields"));
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success(t("landing.demoForm.successToast"));
    setTimeout(() => { setOpen(false); setIsSubmitted(false); setFormData({ name: "", agencyName: "", phone: "" }); }, 2000);
  };

  const defaultTrigger = (
    <Button size={size} variant={variant} className={`gap-2 ${className}`}>
      <Play className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
      <span className="hidden sm:inline">{t("landing.requestDemo")}</span>
      <span className="sm:hidden">{t("landing.freeDemo")}</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="text-xl font-display">{t("landing.demoForm.title")}</DialogTitle></DialogHeader>
        {isSubmitted ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-success" /></div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t("landing.demoForm.successTitle")}</h3>
            <p className="text-muted-foreground text-sm">{t("landing.demoForm.successMessage")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm text-foreground font-medium mb-1">{t("landing.demoForm.freeTrialInfo")}</p>
              <p className="text-sm text-muted-foreground">{t("landing.demoForm.discoverInfo")}</p>
              <p className="text-sm text-muted-foreground">{t("landing.demoForm.advisorInfo")}</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2"><Label htmlFor="name">{t("landing.demoForm.name")}</Label><Input id="name" placeholder={t("landing.demoForm.namePlaceholder")} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label htmlFor="agencyName">{t("landing.demoForm.agencyName")}</Label><Input id="agencyName" placeholder={t("landing.demoForm.agencyNamePlaceholder")} value={formData.agencyName} onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })} required /></div>
              <div className="space-y-2"><Label htmlFor="phone">{t("landing.demoForm.phone")}</Label><Input id="phone" type="tel" placeholder={t("landing.demoForm.phonePlaceholder")} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required /></div>
            </div>
            <Button type="submit" className="w-full gap-2" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (<><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />{t("landing.demoForm.sending")}</>) : (<><Send className="w-4 h-4" />{t("landing.demoForm.submit")}</>)}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
