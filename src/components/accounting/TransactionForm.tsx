import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useTranslation } from "react-i18next";
import type { TransactionType } from "@/hooks/useTransactions";

type FormData = {
  type: "income" | "expense";
  amount: number;
  description?: string;
  category?: string;
  transaction_date: string;
};

interface TransactionFormProps {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TransactionForm({ onSubmit, onCancel, isLoading }: TransactionFormProps) {
  const { t } = useTranslation();

  const formSchema = z.object({
    type: z.enum(["income", "expense"] as const),
    amount: z.coerce.number().positive(t("forms.validation.amountPositive")),
    description: z.string().optional(),
    category: z.string().optional(),
    transaction_date: z.string().min(1, t("forms.validation.dateRequired")),
  });

  const incomeCategories = [
    { value: "location", label: t("forms.transaction.incomeCategories.location") },
    { value: "depot", label: t("forms.transaction.incomeCategories.depot") },
    { value: "supplement", label: t("forms.transaction.incomeCategories.supplement") },
    { value: "autre", label: t("forms.transaction.incomeCategories.autre") },
  ];

  const expenseCategories = [
    { value: "carburant", label: t("forms.transaction.expenseCategories.carburant") },
    { value: "maintenance", label: t("forms.transaction.expenseCategories.maintenance") },
    { value: "assurance", label: t("forms.transaction.expenseCategories.assurance") },
    { value: "taxe", label: t("forms.transaction.expenseCategories.taxe") },
    { value: "salaire", label: t("forms.transaction.expenseCategories.salaire") },
    { value: "loyer", label: t("forms.transaction.expenseCategories.loyer") },
    { value: "autre", label: t("forms.transaction.expenseCategories.autre") },
  ];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "income",
      amount: 0,
      description: "",
      category: "",
      transaction_date: new Date().toISOString().split("T")[0],
    },
  });

  const transactionType = form.watch("type");
  const categories = transactionType === "income" ? incomeCategories : expenseCategories;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("forms.transaction.type")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("forms.transaction.selectType")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="income">{t("forms.transaction.income")}</SelectItem>
                  <SelectItem value="expense">{t("forms.transaction.expense")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("forms.transaction.amount")}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transaction_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("forms.transaction.date")}</FormLabel>
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
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("forms.transaction.category")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("forms.transaction.selectCategory")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("forms.transaction.description")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("forms.transaction.descriptionPlaceholder")}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("forms.cancel")}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {t("forms.add")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
