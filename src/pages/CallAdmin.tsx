import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle, XCircle, Trophy, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { calculatePointsFromMultiplier } from "@/utils/pointsCalculator";

interface SlotCall {
  id: string;
  userId: string;
  username: string;
  usernameSecondary?: string;
  avatar?: string;
  slot: string;
  slotId?: string;
  slotImage?: string;
  slotProvider?: string;
  multiplier?: number;
  points?: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
}

const CallAdmin = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [calls, setCalls] = useState<SlotCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCall, setEditingCall] = useState<SlotCall | null>(null);
  const [multiplier, setMultiplier] = useState("");
  const [points, setPoints] = useState("");
  const [status, setStatus] = useState<"pending" | "completed" | "cancelled">("pending");
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (isAdmin) {
      loadCalls();
    }
  }, [isAdmin]);

  useEffect(() => {
    // Recharger les calls quand la date change
    if (isAdmin) {
      loadCalls();
    }
  }, [currentDate, isAdmin]);

  const loadCalls = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/calls", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        // Filtrer les calls par la date sélectionnée
        const filtered = (data.calls || []).filter((call: SlotCall) => {
          const callDate = new Date(call.createdAt);
          return callDate.getDate() === currentDate.getDate() &&
                 callDate.getMonth() === currentDate.getMonth() &&
                 callDate.getFullYear() === currentDate.getFullYear();
        });
        setCalls(filtered);
      }
    } catch (error) {
      console.error("Error loading calls:", error);
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (call: SlotCall) => {
    setEditingCall(call);
    setMultiplier(call.multiplier?.toString() || "");
    // Calculer automatiquement les points si un multiplicateur existe
    if (call.multiplier !== undefined) {
      const calculatedPoints = calculatePointsFromMultiplier(call.multiplier);
      setPoints(calculatedPoints.toString());
    } else {
      setPoints(call.points?.toString() || "");
    }
    setStatus(call.status);
  };

  const saveCall = async () => {
    if (!editingCall) return;

    setLoading(true);
    try {
      // Calculer automatiquement les points à partir du multiplicateur
      let calculatedPoints = 0;
      if (multiplier) {
        const multiplierValue = parseFloat(multiplier);
        if (!isNaN(multiplierValue)) {
          calculatedPoints = calculatePointsFromMultiplier(multiplierValue);
        }
      }

      const response = await fetch(`/api/calls/${editingCall.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          multiplier: multiplier ? parseFloat(multiplier) : undefined,
          points: calculatedPoints > 0 ? calculatedPoints : undefined,
          status,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Call mis à jour",
          description: "Le call a été mis à jour avec succès",
        });
        
        // Si des points ont été attribués, les ajouter au compte de l'utilisateur
        let calculatedPoints = 0;
        if (multiplier) {
          const multiplierValue = parseFloat(multiplier);
          if (!isNaN(multiplierValue)) {
            calculatedPoints = calculatePointsFromMultiplier(multiplierValue);
          }
        }
        
        if (calculatedPoints > 0 && status === "completed") {
          try {
            await fetch("/api/points/add", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                userId: editingCall.userId,
                amount: calculatedPoints,
              }),
            });
            toast({
              title: "Points attribués",
              description: `${calculatedPoints} points ont été ajoutés au compte de l'utilisateur`,
            });
          } catch (error) {
            console.error("Error adding points:", error);
          }
        }
        
        setEditingCall(null);
        loadCalls();
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Impossible de mettre à jour le call",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCall = async (callId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce call ?")) return;

    try {
      const response = await fetch(`/api/calls/${callId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Call supprimé",
          description: "Le call a été supprimé avec succès",
        });
        loadCalls();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le call",
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

  const changeDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const formattedHeaderDate = currentDate.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4 min-h-screen">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-2">
                  Administration Calls
                </h1>
                <p className="text-xl text-muted-foreground">
                  Gérez les calls et attribuez des points
                </p>
              </div>
            </div>

            {/* Navigation par date */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() => changeDate("prev")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {formattedHeaderDate}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  className="text-xs text-muted-foreground hover:text-foreground mt-1"
                >
                  Aujourd'hui
                </Button>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => changeDate("next")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Card className="gradient-card border-2 border-border/50">
            <CardHeader className="bg-primary/10 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Trophy className="h-5 w-5" />
                Liste des Calls
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Chargement...
                </div>
              ) : calls.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Aucun call trouvé
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Utilisateur</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Slot</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Multiplicateur</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Points</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Statut</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calls.map((call) => (
                        <tr key={call.id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                {call.avatar ? (
                                  <AvatarImage
                                    src={`https://cdn.discordapp.com/avatars/${call.userId}/${call.avatar}.png`}
                                    alt={call.username}
                                  />
                                ) : (
                                  <AvatarFallback className="bg-primary/20 text-primary">
                                    {call.username.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <div className="font-semibold text-foreground">{call.username}</div>
                                {call.usernameSecondary && (
                                  <div className="text-xs text-muted-foreground">{call.usernameSecondary}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {call.slotImage && (
                                <img
                                  src={call.slotImage}
                                  alt={call.slot}
                                  className="w-12 h-12 rounded-lg object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              )}
                              <div>
                                <div className="font-medium text-foreground">{call.slot}</div>
                                {call.slotProvider && (
                                  <div className="text-xs text-muted-foreground">{call.slotProvider}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            {call.multiplier !== undefined ? call.multiplier : "-"}
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            {call.points !== undefined ? call.points : "-"}
                          </td>
                          <td className="px-4 py-3">
                            {call.status === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-blue-500/20 text-blue-400 border-blue-500/50"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                En attente
                              </Button>
                            )}
                            {call.status === "completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-500/20 text-green-400 border-green-500/50"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Terminé
                              </Button>
                            )}
                            {call.status === "cancelled" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-red-500/20 text-red-400 border-red-500/50"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Annulé
                              </Button>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatDate(call.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(call)}
                              >
                                Modifier
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteCall(call.id)}
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

      {/* Dialog pour modifier un call */}
      {editingCall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Modifier le call</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Utilisateur</Label>
                <div className="mt-1 p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    {editingCall.avatar && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://cdn.discordapp.com/avatars/${editingCall.userId}/${editingCall.avatar}.png`}
                          alt={editingCall.username}
                        />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {editingCall.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <div className="font-semibold">{editingCall.username}</div>
                      {editingCall.usernameSecondary && (
                        <div className="text-xs text-muted-foreground">{editingCall.usernameSecondary}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Slot</Label>
                <div className="mt-1 p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    {editingCall.slotImage && (
                      <img
                        src={editingCall.slotImage}
                        alt={editingCall.slot}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <div className="font-semibold">{editingCall.slot}</div>
                      {editingCall.slotProvider && (
                        <div className="text-xs text-muted-foreground">{editingCall.slotProvider}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="multiplier">Multiplicateur</Label>
                <Input
                  id="multiplier"
                  type="number"
                  step="0.01"
                  value={multiplier}
                  onChange={(e) => {
                    const newMultiplier = e.target.value;
                    setMultiplier(newMultiplier);
                    // Calculer automatiquement les points en fonction du multiplicateur
                    if (newMultiplier) {
                      const multiplierValue = parseFloat(newMultiplier);
                      if (!isNaN(multiplierValue)) {
                        const calculatedPoints = calculatePointsFromMultiplier(multiplierValue);
                        setPoints(calculatedPoints.toString());
                      } else {
                        setPoints("0");
                      }
                    } else {
                      setPoints("0");
                    }
                  }}
                  placeholder="Ex: 100x"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  X0: 0 pts | X10: 5 pts | X50: 10 pts | X100: 20 pts | X500: 50 pts | X1000+: 100 pts
                </p>
              </div>

              <div>
                <Label htmlFor="points">Points à attribuer</Label>
                <Input
                  id="points"
                  type="number"
                  step="1"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  placeholder="Ex: 1000"
                  className="mt-1"
                  readOnly
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Points calculés automatiquement selon le multiplicateur. Les points seront ajoutés si le statut est "Terminé"
                </p>
              </div>

              <div>
                <Label htmlFor="status">Statut</Label>
                <Select value={status} onValueChange={(value: "pending" | "completed" | "cancelled") => setStatus(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingCall(null)}
                >
                  Annuler
                </Button>
                <Button onClick={saveCall} disabled={loading}>
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CallAdmin;

