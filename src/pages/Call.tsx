import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Phone, Play, Search, ChevronLeft, ChevronRight, Clock, Lock, Plus, AlertCircle, Trophy, Coins, Megaphone, Gift, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

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
  date?: string;
  createdAt: string;
}

interface Slot {
  id: string;
  name: string;
  thumbnailUrl: string;
  provider: {
    name: string;
  };
}

const Call = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [calls, setCalls] = useState<SlotCall[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [createCallDialogOpen, setCreateCallDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [slotSearchQuery, setSlotSearchQuery] = useState("");
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [canCreateCall, setCanCreateCall] = useState(true);
  const [nextCallTime, setNextCallTime] = useState<Date | null>(null);

  useEffect(() => {
    checkAuth();
    loadCalls();
    checkCallCooldown();
  }, []);

  useEffect(() => {
    if (user) {
      checkCallCooldown();
    }
  }, [user]);

  useEffect(() => {
    // Recharger les calls quand la date change
    loadCalls();
  }, [currentDate]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    }
  };

  const checkCallCooldown = async () => {
    try {
      const response = await fetch("/api/calls/cooldown", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCanCreateCall(data.canCreate);
        if (data.nextCallTime) {
          setNextCallTime(new Date(data.nextCallTime));
        } else {
          setNextCallTime(null);
        }
      }
    } catch (error) {
      console.error("Error checking cooldown:", error);
    }
  };

  const loadCalls = async () => {
    try {
      const response = await fetch("/api/calls", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCalls(data.calls || []);
      } else {
        // Données de démonstration si l'API n'est pas encore disponible
        const demoCalls: SlotCall[] = [];
        setCalls(demoCalls);
      }
    } catch (error) {
      console.error("Error loading calls:", error);
      setCalls([]);
    }
  };

  const searchSlots = async (query: string) => {
    if (query.length < 2) {
      setAvailableSlots([]);
      return;
    }
    setSearching(true);
    try {
      const response = await fetch(`/api/slots/search?q=${encodeURIComponent(query)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.slots || []);
      }
    } catch (error) {
      console.error("Error searching slots:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleSlotSearch = (value: string) => {
    setSlotSearchQuery(value);
    if (value.length >= 2) {
      searchSlots(value);
    } else {
      setAvailableSlots([]);
    }
  };

  const createCall = async () => {
    if (!selectedSlot) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un slot",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          slot: selectedSlot.name,
          slotId: selectedSlot.id,
          slotImage: selectedSlot.thumbnailUrl,
          slotProvider: selectedSlot.provider?.name,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Call créé !",
          description: "Votre call a été créé avec succès",
        });
        setCreateCallDialogOpen(false);
        setSelectedSlot(null);
        setSlotSearchQuery("");
        setAvailableSlots([]);
        loadCalls();
        checkCallCooldown();
        } else {
          let errorMessage = data.error || "Impossible de créer le call";
          if (data.error && data.error.includes("jour")) {
            // Message déjà en français pour le cooldown quotidien
            errorMessage = data.error;
          }
          toast({
            title: "Erreur",
            description: errorMessage,
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

  const handleLogin = () => {
    window.location.href = "/api/auth/discord";
  };

  const filteredCalls = calls.filter((call) => {
    const matchesSearch = call.slot.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || call.status === statusFilter;
    
    // Filtrer par date sélectionnée (comparer seulement jour/mois/année)
    const callDate = new Date(call.createdAt || call.date);
    const isSameDay = callDate.getDate() === currentDate.getDate() &&
                      callDate.getMonth() === currentDate.getMonth() &&
                      callDate.getFullYear() === currentDate.getFullYear();
    
    return matchesSearch && matchesStatus && isSameDay;
  });

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

  const formatTimeRemaining = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    if (diff <= 0) return "Maintenant";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `Dans ${hours}h ${minutes}m`;
    }
    return `Dans ${minutes}m`;
  };

  const changeDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
    loadCalls();
  };

  const formattedDate = currentDate.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4 min-h-screen">
        <div className="container mx-auto max-w-7xl">
          {/* Prize Banner */}
          <div className="text-center mb-6">
            <div className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold text-lg mb-4">
              150€ A GAGNER !
            </div>
          </div>

          {/* Main Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeDate("prev")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="text-center flex-1">
              <h1 className="text-4xl md:text-6xl font-bold text-primary mb-2">
                SLOT CALLS
              </h1>
              <div className="flex items-center justify-center gap-3 text-muted-foreground">
                <span>{formattedDate}</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-primary font-semibold">Active</span>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeDate("next")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Faire un call Section */}
          <Card className="gradient-card border-2 border-border/50 mb-8">
            <CardHeader className="bg-primary/10 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Phone className="h-5 w-5" />
                Faire un call
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {user ? (
                canCreateCall ? (
                  <div className="space-y-4">
                    <Button
                      onClick={() => setCreateCallDialogOpen(true)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      size="lg"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Créer un call
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-semibold">Limite quotidienne</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Vous avez déjà fait un call aujourd'hui. {nextCallTime ? `Prochain call possible demain (${nextCallTime.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })})` : "Prochain call possible demain"}
                    </p>
                  </div>
                )
              ) : (
                <div className="p-6 rounded-lg bg-muted/50 border-2 border-dashed border-border/50 text-center">
                  <Lock className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Connectez-vous avec Discord pour créer un call
                  </p>
                  <Button
                    onClick={handleLogin}
                    className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
                  >
                    Se connecter avec Discord
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Liste des calls Section */}
          <Card className="gradient-card border-2 border-border/50">
            <CardHeader className="bg-primary/10 border-b border-border/50">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Play className="h-5 w-5" />
                  Liste des calls
                </CardTitle>
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
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
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCalls.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          Aucun call trouvé
                        </td>
                      </tr>
                    ) : (
                      filteredCalls.map((call) => (
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
                          <td className="px-4 py-3 text-muted-foreground">
                            {call.multiplier !== undefined ? call.multiplier : "-"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {call.points !== undefined ? call.points : "-"}
                          </td>
                          <td className="px-4 py-3">
                            {call.status === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30"
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
                                Terminé
                              </Button>
                            )}
                            {call.status === "cancelled" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-red-500/20 text-red-400 border-red-500/50"
                              >
                                Annulé
                              </Button>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatDate(call.createdAt || call.date)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Rewards System Section - After calls list */}
          <div className="grid md:grid-cols-2 gap-6 mb-8 mt-8">
            {/* Points per multiplier */}
            <Card className="gradient-card border-2 border-border/50">
              <CardHeader className="bg-primary/10 border-b border-border/50">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Trophy className="h-5 w-5" />
                  Système de récompenses
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Coins className="h-4 w-4 text-primary" />
                  Points gagnés par call
                </div>
                <div className="space-y-2">
                  {[
                    { multiplier: 0, label: "X0", points: 0 },
                    { multiplier: 10, label: "X10", points: 5 },
                    { multiplier: 50, label: "X50", points: 10 },
                    { multiplier: 100, label: "X100", points: 20 },
                    { multiplier: 500, label: "X500", points: 50 },
                    { multiplier: 1000, label: "X1000+", points: 100, highlight: true },
                  ].map((item) => (
                    <div
                      key={item.multiplier}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        item.highlight
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-muted/50 border-border/50 hover:border-primary/50"
                      }`}
                    >
                      <span className={`font-bold ${item.highlight ? "text-primary-foreground" : "text-foreground"}`}>
                        {item.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={item.highlight ? "text-primary-foreground" : "text-foreground"}>
                          {item.points}
                        </span>
                        <Coins className={`h-4 w-4 ${item.highlight ? "text-primary-foreground" : "text-primary"}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* How it works */}
            <Card className="gradient-card border-2 border-border/50">
              <CardHeader className="bg-primary/10 border-b border-border/50">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Megaphone className="h-5 w-5" />
                  Comment ça marche ?
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Play className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Faites vos calls</h4>
                    <p className="text-sm text-muted-foreground">
                      Proposez une slot, obtenez un bon multiplicateur et gagnez des points !
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Gift className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Gagnez des récompenses</h4>
                    <p className="text-sm text-muted-foreground">
                      Utilisez vos points pour ouvrir des boosters ou sur la boutique pour gagner des récompenses exclusives.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Session Statistics */}
          <Card className="gradient-card border-2 border-primary mb-8">
            <CardHeader className="bg-primary/10 border-b border-primary/30">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Flag className="h-5 w-5" />
                Session en cours : 150€ A GAGNER !
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(() => {
                  const totalCalls = filteredCalls.length;
                  const completedCalls = filteredCalls.filter(c => c.status === "completed").length;
                  const totalPoints = filteredCalls
                    .filter(c => c.status === "completed" && c.points)
                    .reduce((sum, c) => sum + (c.points || 0), 0);
                  const successRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;

                  return (
                    <>
                      <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                          {totalCalls}
                        </div>
                        <div className="text-sm text-muted-foreground">Calls totaux</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                          {completedCalls}
                        </div>
                        <div className="text-sm text-muted-foreground">Calls terminés</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                          {totalPoints}
                        </div>
                        <div className="text-sm text-muted-foreground">Points distribués</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                          {successRate}%
                        </div>
                        <div className="text-sm text-muted-foreground">Taux de réussite</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      {/* Dialog pour créer un call */}
      <Dialog open={createCallDialogOpen} onOpenChange={setCreateCallDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un call</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="slot-search">Rechercher un slot</Label>
              <Input
                id="slot-search"
                placeholder="Tapez le nom du slot..."
                value={slotSearchQuery}
                onChange={(e) => handleSlotSearch(e.target.value)}
                className="mt-1"
              />
              {searching && (
                <div className="mt-2 text-sm text-muted-foreground">Recherche en cours...</div>
              )}
              {availableSlots.length > 0 && !selectedSlot && (
                <div className="mt-2 max-h-64 overflow-y-auto border border-border/50 rounded-lg bg-background">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setSlotSearchQuery(slot.name);
                        setAvailableSlots([]);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-muted transition-colors border-b border-border/50 last:border-0 flex items-center gap-3"
                    >
                      <img
                        src={slot.thumbnailUrl}
                        alt={slot.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{slot.name}</div>
                        {slot.provider?.name && (
                          <div className="text-xs text-muted-foreground">{slot.provider.name}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {selectedSlot && (
                <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="text-sm font-medium text-primary mb-2">Slot sélectionné:</div>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedSlot.thumbnailUrl}
                      alt={selectedSlot.name}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div>
                      <div className="font-semibold">{selectedSlot.name}</div>
                      {selectedSlot.provider?.name && (
                        <div className="text-xs text-muted-foreground">{selectedSlot.provider.name}</div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={() => {
                      setSelectedSlot(null);
                      setSlotSearchQuery("");
                    }}
                  >
                    Changer de slot
                  </Button>
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateCallDialogOpen(false);
                  setSelectedSlot(null);
                  setSlotSearchQuery("");
                  setAvailableSlots([]);
                }}
              >
                Fermer
              </Button>
              <Button onClick={createCall} disabled={!selectedSlot || loading}>
                {loading ? "Création..." : "Créer le call"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Call;
