import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateReservation } from "@/hooks/useReservations";
import { useVehicles } from "@/hooks/useVehicles";
import { useClients } from "@/hooks/useClients";
import { Loader2, Calculator } from "lucide-react";
import { useState, useEffect } from "react";

const reservationSchema = z.object({
  client_id: z.string().min(1, "Sélectionnez un client"),
  vehicle_id: z.string().min(1, "Sélectionnez un véhicule"),
  start_date: z.string().min(1, "Date de début requise"),
  end_date: z.string().min(1, "Date de fin requise"),
  notes: z.string().optional(),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

interface ReservationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReservationForm({ open, onOpenChange }: ReservationFormProps) {
  const createReservation = useCreateReservation();
  const { data: vehicles } = useVehicles("available");
  const { data: clients } = useClients();
  const [estimatedAmount, setEstimatedAmount] = useState<number>(0);

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      start_date: new Date().toISOString().split('T')[0],
    },
  });

  const watchedVehicle = form.watch("vehicle_id");
  const watchedStart = form.watch("start_date");
  const watchedEnd = form.watch("end_date");

  // Calculer le montant estimé
  useEffect(() => {
    if (watchedVehicle && watchedStart && watchedEnd) {
      const vehicle = vehicles?.find((v) => v.id === watchedVehicle);
      if (vehicle?.daily_rate) {
        const start = new Date(watchedStart);
        const end = new Date(watchedEnd);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (days > 0) {
          setEstimatedAmount(days * vehicle.daily_rate);
        } else {
          setEstimatedAmount(0);
        }
      }
    }
  }, [watchedVehicle, watchedStart, watchedEnd, vehicles]);

  const onSubmit = async (data: ReservationFormData) => {
    try {
      await createReservation.mutateAsync({
        ...data,
        status: "pending",
        total_amount: estimatedAmount,
      } as any);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  // Filtrer les clients non blacklistés
  const availableClients = clients?.filter((c) => !c.is_blacklisted) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Nouvelle réservation</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client" />
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
                  <FormLabel>Véhicule *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un véhicule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {vehicles?.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.brand} {vehicle.model} - {vehicle.daily_rate} MAD/jour
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
                    <FormLabel>Date de début *</FormLabel>
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
                    <FormLabel>Date de fin *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {estimatedAmount > 0 && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <Calculator className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Montant estimé</p>
                  <p className="text-xl font-bold font-display text-primary">{estimatedAmount} MAD</p>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notes supplémentaires..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                Annuler
              </Button>
              <Button type="submit" disabled={createReservation.isPending} className="w-full sm:w-auto">
                {createReservation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer la réservation
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
