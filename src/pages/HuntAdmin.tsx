import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { Trash2, AlertTriangle } from "lucide-react";
import { huntStorage } from "@/lib/huntStorage";
import { Hunt } from "@/types/hunt";

const HuntAdmin = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      setHunts(huntStorage.getAll());
    }
  }, [isAdmin]);

  const handleDeleteAll = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer TOUS les BonusHunt ? Cette action est irréversible.")) {
      return;
    }

    setLoading(true);
    try {
      // Supprimer du localStorage
      localStorage.removeItem('bonus_hunts');
      
      // Supprimer du serveur si possible
      try {
        await fetch("/api/hunts", {
          method: "DELETE",
          credentials: "include",
        });
      } catch (error) {
        console.error("Erreur lors de la suppression côté serveur:", error);
      }

      setHunts([]);
      toast({
        title: "Tous les hunts ont été supprimés",
        description: "Les BonusHunt ont été supprimés avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHunt = (huntId: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le hunt "${huntStorage.getById(huntId)?.title}" ?`)) {
      return;
    }

    huntStorage.delete(huntId);
    setHunts(huntStorage.getAll());
    toast({
      title: "Hunt supprimé",
      description: "Le hunt a été supprimé avec succès.",
    });
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center py-16">
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
                  <h2 className="text-2xl font-bold">Accès refusé</h2>
                  <p className="text-muted-foreground">
                    Vous devez être administrateur pour accéder à cette page.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-20 px-4 min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Gestion des BonusHunt</h1>
                <p className="text-muted-foreground mt-2">
                  Gérez tous les BonusHunt créés par les utilisateurs
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteAll}
                disabled={loading || hunts.length === 0}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {loading ? "Suppression..." : "Supprimer tous les hunts"}
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  Liste des BonusHunt ({hunts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hunts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun hunt trouvé
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hunts.map((hunt) => (
                      <div
                        key={hunt.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{hunt.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Créé par {hunt.creator || "Inconnu"} le{" "}
                            {new Date(hunt.createdAt).toLocaleDateString("fr-FR")}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {hunt.slots.length} slots • {hunt.startAmount.toFixed(2)} {hunt.currency === 'EUR' ? '€' : hunt.currency === 'USD' ? '$' : '£'}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteHunt(hunt.id)}
                          className="ml-4"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HuntAdmin;

