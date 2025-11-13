import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slot } from '@/types/hunt';

interface EditSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: Slot | null;
  onUpdate: (slot: Slot) => void;
}

export const EditSlotDialog = ({ open, onOpenChange, slot, onUpdate }: EditSlotDialogProps) => {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [bet, setBet] = useState('');
  const [gain, setGain] = useState('');
  const [status, setStatus] = useState<'waiting' | 'collected'>('waiting');
  const [player, setPlayer] = useState('');
  const [bounty, setBounty] = useState(false);

  useEffect(() => {
    if (slot) {
      setName(slot.name);
      setProvider(slot.provider);
      setBet(slot.bet.toString());
      setGain(slot.gain.toString());
      setStatus(slot.status);
      setPlayer(slot.player || '');
      setBounty(Boolean(slot.bounty));
    }
  }, [slot]);

  const handleGainChange = (value: string) => {
    setGain(value);
    // Si le gain > 0, passer automatiquement le statut à "collecté"
    const gainValue = parseFloat(value) || 0;
    if (gainValue > 0) {
      setStatus('collected');
    } else {
      // Si on remet le gain à 0, remettre en attente
      setStatus('waiting');
    }
  };

  const handleUpdate = () => {
    if (!slot || !name || !bet) return;

    const gainValue = parseFloat(gain) || 0;
    const finalStatus = gainValue > 0 ? 'collected' : status;

    const updatedSlot: Slot = {
      ...slot,
      name,
      provider,
      bet: parseFloat(bet),
      gain: gainValue,
      status: finalStatus,
      player: player.trim() || undefined,
      bounty
    };

    onUpdate(updatedSlot);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier la slot</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-slot-name">Nom du slot</Label>
            <Input
              id="edit-slot-name"
              placeholder="Sugar Rush"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-provider">Provider</Label>
            <Input
              id="edit-provider"
              placeholder="Pragmatic Play"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-player">Pseudo</Label>
            <Input
              id="edit-player"
              placeholder="Pseudo joueur"
              value={player}
              onChange={(e) => setPlayer(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-bet">Bet</Label>
              <Input
                id="edit-bet"
                type="number"
                step="0.01"
                placeholder="10.00"
                value={bet}
                onChange={(e) => setBet(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-gain">Gain</Label>
              <Input
                id="edit-gain"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={gain}
                onChange={(e) => handleGainChange(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-status">Statut</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger id="edit-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="waiting">En attente</SelectItem>
                <SelectItem value="collected">Collecté</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2">
            <div>
              <Label htmlFor="edit-bounty" className="text-sm font-medium">
                Bounty
              </Label>
              <p className="text-xs text-muted-foreground">Indiquer si ce bonus est un bounty</p>
            </div>
            <Switch id="edit-bounty" checked={bounty} onCheckedChange={setBounty} />
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleUpdate} disabled={!name || !bet}>
            Modifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
