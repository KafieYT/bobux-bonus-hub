import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdmin } from "@/hooks/useAdmin";
import { useState, useEffect } from "react";
import { BarChart3, Users, MousePointerClick, Video, Gift, TrendingUp, Trophy, Film } from "lucide-react";

interface StatsData {
  bonuses: Array<{
    id: number;
    title: string;
    platform: string;
    clicks: { count: number; lastClick: string | null };
  }>;
  videos: Array<{
    id: string;
    title: string;
    clicks: { count: number; lastClick: string | null };
  }>;
  totalBonusClicks: number;
  totalVideoClicks: number;
}

const AdminStats = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState(0);
  const [winners, setWinners] = useState(0);
  const [hunts, setHunts] = useState(0);
  const [users, setUsers] = useState(0);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [currentStats, setCurrentStats] = useState<{
    type: "bonus" | "video";
    data: any;
    clicks: { count: number; lastClick: string | null };
  } | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
      loadGeneralStats();
    }
  }, [isAdmin]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stats", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erreur inconnue" }));
        console.error("Erreur lors du chargement des statistiques:", errorData);
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.bonuses && data.videos) {
        setStats({
          bonuses: data.bonuses || [],
          videos: data.videos || [],
          totalBonusClicks: data.totalBonusClicks || 0,
          totalVideoClicks: data.totalVideoClicks || 0,
        });
      } else {
        console.error("Données de statistiques incomplètes:", data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadGeneralStats = async () => {
    try {
      // Charger les participants
      const participantsRes = await fetch("/api/liste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (participantsRes.ok) {
        const participantsData = await participantsRes.json();
        setParticipants(participantsData.participants?.length || 0);
      } else {
        console.error("Erreur lors du chargement des participants:", await participantsRes.json().catch(() => ({})));
      }

      // Charger les gagnants
      const winnersRes = await fetch("/api/winners/ranking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (winnersRes.ok) {
        const winnersData = await winnersRes.json();
        setWinners(winnersData.ranking?.length || 0);
      } else {
        console.error("Erreur lors du chargement des gagnants:", await winnersRes.json().catch(() => ({})));
      }

      // Charger les hunts
      const huntsRes = await fetch("/api/hunts", {
        method: "GET",
        credentials: "include",
      });
      if (huntsRes.ok) {
        const huntsData = await huntsRes.json();
        setHunts(huntsData.hunts?.length || 0);
      } else {
        console.error("Erreur lors du chargement des hunts:", await huntsRes.json().catch(() => ({})));
      }

      // Charger les utilisateurs Discord depuis le leaderboard
      const usersRes = await fetch("/api/points/leaderboard?limit=1000", {
        method: "GET",
        credentials: "include",
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.leaderboard?.length || 0);
      } else {
        console.error("Erreur lors du chargement des utilisateurs:", await usersRes.json().catch(() => ({})));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques générales:", error);
    }
  };

  if (adminLoading || loading) {
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
                  <BarChart3 className="w-12 h-12 text-destructive mx-auto" />
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

  const topBonuses = stats?.bonuses
    ?.sort((a, b) => (b.clicks?.count || 0) - (a.clicks?.count || 0))
    ?.slice(0, 5) || [];

  const topVideos = stats?.videos
    ?.sort((a, b) => (b.clicks?.count || 0) - (a.clicks?.count || 0))
    ?.slice(0, 5) || [];

  const openStatsDialog = (type: "bonus" | "video", item: any) => {
    setCurrentStats({
      type,
      data: item,
      clicks: item.clicks || { count: 0, lastClick: null },
    });
    setStatsDialogOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-20 px-4 min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                Statistiques
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Vue d'ensemble des statistiques du site
            </p>
          </div>

          {/* General Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="gradient-card border-2 border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Utilisateurs Discord</p>
                    <p className="text-3xl font-bold">{users}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card border-2 border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Participants Tirage</p>
                    <p className="text-3xl font-bold">{participants}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card border-2 border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Bonus Hunts</p>
                    <p className="text-3xl font-bold">{hunts}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card border-2 border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Gagnants</p>
                    <p className="text-3xl font-bold">{winners}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Clicks Stats */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="gradient-card border-2 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointerClick className="h-5 w-5 text-primary" />
                  Clics Totaux
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                    <div className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-primary" />
                      <span className="font-medium">Bonus</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      {stats?.totalBonusClicks || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                    <div className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-primary" />
                      <span className="font-medium">Vidéos</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      {stats?.totalVideoClicks || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {(stats?.totalBonusClicks || 0) + (stats?.totalVideoClicks || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card border-2 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Contenu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                    <span className="font-medium">Nombre de Bonus</span>
                    <span className="text-2xl font-bold text-primary">
                      {stats?.bonuses?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                    <span className="font-medium">Nombre de Vidéos</span>
                    <span className="text-2xl font-bold text-primary">
                      {stats?.videos?.length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Content */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="gradient-card border-2 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  Top 5 Bonus
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topBonuses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune statistique disponible
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topBonuses.map((bonus, index) => (
                      <div
                        key={bonus.id}
                        onClick={() => openStatsDialog("bonus", bonus)}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 cursor-pointer hover:bg-background/70 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold">{bonus.title}</p>
                            <p className="text-sm text-muted-foreground">{bonus.platform}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{bonus.clicks?.count || 0}</p>
                          <p className="text-xs text-muted-foreground">clics</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="gradient-card border-2 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  Top 5 Vidéos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topVideos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune statistique disponible
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topVideos.map((video, index) => (
                      <div
                        key={video.id}
                        onClick={() => openStatsDialog("video", video)}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 cursor-pointer hover:bg-background/70 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold">{video.title}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{video.clicks?.count || 0}</p>
                          <p className="text-xs text-muted-foreground">clics</p>
                        </div>
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

      {/* Dialog pour statistiques détaillées */}
      <Dialog open={statsDialogOpen} onOpenChange={setStatsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Statistiques de {currentStats?.type === "bonus" ? "Bonus" : "Vidéo"}
            </DialogTitle>
          </DialogHeader>
          {currentStats && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <div className="mb-3">
                  <h4 className="font-bold text-lg">
                    {currentStats.type === "bonus" 
                      ? currentStats.data.platform 
                      : currentStats.data.title}
                  </h4>
                  {currentStats.type === "bonus" && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentStats.data.title}
                    </p>
                  )}
                  {currentStats.type === "video" && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentStats.data.category}
                    </p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2">
                      {currentStats.type === "bonus" ? (
                        <Film className="h-5 w-5 text-primary" />
                      ) : (
                        <Video className="h-5 w-5 text-primary" />
                      )}
                      <span className="font-medium">Clics totaux</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      {currentStats.clicks.count || 0}
                    </span>
                  </div>
                  
                  {currentStats.clicks.lastClick && (
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <p className="text-sm text-muted-foreground mb-1">Dernier clic</p>
                      <p className="text-sm font-medium">
                        {new Date(currentStats.clicks.lastClick).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}
                  
                  {!currentStats.clicks.lastClick && (
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <p className="text-sm text-muted-foreground">
                        Aucun clic enregistré pour le moment
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setStatsDialogOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStats;

