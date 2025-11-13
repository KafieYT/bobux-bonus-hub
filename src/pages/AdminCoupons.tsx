import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdmin } from "@/hooks/useAdmin";
import { useState, useEffect } from "react";
import { Gift, Plus, Trash2, Edit, X, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Coupon {
  id: string;
  code: string;
  points: number;
  maxUses: number | null;
  currentUses: number;
  expiresAt: string | null;
  description: string;
  createdAt: string;
  createdBy: string;
  lastUsedAt?: string;
}

const AdminCoupons = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    points: "",
    maxUses: "",
    expiresAt: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadCoupons();
    }
  }, [isAdmin]);

  const loadCoupons = async () => {
    try {
      const res = await fetch("/api/coupons", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          code: formData.code,
          points: parseFloat(formData.points),
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          expiresAt: formData.expiresAt || null,
          description: formData.description,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Coupon créé avec succès !");
        setFormData({
          code: "",
          points: "",
          maxUses: "",
          expiresAt: "",
          description: "",
        });
        setShowCreateModal(false);
        loadCoupons();
      } else {
        setError(data.error || "Erreur lors de la création du coupon");
      }
    } catch (error) {
      setError("Erreur de connexion");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/coupons/${editingCoupon.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          code: formData.code,
          points: parseFloat(formData.points),
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          expiresAt: formData.expiresAt || null,
          description: formData.description,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Coupon mis à jour avec succès !");
        setEditingCoupon(null);
        setFormData({
          code: "",
          points: "",
          maxUses: "",
          expiresAt: "",
          description: "",
        });
        loadCoupons();
      } else {
        setError(data.error || "Erreur lors de la mise à jour du coupon");
      }
    } catch (error) {
      setError("Erreur de connexion");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce coupon ?")) return;

    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setSuccess("Coupon supprimé avec succès !");
        loadCoupons();
      } else {
        setError("Erreur lors de la suppression du coupon");
      }
    } catch (error) {
      setError("Erreur de connexion");
    }
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      points: coupon.points.toString(),
      maxUses: coupon.maxUses?.toString() || "",
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "",
      description: coupon.description || "",
    });
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingCoupon(null);
    setFormData({
      code: "",
      points: "",
      maxUses: "",
      expiresAt: "",
      description: "",
    });
    setError(null);
    setSuccess(null);
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isMaxUsesReached = (coupon: Coupon) => {
    if (!coupon.maxUses) return false;
    return coupon.currentUses >= coupon.maxUses;
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center py-16">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-4">Chargement...</p>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                <Gift className="w-8 h-8 text-primary" />
                Gestion des Coupons
              </h1>
              <p className="text-muted-foreground">
                Créez et gérez les coupons bonus pour distribuer des points
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Créer un coupon
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg">
              {success}
            </div>
          )}

          <div className="grid gap-4">
            {coupons.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Gift className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">Aucun coupon créé</p>
                    <p className="text-muted-foreground/70 text-sm mt-2">
                      Créez votre premier coupon pour commencer
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              coupons.map((coupon) => (
                <Card key={coupon.id} className="gradient-card border-2 border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-foreground">{coupon.code}</h3>
                          <span className="text-lg font-semibold text-primary">
                            {coupon.points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pts
                          </span>
                          {isExpired(coupon.expiresAt) && (
                            <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20">
                              Expiré
                            </span>
                          )}
                          {isMaxUsesReached(coupon) && (
                            <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded border border-yellow-500/20">
                              Limite atteinte
                            </span>
                          )}
                        </div>
                        {coupon.description && (
                          <p className="text-muted-foreground mb-3">{coupon.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {coupon.maxUses && (
                            <span>
                              Utilisations: {coupon.currentUses} / {coupon.maxUses}
                            </span>
                          )}
                          {coupon.expiresAt && (
                            <span>
                              Expire le: {new Date(coupon.expiresAt).toLocaleDateString("fr-FR")}
                            </span>
                          )}
                          <span>
                            Créé le: {new Date(coupon.createdAt).toLocaleDateString("fr-FR")}
                          </span>
                          {coupon.lastUsedAt && (
                            <span>
                              Dernière utilisation: {new Date(coupon.lastUsedAt).toLocaleDateString("fr-FR")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(coupon)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Modifier
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(coupon.id)}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Modal Create/Edit */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background border-2 border-border rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  {editingCoupon ? "Modifier le coupon" : "Créer un coupon"}
                </h2>
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={editingCoupon ? handleUpdate : handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="code">Code du coupon *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: BONUS100"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="points">Points à donner *</Label>
                  <Input
                    id="points"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                    placeholder="Ex: 100"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="maxUses">Limite d'utilisations (optionnel)</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    placeholder="Ex: 50 (laisser vide pour illimité)"
                  />
                </div>

                <div>
                  <Label htmlFor="expiresAt">Date d'expiration (optionnel)</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Coupon de bienvenue"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded border border-red-500/20">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-green-500/10 text-green-400 text-sm rounded border border-green-500/20">
                    {success}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4">
                  <Button type="submit" className="flex-1 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {editingCoupon ? "Modifier" : "Créer"}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Annuler
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCoupons;

