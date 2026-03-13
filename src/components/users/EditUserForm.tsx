import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Check, X, RotateCcw, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  full_name: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  is_active: z.boolean(),
  agency_ids: z.array(z.string()).min(1, "Sélectionnez au moins une agence"),
});

type FormData = z.infer<typeof formSchema>;

interface Agency {
  id: string;
  name: string;
}

interface User {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  is_active: boolean;
  role: string | null;
  agency_id: string | null;
}

interface SubscriptionInfo {
  id: string;
  status: string;
  plan_name: string;
  billing_interval: string;
}

interface EditUserFormProps {
  user: User;
  agencies: Agency[];
  userAgencyIds: string[];
  onSubmit: (data: { full_name: string; email: string; is_active: boolean; agency_ids: string[] }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  subscription?: SubscriptionInfo | null;
  onRenew?: () => Promise<void>;
  isRenewing?: boolean;
}

export function EditUserForm({ user, agencies, userAgencyIds, onSubmit, onCancel, isLoading, subscription, onRenew, isRenewing }: EditUserFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: user.full_name || "",
      email: user.email || "",
      is_active: user.is_active,
      agency_ids: userAgencyIds.length > 0 ? userAgencyIds : (user.agency_id ? [user.agency_id] : []),
    },
  });

  const selectedAgencyIds = form.watch("agency_ids");
  const isAdmin = user.role === "admin";

  const toggleAgency = (agencyId: string) => {
    const current = form.getValues("agency_ids");
    if (current.includes(agencyId)) {
      form.setValue("agency_ids", current.filter((id) => id !== agencyId), { shouldValidate: true });
    } else {
      form.setValue("agency_ids", [...current, agencyId], { shouldValidate: true });
    }
  };

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data as { full_name: string; email: string; is_active: boolean; agency_ids: string[] });
  };

  const canRenew = subscription && subscription.status !== "active" && subscription.status !== "trialing";

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
                <Input type="email" placeholder="email@exemple.com" {...field} disabled />
              </FormControl>
              <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Compte actif</FormLabel>
                <p className="text-sm text-muted-foreground">
                  L'utilisateur peut se connecter
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Subscription renewal section */}
        {subscription && (
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Abonnement</p>
                <p className="text-xs text-muted-foreground">
                  Plan : <span className="capitalize font-medium">{subscription.plan_name}</span> — Statut :{" "}
                  <Badge
                    variant={subscription.status === "active" || subscription.status === "trialing" ? "default" : "destructive"}
                    className="capitalize text-xs"
                  >
                    {subscription.status}
                  </Badge>
                </p>
              </div>
              {canRenew && onRenew && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRenew}
                  disabled={isRenewing}
                  className="gap-2"
                >
                  {isRenewing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  Renouveler
                </Button>
              )}
            </div>
          </div>
        )}

        {isAdmin && (
          <FormField
            control={form.control}
            name="agency_ids"
            render={() => (
              <FormItem>
                <FormLabel>Agences gérées * (sélection multiple)</FormLabel>
                <div className="space-y-2">
                  {selectedAgencyIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 rounded-lg border border-border bg-muted/30">
                      {selectedAgencyIds.map((id) => {
                        const agency = agencies.find((a) => a.id === id);
                        return (
                          <Badge
                            key={id}
                            variant="secondary"
                            className="gap-1 pr-1"
                          >
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
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
