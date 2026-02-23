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
import { useTranslation } from "react-i18next";

export type EmployeeFormData = {
  full_name: string;
  email?: string;
  phone?: string;
  position?: string;
  hire_date?: string;
  is_active: boolean;
  agency_id: string;
  create_account: boolean;
  account_email?: string;
  account_password?: string;
};

interface EmployeeFormProps {
  employee?: Employee | null;
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EmployeeForm({ employee, onSubmit, onCancel, isLoading }: EmployeeFormProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const { isAdmin } = useAuth();
  const { data: accessibleAgencies, isLoading: isLoadingAgencies } = useAccessibleAgencies();

  const positions = [
    { value: "admin", label: t("employees.positions.admin") },
    { value: "agent", label: t("employees.positions.agent") },
    { value: "comptable", label: t("employees.positions.comptable") },
    { value: "responsable", label: t("employees.positions.responsable") },
  ];

  const formSchema = z.object({
    full_name: z.string().min(2, t("forms.validation.nameMin2")),
    email: z.string().email(t("forms.validation.invalidEmail")).optional().or(z.literal("")),
    phone: z.string().optional(),
    position: z.string().optional(),
    hire_date: z.string().optional(),
    is_active: z.boolean().default(true),
    agency_id: z.string().min(1, t("forms.validation.agencyRequired")),
    create_account: z.boolean().default(false),
    account_email: z.string().email(t("forms.validation.invalidEmail")).optional().or(z.literal("")),
    account_password: z.string().optional(),
  }).refine((data) => {
    if (data.create_account) {
      return data.account_email && data.account_email.length > 0 && data.account_password && data.account_password.length >= 6;
    }
    return true;
  }, {
    message: t("forms.employee.accountValidation"),
    path: ["account_password"],
  });

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
              <FormLabel>{t("forms.fullName")}</FormLabel>
              <FormControl>
                <Input placeholder={t("forms.fullNamePlaceholder")} {...field} />
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
                <FormLabel>{t("forms.email")}</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder={t("forms.emailPlaceholder")} 
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
                <FormLabel>{t("forms.phone")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("forms.phonePlaceholder")} {...field} />
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
              <FormLabel>{t("forms.employee.agency")}</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("forms.employee.selectAgency")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingAgencies ? (
                    <SelectItem value="loading" disabled>{t("common.loading")}</SelectItem>
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
                <FormLabel>{t("forms.employee.position")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("forms.employee.selectPosition")} />
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
                <FormLabel>{t("forms.employee.hireDate")}</FormLabel>
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
                <FormLabel className="text-base">{t("forms.active")}</FormLabel>
                <p className="text-sm text-muted-foreground">
                  {t("forms.employee.activeDesc")}
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

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
                  {t("forms.employee.createAccount")}
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
                      <FormLabel className="text-base">{t("forms.employee.createAccountLabel")}</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        {t("forms.employee.createAccountDesc")}
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
                        <FormLabel>{t("forms.employee.accountEmail")}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t("forms.emailPlaceholder")} {...field} />
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
                        <FormLabel>{t("forms.employee.accountPassword")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder={t("forms.employee.passwordPlaceholder")}
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
            {t("forms.cancel")}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {employee ? t("forms.edit") : t("forms.add")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
