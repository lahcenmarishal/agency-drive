import { useState } from "react";
import { Key, Plus, Search, Clock, AlertCircle, Loader2, CheckCircle, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useRentals, useCompleteRental, useTodayReturns, useOverdueRentals, Rental } from "@/hooks/useRentals";
import { RentalForm } from "@/components/rentals/RentalForm";
import { format, differenceInDays } from "date-fns";
import { Enums } from "@/integrations/supabase/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

export default function Locations() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<Enums<"rental_status"> | "all">("all" as any);
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [amountPaid, setAmountPaid] = useState<string>("");
  const { data: rentals, isLoading } = useRentals(statusFilter === "all" ? undefined : statusFilter);
  const { data: todayReturns } = useTodayReturns();
  const { data: overdueRentals } = useOverdueRentals();
  const completeRental = useCompleteRental();

  const statusLabels: Record<string, string> = { active: t("rentals.statusActive"), completed: t("rentals.statusCompleted"), overdue: t("rentals.statusOverdue") };
  const statusClasses: Record<string, string> = { active: "bg-blue-500/15 text-blue-400", completed: "bg-green-500/15 text-green-400", overdue: "bg-red-500/15 text-red-400" };
  const statusFilters = [{ value: "all" as any, label: t("rentals.statusAll") }, { value: "active" as const, label: t("rentals.statusActive") }, { value: "completed" as const, label: t("rentals.statusCompleted") }];

  const filteredRentals = rentals?.filter((r) => { if (!searchQuery) return true; const q = searchQuery.toLowerCase(); return r.clients?.full_name?.toLowerCase().includes(q) || r.vehicles?.brand?.toLowerCase().includes(q) || r.vehicles?.model?.toLowerCase().includes(q) || r.vehicles?.registration?.toLowerCase().includes(q); });
  const handleComplete = (rental: Rental) => { setSelectedRental(rental); setAmountPaid(rental.total_amount?.toString() || ""); setCompleteDialogOpen(true); };
  const confirmComplete = async () => { if (selectedRental) { await completeRental.mutateAsync({ id: selectedRental.id, amountPaid: parseFloat(amountPaid) || undefined }); setCompleteDialogOpen(false); setSelectedRental(null); } };
  const getDaysRemaining = (endDate: string) => differenceInDays(new Date(endDate), new Date());

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl md:text-3xl font-bold font-display">{t("rentals.title")}</h1><p className="text-sm md:text-base text-muted-foreground mt-1">{t("rentals.subtitle")}</p></div>
        <Button className="gap-2 w-full sm:w-auto" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" />{t("rentals.newRental")}</Button>
      </div>
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        <div className="glass-card p-3 md:p-5 flex flex-col md:flex-row items-center gap-2 md:gap-4"><div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-blue-500/10"><Key className="h-5 w-5 md:h-6 md:w-6 text-blue-400" /></div><div className="text-center md:text-left"><p className="text-xl md:text-2xl font-bold font-display">{rentals?.filter((r) => r.status === "active").length || 0}</p><p className="text-xs md:text-sm text-muted-foreground">{t("rentals.active")}</p></div></div>
        <div className="glass-card p-3 md:p-5 flex flex-col md:flex-row items-center gap-2 md:gap-4"><div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-amber-500/10"><Clock className="h-5 w-5 md:h-6 md:w-6 text-amber-400" /></div><div className="text-center md:text-left"><p className="text-xl md:text-2xl font-bold font-display">{todayReturns?.length || 0}</p><p className="text-xs md:text-sm text-muted-foreground">{t("rentals.returns")}</p></div></div>
        <div className="glass-card p-3 md:p-5 flex flex-col md:flex-row items-center gap-2 md:gap-4"><div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-red-500/10"><AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-red-400" /></div><div className="text-center md:text-left"><p className="text-xl md:text-2xl font-bold font-display">{overdueRentals?.length || 0}</p><p className="text-xs md:text-sm text-muted-foreground">{t("rentals.delays")}</p></div></div>
      </div>
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0"><TabsList className="w-max">{statusFilters.map((f) => (<TabsTrigger key={f.value} value={f.value} className="text-xs md:text-sm">{f.label}</TabsTrigger>))}</TabsList></div>
          <div className="relative flex-1 max-w-full md:max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t("common.search")} className="pl-10 bg-muted/30 border-border" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        </div>
      </Tabs>
      {isLoading && <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
      {!isLoading && (!filteredRentals || filteredRentals.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground"><Key className="h-16 w-16 mb-4 opacity-30" /><p className="text-lg font-medium">{t("rentals.noRentals")}</p><p className="text-sm">{t("rentals.createFirst")}</p><Button className="mt-4" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4 mr-2" />{t("rentals.newRental")}</Button></div>
      )}
      {!isLoading && filteredRentals && filteredRentals.length > 0 && (
        <div className="glass-card overflow-hidden hidden lg:block"><div className="overflow-x-auto"><table className="data-table"><thead><tr><th>{t("rentals.client")}</th><th>{t("rentals.vehicle")}</th><th>{t("rentals.period")}</th><th>{t("rentals.amount")}</th><th>{t("clients.status")}</th><th></th></tr></thead>
        <tbody>{filteredRentals.map((rental) => { const dr = getDaysRemaining(rental.end_date); const isOverdue = rental.status === "active" && dr < 0; return (
          <tr key={rental.id} className="group"><td><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-foreground font-medium text-sm">{rental.clients?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?"}</div><div><span className="font-medium">{rental.clients?.full_name || "Client"}</span>{rental.reservation_id && <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400"><CalendarClock className="h-3 w-3" />{t("rentals.fromReservation")}</span>}</div></div></td>
          <td><div><p className="font-medium">{rental.vehicles?.brand} {rental.vehicles?.model}</p><p className="text-sm text-muted-foreground font-mono">{rental.vehicles?.registration}</p></div></td>
          <td><p className="text-sm">{format(new Date(rental.start_date), "dd/MM/yyyy")} → {format(new Date(rental.end_date), "dd/MM/yyyy")}</p>{rental.status === "active" && <p className={cn("text-xs mt-1", isOverdue ? "text-red-400" : dr <= 1 ? "text-amber-400" : "text-muted-foreground")}>{isOverdue ? t("rentals.daysOverdue", { count: Math.abs(dr) }) : dr === 0 ? t("rentals.returnToday") : t("rentals.daysRemaining", { count: dr })}</p>}</td>
          <td><p className="font-semibold text-primary">${rental.total_amount || 0}</p>{rental.amount_paid && rental.amount_paid > 0 && <p className="text-xs text-green-400">{t("rentals.paid")}: ${rental.amount_paid}</p>}</td>
          <td><span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", isOverdue ? statusClasses["overdue"] : statusClasses[rental.status || "active"])}>{isOverdue ? t("rentals.statusOverdue") : statusLabels[rental.status || "active"]}</span></td>
          <td>{rental.status === "active" && <Button variant="outline" size="sm" onClick={() => handleComplete(rental)}><CheckCircle className="h-4 w-4 mr-1" />{t("rentals.complete")}</Button>}</td></tr>); })}</tbody></table></div></div>
      )}
      {!isLoading && filteredRentals && filteredRentals.length > 0 && (
        <div className="lg:hidden space-y-3">{filteredRentals.map((rental) => { const dr = getDaysRemaining(rental.end_date); const isOverdue = rental.status === "active" && dr < 0; return (
          <div key={rental.id} className="glass-card p-4 space-y-3"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3 min-w-0"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-foreground font-medium text-sm shrink-0">{rental.clients?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?"}</div><div className="min-w-0"><p className="font-medium truncate">{rental.clients?.full_name || "Client"}</p><p className="text-sm text-muted-foreground truncate">{rental.vehicles?.brand} {rental.vehicles?.model}</p>{rental.reservation_id && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400"><CalendarClock className="h-3 w-3" />{t("rentals.fromReservation")}</span>}</div></div><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium shrink-0", isOverdue ? statusClasses["overdue"] : statusClasses[rental.status || "active"])}>{isOverdue ? t("rentals.statusOverdue") : statusLabels[rental.status || "active"]}</span></div>
          <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{format(new Date(rental.start_date), "dd/MM")} → {format(new Date(rental.end_date), "dd/MM/yyyy")}</span><span className="font-semibold text-primary">${rental.total_amount || 0}</span></div>
          {rental.status === "active" && <Button variant="outline" size="sm" className="w-full" onClick={() => handleComplete(rental)}><CheckCircle className="h-4 w-4 mr-1" />{t("rentals.complete")}</Button>}</div>); })}</div>
      )}
      <RentalForm open={formOpen} onOpenChange={setFormOpen} />
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}><DialogContent><DialogHeader><DialogTitle className="font-display">{t("rentals.completeRental")}</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div className="p-4 rounded-lg bg-muted/30"><p className="text-sm text-muted-foreground">{t("rentals.client")}</p><p className="font-medium">{selectedRental?.clients?.full_name}</p></div><div className="p-4 rounded-lg bg-muted/30"><p className="text-sm text-muted-foreground">{t("rentals.vehicle")}</p><p className="font-medium">{selectedRental?.vehicles?.brand} {selectedRental?.vehicles?.model}</p></div><div className="p-4 rounded-lg bg-primary/10 border border-primary/20"><p className="text-sm text-muted-foreground">{t("rentals.totalAmount")}</p><p className="text-xl font-bold font-display text-primary">${selectedRental?.total_amount || 0}</p></div><div className="space-y-2"><Label htmlFor="amount-paid">{t("rentals.amountPaid")}</Label><Input id="amount-paid" type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder={t("rentals.amountPaidPlaceholder")} /></div></div><DialogFooter><Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>{t("common.cancel")}</Button><Button onClick={confirmComplete} disabled={completeRental.isPending}>{completeRental.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t("rentals.confirmReturn")}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
