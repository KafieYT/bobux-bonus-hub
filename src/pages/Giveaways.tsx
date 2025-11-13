import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePoints } from "@/hooks/usePoints";
import { Gift, Clock, Star, Award, Plus, Minus, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocialLinks } from "@/hooks/useSocialLinks";

interface GiveawayEntry {
  id: string;
  user: {
    name: string;
    id: string;
  };
  tickets: number;
}

interface GiveawayWinner {
  id: string;
  user: {
    name: string;
    id: string;
  };
}

interface Giveaway {
  id: string;
  title: string;
  description: string;
  prize: string;
  ticketPrice: number;
  endDate: string;
  createdAt: string;
  isAffiliateOnly: boolean;
  entries: GiveawayEntry[];
  winners: GiveawayWinner[];
}

interface UserStats {
  points: number;
}

const Giveaways = () => {
  const { user } = useAuth();
  const { points, refreshPoints } = usePoints();
  const { links } = useSocialLinks();
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [ticketCounts, setTicketCounts] = useState<Record<string, number>>({});
  const [affiliateModal, setAffiliateModal] = useState<{ giveawayId: string; tickets: number } | null>(null);
  const [claimModal, setClaimModal] = useState(false);
  const [filter, setFilter] = useState<"active" | "expired" | "completed" | "all">("active");

  useEffect(() => {
    loadGiveaways();
    if (user) {
      loadStats();
    }
  }, [user]);

  useEffect(() => {
    if (giveaways.length > 0) {
      const activeCount = giveaways.filter(g => getStatus(g) === "active").length;
      if (activeCount > 0 && filter === "active") {
        setFilter("active");
      } else if (filter === "active" && activeCount === 0) {
        setFilter("all");
      }
    }
  }, [giveaways]);

  const loadGiveaways = async () => {
    try {
      const res = await fetch("/api/giveaways");
      if (res.ok) {
        const data = await res.json();
        setGiveaways(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des giveaways:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch("/api/user/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des stats:", error);
    }
  };

  const handlePurchase = async (giveawayId: string) => {
    const tickets = ticketCounts[giveawayId] || 1;
    if (tickets <= 0) return;

    const giveaway = giveaways.find(g => g.id === giveawayId);
    if (!giveaway) return;

    if (giveaway.isAffiliateOnly) {
      setAffiliateModal({ giveawayId, tickets });
      return;
    }

    await purchaseTickets(giveawayId, tickets);
  };

  const purchaseTickets = async (giveawayId: string, tickets: number) => {
    setPurchasing(giveawayId);
    setNotification(null);

    try {
      const res = await fetch("/api/giveaways/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          giveawayId,
          tickets,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setNotification({
          type: "success",
          text: `🎉 ${tickets} ticket(s) acheté(s) avec succès !`,
        });
        setTicketCounts(prev => ({ ...prev, [giveawayId]: 1 }));
        loadGiveaways();
        loadStats();
        refreshPoints();
      } else {
        setNotification({
          type: "error",
          text: data.error || "Erreur lors de l'achat",
        });
      }
    } catch (error) {
      setNotification({
        type: "error",
        text: "Erreur de connexion",
      });
    } finally {
      setPurchasing(null);
      setAffiliateModal(null);
    }
  };

  const adjustTicketCount = (giveawayId: string, increase: boolean) => {
    const current = ticketCounts[giveawayId] || 1;
    const newCount = increase ? current + 1 : Math.max(1, current - 1);
    setTicketCounts(prev => ({ ...prev, [giveawayId]: newCount }));
  };

  const getTotalTickets = (giveaway: Giveaway) => {
    return giveaway.entries.reduce((sum, entry) => sum + entry.tickets, 0);
  };

  const getUserTickets = (giveaway: Giveaway) => {
    if (!user) return 0;
    return giveaway.entries
      .filter(entry => entry.user.name === user.username)
      .reduce((sum, entry) => sum + entry.tickets, 0);
  };

  const formatTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Terminé";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}j ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatus = (giveaway: Giveaway): "active" | "expired" | "completed" => {
    if (giveaway.winners.length > 0) return "completed";
    if (new Date(giveaway.endDate) <= new Date()) return "expired";
    return "active";
  };

  const isWinner = (giveaway: Giveaway) => {
    if (!user) return false;
    return giveaway.winners.some(winner => winner.user.name === user.username);
  };

  const getActiveCount = () => giveaways.filter(g => getStatus(g) === "active").length;
  const getExpiredCount = () => giveaways.filter(g => getStatus(g) === "expired").length;
  const getCompletedCount = () => giveaways.filter(g => getStatus(g) === "completed").length;

  const filteredGiveaways = giveaways
    .filter(g => filter === "all" || getStatus(g) === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="min-h-screen relative">
          <div className="relative pt-[72px]">
            <div className="max-w-6xl mx-auto px-4 py-12">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="w-full">
        <div className="pt-24 pb-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-secondary/5 border border-secondary/10 mb-6">
              <Gift className="w-5 h-5 text-secondary" />
              <span className="text-secondary font-medium tracking-wider">GIVEAWAYS</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              <span className="text-secondary">GIVEAWAYS</span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Participez à nos giveaways et tentez de gagner des lots incroyables !
            </p>
          </div>
        </div>
      </div>

      <main className="min-h-screen max-w-6xl mx-auto px-4 overflow-x-hidden relative">
        {/* Background gradient */}
        <div className="pointer-events-none select-none fixed inset-0 -z-10 h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-secondary/3 to-transparent -mt-32"></div>
        </div>

        {/* Notification */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              notification.type === "success"
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {notification.type === "success" ? (
              <Star className="w-5 h-5" />
            ) : (
              <Gift className="w-5 h-5" />
            )}
            {notification.text}
          </motion.div>
        )}

        {/* Stats Card */}
        {user && stats && (
          <div className="mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-secondary/20 rounded-lg">
                    <img src="/images/jeton.png" alt="Jeton" className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Vos points</p>
                    <p className="text-2xl font-bold text-white">
                      {points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-sm">Giveaways actifs</p>
                  <p className="text-2xl font-bold text-secondary">{getActiveCount()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => setFilter("active")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "active"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            Actifs ({getActiveCount()})
          </button>
          <button
            onClick={() => setFilter("expired")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "expired"
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            Expirés ({getExpiredCount()})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "completed"
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            Terminés ({getCompletedCount()})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-secondary text-black"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            Tous ({giveaways.length})
          </button>
        </div>

        {/* Giveaways Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGiveaways.length > 0 ? (
            filteredGiveaways.map(giveaway => {
              const status = getStatus(giveaway);
              const totalTickets = getTotalTickets(giveaway);
              const userTickets = getUserTickets(giveaway);
              const timeRemaining = formatTimeRemaining(giveaway.endDate);

              return (
                <motion.div
                  key={giveaway.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            status === "completed"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : status === "expired"
                              ? "bg-orange-500/20 text-orange-300"
                              : "bg-green-500/20 text-green-300"
                          }`}
                        >
                          {status === "completed" ? "Terminé" : status === "expired" ? "En attente" : "En cours"}
                        </span>
                        {giveaway.isAffiliateOnly ? (
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                            Affiliés uniquement
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-300 border border-green-400/20">
                            Ouvert à tous
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-secondary">{giveaway.prize}</div>
                      </div>
                    </div>

                    {/* Title and Description */}
                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-secondary transition-colors">
                      {giveaway.title}
                    </h3>
                    <p className="text-white/60 text-sm mb-6 line-clamp-2">{giveaway.description}</p>

                    {/* Ticket Info */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="text-white/50 text-sm">
                        {giveaway.ticketPrice}{" "}
                        <img src="/images/jeton.png" alt="Jeton" className="inline w-4 h-4 mx-1" /> / ticket
                      </div>
                      <div className="text-white/50 text-sm">{totalTickets} tickets vendus</div>
                    </div>

                    {/* Countdown */}
                    {status === "active" && (
                      <div className="flex items-center justify-center gap-2 mb-4 p-3 bg-white/5 border border-white/10 rounded-lg">
                        <Clock className="w-4 h-4 text-secondary" />
                        <span className="text-white/70 text-sm font-medium">Se termine dans {timeRemaining}</span>
                      </div>
                    )}

                    {/* Purchase Section */}
                    {user && status === "active" ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => adjustTicketCount(giveaway.id, false)}
                            disabled={purchasing === giveaway.id}
                            className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                          >
                            <Minus className="w-4 h-4 text-white" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={ticketCounts[giveaway.id] || 1}
                            onChange={e => {
                              const val = e.target.value;
                              if (val === "" || isNaN(Number(val))) {
                                setTicketCounts(prev => ({ ...prev, [giveaway.id]: "" }));
                              } else {
                                setTicketCounts(prev => ({ ...prev, [giveaway.id]: Math.max(1, parseInt(val)) }));
                              }
                            }}
                            onBlur={e => {
                              const val = e.target.value;
                              if (val === "" || isNaN(Number(val)) || parseInt(val) < 1) {
                                setTicketCounts(prev => ({ ...prev, [giveaway.id]: 1 }));
                              }
                            }}
                            disabled={purchasing === giveaway.id}
                            className="w-16 text-center text-white font-bold bg-white/10 border border-white/20 rounded focus:outline-none focus:ring-2 focus:ring-secondary py-1 px-2 text-lg appearance-none"
                            style={{ MozAppearance: "textfield" }}
                          />
                          <button
                            onClick={() => adjustTicketCount(giveaway.id, true)}
                            disabled={purchasing === giveaway.id}
                            className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        <button
                          onClick={() => handlePurchase(giveaway.id)}
                          disabled={
                            purchasing === giveaway.id ||
                            (points || 0) < (ticketCounts[giveaway.id] || 1) * giveaway.ticketPrice
                          }
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary hover:bg-secondary/90 text-black font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {purchasing === giveaway.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                              Achat...
                            </>
                          ) : (
                            <>
                              <Ticket className="w-4 h-4" />
                              Acheter
                            </>
                          )}
                        </button>
                      </div>
                    ) : status === "completed" ? (
                      <div className="text-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <span className="text-yellow-300 text-sm font-medium mb-2 block">
                          {giveaway.winners.length} gagnant(s)
                        </span>
                        {giveaway.winners.length > 0 && (
                          <div className="space-y-1">
                            {giveaway.winners.map(winner => (
                              <div key={winner.id} className="flex items-center justify-center gap-2">
                                <Award className="w-3 h-3 text-yellow-400" />
                                <span className="text-yellow-200 text-xs font-medium">{winner.user.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {isWinner(giveaway) && (
                          <button
                            onClick={() => setClaimModal(true)}
                            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors"
                          >
                            <Award className="w-4 h-4" />
                            Récupérer mon gain
                          </button>
                        )}
                      </div>
                    ) : user && userTickets > 0 ? (
                      <div className="text-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <span className="text-green-300 text-sm font-medium">
                          Vous avez {userTickets} ticket(s)
                        </span>
                      </div>
                    ) : (
                      <div className="text-center p-3 bg-white/10 border border-white/20 rounded-lg">
                        <span className="text-white/60 text-sm">
                          {status === "expired" ? "Sélection en cours" : "Connectez-vous pour participer"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </motion.div>
              );
            })
          ) : (
            <div className="lg:col-span-2 text-center py-12">
              <Gift className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 text-lg font-medium mb-2">
                {filter === "all"
                  ? "Aucun giveaway"
                  : filter === "active"
                  ? "Aucun giveaway actif"
                  : filter === "expired"
                  ? "Aucun giveaway expiré"
                  : "Aucun giveaway terminé"}
              </p>
              <p className="text-white/20 text-sm">
                {filter === "all"
                  ? "Revenez plus tard pour découvrir nos prochains giveaways !"
                  : filter === "active"
                  ? "Aucun giveaway n'est actuellement en cours."
                  : filter === "expired"
                  ? "Aucun giveaway n'est en attente de sélection des gagnants."
                  : "Aucun giveaway n'a encore été terminé avec des gagnants."}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Affiliate Modal */}
      {affiliateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-light rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Giveaway Affiliés Uniquement</h3>
              <p className="text-white/60 text-sm">
                Attention, ce giveaway est uniquement pour les affiliés.
              </p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-6">
              <p className="text-purple-400 text-sm font-medium mb-2">⚠️ Conditions importantes :</p>
              <ul className="text-purple-400/80 text-sm space-y-1">
                <li>• Seuls les affiliés peuvent être sélectionnés comme gagnants</li>
                <li>• Si vous n'êtes pas affilié, le giveaway sera rerollé automatiquement</li>
                <li>• Aucun remboursement ne sera effectué en cas de reroll</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => purchaseTickets(affiliateModal.giveawayId, affiliateModal.tickets)}
                disabled={purchasing === affiliateModal.giveawayId}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {purchasing === affiliateModal.giveawayId ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Achat en cours...
                  </>
                ) : (
                  <>
                    <Ticket className="w-4 h-4" />
                    Ok, acheter les tickets
                  </>
                )}
              </button>
              <button
                onClick={() => setAffiliateModal(null)}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Claim Modal */}
      {claimModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-light rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Comment récupérer votre gain ?</h3>
              <p className="text-white/60 text-sm">
                Pour récupérer votre gain il suffit de vous créer un ticket sur notre serveur Discord
              </p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
              <p className="text-yellow-400 text-sm font-medium mb-2">📋 Instructions :</p>
              <ul className="text-yellow-400/80 text-sm space-y-1">
                <li>• Rejoignez notre serveur Discord</li>
                <li>• Créez un ticket dans le canal #tickets</li>
                <li>• Mentionnez le giveaway gagné et votre nom d'utilisateur</li>
                <li>• Notre équipe vous contactera rapidement</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <a
                href={links.discord || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Rejoindre Discord
              </a>
              <button
                onClick={() => setClaimModal(false)}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Giveaways;
