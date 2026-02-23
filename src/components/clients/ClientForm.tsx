import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateClient, useUpdateClient, Client } from "@/hooks/useClients";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

type ClientFormData = {
  full_name: string;
  phone?: string;
  email?: string;
  id_number?: string;
  license_number?: string;
  address?: string;
  city?: string;
  notes?: string;
};

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
}

export function ClientForm({ open, onOpenChange, client }: ClientFormProps) {
  const { t } = useTranslation();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const isEditing = !!client;

  const clientSchema = z.object({
    full_name: z.string().min(1, t("forms.validation.nameRequired")),
    phone: z.string().optional(),
    email: z.string().email(t("forms.validation.invalidEmail")).optional().or(z.literal("")),
    id_number: z.string().optional(),
    license_number: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    notes: z.string().optional(),
  });

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client ? {
      full_name: client.full_name,
      phone: client.phone || "",
      email: client.email || "",
      id_number: client.id_number || "",
      license_number: client.license_number || "",
      address: client.address || "",
      city: client.city || "",
      notes: client.notes || "",
    } : {},
  });

  const onSubmit = async (data: ClientFormData) => {
    try {
      if (isEditing) {
        await updateClient.mutateAsync({ id: client.id, ...data });
      } else {
        await createClient.mutateAsync(data as any);
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const isPending = createClient.isPending || updateClient.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? t("forms.client.editTitle") : t("forms.client.newTitle")}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">{t("forms.client.personalInfo")}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem className="col-span-1 sm:col-span-2">
                      <FormLabel>{t("forms.fullName")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("forms.client.namePlaceholder")} {...field} />
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
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("forms.email")}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={t("forms.emailPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">{t("forms.client.documents")}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="id_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("forms.client.idNumber")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("forms.client.idNumberPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="license_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("forms.client.licenseNumber")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("forms.client.licenseNumberPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">{t("forms.client.addressSection")}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="col-span-1 sm:col-span-2">
                      <FormLabel>{t("forms.address")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("forms.addressPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">{t("forms.client.internalNotes")}</h4>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder={t("forms.client.notesPlaceholder")} 
                        className="min-h-[80px] sm:min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                {t("forms.cancel")}
              </Button>
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? t("forms.save") : t("forms.add")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
