import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
import { KeyRound, Plus, Trash2, Copy, Globe, Calendar, User } from "lucide-react";

function generateKey() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const parts = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  );
  return parts.join("-");
}

export default function LicencesManagement() {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [clientName, setClientName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;

  const { data: licenses, isLoading } = useQuery({
    queryKey: ["licenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("licenses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createLicense = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("licenses").insert({
        license_key: generateKey(),
        client_name: clientName || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      setClientName("");
      toast({ title: "Licence générée avec succès" });
    },
  });

  const deleteLicense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("licenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      setDeleteId(null);
      toast({ title: "Licence supprimée" });
    },
  });

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Clé copiée !" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Licences</h1>
          <p className="text-muted-foreground">Générer et gérer les clés d'activation</p>
        </div>
      </div>

      {/* Generate */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Générer une nouvelle licence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Label>Nom du client (optionnel)</Label>
              <Input
                placeholder="Ex: Agence XYZ"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <Button
              onClick={() => createLicense.mutate()}
              disabled={createLicense.isPending}
              className="premium-gradient"
            >
              <KeyRound className="h-4 w-4 mr-2" />
              Générer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Chargement...</p>
        ) : !licenses?.length ? (
          <p className="text-muted-foreground text-center py-8">Aucune licence générée</p>
        ) : (
          licenses.map((lic) => (
            <Card key={lic.id} className="relative group">
              <CardContent className="pt-5 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono font-bold tracking-wider text-foreground">
                        {lic.license_key}
                      </code>
                      <button
                        onClick={() => copyKey(lic.license_key)}
                        className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <Badge variant={lic.is_active ? "default" : "destructive"}>
                        {lic.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {lic.client_name && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {lic.client_name}
                        </span>
                      )}
                      {lic.allowed_domain && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" /> {lic.allowed_domain}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(lic.created_at).toLocaleDateString("fr-FR")}
                      </span>
                      {lic.activated_at && (
                        <span className="text-green-500">
                          Activée le {new Date(lic.activated_at).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => setDeleteId(lic.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette licence ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le domaine associé perdra l'accès.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteLicense.mutate(deleteId)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
