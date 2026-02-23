import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import type { Agency } from "@/hooks/useAgencies";

type AgencyFormData = {
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
};

interface AgencyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AgencyFormData) => void;
  defaultValues?: Agency | null;
  isLoading?: boolean;
}

export function AgencyForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isLoading,
}: AgencyFormProps) {
  const { t } = useTranslation();

  const agencySchema = z.object({
    name: z.string().min(2, t("forms.validation.nameMin2")),
    address: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email(t("forms.validation.invalidEmail")).optional().or(z.literal("")),
  });

  const form = useForm<AgencyFormData>({
    resolver: zodResolver(agencySchema),
    defaultValues: {
      name: defaultValues?.name || "",
      address: defaultValues?.address || "",
      city: defaultValues?.city || "",
      phone: defaultValues?.phone || "",
      email: defaultValues?.email || "",
    },
  });

  const handleSubmit = (data: AgencyFormData) => {
    onSubmit({
      ...data,
      email: data.email || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? t("forms.agency.editTitle") : t("forms.agency.newTitle")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.agency.agencyName")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("forms.agency.agencyNamePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.city")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("forms.cityPlaceholder")} {...field} />
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
                      <Input placeholder={t("forms.agency.phonePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.address")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("forms.agency.addressPlaceholder")}
                      {...field}
                    />
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
                  <FormLabel>{t("forms.email")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("forms.agency.emailPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("forms.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? t("forms.saving")
                  : defaultValues
                  ? t("forms.edit")
                  : t("forms.create")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
