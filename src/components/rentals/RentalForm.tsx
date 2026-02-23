import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateRental } from "@/hooks/useRentals";
import { useVehicles } from "@/hooks/useVehicles";
import { useClients } from "@/hooks/useClients";
import { Loader2, Calculator } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

type RentalFormData = {
  client_id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  daily_rate?: number;
  notes?: string;
};

interface RentalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RentalForm({ open, onOpenChange }: RentalFormProps) {
  const { t } = useTranslation();
  const createRental = useCreateRental();
  const { data: vehicles } = useVehicles("available");
  const { data: clients } = useClients();
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const rentalSchema = z.object({
    client_id: z.string().min(1, t("forms.validation.selectClient")),
    vehicle_id: z.string().min(1, t("forms.validation.selectVehicle")),
    start_date: z.string().min(1, t("forms.validation.startDateRequired")),
    end_date: z.string().min(1, t("forms.validation.endDateRequired")),
    daily_rate: z.coerce.number().min(0).optional(),
    notes: z.string().optional(),
  });

  const form = useForm<RentalFormData>({
    resolver: zodResolver(rentalSchema),
    defaultValues: {
      start_date: new Date().toISOString().split('T')[0],
    },
  });

  const watchedVehicle = form.watch("vehicle_id");
  const watchedStart = form.watch("start_date");
  const watchedEnd = form.watch("end_date");
  const watchedDailyRate = form.watch("daily_rate");

  useEffect(() => {
    if (watchedVehicle) {
      const vehicle = vehicles?.find((v) => v.id === watchedVehicle);
      if (vehicle?.daily_rate) {
        form.setValue("daily_rate", vehicle.daily_rate);
      }
    }
  }, [watchedVehicle, vehicles, form]);

  useEffect(() => {
    if (watchedDailyRate && watchedStart && watchedEnd) {
      const start = new Date(watchedStart);
      const end = new Date(watchedEnd);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (days > 0) {
        setTotalAmount(days * watchedDailyRate);
      } else {
        setTotalAmount(0);
      }
    }
  }, [watchedDailyRate, watchedStart, watchedEnd]);

  const onSubmit = async (data: RentalFormData) => {
    try {
      await createRental.mutateAsync({
        ...data,
        status: "active",
        total_amount: totalAmount,
      } as any);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const availableClients = clients?.filter((c) => !c.is_blacklisted) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{t("forms.rental.title")}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.rental.client")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("forms.rental.selectClient")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {availableClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.full_name}
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
              name="vehicle_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.rental.vehicle")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("forms.rental.selectVehicle")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {vehicles?.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.brand} {vehicle.model} ({vehicle.registration})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.rental.startDate")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.rental.endDate")}</FormLabel>
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
              name="daily_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.rental.dailyRate")}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {totalAmount > 0 && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <Calculator className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">{t("forms.rental.totalAmount")}</p>
                  <p className="text-xl font-bold font-display text-primary">{totalAmount} MAD</p>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.rental.notes")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t("forms.rental.notesPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                {t("forms.cancel")}
              </Button>
              <Button type="submit" disabled={createRental.isPending} className="w-full sm:w-auto">
                {createRental.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("forms.rental.createRental")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
