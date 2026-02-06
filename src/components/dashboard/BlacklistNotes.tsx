import { Ban, StickyNote, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClients } from "@/hooks/useClients";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAgencyFilter } from "@/hooks/useAgencyFilter";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export function BlacklistNotes() {
  const { data: clients, isLoading: clientsLoading } = useClients(true);
  const { filterByAgency, agencyId } = useAgencyFilter();
  const queryClient = useQueryClient();
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  // Récupérer les notes
  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ["blacklist-notes", filterByAgency],
    queryFn: async () => {
      let query = supabase
        .from("blacklist_notes")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (filterByAgency) {
        query = query.eq("agency_id", filterByAgency);
      }
      
      const { data, error } = await query.limit(5);
      if (error) throw error;
      return data;
    },
  });

  // Créer une note
  const createNote = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      if (!agencyId) throw new Error("Agency ID required");
      
      const { error } = await supabase
        .from("blacklist_notes")
        .insert({ title, content, agency_id: agencyId });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blacklist-notes"] });
      setNoteDialogOpen(false);
      setNoteTitle("");
      setNoteContent("");
      toast.success("Note ajoutée");
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout");
    },
  });

  // Toggle completed
  const toggleCompleted = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const { error } = await supabase
        .from("blacklist_notes")
        .update({ is_completed: isCompleted })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blacklist-notes"] });
    },
  });

  const handleSubmitNote = () => {
    if (noteTitle.trim()) {
      createNote.mutate({ title: noteTitle, content: noteContent });
    }
  };

  const blacklistedClients = clients || [];
  const isLoading = clientsLoading || notesLoading;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Blacklist */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-400" />
            <h3 className="section-title">Blacklist</h3>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
            {blacklistedClients.length}
          </span>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : blacklistedClients.length > 0 ? (
          <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin">
            {blacklistedClients.slice(0, 5).map((client) => (
              <div
                key={client.id}
                className="p-3 rounded-lg bg-red-500/5 border border-red-500/10"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{client.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(client.updated_at), "dd/MM/yyyy", { locale: fr })}
                  </p>
                </div>
                <p className="text-xs text-red-400">{client.blacklist_reason || "Raison non spécifiée"}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Ban className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">Aucun client blacklisté</p>
          </div>
        )}
      </div>

      {/* Notes internes */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            <h3 className="section-title">Notes internes</h3>
          </div>
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setNoteDialogOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {notesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : notes && notes.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
            {notes.map((note) => (
              <div
                key={note.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
              >
                <Checkbox
                  checked={note.is_completed || false}
                  onCheckedChange={(checked) => 
                    toggleCompleted.mutate({ id: note.id, isCompleted: !!checked })
                  }
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${note.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                    {note.title}
                  </p>
                  {note.content && (
                    <p className="text-xs text-muted-foreground mt-1">{note.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <StickyNote className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">Aucune note</p>
          </div>
        )}
      </div>

      {/* Dialog pour ajouter une note */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Nouvelle note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">Titre</Label>
              <Input
                id="note-title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Titre de la note"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-content">Contenu (optionnel)</Label>
              <Textarea
                id="note-content"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Détails supplémentaires..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmitNote} disabled={!noteTitle.trim() || createNote.isPending}>
              {createNote.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
