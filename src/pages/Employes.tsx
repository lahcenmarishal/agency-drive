import { useState } from "react";
import { Users, Plus, Search, Phone, Mail, Building2, Shield, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  useToggleEmployeeStatus,
  type Employee,
} from "@/hooks/useEmployees";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { useAgencyFilterContext } from "@/contexts/AgencyFilterContext";
import { useAgencies } from "@/hooks/useAgencies";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

export default function Employes() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "fr" ? fr : enUS;
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  const { isAdmin } = useAuth();
  const { effectiveAgencyId } = useAgencyFilterContext();
  const { data: agencies } = useAgencies();
  const { data: employees, isLoading } = useEmployees();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const toggleStatus = useToggleEmployeeStatus();

  const selectedAgencyName = effectiveAgencyId
    ? agencies?.find((a) => a.id === effectiveAgencyId)?.name
    : null;

  const filteredEmployees = employees?.filter((emp) =>
    emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (data: any) => {
    createEmployee.mutate(data, {
      onSuccess: () => setIsFormOpen(false),
    });
  };

  const handleUpdate = (data: any) => {
    if (!editingEmployee) return;
    updateEmployee.mutate(
      { id: editingEmployee.id, ...data },
      { onSuccess: () => setEditingEmployee(null) }
    );
  };

  const handleDelete = () => {
    if (!deletingEmployee) return;
    deleteEmployee.mutate(deletingEmployee.id, {
      onSuccess: () => setDeletingEmployee(null),
    });
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">{t("employees.title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            {t("employees.employeesCount", { count: employees?.length || 0 })}
            {selectedAgencyName && (
              <span className="ml-1">
                • <Building2 className="inline h-3.5 w-3.5 mr-1" />
                {selectedAgencyName}
              </span>
            )}
            {!selectedAgencyName && isAdmin && ` ${t("common.inAllAgencies")}`}
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4" />
          {t("employees.addEmployee")}
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("employees.searchPlaceholder")}
          className="pl-10 bg-muted/30 border-border"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : filteredEmployees?.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">{t("employees.noEmployees")}</h3>
          <p className="text-muted-foreground mt-1">{t("employees.startAdding")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees?.map((employe) => (
            <div key={employe.id} className="glass-card p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-foreground font-semibold text-lg">
                  {employe.full_name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5",
                      employe.position === "admin" ? "bg-primary/15 text-primary" :
                      employe.position === "comptable" ? "bg-amber-500/15 text-amber-400" :
                      employe.position === "responsable" ? "bg-purple-500/15 text-purple-400" :
                      "bg-blue-500/15 text-blue-400"
                    )}
                  >
                    <Shield className="h-3 w-3" />
                    {t(`employees.positions.${employe.position || "agent"}`)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold font-display">{employe.full_name}</h3>
                {employe.is_active ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Building2 className="h-4 w-4" />
                <span>{(employe as any).agencies?.name || t("agencies.title")}</span>
              </div>
              
              <div className="space-y-2 pt-4 border-t border-border">
                {employe.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{employe.phone}</span>
                  </div>
                )}
                {employe.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{employe.email}</span>
                  </div>
                )}
                {employe.hire_date && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("employees.hiredOn", {
                      date: format(new Date(employe.hire_date), "d MMMM yyyy", { locale: dateLocale }),
                    })}
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditingEmployee(employe)}>
                  <Edit2 className="h-3.5 w-3.5 mr-1" />
                  {t("common.modify")}
                </Button>
                <Button
                  size="sm"
                  variant={employe.is_active ? "outline" : "default"}
                  onClick={() => toggleStatus.mutate({ id: employe.id, is_active: !employe.is_active })}
                >
                  {employe.is_active ? t("dashboard.deactivate") : t("dashboard.activate")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeletingEmployee(employe)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("employees.addEmployeeTitle")}</DialogTitle>
            <DialogDescription className="sr-only">
              {t("employees.addEmployeeTitle")}
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm
            onSubmit={handleCreate}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createEmployee.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("employees.editEmployee")}</DialogTitle>
            <DialogDescription className="sr-only">
              {t("employees.editEmployee")}
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm
            employee={editingEmployee}
            onSubmit={handleUpdate}
            onCancel={() => setEditingEmployee(null)}
            isLoading={updateEmployee.isPending}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingEmployee} onOpenChange={() => setDeletingEmployee(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("employees.deleteEmployee")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("employees.deleteEmployeeDesc", { name: deletingEmployee?.full_name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEmployee.isPending ? "Suppression..." : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
