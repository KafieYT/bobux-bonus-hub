import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePoints } from "@/hooks/usePoints";
import { useSocialLinks } from "@/hooks/useSocialLinks";
import {
  Coins,
  TrendingUp,
  Trophy,
  Target,
  RefreshCw,
  History,
  ShoppingBag,
  User,
  Gift,
  ExternalLink,
  Copy,
  Check,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import CouponClaim from "@/components/CouponClaim";

interface Bet {
  id: string;
  gameType: string;
  betAmount: number;
  result: number;
  isWin: boolean;
  multiplier?: number;
  timeAgo: string;
  status?: string;
}

interface Order {
  id: string;
  storeitem: {
    name: string;
    category: string;
    image?: string;
  };
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  metadata?: string;
}

interface Stats {
  points: number;
  totalWager: number;
  totalWinnings: number;
  bestWin: number;
  winRate: number;
  totalBets: number;
  winningBetsCount: number;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { points, refreshPoints } = usePoints();
  const { links } = useSocialLinks();
  const [profile, setProfile] = useState({
    gambaUsername: "",
  });
  const [stats, setStats] = useState<Stats>({
    points: 0,
    totalWager: 0,
    totalWinnings: 0,
    bestWin: 0,
    winRate: 0,
    totalBets: 0,
    winningBetsCount: 0,
  });
  const [bets, setBets] = useState<Bet[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [betsPage, setBetsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [betsLimit] = useState(5);
  const [ordersLimit] = useState(5);
  const [totalBets, setTotalBets] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loadingBets, setLoadingBets] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState<"bets" | "orders">("bets");
  const hasLoadedRef = useRef(false);
  const [revealedGiftCards, setRevealedGiftCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const loadData = async () => {
      // Attendre que l'authentification soit terminée
      if (authLoading) {
        return;
      }

      // Si pas d'utilisateur, arrêter le chargement
      if (!user) {
        setLoading(false);
        return;
      }

      // Si on a déjà chargé les données, ne pas recharger
      if (hasLoadedRef.current) {
        setLoading(false);
        return;
      }

      // Charger les données
      setLoading(true);
      try {
        // Load profile
        const profileRes = await fetch("/api/user/profile", {
          credentials: "include",
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
            setProfile({
              gambaUsername: profileData.gambaUsername || "",
            });
        }

        // Load stats
        const statsRes = await fetch("/api/user/stats", {
          credentials: "include",
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Refresh points
        await refreshPoints();

        // Load bets and orders
        await loadBets(1);
        await loadOrders(1);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
        hasLoadedRef.current = true;
      }
    };

    loadData();
  }, [user, authLoading]);


  const loadBets = async (page: number) => {
    setLoadingBets(true);
    try {
      const res = await fetch(`/api/user/recent-bets?limit=${betsLimit}&page=${page}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setBets(data.bets || []);
        setTotalBets(data.totalBets || 0);
        setBetsPage(page);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des paris:", error);
    } finally {
      setLoadingBets(false);
    }
  };

  const loadOrders = async (page: number) => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/user/orders?limit=${ordersLimit}&page=${page}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setTotalOrders(data.totalOrders || 0);
        setOrdersPage(page);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotification(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la sauvegarde");
      }

      // Rafraîchir les points après la sauvegarde
      await refreshPoints();
      
      // Recharger le profil pour mettre à jour le champ désactivé
      const profileRes = await fetch("/api/user/profile", {
        credentials: "include",
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile({
          gambaUsername: profileData.gambaUsername || "",
        });
      }

      setNotification({
        type: "success",
        text: "Profil mis à jour avec succès",
      });
    } catch (error) {
      setNotification({
        type: "error",
        text: error instanceof Error ? error.message : "Erreur lors de la mise à jour du profil",
      });
    } finally {
      setSaving(false);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "processing":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "verification":
        return "text-purple-500 bg-purple-500/10 border-purple-500/20";
      case "completed":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "cancelled":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "En attente",
      processing: "En cours",
      verification: "Vérification",
      completed: "Terminé",
      cancelled: "Annulé",
    };
    return labels[status] || status;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      merch: "Merchandising",
      song_request: "Song Request",
      stake_tips: "Tips Casino",
      bonus_buys: "Bonus Buys",
      irl_stuff: "Objets Physiques",
      gift_card: "Carte cadeau",
    };
    return labels[category] || category;
  };

  const parseMetadata = (metadata?: string) => {
    if (!metadata) return null;
    try {
      return JSON.parse(metadata);
    } catch (error) {
      console.error("Erreur parsing métadonnées:", error);
      return null;
    }
  };

  const getGiftCardInfo = (order: Order) => {
    if (order.storeitem.category !== "gift_card") return null;
    const metadata = parseMetadata(order.metadata);
    return metadata?.giftCardInfo || null;
  };

  const blurText = (text: string) => "*".repeat(text.length);

  // Afficher un loader uniquement pendant l'authentification initiale
  if (authLoading) {
    return (
      <div className="min-h-screen relative bg-background">
        <Header />
        <div className="relative pt-24 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Si pas d'utilisateur, afficher un message
  if (!user) {
    return (
      <div className="min-h-screen relative bg-background">
        <Header />
        <div className="relative pt-24 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold text-foreground mb-4">Profil</h1>
              <p className="text-muted-foreground">Veuillez vous connecter pour accéder à votre profil</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-background">
      <Header />
      <div className="relative pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex flex-col items-center justify-center gap-4 mb-6">
              {user?.avatar ? (
                <img
                  src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                  alt={user?.username || "Avatar"}
                  className="w-20 h-20 rounded-full border-4 border-primary/30"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-4 border-primary/30 bg-muted flex items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}
              <div className="text-center">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {user?.global_name || user?.username || "Utilisateur"}
                </h1>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <span className="text-lg font-medium">
                    {(points || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                    pts
                  </span>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="gradient-card border-2 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-foreground font-medium">Total Wager</h3>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {(stats.totalWager || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-muted-foreground text-sm mt-1">Total des paris</p>
              </CardContent>
            </Card>

            <Card className="gradient-card border-2 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-foreground font-medium">Total Gains</h3>
                </div>
                <div className="text-2xl font-bold text-primary">
                  +{(stats.totalWinnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-muted-foreground text-sm mt-1">Gains totaux</p>
              </CardContent>
            </Card>

            <Card className="gradient-card border-2 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-foreground font-medium">Win Rate</h3>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {(stats.winRate || 0).toFixed(1)}%
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  {stats.winningBetsCount || 0}/{stats.totalBets || 0} paris gagnés
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card border-2 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Coins className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-foreground font-medium">Meilleur Gain</h3>
                </div>
                <div className="text-2xl font-bold text-primary">
                  +{(stats.bestWin || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-muted-foreground text-sm mt-1">Gain le plus élevé</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* History Section */}
            <div className="lg:col-span-2">
              <Card className="gradient-card border-2 border-border/50">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <History className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-xl font-semibold text-foreground">Historique</h2>
                    </div>
                    <Button
                      onClick={() => (activeTab === "bets" ? loadBets(1) : loadOrders(1))}
                      disabled={activeTab === "bets" ? loadingBets : loadingOrders}
                      variant="ghost"
                      size="sm"
                    >
                      <RefreshCw
                        className={`w-5 h-5 text-primary ${activeTab === "bets" ? (loadingBets ? "animate-spin" : "") : (loadingOrders ? "animate-spin" : "")}`}
                      />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex px-6 pb-6 pt-4">
                    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
                      <Button
                        onClick={() => setActiveTab("bets")}
                        variant={activeTab === "bets" ? "default" : "ghost"}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <History className="w-4 h-4" />
                        <span>Paris</span>
                      </Button>
                      <Button
                        onClick={() => setActiveTab("orders")}
                        variant={activeTab === "orders" ? "default" : "ghost"}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Commandes</span>
                      </Button>
                    </div>
                  </div>

                  <div className="p-6">
                    {activeTab === "bets" ? (
                      <div className="space-y-4">
                        {bets.length > 0 ? (
                          <>
                            {bets.map((bet) => (
                              <motion.div
                                key={bet.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/20 hover:from-muted/70 hover:to-muted/30 transition-all duration-300 border border-border/50 hover:border-border rounded-lg"
                              >
                                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                  <div className="p-3 bg-primary/10 group-hover:bg-primary/20 transition-colors rounded-lg flex-shrink-0">
                                    <History className="w-5 h-5 text-primary" />
                                  </div>
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-foreground font-medium truncate">{bet.gameType}</span>
                                      {bet.status && (
                                        <span className={`text-xs px-2 py-0.5 rounded ${
                                          bet.status === "Victoire" 
                                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                            : bet.status === "Défaite"
                                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                            : "bg-muted/50 text-muted-foreground"
                                        }`}>
                                          {bet.status}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-muted-foreground text-sm">{bet.timeAgo}</span>
                                    <span className="text-muted-foreground text-sm sm:hidden">
                                      Pari: {bet.betAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                  <div className="text-muted-foreground hidden sm:block">
                                    Pari: {bet.betAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                  {bet.multiplier && (
                                    <span className="text-muted-foreground text-sm bg-muted/50 px-2 py-1 rounded">
                                      {bet.multiplier.toFixed(2)}x
                                    </span>
                                  )}
                                  <span
                                    className={`font-bold text-lg px-3 py-1 rounded ${
                                      bet.isWin
                                        ? "text-green-400 bg-green-500/10 border border-green-500/20"
                                        : "text-red-400 bg-red-500/10 border border-red-500/20"
                                    }`}
                                  >
                                    {bet.isWin ? "+" : ""}
                                    {bet.result.toLocaleString()}
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                            {totalBets > betsLimit && (
                              <div className="flex items-center justify-center gap-2 pt-4 border-t border-border/50">
                                <Button
                                  onClick={() => loadBets(betsPage - 1)}
                                  disabled={betsPage <= 1 || loadingBets}
                                  variant="outline"
                                  size="sm"
                                >
                                  Précédent
                                </Button>
                                <span className="text-muted-foreground text-sm">
                                  Page {betsPage} sur {Math.ceil(totalBets / betsLimit)}
                                </span>
                                <Button
                                  onClick={() => loadBets(betsPage + 1)}
                                  disabled={betsPage >= Math.ceil(totalBets / betsLimit) || loadingBets}
                                  variant="outline"
                                  size="sm"
                                >
                                  Suivant
                                </Button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <History className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                            <p className="text-muted-foreground text-lg font-medium mb-2">Aucun pari récent</p>
                            <p className="text-muted-foreground/70 text-sm">
                              Commencez à jouer pour voir votre historique
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.length > 0 ? (
                          <>
                            {orders.map((order) => {
                              const giftCardInfo = getGiftCardInfo(order);
                              return (
                                <motion.div
                                  key={order.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/20 hover:from-muted/70 hover:to-muted/30 transition-all duration-300 border border-border/50 hover:border-border rounded-lg"
                                >
                                  <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                    <div className="w-12 h-12 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 rounded-lg">
                                      {order.storeitem.image ? (
                                        <img
                                          src={order.storeitem.image}
                                          alt={order.storeitem.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <Package className="w-6 h-6 text-muted-foreground/50" />
                                      )}
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="text-foreground font-medium truncate">
                                        {order.storeitem.name}
                                      </span>
                                      <span className="text-muted-foreground text-sm">
                                        {getCategoryLabel(order.storeitem.category)}
                                      </span>
                                      <span className="text-muted-foreground text-sm">
                                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                                      </span>
                                      {giftCardInfo && order.status === "completed" && (
                                        <div className="mt-2 p-2 bg-muted/50 rounded border border-border/50">
                                          <div className="flex items-center gap-2 mb-1">
                                            <Gift className="w-3 h-3 text-primary" />
                                            <span className="text-xs text-muted-foreground">Numéro de carte cadeau</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm text-foreground">
                                              {revealedGiftCards[order.id] ? giftCardInfo : blurText(giftCardInfo)}
                                            </span>
                                            <Button
                                              onClick={() =>
                                                setRevealedGiftCards((prev) => ({
                                                  ...prev,
                                                  [order.id]: !prev[order.id],
                                                }))
                                              }
                                              variant="ghost"
                                              size="sm"
                                              className="p-1 h-auto"
                                            >
                                              {revealedGiftCards[order.id] ? (
                                                <Copy className="w-3 h-3 text-muted-foreground" />
                                              ) : (
                                                <Check className="w-3 h-3 text-muted-foreground" />
                                              )}
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-muted-foreground hidden sm:block">
                                      Qté: {order.quantity}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                    <span
                                      className={`px-3 py-1 text-sm font-medium border rounded ${getStatusColor(order.status)}`}
                                    >
                                      {getStatusLabel(order.status)}
                                    </span>
                                    <span className="font-bold text-lg text-primary bg-primary/10 px-3 py-1 border border-primary/20 rounded">
                                      {order.totalPrice.toLocaleString()}
                                    </span>
                                  </div>
                                </motion.div>
                              );
                            })}
                            {totalOrders > ordersLimit && (
                              <div className="flex items-center justify-center gap-2 pt-4 border-t border-border/50">
                                <Button
                                  onClick={() => loadOrders(ordersPage - 1)}
                                  disabled={ordersPage <= 1 || loadingOrders}
                                  variant="outline"
                                  size="sm"
                                >
                                  Précédent
                                </Button>
                                <span className="text-muted-foreground text-sm">
                                  Page {ordersPage} sur {Math.ceil(totalOrders / ordersLimit)}
                                </span>
                                <Button
                                  onClick={() => loadOrders(ordersPage + 1)}
                                  disabled={ordersPage >= Math.ceil(totalOrders / ordersLimit) || loadingOrders}
                                  variant="outline"
                                  size="sm"
                                >
                                  Suivant
                                </Button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <ShoppingBag className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                            <p className="text-muted-foreground text-lg font-medium mb-2">Aucune commande</p>
                            <p className="text-muted-foreground/70 text-sm">
                              Visitez la boutique pour faire votre première commande
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Form */}
              <Card className="gradient-card border-2 border-border/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">Profil</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label htmlFor="gambaUsername" className="block text-sm font-medium text-muted-foreground mb-2">
                        Pseudo Gamba
                      </label>
                      <Input
                        type="text"
                        id="gambaUsername"
                        value={profile.gambaUsername}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            gambaUsername: e.target.value,
                          }))
                        }
                        className="w-full"
                        placeholder="Entrez votre pseudo Gamba"
                        disabled={!!profile.gambaUsername}
                      />
                      {profile.gambaUsername && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Le pseudo Gamba ne peut être modifié qu'une seule fois
                        </p>
                      )}
                    </div>

                    {notification && (
                      <div
                        className={`p-4 flex items-center gap-3 rounded-lg ${
                          notification.type === "success"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {notification.text}
                      </div>
                    )}

                    <Button type="submit" disabled={saving} className="w-full">
                      {saving ? "Sauvegarde..." : "Sauvegarder"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Coupon Section */}
              <Card className="gradient-card border-2 border-border/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Gift className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">Codes Coupons</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                      Entrez un code coupon pour recevoir des points bonus
                    </p>
                    <CouponClaim />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="gradient-card border-2 border-border/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <ExternalLink className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">Liens rapides</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link
                      to="/bonuslist"
                      className="flex items-center gap-3 p-3 bg-muted/50 hover:bg-muted/70 transition-colors rounded-lg group"
                    >
                      <div className="p-2 bg-primary/10 group-hover:bg-primary/20 transition-colors rounded-lg">
                        <Gift className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-muted-foreground group-hover:text-foreground">Découvrir les Bonus</span>
                    </Link>
                    {links.discord && (
                      <a
                        href={links.discord}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-muted/50 hover:bg-muted/70 transition-colors rounded-lg group"
                      >
                        <div className="p-2 bg-primary/10 group-hover:bg-primary/20 transition-colors rounded-lg">
                          <ExternalLink className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-muted-foreground group-hover:text-foreground">Chaine DLive</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;

