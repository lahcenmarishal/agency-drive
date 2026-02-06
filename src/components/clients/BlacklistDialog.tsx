import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToggleBlacklist, Client } from "@/hooks/useClients";
import { Ban, UserCheck, Loader2 } from "lucide-react";

interface BlacklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
}

export function BlacklistDialog({ open, onOpenChange, client }: BlacklistDialogProps) {
  const [reason, setReason] = useState(client.blacklist_reason || "");
  const toggleBlacklist = useToggleBlacklist();

  const isBlacklisted = client.is_blacklisted;

  const handleSubmit = async () => {
    await toggleBlacklist.mutateAsync({
      id: client.id,
      isBlacklisted: !isBlacklisted,
      reason: !isBlacklisted ? reason : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            {isBlacklisted ? (
              <>
                <UserCheck className="h-5 w-5 text-green-400" />
                Retirer de la blacklist
              </>
            ) : (
              <>
                <Ban className="h-5 w-5 text-red-400" />
                Blacklister le client
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isBlacklisted
              ? `Voulez-vous retirer ${client.full_name} de la blacklist ?`
              : `Vous êtes sur le point de blacklister ${client.full_name}. Cette action empêchera toute nouvelle location.`}
          </DialogDescription>
        </DialogHeader>

        {!isBlacklisted && (
          <div className="space-y-2">
            <Label htmlFor="reason">Raison du blacklistage</Label>
            <Textarea
              id="reason"
              placeholder="Expliquez la raison..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={toggleBlacklist.isPending}
            variant={isBlacklisted ? "default" : "destructive"}
          >
            {toggleBlacklist.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isBlacklisted ? "Retirer de la blacklist" : "Blacklister"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
