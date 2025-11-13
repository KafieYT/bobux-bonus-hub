import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Shield, CheckCircle, Clock, XCircle, Package } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Order {
  id: string;
  userId: string;
  username: string;
  usernameSecondary?: string;
  avatar?: string;
  itemId: string;
  itemName: string;
  itemCategory: string;
  price: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
  completedAt?: string;
}

const OrdersAdmin = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (isAdmin) {
      loadOrders();
    }
  }, [isAdmin, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/orders", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        let filteredOrders = data.orders || [];
        
        // Filtrer par statut
        if (statusFilter !== "all") {
          filteredOrders = filteredOrders.filter((order: Order) => order.status === statusFilter);
        }
        
        // Trier par date (plus récent en premier)
        filteredOrders.sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setOrders(filteredOrders);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: "pending" | "completed" | "cancelled") => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      // Confirmation si on annule une commande
      if (newStatus === "cancelled" && order.status !== "cancelled") {
        if (!confirm(`Êtes-vous sûr de vouloir annuler cette commande ? Les ${order.price} points seront remboursés à l'utilisateur.`)) {
          return;
        }
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const statusMessages = {
          completed: "complétée",
          cancelled: "annulée",
          pending: "en attente",
        };
        const message = newStatus === "cancelled" && order.status !== "cancelled"
          ? `La commande a été annulée et ${order.price} points ont été remboursés à l'utilisateur.`
          : `La commande a été marquée comme ${statusMessages[newStatus]}`;
        
        toast({
          title: "Statut mis à jour",
          description: message,
        });
        loadOrders();
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Impossible de mettre à jour le statut",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Commande supprimée",
          description: "La commande a été supprimée avec succès",
        });
        loadOrders();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la commande",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Date invalide";
      }
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (e) {
      return "Date invalide";
    }
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
                  <Shield className="w-12 h-12 text-destructive mx-auto" />
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

  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const completedOrders = orders.filter(o => o.status === "completed").length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4 min-h-screen">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-2">
              Administration Boutique
            </h1>
            <p className="text-xl text-muted-foreground">
              Gérez les commandes et attribuez les lots
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="gradient-card border-2 border-border/50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-foreground mb-1">{orders.length}</div>
                <div className="text-sm text-muted-foreground">Commandes totales</div>
              </CardContent>
            </Card>
            <Card className="gradient-card border-2 border-border/50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-500 mb-1">{pendingOrders}</div>
                <div className="text-sm text-muted-foreground">En attente</div>
              </CardContent>
            </Card>
            <Card className="gradient-card border-2 border-border/50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-500 mb-1">{completedOrders}</div>
                <div className="text-sm text-muted-foreground">Complétées</div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="completed">Complétées</SelectItem>
                <SelectItem value="cancelled">Annulées</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders List */}
          <Card className="gradient-card border-2 border-border/50">
            <CardHeader className="bg-primary/10 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-primary">
                <ShoppingBag className="h-5 w-5" />
                Liste des commandes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Chargement...
                </div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Aucune commande trouvée
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Utilisateur</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Article</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Catégorie</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Prix</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Statut</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                {order.avatar ? (
                                  <AvatarImage
                                    src={`https://cdn.discordapp.com/avatars/${order.userId}/${order.avatar}.png`}
                                    alt={order.username}
                                  />
                                ) : (
                                  <AvatarFallback className="bg-primary/20 text-primary">
                                    {order.username.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <div className="font-semibold text-foreground">{order.username}</div>
                                {order.usernameSecondary && (
                                  <div className="text-xs text-muted-foreground">{order.usernameSecondary}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-foreground font-medium">{order.itemName}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {order.itemCategory === "song-request" && "Song Request"}
                            {order.itemCategory === "tips-casino" && "Tips Casino"}
                            {order.itemCategory === "carte-cadeau" && "Carte cadeau"}
                            {order.itemCategory === "merch" && "Merch"}
                            {order.itemCategory === "objets-physiques" && "Objets Physiques"}
                            {!["song-request", "tips-casino", "carte-cadeau", "merch", "objets-physiques"].includes(order.itemCategory) && order.itemCategory}
                          </td>
                          <td className="px-4 py-3 text-foreground font-semibold">{order.price} pts</td>
                          <td className="px-4 py-3">
                            {order.status === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                En attente
                              </Button>
                            )}
                            {order.status === "completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-500/20 text-green-400 border-green-500/50"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Complétée
                              </Button>
                            )}
                            {order.status === "cancelled" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-red-500/20 text-red-400 border-red-500/50"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Annulée
                              </Button>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {order.status === "pending" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateOrderStatus(order.id, "completed")}
                                    className="bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Valider
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateOrderStatus(order.id, "cancelled")}
                                    className="bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30"
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Annuler
                                  </Button>
                                </>
                              )}
                              {order.status === "completed" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, "pending")}
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  Remettre en attente
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteOrder(order.id)}
                              >
                                Supprimer
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrdersAdmin;

