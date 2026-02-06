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
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Eye, EyeOff, UserPlus } from "lucide-react";
import type { Employee } from "@/hooks/useEmployees";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessibleAgencies } from "@/hooks/useAccessibleAgencies";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  full_name: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  position: z.string().optional(),
  hire_date: z.string().optional(),
  is_active: z.boolean().default(true),
  agency_id: z.string().min(1, "Agence requise"),
  create_account: z.boolean().default(false),
  account_email: z.string().email("Email invalide").optional().or(z.literal("")),
  account_password: z.string().optional(),
}).refine((data) => {
  if (data.create_account) {
    return data.account_email && data.account_email.length > 0 && data.account_password && data.account_password.length >= 6;
  }
  return true;
}, {
  message: "Email et mot de passe requis pour créer un compte (min 6 caractères)",
  path: ["account_password"],
});

export type EmployeeFormData = z.infer<typeof formSchema>;

interface EmployeeFormProps {
  employee?: Employee | null;
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const positions = [
  { value: "admin", label: "Administrateur" },
  { value: "agent", label: "Agent" },
  { value: "comptable", label: "Comptable" },
  { value: "responsable", label: "Responsable Agence" },
];

export function EmployeeForm({ employee, onSubmit, onCancel, isLoading }: EmployeeFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const { isAdmin } = useAuth();
  const { data: accessibleAgencies, isLoading: isLoadingAgencies } = useAccessibleAgencies();

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: employee?.full_name || "",
      email: employee?.email || "",
      phone: employee?.phone || "",
      position: employee?.position || "",
      hire_date: employee?.hire_date || "",
      is_active: employee?.is_active ?? true,
      agency_id: employee?.agency_id || (accessibleAgencies?.[0]?.id || ""),
      create_account: false,
      account_email: employee?.email || "",
      account_password: "",
    },
  });

  const createAccount = form.watch("create_account");

  // Sync email fields
  const handleEmailChange = (email: string) => {
    form.setValue("email", email);
    if (!form.getValues("account_email")) {
      form.setValue("account_email", email);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="email@exemple.com" 
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleEmailChange(e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="+212 6 XX XX XX XX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="agency_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agence *</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une agence" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingAgencies ? (
                    <SelectItem value="loading" disabled>Chargement...</SelectItem>
                  ) : (
                    accessibleAgencies?.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Poste</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un poste" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos.value} value={pos.value}>
                        {pos.label}
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
            name="hire_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date d'embauche</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Actif</FormLabel>
                <p className="text-sm text-muted-foreground">
                  L'employé peut accéder au système
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Account creation section - only for admins and new employees */}
        {isAdmin && !employee && (
          <Collapsible open={isAccountOpen} onOpenChange={setIsAccountOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Créer un compte utilisateur
                </span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  isAccountOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="create_account"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Créer un compte</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Permettre à cet employé de se connecter à l'application
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {createAccount && (
                <>
                  <FormField
                    control={form.control}
                    name="account_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email du compte *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemple.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="account_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Min. 6 caractères"
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
                </>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {employee ? "Modifier" : "Ajouter"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
