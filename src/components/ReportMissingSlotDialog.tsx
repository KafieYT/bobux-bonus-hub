import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Hunt } from '@/types/hunt';
import { useToast } from '@/hooks/use-toast';

interface ReportMissingSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hunt: Hunt;
}

export const ReportMissingSlotDialog = ({ open, onOpenChange, hunt }: ReportMissingSlotDialogProps) => {
  const { toast } = useToast();
  const [slotName, setSlotName] = useState('');
  const [provider, setProvider] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const webhookUrl =
    import.meta.env.VITE_DISCORD_WEBHOOK_URL ??
    'https://discord.com/api/webhooks/1409745299773067315/uiCb_p-qOAWKyn-n157OGyx8jMMC94JoprK35PdBdIwTtw3Pd-RBW4r0XVryUfhQz3FT';

  const resetForm = () => {
    setSlotName('');
    setProvider('');
    setNotes('');
    setLoading(false);
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!slotName.trim() || !provider.trim()) {
      toast({
        title: 'Champs manquants',
        description: 'Merci de renseigner le nom de la slot et le provider.',
        variant: 'destructive'
      });
      return;
    }

    if (!webhookUrl) {
      toast({
        title: 'Webhook manquant',
        description: 'Contactez un administrateur pour configurer le webhook Discord.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const embed = {
        title: 'Slot manquante signalée',
        description: `Hunt: **${hunt.title}** (ID: ${hunt.id})`,
        color: 0x4f46e5,
        fields: [
          {
            name: 'Nom du slot',
            value: slotName.trim().slice(0, 256),
            inline: true
          },
          {
            name: 'Provider',
            value: provider.trim().slice(0, 256),
            inline: true
          },
          {
            name: 'Slots actuelles',
            value: `${hunt.slots.length}`,
            inline: true
          }
        ] as Array<{ name: string; value: string; inline?: boolean }>
      };

      if (notes.trim()) {
        embed.fields.push({
          name: 'Notes',
          value: notes.trim().slice(0, 1024)
        });
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Bonus Hunt',
          embeds: [embed]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      toast({
        title: 'Signalement envoyé',
        description: 'Le message a été envoyé sur Discord.'
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Erreur envoi webhook Discord:', error);
      toast({
        title: 'Erreur lors de l’envoi',
        description: 'Impossible d’envoyer la demande au webhook Discord.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Signaler une slot manquante</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="missing-slot-name">Nom du slot</Label>
            <Input
              id="missing-slot-name"
              placeholder="Nom de la slot manquante"
              value={slotName}
              onChange={(e) => setSlotName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="missing-slot-provider">Provider</Label>
            <Input
              id="missing-slot-provider"
              placeholder="Nom du provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="missing-slot-notes">Infos supplémentaires (optionnel)</Label>
            <Textarea
              id="missing-slot-notes"
              placeholder="Précise où tu as vu cette slot , lien de la machine ou autre."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Envoi...' : 'Envoyer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

