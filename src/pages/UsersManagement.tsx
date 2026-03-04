import { useState } from "react";
import { Users, Plus, Search, Mail, Building2, Shield, CheckCircle, XCircle, Pencil, Trash2 } from "lucide-react";
import { AdminBillingPanel } from "@/components/billing/AdminBillingPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
import { Skeleton } from "@/components/ui/skeleton";
import { CreateAdminForm } from "@/components/users/CreateAdminForm";
import { EditUserForm } from "@/components/users/EditUserForm";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, UserWithProfile } from "@/hooks/useUsers";
import { useAgencies } from "@/hooks/useAgencies";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

export default function UsersManagement() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserWithProfile | null>(null);

  const { isSuperAdmin, user: currentUser } = useAuth();
  const { data: agencies } = useAgencies();
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const filteredUsers = users?.filter((user) =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (data: { full_name: string; email: string; password: string; agency_ids: string[]; plan_key: string; billing_interval: string }) => {
    createUser.mutate({ ...data, role: "admin" }, { onSuccess: () => setIsFormOpen(false) });
  };

  const handleUpdate = (data: { full_name: string; email: string; is_active: boolean; agency_ids: string[] }) => {
    if (!editingUser) return;
    updateUser.mutate({ user_id: editingUser.user_id, full_name: data.full_name, is_active: data.is_active, agency_ids: data.agency_ids }, { onSuccess: () => setEditingUser(null) });
  };

  const handleDelete = () => {
    if (!deletingUser) return;
    deleteUser.mutate(deletingUser.user_id, { onSuccess: () => setDeletingUser(null) });
  };

  const canModifyUser = (user: UserWithProfile) => {
    return user.role !== "super_admin" && user.user_id !== currentUser?.id;
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">{t("users.accessDenied")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">{t("users.title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            {t("users.usersCount", { count: users?.length || 0 })}
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4" />
          {t("users.createAdmin")}
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t("users.searchPlaceholder")} className="pl-10 bg-muted/30 border-border" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (<Skeleton key={i} className="h-48 rounded-xl" />))}
        </div>
      ) : filteredUsers?.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">{t("users.noUsers")}</h3>
          <p className="text-muted-foreground mt-1">{t("users.startCreating")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers?.map((user) => (
            <div key={user.id} className="glass-card p-6 group relative">
              {canModifyUser(user) && (
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingUser(user)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeletingUser(user)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-foreground font-semibold text-lg">
                  {user.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5",
                    user.role === "super_admin" ? "bg-destructive/15 text-destructive" :
                    user.role === "admin" ? "bg-primary/15 text-primary" : "bg-accent text-accent-foreground"
                  )}>
                    <Shield className="h-3 w-3" />
                    {t(`users.roles.${user.role || "agent"}`)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold font-display">{user.full_name || t("dashboard.noName")}</h3>
                {user.is_active ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-destructive" />}
              </div>
              
              {user.agency_name && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Building2 className="h-4 w-4" />
                  <span className="line-clamp-2">{user.agency_name}</span>
                </div>
              )}
              
              <div className="space-y-2 pt-4 border-t border-border">
                {user.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t("users.createAdminTitle")}</DialogTitle></DialogHeader>
          <CreateAdminForm agencies={agencies || []} onSubmit={handleCreate} onCancel={() => setIsFormOpen(false)} isLoading={createUser.isPending} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t("users.editUser")}</DialogTitle></DialogHeader>
          {editingUser && (
            <EditUserForm user={editingUser} agencies={agencies || []} userAgencyIds={editingUser.agency_ids || []} onSubmit={handleUpdate} onCancel={() => setEditingUser(null)} isLoading={updateUser.isPending} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("users.deleteUser")}</AlertDialogTitle>
            <AlertDialogDescription dangerouslySetInnerHTML={{ __html: t("users.deleteUserDesc", { name: deletingUser?.full_name }) }} />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteUser.isPending ? t("users.deleting") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Super Admin Billing Panel */}
      <AdminBillingPanel />
    </div>
  );
}
