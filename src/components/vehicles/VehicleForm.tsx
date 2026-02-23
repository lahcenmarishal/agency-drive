import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateVehicle, useUpdateVehicle, Vehicle } from "@/hooks/useVehicles";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

type VehicleFormData = {
  brand: string;
  model: string;
  registration: string;
  year?: number;
  color?: string;
  seats?: number;
  fuel_type?: string;
  transmission?: string;
  daily_rate?: number;
  status: "available" | "rented" | "reserved" | "maintenance";
  insurance_expiry?: string;
  registration_card_expiry?: string;
  technical_visit_expiry?: string;
};

interface VehicleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: Vehicle;
}

export function VehicleForm({ open, onOpenChange, vehicle }: VehicleFormProps) {
  const { t } = useTranslation();
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const isEditing = !!vehicle;

  const vehicleSchema = z.object({
    brand: z.string().min(1, t("forms.validation.brandRequired")),
    model: z.string().min(1, t("forms.validation.modelRequired")),
    registration: z.string().min(1, t("forms.validation.registrationRequired")),
    year: z.coerce.number().min(1900).max(2030).optional(),
    color: z.string().optional(),
    seats: z.coerce.number().min(1).max(50).optional(),
    fuel_type: z.string().optional(),
    transmission: z.string().optional(),
    daily_rate: z.coerce.number().min(0).optional(),
    status: z.enum(["available", "rented", "reserved", "maintenance"]).default("available"),
    insurance_expiry: z.string().optional(),
    registration_card_expiry: z.string().optional(),
    technical_visit_expiry: z.string().optional(),
  });

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: vehicle ? {
      brand: vehicle.brand,
      model: vehicle.model,
      registration: vehicle.registration,
      year: vehicle.year || undefined,
      color: vehicle.color || "",
      seats: vehicle.seats || undefined,
      fuel_type: vehicle.fuel_type || "",
      transmission: vehicle.transmission || "",
      daily_rate: vehicle.daily_rate || undefined,
      status: vehicle.status || "available",
      insurance_expiry: vehicle.insurance_expiry || "",
      registration_card_expiry: vehicle.registration_card_expiry || "",
      technical_visit_expiry: vehicle.technical_visit_expiry || "",
    } : {
      status: "available",
    },
  });

  const onSubmit = async (data: VehicleFormData) => {
    try {
      if (isEditing) {
        await updateVehicle.mutateAsync({ id: vehicle.id, ...data });
      } else {
        await createVehicle.mutateAsync(data as any);
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const isPending = createVehicle.isPending || updateVehicle.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? t("forms.vehicle.editTitle") : t("forms.vehicle.newTitle")}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">{t("forms.vehicle.generalInfo")}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("forms.vehicle.brand")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("forms.vehicle.brandPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("forms.vehicle.model")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("forms.vehicle.modelPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("forms.vehicle.registration")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("forms.vehicle.registrationPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("forms.vehicle.year")}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("forms.vehicle.color")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("forms.vehicle.colorPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("forms.vehicle.seats")}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fuel_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("forms.vehicle.fuelType")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("forms.vehicle.select")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Diesel">{t("forms.vehicle.diesel")}</SelectItem>
                          <SelectItem value="Essence">{t("forms.vehicle.gasoline")}</SelectItem>
                          <SelectItem value="Hybride">{t("forms.vehicle.hybrid")}</SelectItem>
                          <SelectItem value="Électrique">{t("forms.vehicle.electric")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="transmission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("forms.vehicle.transmission")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("forms.vehicle.select")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Manuelle">{t("forms.vehicle.manual")}</SelectItem>
                          <SelectItem value="Automatique">{t("forms.vehicle.automatic")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">{t("forms.vehicle.pricingStatus")}</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="daily_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("forms.vehicle.dailyRate")}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="350" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("forms.vehicle.status")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">{t("forms.vehicle.statusAvailable")}</SelectItem>
                          <SelectItem value="rented">{t("forms.vehicle.statusRented")}</SelectItem>
                          <SelectItem value="reserved">{t("forms.vehicle.statusReserved")}</SelectItem>
                          <SelectItem value="maintenance">{t("forms.vehicle.statusMaintenance")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">{t("forms.vehicle.documents")}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="insurance_expiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("forms.vehicle.insurance")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registration_card_expiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("forms.vehicle.registrationCard")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="technical_visit_expiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("forms.vehicle.technicalVisit")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
