import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAdmin } from "@/hooks/useAdmin";
import { useState, useEffect } from "react";
import { Coins, Plus, Minus, Settings, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface User {
  id: string;
  username: string;
  global_name?: string;
  avatar?: string;
  points: number;
  email?: string;
}

const PointsAdmin = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"add" | "subtract" | "set">("add");
  const [pointsAmount, setPointsAmount] = useState("");
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Utiliser l'API users pour obtenir tous les utilisateurs
      const response = await fetch("/api/users", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        // Trier par points décroissants
        const sortedUsers = (data.users || []).sort((a: User, b: User) => b.points - a.points);
        setUsers(sortedUsers);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les utilisateurs",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des utilisateurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) {
      return true; // Afficher tous les utilisateurs si la recherche est vide
    }
    
    const searchLower = searchQuery.toLowerCase().trim();
    const username = (user.username || "").toLowerCase();
    const globalName = (user.global_name || "").toLowerCase();
    const userId = user.id || "";
    
    // 1. Recherche exacte ou partielle dans le username (priorité élevée)
    if (username.includes(searchLower)) {
      return true;
    }
    
    // 2. Recherche exacte ou partielle dans le global_name
    if (globalName && globalName.includes(searchLower)) {
      return true;
    }
    
    // 3. Recherche dans l'ID
    if (userId.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // 4. Recherche par début de mot dans le username (plus intuitif pour les pseudos)
    // Divise le username par underscores, tirets, espaces, chiffres
    const usernameParts = username.split(/[_\-\s0-9]+/).filter(part => part.length > 0);
    if (usernameParts.some(part => part.startsWith(searchLower))) {
      return true;
    }
    
    // 5. Recherche par début de mot dans le global_name
    if (globalName) {
      const globalNameParts = globalName.split(/[_\-\s0-9]+/).filter(part => part.length > 0);
      if (globalNameParts.some(part => part.startsWith(searchLower))) {
        return true;
      }
    }
    
    // 6. Recherche par correspondance de mots (si plusieurs mots dans la recherche)
    const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0);
    if (searchWords.length > 1) {
      const allText = `${username} ${globalName} ${userId}`.toLowerCase();
      const allWordsMatch = searchWords.every(word => allText.includes(word));
      if (allWordsMatch) {
        return true;
      }
    }
    
    // 7. Recherche avec caractères spéciaux ignorés (pour pseudos avec _ ou -)
    const normalizedUsername = username.replace(/[_\-\s]/g, "");
    const normalizedSearch = searchLower.replace(/[_\-\s]/g, "");
    if (normalizedUsername.includes(normalizedSearch)) {
      return true;
    }
    
    return false;
  }).sort((a, b) => {
    // Trier les résultats pour donner la priorité aux correspondances exactes dans le username
    if (!searchQuery.trim()) {
      return b.points - a.points; // Trier par points si pas de recherche
    }
    
    const searchLower = searchQuery.toLowerCase().trim();
    const aUsername = (a.username || "").toLowerCase();
    const bUsername = (b.username || "").toLowerCase();
    
    // Correspondance exacte du username en premier
    if (aUsername === searchLower && bUsername !== searchLower) return -1;
    if (bUsername === searchLower && aUsername !== searchLower) return 1;
    
    // Correspondance au début du username
    const aStarts = aUsername.startsWith(searchLower);
    const bStarts = bUsername.startsWith(searchLower);
    if (aStarts && !bStarts) return -1;
    if (bStarts && !aStarts) return 1;
    
    // Sinon, trier par points
    return b.points - a.points;
  });

  const openDialog = (user: User, action: "add" | "subtract" | "set") => {
    setSelectedUser(user);
    setActionType(action);
    setPointsAmount("");
    setReason("");
    setDialogOpen(true);
  };

  const handlePointsAction = async () => {
    if (!selectedUser) return;

    const amount = parseInt(pointsAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Erreur",
        description: "Le montant doit être un nombre positif",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      let response;
      if (actionType === "add") {
        response = await fetch("/api/points/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            userId: selectedUser.id,
            amount: amount,
            reason: reason || "Points ajoutés par un administrateur",
          }),
        });
      } else if (actionType === "subtract") {
        response = await fetch("/api/points/subtract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            userId: selectedUser.id,
            amount: amount,
            reason: reason || "Points retirés par un administrateur",
          }),
        });
      } else {
        // set
        response = await fetch("/api/points/set", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            userId: selectedUser.id,
            amount: amount,
            reason: reason || "Points définis par un administrateur",
          }),
        });
      }

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Succès",
          description: `Points ${actionType === "add" ? "ajoutés" : actionType === "subtract" ? "retirés" : "définis"} avec succès`,
        });
        setDialogOpen(false);
        loadUsers(); // Recharger la liste
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Impossible de modifier les points",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error modifying points:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
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
                  <p className="text-destructive font-semibold">Accès non autorisé</p>
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
          <Card className="gradient-card border-2 border-border/50 mb-6">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                <Coins className="h-8 w-8 text-primary" />
                Gestion des Points
              </CardTitle>
              <p className="text-muted-foreground">
                Gérez les points de tous les utilisateurs inscrits sur le site
              </p>
            </CardHeader>
            <CardContent>
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un utilisateur par pseudo, nom ou ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setSearchQuery("")}
                    >
                      ×
                    </Button>
                  )}
                </div>
                {searchQuery && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {filteredUsers.length === 0
                      ? "Aucun utilisateur trouvé"
                      : `${filteredUsers.length} utilisateur${filteredUsers.length > 1 ? "s" : ""} trouvé${filteredUsers.length > 1 ? "s" : ""}`}
                  </p>
                )}
              </div>

              {/* Users List */}
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Chargement des utilisateurs...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery ? "Aucun utilisateur trouvé" : "Aucun utilisateur inscrit"}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => {
                    // Fonction pour mettre en évidence les correspondances dans les résultats
                    const highlightMatch = (text: string, query: string) => {
                      if (!query.trim()) return <>{text}</>;
                      // Échapper les caractères spéciaux pour la regex
                      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                      const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
                      return (
                        <>
                          {parts.map((part, index) =>
                            part.toLowerCase() === query.toLowerCase() ? (
                              <mark key={index} className="bg-primary/30 text-primary-foreground font-semibold px-0.5 rounded">
                                {part}
                              </mark>
                            ) : (
                              <span key={index}>{part}</span>
                            )
                          )}
                        </>
                      );
                    };

                    const searchLower = searchQuery.toLowerCase().trim();
                    
                    return (
                      <Card key={user.id} className="border-border/50 hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <Avatar className="flex-shrink-0">
                                <AvatarImage
                                  src={
                                    user.avatar
                                      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
                                      : undefined
                                  }
                                />
                                <AvatarFallback>
                                  {(user.global_name || user.username)
                                    .charAt(0)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold truncate">
                                  {searchQuery
                                    ? highlightMatch(user.global_name || user.username, searchLower)
                                    : user.global_name || user.username}
                                </div>
                                <div className="text-sm text-muted-foreground truncate">
                                  @
                                  {searchQuery
                                    ? highlightMatch(user.username, searchLower)
                                    : user.username}{" "}
                                  • ID: {user.id.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary flex items-center gap-1 justify-end">
                                  <Coins className="h-5 w-5" />
                                  {user.points.toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground">points</div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDialog(user, "add")}
                                  title="Ajouter des points"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Ajouter
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDialog(user, "subtract")}
                                  title="Retirer des points"
                                >
                                  <Minus className="h-4 w-4 mr-1" />
                                  Retirer
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDialog(user, "set")}
                                  title="Définir les points"
                                >
                                  <Settings className="h-4 w-4 mr-1" />
                                  Définir
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      {/* Points Modification Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "add" && "Ajouter des points"}
              {actionType === "subtract" && "Retirer des points"}
              {actionType === "set" && "Définir les points"}
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Utilisateur</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar>
                    <AvatarImage
                      src={
                        selectedUser.avatar
                          ? `https://cdn.discordapp.com/avatars/${selectedUser.id}/${selectedUser.avatar}.png`
                          : undefined
                      }
                    />
                    <AvatarFallback>
                      {(selectedUser.global_name || selectedUser.username)
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold">
                      {selectedUser.global_name || selectedUser.username}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Points actuels: {selectedUser.points}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="points">
                  {actionType === "add" && "Points à ajouter"}
                  {actionType === "subtract" && "Points à retirer"}
                  {actionType === "set" && "Nouveau montant de points"}
                </Label>
                <Input
                  id="points"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(e.target.value)}
                />
                {actionType === "subtract" && selectedUser.points - parseInt(pointsAmount || "0") < 0 && (
                  <p className="text-xs text-destructive">
                    Attention: Le solde ne peut pas être négatif. Le solde sera défini à 0.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Raison (optionnel)</Label>
                <Input
                  id="reason"
                  placeholder="Raison de la modification..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handlePointsAction} disabled={processing || !pointsAmount}>
              {processing ? "Traitement..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PointsAdmin;

