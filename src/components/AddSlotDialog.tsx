import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slot } from '@/types/hunt';

interface AddSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (slot: Slot) => void;
}

export const AddSlotDialog = ({ open, onOpenChange, onAdd }: AddSlotDialogProps) => {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [bet, setBet] = useState('');
  const [gain, setGain] = useState('');
  const [status, setStatus] = useState<'waiting' | 'collected'>('waiting');
  const [player, setPlayer] = useState('');
  const [bounty, setBounty] = useState(false);
  const [slotResults, setSlotResults] = useState<Array<{ id: string; name: string; provider: string; thumbnailUrl?: string }>>([]);
  const [slotSearchLoading, setSlotSearchLoading] = useState(false);
  const [slotSearchError, setSlotSearchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleGainChange = (value: string) => {
    setGain(value);
    // Si le gain > 0, passer automatiquement le statut à "collecté"
    const gainValue = parseFloat(value) || 0;
    if (gainValue > 0) {
      setStatus('collected');
    } else {
      setStatus('waiting');
    }
  };

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSlotResults([]);
      setSlotSearchError(null);
      return;
    }

    let cancelled = false;
    setSlotSearchLoading(true);
    setSlotSearchError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const url = `/api/slots/search?q=${encodeURIComponent(searchTerm)}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setSlotResults(data.slots || []);
        }
      } catch (error) {
        if (!cancelled && error.name !== "AbortError") {
          console.error("Erreur recherche slots:", error);
          setSlotSearchError("Impossible de charger les slots");
        }
      } finally {
        if (!cancelled) setSlotSearchLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchTerm]);

  const handleSelectSlot = (slot: { name: string; provider: string }) => {
    setName(slot.name);
    setSearchTerm(slot.name);
    setProvider(slot.provider);
    setSlotResults([]);
  };

  const handleAdd = () => {
    if (!name || !bet) return;

    const gainValue = parseFloat(gain) || 0;
    const finalStatus = gainValue > 0 ? 'collected' : status;

    const newSlot: Slot = {
      id: crypto.randomUUID(),
      name,
      provider,
      bet: parseFloat(bet),
      gain: gainValue,
      status: finalStatus,
      player: player.trim() || undefined,
      bounty
    };

    onAdd(newSlot);
    
    // Reset form
    setName('');
    setSearchTerm('');
    setProvider('');
    setBet('');
    setGain('');
    setStatus('waiting');
    setPlayer('');
    setBounty(false);
    setSlotResults([]);
    setSlotSearchError(null);
    onOpenChange(false);
  };

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setName('');
      setProvider('');
      setBet('');
      setGain('');
      setStatus('waiting');
      setPlayer('');
      setBounty(false);
      setSlotResults([]);
      setSlotSearchError(null);
      setSlotSearchLoading(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une slot</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="slot-name">Nom du slot</Label>
            <Input
              id="slot-name"
              placeholder="Sugar Rush"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setName(e.target.value);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Tapez au moins 2 lettres pour rechercher · maximum 10 résultats
            </p>
            {slotSearchLoading && (
              <p className="text-xs text-muted-foreground">Recherche en cours...</p>
            )}
            {slotSearchError && (
              <p className="text-xs text-destructive">{slotSearchError}</p>
            )}
            {!slotSearchLoading && !slotSearchError && searchTerm.length >= 2 && slotResults.length === 0 && (
              <p className="text-xs text-muted-foreground">Aucun slot trouvé</p>
            )}
            {!slotSearchLoading && slotResults.length > 0 && (
              <div className="max-h-48 overflow-auto rounded-md border border-border/50 bg-background/80 backdrop-blur-sm">
                {slotResults.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-3"
                    onClick={() => handleSelectSlot(slot)}
                  >
                    {slot.thumbnailUrl && (
                      <img 
                        src={slot.thumbnailUrl} 
                        alt={slot.name}
                        className="w-12 h-12 object-cover rounded border border-border/50 flex-shrink-0"
                        onError={(e) => {
                          // En cas d'erreur de chargement, cacher l'image
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{slot.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{slot.provider}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Input
              id="provider"
              placeholder="Pragmatic Play"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="player">Pseudo</Label>
            <Input
              id="player"
              placeholder="Pseudo joueur"
              value={player}
              onChange={(e) => setPlayer(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bet">Bet</Label>
              <Input
                id="bet"
                type="number"
                step="0.01"
                placeholder="10.00"
                value={bet}
                onChange={(e) => setBet(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gain">Gain</Label>
              <Input
                id="gain"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={gain}
                onChange={(e) => handleGainChange(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger id="status">
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
              <Label htmlFor="bounty" className="text-sm font-medium">
                Bounty
              </Label>
              <p className="text-xs text-muted-foreground">Indiquer si ce bonus est un bounty</p>
            </div>
            <Switch id="bounty" checked={bounty} onCheckedChange={setBounty} />
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleAdd} disabled={!name || !bet}>
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
