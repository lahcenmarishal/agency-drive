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
import { useTranslation } from "react-i18next";
import type { Driver } from "@/hooks/useDrivers";

type FormData = {
  full_name: string;
  phone?: string;
  license_number?: string;
  license_expiry?: string;
  is_active: boolean;
};

interface DriverFormProps {
  driver?: Driver | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DriverForm({ driver, onSubmit, onCancel, isLoading }: DriverFormProps) {
  const { t } = useTranslation();

  const formSchema = z.object({
    full_name: z.string().min(2, t("forms.validation.nameMin2")),
    phone: z.string().optional(),
    license_number: z.string().optional(),
    license_expiry: z.string().optional(),
    is_active: z.boolean().default(true),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: driver?.full_name || "",
      phone: driver?.phone || "",
      license_number: driver?.license_number || "",
      license_expiry: driver?.license_expiry || "",
      is_active: driver?.is_active ?? true,
    },
  });

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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="license_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("forms.driver.licenseNumber")}</FormLabel>
                <FormControl>
                  <Input placeholder="ABC123456" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="license_expiry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("forms.driver.licenseExpiry")}</FormLabel>
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
                  {t("forms.driver.activeDesc")}
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("forms.cancel")}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {driver ? t("forms.edit") : t("forms.add")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
