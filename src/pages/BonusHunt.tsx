import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { CreateHuntDialog } from '@/components/CreateHuntDialog';
import { HuntCard } from '@/components/HuntCard';
import { huntStorage } from '@/lib/huntStorage';
import { Hunt } from '@/types/hunt';
import { Plus, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const MysteryGameDialog = lazy(() => import('@/components/MysteryGameDialog'));

const BonusHunt = () => {
  const { t } = useLanguage();
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mysteryGameOpen, setMysteryGameOpen] = useState(false);

  useEffect(() => {
    setHunts(huntStorage.getAll());
  }, []);

  const refreshHunts = () => {
    setHunts(huntStorage.getAll());
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-20 px-4 min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground">Bonus Hunt</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Créez et suivez vos sessions de bonus hunt pour maximiser vos gains.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Button size="lg" onClick={() => setDialogOpen(true)} className="gap-2">
                  <Plus className="w-5 h-5" />
                  Nouveau Hunt
                </Button>
                <Button 
                  size="lg" 
                  onClick={() => setMysteryGameOpen(true)} 
                  className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Sparkles className="w-5 h-5" />
                  Mystery Game
                </Button>
              </div>
            </div>

            {hunts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hunts.map((hunt) => (
                  <HuntCard key={hunt.id} hunt={hunt} onDelete={refreshHunts} />
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
      </main>
      <Footer />

      <CreateHuntDialog 
        open={dialogOpen} 
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) refreshHunts();
        }} 
      />

      <Suspense fallback={null}>
        <MysteryGameDialog 
          open={mysteryGameOpen} 
          onOpenChange={setMysteryGameOpen} 
        />
      </Suspense>
    </div>
  );
};

export default BonusHunt;

