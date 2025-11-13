import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Gift, Plus, Trash2, Edit, Award, Users, Calendar, Coins, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const AdminGiveaways = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGiveaway, setEditingGiveaway] = useState<Giveaway | null>(null);
  const [showWinnersModal, setShowWinnersModal] = useState<Giveaway | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prize: "",
    ticketPrice: 1,
    endDate: "",
    isAffiliateOnly: false,
  });

  useEffect(() => {
    if (isAdmin) {
      loadGiveaways();
    }
  }, [isAdmin]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    try {
      const url = editingGiveaway ? `/api/giveaways/${editingGiveaway.id}` : "/api/giveaways";
      const method = editingGiveaway ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setNotification({
          type: "success",
          text: editingGiveaway ? "Giveaway modifié avec succès !" : "Giveaway créé avec succès !",
        });
        resetForm();
        loadGiveaways();
      } else {
        setNotification({
          type: "error",
          text: data.error || "Erreur lors de la sauvegarde",
        });
      }
    } catch (error) {
      setNotification({
        type: "error",
        text: "Erreur de connexion",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce giveaway ?")) return;

    try {
      const res = await fetch(`/api/giveaways/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setNotification({
          type: "success",
          text: "Giveaway supprimé avec succès !",
        });
        loadGiveaways();
      } else {
        const data = await res.json();
        setNotification({
          type: "error",
          text: data.error || "Erreur lors de la suppression",
        });
      }
    } catch (error) {
      setNotification({
        type: "error",
        text: "Erreur de connexion",
      });
    }
  };

  const handleEdit = (giveaway: Giveaway) => {
    setEditingGiveaway(giveaway);
    setFormData({
      title: giveaway.title,
      description: giveaway.description,
      prize: giveaway.prize,
      ticketPrice: giveaway.ticketPrice,
      endDate: new Date(giveaway.endDate).toISOString().slice(0, 16),
      isAffiliateOnly: giveaway.isAffiliateOnly,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      prize: "",
      ticketPrice: 1,
      endDate: "",
      isAffiliateOnly: false,
    });
    setEditingGiveaway(null);
    setShowForm(false);
  };

  const handleSelectWinners = async (giveaway: Giveaway, count: number = 1) => {
    try {
      const res = await fetch(`/api/giveaways/${giveaway.id}/winners`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ count }),
      });

      const data = await res.json();

      if (res.ok) {
        setNotification({
          type: "success",
          text: `${count} gagnant(s) sélectionné(s) avec succès !`,
        });
        setShowWinnersModal(null);
        loadGiveaways();
      } else {
        setNotification({
          type: "error",
          text: data.error || "Erreur lors de la sélection des gagnants",
        });
      }
    } catch (error) {
      setNotification({
        type: "error",
        text: "Erreur de connexion",
      });
    }
  };

  const handleReroll = async (giveaway: Giveaway) => {
    if (!confirm("Êtes-vous sûr de vouloir reroll ce giveaway ? Les gagnants actuels seront supprimés.")) return;

    try {
      const res = await fetch(`/api/giveaways/${giveaway.id}/reroll`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setNotification({
          type: "success",
          text: "Giveaway rerollé avec succès ! Les gagnants ont été réinitialisés.",
        });
        loadGiveaways();
      } else {
        setNotification({
          type: "error",
          text: data.error || "Erreur lors du reroll",
        });
      }
    } catch (error) {
      setNotification({
        type: "error",
        text: "Erreur de connexion",
      });
    }
  };

  const getStatus = (giveaway: Giveaway): "active" | "expired" | "completed" => {
    if (giveaway.winners.length > 0) return "completed";
    if (new Date(giveaway.endDate) <= new Date()) return "expired";
    return "active";
  };

  const getTotalTickets = (giveaway: Giveaway) => {
    return giveaway.entries.reduce((sum, entry) => sum + entry.tickets, 0);
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
                  <Gift className="w-12 h-12 text-destructive mx-auto" />
                  <h2 className="text-2xl font-bold">Accès refusé</h2>
                  <p className="text-muted-foreground">Vous devez être administrateur pour accéder à cette page.</p>
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
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Gestion des Giveaways</h1>
              <p className="text-muted-foreground">Créez et gérez les giveaways</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouveau Giveaway
            </Button>
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
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              {notification.text}
            </motion.div>
          )}

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>{editingGiveaway ? "Modifier le Giveaway" : "Nouveau Giveaway"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Titre</label>
                      <Input
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder="Ex: Giveaway 1000€"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        required
                        placeholder="Description du giveaway"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Prix</label>
                      <Input
                        value={formData.prize}
                        onChange={e => setFormData({ ...formData, prize: e.target.value })}
                        required
                        placeholder="Ex: 1000€"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Prix du ticket (points)</label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.ticketPrice}
                        onChange={e => setFormData({ ...formData, ticketPrice: parseInt(e.target.value) || 1 })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Date de fin</label>
                      <Input
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isAffiliateOnly"
                        checked={formData.isAffiliateOnly}
                        onChange={e => setFormData({ ...formData, isAffiliateOnly: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label htmlFor="isAffiliateOnly" className="text-sm font-medium">
                        Affiliés uniquement
                      </label>
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit" className="flex-1">
                        {editingGiveaway ? "Modifier" : "Créer"}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Annuler
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Winners Modal */}
          {showWinnersModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="max-w-md w-full">
                <CardHeader>
                  <CardTitle>Sélectionner les gagnants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Total de tickets vendus: {getTotalTickets(showWinnersModal)}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Nombre de participants: {showWinnersModal.entries.length}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre de gagnants</label>
                    <Input
                      type="number"
                      min="1"
                      max={showWinnersModal.entries.length}
                      defaultValue="1"
                      id="winnerCount"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        const count = parseInt((document.getElementById("winnerCount") as HTMLInputElement)?.value || "1");
                        handleSelectWinners(showWinnersModal, count);
                      }}
                      className="flex-1"
                    >
                      Sélectionner
                    </Button>
                    <Button variant="outline" onClick={() => setShowWinnersModal(null)}>
                      Annuler
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Giveaways List */}
          <div className="grid gap-6">
            {giveaways.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun giveaway créé</p>
                </CardContent>
              </Card>
            ) : (
              giveaways.map(giveaway => {
                const status = getStatus(giveaway);
                const totalTickets = getTotalTickets(giveaway);

                return (
                  <motion.div
                    key={giveaway.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="gradient-card border-2 border-border/50">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle>{giveaway.title}</CardTitle>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  status === "completed"
                                    ? "bg-yellow-500/20 text-yellow-300"
                                    : status === "expired"
                                    ? "bg-orange-500/20 text-orange-300"
                                    : "bg-green-500/20 text-green-300"
                                }`}
                              >
                                {status === "completed" ? "Terminé" : status === "expired" ? "Expiré" : "Actif"}
                              </span>
                              {giveaway.isAffiliateOnly && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-300">
                                  Affiliés
                                </span>
                              )}
                            </div>
                            <p className="text-muted-foreground text-sm mb-2">{giveaway.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Coins className="w-4 h-4" />
                                <span>Prix: {giveaway.prize}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Coins className="w-4 h-4" />
                                <span>Ticket: {giveaway.ticketPrice} pts</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{totalTickets} tickets vendus</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Fin: {new Date(giveaway.endDate).toLocaleDateString("fr-FR")}</span>
                              </div>
                              {giveaway.winners.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Award className="w-4 h-4 text-yellow-400" />
                                  <span>{giveaway.winners.length} gagnant(s)</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {status === "expired" && giveaway.winners.length === 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowWinnersModal(giveaway)}
                                className="flex items-center gap-1"
                              >
                                <Award className="w-4 h-4" />
                                Sélectionner gagnants
                              </Button>
                            )}
                            {giveaway.winners.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReroll(giveaway)}
                                className="flex items-center gap-1 text-orange-500 hover:text-orange-600"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Reroll
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => handleEdit(giveaway)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(giveaway.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {giveaway.winners.length > 0 && (
                        <CardContent>
                          <div className="pt-4 border-t border-border/50">
                            <p className="text-sm font-medium mb-2">Gagnants:</p>
                            <div className="flex flex-wrap gap-2">
                              {giveaway.winners.map(winner => (
                                <span
                                  key={winner.id}
                                  className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm"
                                >
                                  {winner.user.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminGiveaways;

