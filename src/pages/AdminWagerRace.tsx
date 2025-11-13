import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/hooks/useAdmin";
import { Trophy, Coins, CheckCircle2, XCircle, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BetDetail {
  game: string;
  amount: number;
  date: string;
}

interface WagerDetail {
  rank: number;
  userId: string;
  username: string;
  global_name: string;
  avatar: string | null;
  totalWager: number;
  betCount: number;
  bets: BetDetail[];
  rewardsValidated: boolean;
}

interface WagerData {
  month: string;
  monthName: string;
  details: WagerDetail[];
}

const AdminWagerRace = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [data, setData] = useState<WagerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<string | null>(null);

  // Générer la liste des mois disponibles
  const getAvailableMonths = (): string[] => {
    const months: string[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push(monthKey);
    }
    return months;
  };

  const fetchDetails = async (month?: string) => {
    try {
      setLoading(true);
      setError(null);
      const monthParam = month || selectedMonth || "";
      const url = `/api/wager/admin/details${monthParam ? `?month=${monthParam}` : ""}`;
      const response = await fetch(url, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des détails");
      }
      const result = await response.json();
      setData(result);
      if (!selectedMonth && !month) {
        setSelectedMonth(result.month);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchDetails();
    }
  }, [isAdmin]);

  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleValidateRewards = async () => {
    if (!data) return;
    
    setValidating(true);
    setValidationResult(null);
    
    try {
      const response = await fetch("/api/wager/admin/validate-rewards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ month: data.month }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la validation");
      }

      const result = await response.json();
      setValidationResult(result.message);
      
      // Recharger les données
      await fetchDetails(data.month);
    } catch (err) {
      setValidationResult(`Erreur: ${err instanceof Error ? err.message : "Erreur inconnue"}`);
    } finally {
      setValidating(false);
    }
  };

  const getReward = (rank: number): number => {
    if (rank === 1) return 1000;
    if (rank === 2) return 900;
    if (rank === 3) return 850;
    return 0;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) {
      return <Trophy className="h-6 w-6 text-yellow-400" />;
    }
    if (rank === 2) {
      return <Trophy className="h-5 w-5 text-gray-400" />;
    }
    if (rank === 3) {
      return <Trophy className="h-5 w-5 text-amber-700" />;
    }
    return <span className="text-slate-400 font-bold">#{rank}</span>;
  };

  const getRankBgColor = (rank: number) => {
    if (rank === 1) return "bg-amber-900/30";
    if (rank === 2) return "bg-slate-800/50";
    if (rank === 3) return "bg-amber-800/30";
    return "bg-slate-900/30";
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
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <XCircle className="w-12 h-12 text-destructive mx-auto" />
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-yellow-400" />
                  Admin Wager Race
                </h1>
                <p className="text-muted-foreground mt-2">
                  Suivez les mises des joueurs et validez les récompenses mensuelles
                </p>
              </div>
            </div>

            {/* Month Selector */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    fetchDetails(e.target.value);
                  }}
                  className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  {getAvailableMonths().map((month) => {
                    const date = new Date(month + "-01");
                    const monthName = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
                    return (
                      <option key={month} value={month}>
                        {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                      </option>
                    );
                  })}
                </select>
              </div>

              {data && (
                <Button
                  onClick={handleValidateRewards}
                  disabled={validating || data.details.filter(d => d.rank <= 3 && !d.rewardsValidated).length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {validating ? (
                    "Validation..."
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Valider les récompenses
                    </>
                  )}
                </Button>
              )}

              {validationResult && (
                <div className={cn(
                  "px-4 py-2 rounded-lg",
                  validationResult.includes("Erreur") ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                )}>
                  {validationResult}
                </div>
              )}
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chargement des détails...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-400">Erreur: {error}</p>
            </div>
          )}

          {data && (
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-400 text-2xl">
                  <Trophy className="h-6 w-6" />
                  Classement Wager - {data.monthName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.details.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400">
                      Aucun wager enregistré pour ce mois.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data.details.map((entry) => (
                      <div
                        key={entry.userId}
                        className={cn(
                          "border border-slate-800/50 rounded-lg overflow-hidden transition-all",
                          getRankBgColor(entry.rank)
                        )}
                      >
                        {/* Header Row */}
                        <div
                          className="flex items-center p-4 cursor-pointer hover:bg-slate-800/30"
                          onClick={() => toggleUserExpanded(entry.userId)}
                        >
                          <div className="w-16 flex items-center justify-center">
                            {getRankIcon(entry.rank)}
                          </div>
                          <div className="flex-1 flex items-center gap-3">
                            <Avatar className="w-10 h-10 border-2 border-slate-600">
                              {entry.avatar ? (
                                <AvatarImage
                                  src={entry.avatar}
                                  alt={entry.username}
                                  className="object-cover"
                                />
                              ) : null}
                              <AvatarFallback className="bg-slate-700 text-slate-300 text-sm font-semibold">
                                {entry.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="text-white font-medium">
                                {entry.global_name || entry.username}
                              </div>
                              <div className="text-sm text-slate-400">
                                {entry.betCount} mise(s)
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <Coins className="h-5 w-5 text-yellow-500" />
                                <span className="text-white font-semibold">
                                  {entry.totalWager.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                              {entry.rank <= 3 && (
                                <div className="text-sm text-yellow-400 mt-1">
                                  Récompense: {getReward(entry.rank)} pts
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {entry.rewardsValidated && entry.rank <= 3 && (
                                <CheckCircle2 className="h-5 w-5 text-green-400" title="Récompense validée" />
                              )}
                              {expandedUsers.has(entry.userId) ? (
                                <ChevronUp className="h-5 w-5 text-slate-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedUsers.has(entry.userId) && (
                          <div className="border-t border-slate-800/50 bg-slate-900/50 p-4">
                            <div className="mb-3">
                              <h4 className="text-sm font-semibold text-slate-300 mb-2">
                                Historique des mises ({entry.bets.length})
                              </h4>
                            </div>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                              {entry.bets.length === 0 ? (
                                <p className="text-slate-400 text-sm">Aucune mise enregistrée</p>
                              ) : (
                                entry.bets.map((bet, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                      <div>
                                        <div className="text-white font-medium text-sm">
                                          {bet.game}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                          {new Date(bet.date).toLocaleString('fr-FR')}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Coins className="h-4 w-4 text-yellow-500" />
                                      <span className="text-white font-semibold text-sm">
                                        {bet.amount.toLocaleString(undefined, {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminWagerRace;

