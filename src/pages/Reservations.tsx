import { useState } from "react";
import { CalendarClock, Plus, Search, ArrowRight, Loader2, Play, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useReservations, useCancelReservation, useConvertToRental, useUpdateReservation, Reservation } from "@/hooks/useReservations";
import { ReservationForm } from "@/components/reservations/ReservationForm";
import { format } from "date-fns";
import { Enums } from "@/integrations/supabase/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";

export default function Reservations() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<Enums<"reservation_status"> | "all">("all" as any);
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const { data: reservations, isLoading } = useReservations(statusFilter === "all" ? undefined : statusFilter);
  const cancelReservation = useCancelReservation();
  const convertToRental = useConvertToRental();
  const updateReservation = useUpdateReservation();

  const statusLabels: Record<string, string> = { pending: t("reservations.statusPending"), confirmed: t("reservations.statusConfirmed"), cancelled: t("reservations.statusCancelled"), converted: t("reservations.statusConverted") };
  const statusClasses: Record<string, string> = { pending: "bg-amber-500/15 text-amber-400", confirmed: "bg-green-500/15 text-green-400", cancelled: "bg-red-500/15 text-red-400", converted: "bg-blue-500/15 text-blue-400" };
  const statusFilters = [
    { value: "all" as any, label: t("reservations.statusAll") },
    { value: "pending" as const, label: t("reservations.statusPending") },
    { value: "confirmed" as const, label: t("reservations.statusConfirmed") },
    { value: "cancelled" as const, label: t("reservations.statusCancelled") },
    { value: "converted" as const, label: t("reservations.statusConverted") },
  ];

  const filteredReservations = reservations?.filter((r) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return r.clients?.full_name?.toLowerCase().includes(query) || r.vehicles?.brand?.toLowerCase().includes(query) || r.vehicles?.model?.toLowerCase().includes(query);
  });

  const handleConfirm = async (id: string) => { await updateReservation.mutateAsync({ id, status: "confirmed" }); };
  const handleConvertToRental = async (id: string) => { await convertToRental.mutateAsync(id); };
  const canConvert = (reservation: Reservation) => { if (reservation.status !== "confirmed") return false; return new Date(reservation.start_date) <= new Date(); };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl md:text-3xl font-bold font-display">{t("reservations.title")}</h1><p className="text-muted-foreground mt-1 text-sm md:text-base">{t("reservations.subtitle")}</p></div>
        <Button className="gap-2 w-full sm:w-auto" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" />{t("reservations.newReservation")}</Button>
      </div>
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0"><TabsList className="w-max">{statusFilters.map((f) => (<TabsTrigger key={f.value} value={f.value} className="text-xs md:text-sm">{f.label}</TabsTrigger>))}</TabsList></div>
          <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t("common.search")} className="pl-10 bg-muted/30 border-border" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        </div>
      </Tabs>
      {isLoading && <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
      {!isLoading && (!filteredReservations || filteredReservations.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground"><CalendarClock className="h-16 w-16 mb-4 opacity-30" /><p className="text-lg font-medium">{t("reservations.noReservations")}</p><p className="text-sm">{t("reservations.createFirst")}</p><Button className="mt-4" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4 mr-2" />{t("reservations.newReservation")}</Button></div>
      )}
      {!isLoading && filteredReservations && filteredReservations.length > 0 && (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => (
            <div key={reservation.id} className="glass-card p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between md:hidden">
                <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><CalendarClock className="h-5 w-5" /></div><div><h3 className="font-semibold text-sm">{reservation.clients?.full_name || "Client"}</h3><p className="text-xs text-muted-foreground">{reservation.vehicles?.brand} {reservation.vehicles?.model}</p></div></div>
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusClasses[reservation.status || "pending"])}>{statusLabels[reservation.status || "pending"]}</span>
              </div>
              <div className="flex items-center justify-between md:hidden text-sm"><div className="flex items-center gap-2"><span className="text-muted-foreground">{format(new Date(reservation.start_date), "dd/MM")}</span><ArrowRight className="h-3 w-3 text-muted-foreground" /><span>{format(new Date(reservation.end_date), "dd/MM/yyyy")}</span></div><p className="font-semibold text-primary">{reservation.total_amount || 0} MAD</p></div>
              <div className="flex flex-wrap gap-2 md:hidden">
                {reservation.status === "pending" && <Button variant="outline" size="sm" className="flex-1" onClick={() => handleConfirm(reservation.id)} disabled={updateReservation.isPending}><Check className="h-4 w-4 mr-1" />{t("reservations.confirm")}</Button>}
                {canConvert(reservation) && <Button size="sm" className="flex-1" onClick={() => handleConvertToRental(reservation.id)} disabled={convertToRental.isPending}><Play className="h-4 w-4 mr-1" />{t("reservations.start")}</Button>}
                {(reservation.status === "pending" || reservation.status === "confirmed") && (
                  <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><X className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent className="max-w-[90vw] sm:max-w-lg"><AlertDialogHeader><AlertDialogTitle>{t("reservations.cancelReservation")}</AlertDialogTitle><AlertDialogDescription>{t("reservations.cancelReservationDesc")}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t("common.no")}</AlertDialogCancel><AlertDialogAction onClick={() => cancelReservation.mutate(reservation.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("reservations.yesCancel")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                )}
              </div>
              <div className="hidden md:flex items-center gap-6"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><CalendarClock className="h-6 w-6" /></div><div><h3 className="font-semibold">{reservation.clients?.full_name || "Client"}</h3><p className="text-sm text-muted-foreground">{reservation.vehicles?.brand} {reservation.vehicles?.model}</p></div></div>
              <div className="hidden md:flex items-center gap-2 text-sm"><span className="text-muted-foreground">{format(new Date(reservation.start_date), "dd/MM/yyyy")}</span><ArrowRight className="h-4 w-4 text-muted-foreground" /><span>{format(new Date(reservation.end_date), "dd/MM/yyyy")}</span></div>
              <div className="hidden md:block text-right"><p className="font-semibold text-primary">{reservation.total_amount || 0} MAD</p></div>
              <span className={cn("hidden md:inline-block px-3 py-1.5 rounded-full text-xs font-medium", statusClasses[reservation.status || "pending"])}>{statusLabels[reservation.status || "pending"]}</span>
              <div className="hidden md:flex items-center gap-2">
                {reservation.status === "pending" && <Button variant="outline" size="sm" onClick={() => handleConfirm(reservation.id)} disabled={updateReservation.isPending}><Check className="h-4 w-4 mr-1" />{t("reservations.confirm")}</Button>}
                {canConvert(reservation) && <Button size="sm" onClick={() => handleConvertToRental(reservation.id)} disabled={convertToRental.isPending}><Play className="h-4 w-4 mr-1" />{t("reservations.startRental")}</Button>}
                {(reservation.status === "pending" || reservation.status === "confirmed") && (
                  <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><X className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t("reservations.cancelReservation")}</AlertDialogTitle><AlertDialogDescription>{t("reservations.cancelReservationDesc")}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t("common.no")}</AlertDialogCancel><AlertDialogAction onClick={() => cancelReservation.mutate(reservation.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("reservations.yesCancel")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <ReservationForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
