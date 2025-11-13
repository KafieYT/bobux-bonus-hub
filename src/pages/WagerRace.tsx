import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, Coins, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface WagerEntry {
  rank: number;
  userId: string;
  username: string;
  global_name: string;
  avatar: string | null;
  totalWager: number;
  betCount: number;
}

interface WagerStats {
  totalWager: number;
  totalBets: number;
  averageWager: number;
}

interface WagerLeaderboard {
  month: string;
  monthName: string;
  stats: WagerStats;
  leaderboard: WagerEntry[];
}

// Récompenses pour les 3 premiers
const getReward = (rank: number): number => {
  if (rank === 1) return 1000;
  if (rank === 2) return 900;
  if (rank === 3) return 850;
  return 0;
};

const WagerRace = () => {
  const [data, setData] = useState<WagerLeaderboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/wager/leaderboard");
        if (!response.ok) {
          throw new Error("Erreur lors du chargement du classement");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) {
      return <Crown className="h-6 w-6 text-yellow-400" />;
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="min-h-screen pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8 space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-400" />
              <h1 className="text-4xl md:text-5xl font-bold text-yellow-400">
                LEADERBOARD WAGER MENSUEL
              </h1>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-400">
              TOP 20 DES WAGERS
            </h2>
            <p className="text-slate-300 text-lg">
              Découvrez les joueurs qui ont wager le plus de points sur tous les jeux
            </p>
            {data && (
              <p className="text-yellow-400 text-xl font-semibold">
                {data.monthName}
              </p>
            )}
          </div>

          {loading && (
            <div className="text-center py-12">
              <p className="text-slate-400">Chargement du classement...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-400">Erreur: {error}</p>
            </div>
          )}

          {data && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="h-6 w-6 text-yellow-400" />
                      <span className="text-slate-300 font-medium">Total Wager</span>
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {data.stats.totalWager.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="h-6 w-6 text-green-400" />
                      <span className="text-slate-300 font-medium">Bets du Mois</span>
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {data.stats.totalBets.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Coins className="h-6 w-6 text-yellow-500" />
                      <span className="text-slate-300 font-medium">Moyenne Wager</span>
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {data.stats.averageWager.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Leaderboard */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-400 text-2xl">
                    <Trophy className="h-6 w-6" />
                    Classement Wager - {data.monthName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.leaderboard.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-400">
                        Aucun wager enregistré pour ce mois.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                              Rang
                            </th>
                            <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                              Joueur
                            </th>
                            <th className="text-right py-4 px-4 text-slate-300 font-semibold">
                              Wager Total
                            </th>
                            <th className="text-right py-4 px-4 text-slate-300 font-semibold">
                              Récompense
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.leaderboard.map((entry) => (
                            <tr
                              key={entry.userId}
                              className={cn(
                                "border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors",
                                getRankBgColor(entry.rank)
                              )}
                            >
                              <td className="py-4 px-4">
                                <div className="flex items-center">
                                  {getRankIcon(entry.rank)}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-12 h-12 border-2 border-slate-600 ring-2 ring-slate-700">
                                    {entry.avatar ? (
                                      <AvatarImage
                                        src={entry.avatar}
                                        alt={entry.username}
                                        className="object-cover"
                                        onError={(e) => {
                                          // Si l'image ne charge pas, afficher le fallback
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    ) : null}
                                    <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-slate-200 text-base font-bold border-2 border-slate-600">
                                      {entry.username.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="text-white font-medium">
                                      {entry.global_name || entry.username}
                                    </span>
                                    {entry.global_name && entry.global_name !== entry.username && (
                                      <span className="text-slate-400 text-xs">
                                        {entry.username}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Coins className="h-5 w-5 text-yellow-500" />
                                  <span className="text-white font-semibold">
                                    {entry.totalWager.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-right">
                                {getReward(entry.rank) > 0 ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <Coins className="h-5 w-5 text-yellow-500" />
                                    <span className="text-yellow-400 font-semibold">
                                      {getReward(entry.rank).toLocaleString()}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-500">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WagerRace;

