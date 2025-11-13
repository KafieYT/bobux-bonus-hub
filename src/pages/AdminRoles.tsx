import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, UserPlus, Search, CheckCircle, XCircle, UserX, Coins, Plus, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface User {
  id: string;
  username: string;
  global_name?: string;
  avatar?: string;
  email?: string;
  roles?: string[];
  points?: number;
  gambaUsername?: string;
  createdAt?: string;
  updatedAt?: string;
}

const AdminRoles = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [pointsAction, setPointsAction] = useState<"add" | "set" | "subtract">("add");
  const [pointsAmount, setPointsAmount] = useState("");
  const [userDetails, setUserDetails] = useState<User | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/users", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (userId: string, role: "ADMIN" | "AFFILIÉ") => {
    setNotification(null);

    try {
      const res = await fetch(`/api/roles/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ role }),
      });

      const data = await res.json();

      if (res.ok) {
        setNotification({
          type: "success",
          text: `Rôle ${role} assigné avec succès !`,
        });
        setShowRoleModal(false);
        setSelectedUser(null);
        loadUsers();
      } else {
        setNotification({
          type: "error",
          text: data.error || "Erreur lors de l'assignation du rôle",
        });
      }
    } catch (error) {
      setNotification({
        type: "error",
        text: "Erreur de connexion",
      });
    }
  };

  const handleRemoveRole = async (userId: string, role: "ADMIN" | "AFFILIÉ") => {
    if (!confirm(`Êtes-vous sûr de vouloir retirer le rôle ${role} à cet utilisateur ?`)) return;

    setNotification(null);

    try {
      const res = await fetch(`/api/roles/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ role }),
      });

      const data = await res.json();

      if (res.ok) {
        setNotification({
          type: "success",
          text: `Rôle ${role} retiré avec succès !`,
        });
        loadUsers();
      } else {
        setNotification({
          type: "error",
          text: data.error || "Erreur lors du retrait du rôle",
        });
      }
    } catch (error) {
      setNotification({
        type: "error",
        text: "Erreur de connexion",
      });
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const openPointsModal = (user: User, action: "add" | "set" | "subtract" = "add") => {
    setSelectedUser(user);
    setPointsAction(action);
    setPointsAmount("");
    setShowPointsModal(true);
  };

  const openInfoModal = async (user: User) => {
    setSelectedUser(user);
    setShowInfoModal(true);
    setUserDetails(null);
    // Charger les informations complètes du joueur
    await loadUserDetails(user.id);
  };

  const loadUserDetails = async (userId: string) => {
    try {
      const res = await fetch(`/api/user/profile?userId=${userId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUserDetails(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error);
    }
  };

  const handlePointsAction = async () => {
    if (!selectedUser) return;
    
    const points = parseFloat(pointsAmount);
    if (isNaN(points) || points <= 0) {
      setNotification({
        type: "error",
        text: "Veuillez entrer un nombre de points valide",
      });
      return;
    }

    setNotification(null);

    try {
      let endpoint = "/api/points/add";
      let reason = `Points ajoutés par admin`;
      
      if (pointsAction === "set") {
        endpoint = "/api/points/set";
        reason = `Points définis par admin`;
      } else if (pointsAction === "subtract") {
        endpoint = "/api/points/subtract";
        reason = `Points retirés par admin`;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          amount: points,
          reason: reason,
          userId: selectedUser.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const actionText = 
          pointsAction === "add" ? "ajoutés" :
          pointsAction === "set" ? "définis" : "retirés";
        
        setNotification({
          type: "success",
          text: `${points} points ${actionText} avec succès !`,
        });
        setShowPointsModal(false);
        setPointsAmount("");
        setSelectedUser(null);
        loadUsers();
      } else {
        setNotification({
          type: "error",
          text: data.error || "Erreur lors de l'opération",
        });
      }
    } catch (error) {
      setNotification({
        type: "error",
        text: "Erreur de connexion",
      });
    }
  };

  const hasRole = (user: User, role: "ADMIN" | "AFFILIÉ") => {
    return user.roles && user.roles.includes(role);
  };

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.username?.toLowerCase().includes(search) ||
      user.global_name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    );
  });

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
                  <Shield className="w-12 h-12 text-destructive mx-auto" />
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">INFORMATION joueurs</h1>
            <p className="text-muted-foreground">Consultez les informations des joueurs, ajoutez des points et gérez les rôles</p>
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

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="grid gap-4">
            {filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <UserX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
                </CardContent>
              </Card>
            ) : (
              filteredUsers.map(user => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="gradient-card border-2 border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <Avatar>
                            <AvatarImage
                              src={
                                user.avatar
                                  ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
                                  : undefined
                              }
                            />
                            <AvatarFallback>
                              {user.username?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-foreground">
                                {user.global_name || user.username || "Utilisateur"}
                              </h3>
                              {user.username && user.global_name && (
                                <span className="text-sm text-muted-foreground">@{user.username}</span>
                              )}
                            </div>
                            {user.email && (
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            )}
                            {user.gambaUsername && (
                              <p className="text-sm text-primary font-medium mt-1">
                                Pseudo Gamba: {user.gambaUsername}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1 text-sm">
                                <Coins className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-primary">
                                  {user.points !== undefined
                                    ? user.points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                    : "0.00"}{" "}
                                  pts
                                </span>
                              </div>
                              <div className="flex gap-2">
                                {hasRole(user, "ADMIN") && (
                                  <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
                                    ADMIN
                                  </Badge>
                                )}
                                {hasRole(user, "AFFILIÉ") && (
                                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                    AFFILIÉ
                                  </Badge>
                                )}
                                {(!user.roles || user.roles.length === 0) && (
                                  <Badge variant="outline" className="text-muted-foreground">
                                    Aucun rôle
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => openInfoModal(user)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Info className="w-4 h-4" />
                            Infos
                          </Button>
                          <Button
                            onClick={() => openPointsModal(user, "add")}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Points
                          </Button>
                          <Button onClick={() => openRoleModal(user)} className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            Rôles
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Points Modal */}
      {showPointsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>
                {pointsAction === "add" ? "Ajouter des points" :
                 pointsAction === "set" ? "Définir les points" :
                 "Retirer des points"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Utilisateur: <span className="font-semibold text-foreground">
                    {selectedUser.global_name || selectedUser.username}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Points actuels: <span className="font-semibold text-primary">
                    {selectedUser.points !== undefined
                      ? selectedUser.points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : "0.00"}{" "}
                    pts
                  </span>
                </p>
              </div>

              {/* Action selector */}
              <div className="flex gap-2">
                <Button
                  variant={pointsAction === "add" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPointsAction("add")}
                  className="flex-1"
                >
                  Ajouter
                </Button>
                <Button
                  variant={pointsAction === "set" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPointsAction("set")}
                  className="flex-1"
                >
                  Définir
                </Button>
                <Button
                  variant={pointsAction === "subtract" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPointsAction("subtract")}
                  className="flex-1"
                >
                  Retirer
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {pointsAction === "add" ? "Nombre de points à ajouter" :
                   pointsAction === "set" ? "Nouveau nombre de points" :
                   "Nombre de points à retirer"}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={pointsAmount}
                  onChange={e => setPointsAmount(e.target.value)}
                  placeholder="Ex: 100.50"
                />
              </div>

              {pointsAction === "set" && selectedUser.points !== undefined && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Les points seront remplacés par la valeur saisie. Points actuels:{" "}
                    <span className="font-semibold">
                      {selectedUser.points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={handlePointsAction} 
                  className="flex-1" 
                  disabled={!pointsAmount || parseFloat(pointsAmount) <= 0}
                >
                  {pointsAction === "add" ? "Ajouter" :
                   pointsAction === "set" ? "Définir" :
                   "Retirer"}
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowPointsModal(false);
                  setPointsAmount("");
                }}>
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Modal */}
      {showInfoModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Informations du joueur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-border/50">
                <Avatar className="w-16 h-16">
                  <AvatarImage
                    src={
                      (userDetails || selectedUser).avatar
                        ? `https://cdn.discordapp.com/avatars/${(userDetails || selectedUser).id}/${(userDetails || selectedUser).avatar}.png`
                        : undefined
                    }
                  />
                  <AvatarFallback>
                    {(userDetails || selectedUser).username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {(userDetails || selectedUser).global_name || (userDetails || selectedUser).username}
                  </h3>
                  {(userDetails || selectedUser).username && (userDetails || selectedUser).global_name && (
                    <p className="text-sm text-muted-foreground">@{(userDetails || selectedUser).username}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium">{(userDetails || selectedUser).email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Points</p>
                  <p className="font-bold text-primary">
                    {((userDetails || selectedUser).points !== undefined
                      ? (userDetails || selectedUser).points
                      : selectedUser.points || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                    pts
                  </p>
                </div>
                {(userDetails || selectedUser).createdAt && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date de création</p>
                    <p className="font-medium">
                      {new Date((userDetails || selectedUser).createdAt || "").toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                )}
                {(userDetails || selectedUser).updatedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Dernière mise à jour</p>
                    <p className="font-medium">
                      {new Date((userDetails || selectedUser).updatedAt || "").toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                )}
              </div>

              {((userDetails || selectedUser).roles && (userDetails || selectedUser).roles!.length > 0) && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Rôles</p>
                  <div className="flex gap-2">
                    {(userDetails || selectedUser).roles!.map(role => (
                      <Badge
                        key={role}
                        variant={role === "ADMIN" ? "destructive" : "secondary"}
                        className={
                          role === "ADMIN"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                        }
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-border/50">
                <Button
                  onClick={() => {
                    setShowInfoModal(false);
                    setSelectedUser(null);
                    setUserDetails(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Fermer
                </Button>
                <Button
                  onClick={() => {
                    setShowInfoModal(false);
                    openPointsModal(selectedUser, "add");
                  }}
                  className="flex-1 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Gérer les points
                </Button>
                <Button
                  onClick={() => {
                    setShowInfoModal(false);
                    openRoleModal(selectedUser);
                  }}
                  className="flex-1 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Gérer les rôles
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Gérer les rôles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Utilisateur: <span className="font-semibold text-foreground">
                    {selectedUser.global_name || selectedUser.username}
                  </span>
                </p>
              </div>

              <div className="space-y-3">
                {/* ADMIN Role */}
                <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="font-medium">ADMIN</p>
                      <p className="text-xs text-muted-foreground">Accès complet au panel admin</p>
                    </div>
                  </div>
                  {hasRole(selectedUser, "ADMIN") ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveRole(selectedUser.id, "ADMIN")}
                    >
                      Retirer
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssignRole(selectedUser.id, "ADMIN")}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      Assigner
                    </Button>
                  )}
                </div>

                {/* AFFILIÉ Role */}
                <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="font-medium">AFFILIÉ</p>
                      <p className="text-xs text-muted-foreground">Accès aux giveaways réservés aux affiliés</p>
                    </div>
                  </div>
                  {hasRole(selectedUser, "AFFILIÉ") ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveRole(selectedUser.id, "AFFILIÉ")}
                    >
                      Retirer
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssignRole(selectedUser.id, "AFFILIÉ")}
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                    >
                      Assigner
                    </Button>
                  )}
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={() => setShowRoleModal(false)}>
                Fermer
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminRoles;

