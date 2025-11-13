import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Hunt } from '@/types/hunt';
import { calculateHuntStats } from '@/lib/huntCalculations';
import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { huntStorage } from '@/lib/huntStorage';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface HuntCardProps {
  hunt: Hunt;
  onDelete?: () => void;
}

export const HuntCard = ({ hunt, onDelete }: HuntCardProps) => {
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAdmin) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer le hunt "${hunt.title}" créé par ${hunt.creator || 'un utilisateur'} ? (Action admin)`)) {
      setIsDeleting(true);
      huntStorage.delete(hunt.id);
      toast({ title: 'Hunt supprimé', description: 'Le hunt a été supprimé avec succès.' });
      if (onDelete) onDelete();
      setIsDeleting(false);
    }
  };
  const stats = calculateHuntStats(hunt);
  const currencySymbol = hunt.currency === 'EUR' ? '€' : hunt.currency === 'USD' ? '$' : '£';

  return (
    <div className="relative group">
      <Link to={`/bonus-hunt/${hunt.id}`}>
        <Card className="gradient-card border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {hunt.title}
              <span className="text-sm font-normal text-muted-foreground">
                {hunt.slots.length} slots
              </span>
            </CardTitle>
            <CardDescription>
              {new Date(hunt.createdAt).toLocaleDateString('fr-FR')}
              {hunt.creator && (
                <span className="block text-xs text-muted-foreground/80 mt-1">
                  Créé par {hunt.creator}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Montant de départ</span>
                <span className="font-medium">{hunt.startAmount.toFixed(2)} {currencySymbol}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total gagné</span>
                <span className="font-medium">{stats.totalGain.toFixed(2)} {currencySymbol}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Profit/Perte</span>
                <span className={`font-bold flex items-center gap-1 ${stats.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {stats.profit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stats.profit >= 0 ? '+' : ''}{stats.profit.toFixed(2)} {currencySymbol}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
      {isAdmin && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={handleDelete}
          disabled={isDeleting}
          title="Supprimer ce hunt (Admin)"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
