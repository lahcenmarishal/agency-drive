import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Calendar, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionForm } from "@/components/accounting/TransactionForm";
import { FinancialChart } from "@/components/accounting/FinancialChart";
import { CategoryBreakdown } from "@/components/accounting/CategoryBreakdown";
import {
  useTransactions,
  useCreateTransaction,
  useDeleteTransaction,
  useFinancialSummary,
  type Transaction,
} from "@/hooks/useTransactions";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const categoryLabels: Record<string, string> = {
  location: "Location",
  depot: "Dépôt de garantie",
  supplement: "Supplément",
  carburant: "Carburant",
  maintenance: "Maintenance",
  assurance: "Assurance",
  taxe: "Taxes",
  salaire: "Salaires",
  loyer: "Loyer",
  autre: "Autre",
};

export default function Comptabilite() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  const { data: transactions, isLoading: transactionsLoading } = useTransactions(selectedMonth);
  const { data: summary, isLoading: summaryLoading } = useFinancialSummary(selectedMonth);
  const createTransaction = useCreateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const handleCreate = (data: any) => {
    createTransaction.mutate(data, {
      onSuccess: () => setIsFormOpen(false),
    });
  };

  const handleDelete = () => {
    if (!deletingTransaction) return;
    deleteTransaction.mutate(deletingTransaction.id, {
      onSuccess: () => setDeletingTransaction(null),
    });
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">Comptabilité</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Suivi financier simplifié
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <Calendar className="h-4 w-4" />
                <span className="truncate">{format(selectedMonth, "MMMM yyyy", { locale: fr })}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={selectedMonth}
                onSelect={(date) => date && setSelectedMonth(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button className="gap-2 w-full sm:w-auto" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="sm:inline">Nouvelle transaction</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Revenus</p>
              {summaryLoading ? (
                <Skeleton className="h-8 md:h-9 w-28 md:w-32 mt-1" />
              ) : (
                <p className="text-2xl md:text-3xl font-bold font-display text-green-400 mt-1 truncate">
                  {(summary?.income || 0).toLocaleString()} MAD
                </p>
              )}
            </div>
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-green-500/10 flex-shrink-0">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-green-400" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Dépenses</p>
              {summaryLoading ? (
                <Skeleton className="h-8 md:h-9 w-28 md:w-32 mt-1" />
              ) : (
                <p className="text-2xl md:text-3xl font-bold font-display text-red-400 mt-1 truncate">
                  {(summary?.expenses || 0).toLocaleString()} MAD
                </p>
              )}
            </div>
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-red-500/10 flex-shrink-0">
              <TrendingDown className="h-5 w-5 md:h-6 md:w-6 text-red-400" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Solde net</p>
              {summaryLoading ? (
                <Skeleton className="h-8 md:h-9 w-28 md:w-32 mt-1" />
              ) : (
                <p className="text-2xl md:text-3xl font-bold font-display text-primary mt-1 truncate">
                  {(summary?.balance || 0).toLocaleString()} MAD
                </p>
              )}
            </div>
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
              <Wallet className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="section-title mb-6">Évolution sur 6 mois</h3>
          <FinancialChart />
        </div>
        <div className="glass-card p-6">
          <Tabs defaultValue="income">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Par catégorie</h3>
              <TabsList className="grid grid-cols-2 w-auto">
                <TabsTrigger value="income" className="text-xs">Revenus</TabsTrigger>
                <TabsTrigger value="expense" className="text-xs">Dépenses</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="income">
              <CategoryBreakdown type="income" month={selectedMonth} />
            </TabsContent>
            <TabsContent value="expense">
              <CategoryBreakdown type="expense" month={selectedMonth} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Transactions */}
      <div className="glass-card p-6">
        <h3 className="section-title mb-6">Transactions du mois</h3>
        {transactionsLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : transactions?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune transaction ce mois-ci
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {transactions?.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div
                    className={`flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl flex-shrink-0 ${
                      transaction.type === "income"
                        ? "bg-green-500/10"
                        : "bg-red-500/10"
                    }`}
                  >
                    {transaction.type === "income" ? (
                      <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 md:h-5 md:w-5 text-red-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm md:text-base truncate">
                      {transaction.description || categoryLabels[transaction.category || "autre"]}
                    </p>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                      {transaction.category && (
                        <span>{categoryLabels[transaction.category] || transaction.category}</span>
                      )}
                      {(transaction as any).rentals?.clients?.full_name && (
                        <>
                          <span>•</span>
                          <span className="truncate">{(transaction as any).rentals.clients.full_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-4">
                  <div className="text-left sm:text-right">
                    <p
                      className={`font-semibold text-sm md:text-base ${
                        transaction.type === "income"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {(transaction.amount || 0).toLocaleString()} MAD
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {format(new Date(transaction.transaction_date), "dd/MM/yyyy")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive flex-shrink-0"
                    onClick={() => setDeletingTransaction(transaction)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm
            onSubmit={handleCreate}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createTransaction.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingTransaction} onOpenChange={() => setDeletingTransaction(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la transaction ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La transaction sera supprimée définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
