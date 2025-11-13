import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CreateHuntDialog } from '@/components/CreateHuntDialog';
import { HuntCard } from '@/components/HuntCard';
import { huntStorage } from '@/lib/huntStorage';
import { Hunt } from '@/types/hunt';
import { Plus } from 'lucide-react';

const HuntHome = () => {
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setHunts(huntStorage.getAll());
  }, []);

  const refreshHunts = () => {
    setHunts(huntStorage.getAll());
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold text-foreground">Bonus Hunt</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Créez et suivez vos sessions de bonus hunt pour maximiser vos gains.
            </p>
            <Button size="lg" onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="w-5 h-5" />
              Nouveau Hunt
            </Button>
          </div>

          {hunts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hunts.map((hunt) => (
                <HuntCard key={hunt.id} hunt={hunt} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                Aucun hunt créé pour le moment.
              </p>
              <p className="text-muted-foreground">
                Cliquez sur "Nouveau Hunt" pour commencer.
              </p>
            </div>
          )}
        </div>
      </div>

      <CreateHuntDialog 
        open={dialogOpen} 
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) refreshHunts();
        }} 
      />
    </div>
  );
};

export default HuntHome;
