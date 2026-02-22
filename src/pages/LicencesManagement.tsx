import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Key, Plus, Copy, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function generateLicenseKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segments = 4;
  const segLen = 4;
  const parts: string[] = [];
  for (let s = 0; s < segments; s++) {
    let seg = "";
    for (let i = 0; i < segLen; i++) {
      seg += chars[Math.floor(Math.random() * chars.length)];
    }
    parts.push(seg);
  }
  return parts.join("-");
}

export default function LicencesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

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

  const createMutation = useMutation({
    mutationFn: async (params: { clientName: string; expiresAt: string | null }) => {
      const key = generateLicenseKey();
      const { error } = await supabase.from("licenses").insert({
        license_key: key,
        client_name: params.clientName || null,
        expires_at: params.expiresAt || null,
      });
      if (error) throw error;
      return key;
    },
    onSuccess: (key) => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      navigator.clipboard.writeText(key);
      toast({ title: "Licence créée", description: `Clé copiée : ${key}` });
      setOpen(false);
      setClientName("");
      setExpiresAt("");
    },
    onError: () => {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de créer la licence" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("licenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      toast({ title: "Licence supprimée" });
    },
  });

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Clé copiée !" });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">Gestion des licences</h1>
          <p className="text-muted-foreground mt-1">Créez et gérez les clés d'activation par domaine</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="premium-gradient hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle licence
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une licence</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({ clientName, expiresAt: expiresAt || null });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Nom du client (optionnel)</Label>
                <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nom de l'entreprise" />
              </div>
              <div className="space-y-2">
                <Label>Date d'expiration (optionnel)</Label>
                <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Création..." : "Générer la clé"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clé</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Domaine</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Activée le</TableHead>
              <TableHead>Expire le</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Chargement...</TableCell>
              </TableRow>
            ) : !licenses?.length ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucune licence</TableCell>
              </TableRow>
            ) : (
              licenses.map((lic) => (
                <TableRow key={lic.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{lic.license_key}</code>
                      <button onClick={() => copyKey(lic.license_key)} className="text-muted-foreground hover:text-foreground">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>{lic.client_name || "—"}</TableCell>
                  <TableCell>
                    {lic.allowed_domain ? (
                      <code className="text-xs bg-muted px-2 py-1 rounded">{lic.allowed_domain}</code>
                    ) : (
                      <span className="text-muted-foreground text-sm">Non liée</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {lic.allowed_domain ? (
                      <Badge variant="default" className="bg-success/20 text-success border-success/30">Activée</Badge>
                    ) : lic.is_active ? (
                      <Badge variant="secondary">Disponible</Badge>
                    ) : (
                      <Badge variant="destructive">Désactivée</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {lic.activated_at ? format(new Date(lic.activated_at), "dd MMM yyyy", { locale: fr }) : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {lic.expires_at ? format(new Date(lic.expires_at), "dd MMM yyyy", { locale: fr }) : "Illimitée"}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => deleteMutation.mutate(lic.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
