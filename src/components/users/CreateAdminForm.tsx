import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { PLANS } from "@/config/subscriptionPlans";

const formSchema = z.object({
  full_name: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  agency_ids: z.array(z.string()).min(1, "Sélectionnez au moins une agence"),
  plan_key: z.string().min(1, "Sélectionnez un plan"),
  billing_interval: z.enum(["monthly", "yearly"]),
});

type FormData = z.infer<typeof formSchema>;

interface Agency {
  id: string;
  name: string;
}

interface CreateAdminFormProps {
  agencies: Agency[];
  onSubmit: (data: { full_name: string; email: string; password: string; agency_ids: string[]; plan_key: string; billing_interval: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CreateAdminForm({ agencies, onSubmit, onCancel, isLoading }: CreateAdminFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      agency_ids: [],
      plan_key: "basic",
      billing_interval: "monthly",
    },
  });

  const selectedAgencyIds = form.watch("agency_ids");
  const selectedPlan = form.watch("plan_key");
  const billingInterval = form.watch("billing_interval");

  const toggleAgency = (agencyId: string) => {
    const current = form.getValues("agency_ids");
    if (current.includes(agencyId)) {
      form.setValue("agency_ids", current.filter((id) => id !== agencyId), { shouldValidate: true });
    } else {
      form.setValue("agency_ids", [...current, agencyId], { shouldValidate: true });
    }
  };

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data as { full_name: string; email: string; password: string; agency_ids: string[]; plan_key: string; billing_interval: string });
  };

  const plan = PLANS[selectedPlan];
  const price = plan ? (billingInterval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice) : 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet *</FormLabel>
              <FormControl>
                <Input placeholder="Nom et prénom" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@exemple.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agency_ids"
          render={() => (
            <FormItem>
              <FormLabel>Agences * (sélection multiple)</FormLabel>
              <div className="space-y-2">
                {selectedAgencyIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 rounded-lg border border-border bg-muted/30">
                    {selectedAgencyIds.map((id) => {
                      const agency = agencies.find((a) => a.id === id);
                      return (
                        <Badge key={id} variant="secondary" className="gap-1 pr-1">
                          {agency?.name}
                          <button
                            type="button"
                            onClick={() => toggleAgency(id)}
                            className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {agencies.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground text-center">
                      Aucune agence disponible
                    </div>
                  ) : (
                    agencies.map((agency) => {
                      const isSelected = selectedAgencyIds.includes(agency.id);
                      return (
                        <button
                          key={agency.id}
                          type="button"
                          onClick={() => toggleAgency(agency.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent transition-colors",
                            isSelected && "bg-accent/50"
                          )}
                        >
                          <span>{agency.name}</span>
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subscription Plan Selection */}
        <div className="border-t border-border pt-4 space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Abonnement</h4>

          <FormField
            control={form.control}
            name="plan_key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plan *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un plan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(PLANS).map(([key, p]) => (
                      <SelectItem key={key} value={key}>
                        {p.name} — {p.maxVehicles === -1 ? "∞" : p.maxVehicles} véhicules, {p.maxUsers === -1 ? "∞" : p.maxUsers} utilisateurs
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="billing_interval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facturation</FormLabel>
                <div className="flex items-center gap-3">
                  <span className={cn("text-sm", field.value === "monthly" ? "text-foreground font-medium" : "text-muted-foreground")}>Mensuel</span>
                  <Switch
                    checked={field.value === "yearly"}
                    onCheckedChange={(checked) => field.onChange(checked ? "yearly" : "monthly")}
                  />
                  <span className={cn("text-sm", field.value === "yearly" ? "text-foreground font-medium" : "text-muted-foreground")}>
                    Annuel <Badge variant="secondary" className="ml-1 text-xs">-17%</Badge>
                  </span>
                </div>
              </FormItem>
            )}
          />

          {plan && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prix</span>
                <span className="font-medium">${price}/{billingInterval === "yearly" ? "an" : "mois"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Limites</span>
                <span className="font-medium">
                  {plan.maxVehicles === -1 ? "∞" : plan.maxVehicles} V / {plan.maxUsers === -1 ? "∞" : plan.maxUsers} U / {plan.maxAgencies === -1 ? "∞" : plan.maxAgencies} A
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Création..." : "Créer l'administrateur"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
