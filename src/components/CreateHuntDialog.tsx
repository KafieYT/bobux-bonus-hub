import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Hunt } from '@/types/hunt';
import { huntStorage } from '@/lib/huntStorage';

interface CreateHuntDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DiscordUser {
  id: string;
  username: string;
  global_name?: string;
}

export const CreateHuntDialog = ({ open, onOpenChange }: CreateHuntDialogProps) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [startAmount, setStartAmount] = useState('');
  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'GBP'>('EUR');
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      checkAuth();
    }
  }, [open]);

  const handleCreate = () => {
    if (!title || !startAmount) {
      setError("Merci de remplir tous les champs");
      return;
    }

    if (!user) {
      setError("Vous devez être connecté avec Discord pour créer un hunt");
      return;
    }

    const newHunt: Hunt = {
      id: crypto.randomUUID(),
      title,
      startAmount: parseFloat(startAmount),
      currency,
      slots: [],
      createdAt: new Date().toISOString(),
      creator: user.global_name || user.username,
      creatorId: user.id,
    };

    huntStorage.save(newHunt);
    setTitle('');
    setStartAmount('');
    setError(null);
    onOpenChange(false);
    navigate(`/bonus-hunt/${newHunt.id}`);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un nouveau Hunt</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center text-muted-foreground">
            Chargement...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un nouveau Hunt</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center space-y-4">
            <p className="text-muted-foreground">
              Vous devez être connecté avec Discord pour créer un hunt.
            </p>
            <Button onClick={() => window.location.href = "/api/auth/discord"}>
              Se connecter avec Discord
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un nouveau Hunt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre du Hunt</Label>
            <Input
              id="title"
              placeholder="Mon Hunt du 15/01"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Montant de départ</Label>
            <Input
              id="amount"
              type="number"
              placeholder="1000"
              value={startAmount}
              onChange={(e) => setStartAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Devise</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as any)}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
            <p className="text-xs text-muted-foreground mb-1">Créateur</p>
            <p className="text-sm font-medium">{user.global_name || user.username}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Le hunt sera automatiquement associé à votre compte Discord
            </p>
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleCreate} disabled={!title || !startAmount}>
            Créer le hunt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
