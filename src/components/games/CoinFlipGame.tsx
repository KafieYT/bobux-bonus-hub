import { useEffect, useState } from "react";
import { Card as UiCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePoints } from "@/hooks/usePoints";
import { motion, AnimatePresence } from "framer-motion";

export interface CoinFlipCopy {
  title: string;
  description: string;
  labels: {
    bet: string;
    choose: string;
    result: string;
    status: {
      idle: string;
      flipping: string;
      finished: string;
    };
    results: {
      win: string;
      lose: string;
    };
  };
      actions: {
        heads: string;
        tails: string;
        flip: string;
        random: string;
      };
      sidebar: {
        balance: string;
        bet: string;
        start: string;
        half: string;
        double: string;
        historyTitle: string;
        historyEmpty: string;
        insufficientBalance: string;
        roundInProgress: string;
        resultLabels: {
          win: string;
          lose: string;
        };
      };
}

type GameStatus = "idle" | "flipping" | "finished";

type CoinSide = "heads" | "tails";

interface CoinFlipState {
  status: GameStatus;
  playerChoice: CoinSide | null;
  result: CoinSide | null;
  roundId: number | null;
  payoutDelta: number;
  totalStake: number;
  won: boolean | null;
}

interface CoinFlipHistoryEntry {
  id: number;
  choice: CoinSide;
  result: CoinSide;
  net: number;
  won: boolean;
  timestamp: number;
}

const INITIAL_BET = 10;
const MIN_BET = 1;
const MAX_HISTORY = 5;

const roundToTwo = (value: number) => Math.round(value * 100) / 100;

// Génère un résultat avec 60% de chance serveur / 40% de chance joueur
const generateResultWithOdds = (playerChoice: CoinSide): CoinSide => {
  const random = Math.random();
  // 40% de chance que le joueur gagne (donc le résultat correspond à son choix)
  if (random < 0.4) {
    return playerChoice;
  }
  // 60% de chance que le serveur gagne (donc le résultat est l'opposé)
  return playerChoice === "heads" ? "tails" : "heads";
};

const createIdleState = (): CoinFlipState => ({
  status: "idle",
  playerChoice: null,
  result: null,
  roundId: null,
  payoutDelta: 0,
  totalStake: 0,
  won: null,
});

interface CoinFlipGameProps {
  copy: CoinFlipCopy;
  showHeader?: boolean;
}

export const CoinFlipGame = ({
  copy,
  showHeader = true,
}: CoinFlipGameProps) => {
  const { points, loading: pointsLoading, addPoints, subtractPoints, refreshPoints } = usePoints();
  const balance = points;
  const [bet, setBet] = useState<number>(INITIAL_BET);
  const [game, setGame] = useState<CoinFlipState>(() => createIdleState());
  const [history, setHistory] = useState<CoinFlipHistoryEntry[]>([]);
  const [lastResolvedRoundId, setLastResolvedRoundId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  const startDisabled =
    bet < MIN_BET || bet > balance || game.status === "flipping" || game.status === "finished";

  const adjustBet = (multiplier: number) => {
    setBet((prev) => {
      if (prev <= 0) return prev;
      const next = roundToTwo(prev * multiplier);
      if (next < MIN_BET) return MIN_BET;
      if (balance <= 0) return MIN_BET;
      return Math.min(next, balance);
    });
  };

  const handleBetInput = (value: string) => {
    const parsed = parseFloat(value.replace(",", "."));
    if (Number.isNaN(parsed)) {
      setBet(0);
      return;
    }
    const sanitized = roundToTwo(parsed);
    if (balance <= 0) {
      setBet(Math.max(0, sanitized));
      return;
    }
    setBet(Math.max(MIN_BET, Math.min(sanitized, balance)));
  };

  const processRound = async (state: CoinFlipState) => {
    if (!state.roundId || state.won === null) return;
    setLastResolvedRoundId(state.roundId);
    const net = roundToTwo(state.payoutDelta - state.totalStake);
    
    // Mettre à jour les points selon le résultat
    if (state.payoutDelta > 0) {
      await addPoints(Math.round(state.payoutDelta * 100) / 100, `Pile ou Face: ${state.won ? "Victoire" : "Défaite"}`);
    }
    
    await refreshPoints();
    
    setHistory((prev) => [
      {
        id: state.roundId!,
        choice: state.playerChoice!,
        result: state.result!,
        net,
        won: state.won,
        timestamp: Date.now(),
      },
      ...prev,
    ].slice(0, MAX_HISTORY));
  };

  const startNewRound = async (choice: CoinSide) => {
    if (game.status === "flipping") {
      setErrorMessage(copy.sidebar.roundInProgress);
      return;
    }
    if (bet < MIN_BET || balance < bet) {
      setErrorMessage(copy.sidebar.insufficientBalance);
      return;
    }
    if (pointsLoading) {
      setErrorMessage("Chargement des points...");
      return;
    }
    
    const nextRoundId = Date.now();
    setErrorMessage(null);
    
    // Débiter les points
    const success = await subtractPoints(Math.round(bet * 100) / 100, "Pile ou Face: mise");
    if (!success) {
      setErrorMessage("Erreur lors du débit des points");
      return;
    }
    
    // Générer le résultat avec les cotes 60% serveur / 40% joueur
    const result = generateResultWithOdds(choice);
    const won = result === choice;
    
    // Calculer le payout
    const payoutDelta = won ? bet * 2 : 0; // Si gagné, on récupère la mise + le gain (2x)
    
    // État initial
    setGame({
      status: "idle",
      playerChoice: choice,
      result: null,
      roundId: nextRoundId,
      payoutDelta: 0,
      totalStake: bet,
      won: null,
    });
    
    setLastResolvedRoundId(null);
    
    // Démarrer l'animation de flip
    setIsFlipping(true);
    setGame((prev) => ({ ...prev, status: "flipping" }));
    
    // Animation de flip (2 secondes)
    setTimeout(() => {
      setGame((prev) => ({
        ...prev,
        result,
        status: "finished",
        payoutDelta,
        won,
      }));
      setIsFlipping(false);
    }, 2000);
  };

  useEffect(() => {
    if (
      game.status === "finished" &&
      game.roundId &&
      game.roundId !== lastResolvedRoundId &&
      game.won !== null
    ) {
      processRound(game);
    }
  }, [game, lastResolvedRoundId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRandomChoice = () => {
    const randomChoice: CoinSide = Math.random() < 0.5 ? "heads" : "tails";
    startNewRound(randomChoice);
  };

  const currentStatusLabel = () => {
    switch (game.status) {
      case "flipping":
        return copy.labels.status.flipping;
      case "finished":
        return copy.labels.status.finished;
      default:
        return copy.labels.status.idle;
    }
  };

  const renderCoin = () => {
    const showResult = game.status === "finished" && game.result !== null;
    const isFlipping = game.status === "flipping";
    
    // Calculer la rotation finale pour que la bonne face soit visible
    const finalRotation = showResult 
      ? (game.result === "heads" ? 0 : 180)
      : (game.playerChoice === "heads" ? 0 : 180);
    
    return (
      <motion.div
        className="relative w-48 h-48 md:w-64 md:h-64 mx-auto"
        style={{ perspective: 1000 }}
      >
        <motion.div
          className="relative w-full h-full"
          style={{
            transformStyle: "preserve-3d",
          }}
          animate={{
            rotateY: isFlipping 
              ? [finalRotation, finalRotation + 360, finalRotation + 720, finalRotation + 1080, finalRotation + 1440]
              : finalRotation,
          }}
          transition={{
            duration: isFlipping ? 2 : 0,
            ease: "easeInOut",
          }}
        >
          {/* Face avant (Pile/Heads) */}
          <div
            className="absolute w-full h-full rounded-full flex items-center justify-center overflow-hidden bg-transparent"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(0deg)",
            }}
          >
            <img 
              src="/ChevalPile.png" 
              alt="Pile" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Face arrière (Face/Tails) */}
          <div
            className="absolute w-full h-full rounded-full flex items-center justify-center overflow-hidden bg-transparent"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <img 
              src="/LapinFace.png" 
              alt="Face" 
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
        
        {/* Indicateur du résultat */}
        {showResult && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "absolute -bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm md:text-base font-bold",
              game.won
                ? "bg-green-500/90 text-white"
                : "bg-red-500/90 text-white"
            )}
          >
            {game.won ? copy.labels.results.win : copy.labels.results.lose}
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <UiCard className="flex min-h-[calc(100vh-200px)] flex-col border border-white/8 bg-[#081423]/95 text-slate-100 shadow-[0_35px_120px_-70px_rgba(4,18,36,0.9)]">
      {showHeader && (
        <CardHeader className="space-y-2 border-b border-white/5 pb-6">
          <CardTitle className="text-3xl font-semibold tracking-tight text-white">
            {copy.title}
          </CardTitle>
          <p className="max-w-2xl text-sm text-slate-400">{copy.description}</p>
        </CardHeader>
      )}
      <CardContent className={cn("flex flex-1 flex-col pt-8", !showHeader ? "pt-6" : "")}>
        <div className="grid flex-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-stretch">
          <aside className="space-y-6 self-start">
            <div className="rounded-3xl border border-white/10 bg-[#15293b]/90 p-6 shadow-none space-y-6">
              <div className="rounded-2xl border border-white/8 bg-[#162c41]/95 p-4">
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                  {copy.sidebar.balance}
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {pointsLoading ? (
                    <span className="text-sm text-slate-400">Chargement...</span>
                  ) : (
                    balance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) + " pts"
                  )}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-slate-400">
                  <span>{copy.sidebar.bet}</span>
                </div>
                <div className="relative">
                  <div className="group relative flex items-center rounded-sm border-2 border-white/10 bg-[#1b3146]/80 shadow-sm transition-all focus-within:border-teal-400 hover:border-white/20">
                    <div className="flex-none px-3">
                      <span className="text-sm font-semibold text-slate-300 md:text-base">pts</span>
                    </div>
                    
                    <div className="flex flex-1 items-center">
                      <input
                        type="number"
                        step="0.01"
                        min={MIN_BET}
                        max={Math.min(100, balance)}
                        value={bet}
                        onChange={(e) => handleBetInput(e.target.value)}
                        onBlur={(e) => {
                          const value = e.target.value === "" ? MIN_BET : parseFloat(e.target.value);
                          const roundedValue = isNaN(value) ? MIN_BET : Math.max(MIN_BET, Math.min(100, Math.min(balance, Math.round(value * 100) / 100)));
                          handleBetInput(roundedValue.toString());
                        }}
                        placeholder="0"
                        className="peer block w-full rounded-lg bg-transparent py-2.5 text-base font-semibold text-white outline-0 placeholder:text-slate-500 focus:outline-0"
                        disabled={game.status === "flipping" || game.status === "finished"}
                      />
                    </div>
                    
                    <div className="relative right-0 flex h-full flex-none items-center justify-center">
                      <div className="flex h-full items-center">
                        <div className="h-full min-w-[127px] rounded-r-sm bg-[#15293b] text-sm font-semibold text-slate-300 lg:text-base" style={{ zIndex: 20 }}>
                          <div className="z-30 flex h-full w-full flex-row items-center justify-between">
                            <button
                              type="button"
                              className="group h-full w-[30%] touch-manipulation px-4 py-2.5 duration-150 hover:bg-white/10 hover:text-white md:py-2.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => {
                                const newBet = Math.max(MIN_BET, Math.round((bet / 2) * 100) / 100);
                                setBet(newBet);
                              }}
                              disabled={game.status === "flipping" || game.status === "finished"}
                            >
                              <div className="text-white group-active:scale-95">½</div>
                            </button>
                            <div className="h-full w-px bg-white/10"></div>
                            <button
                              type="button"
                              className="group h-full w-[30%] touch-manipulation px-4 py-2.5 duration-150 hover:bg-white/10 hover:text-white md:py-2.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => {
                                const newBet = Math.min(100, Math.min(balance, bet * 2));
                                setBet(newBet);
                              }}
                              disabled={game.status === "flipping" || game.status === "finished"}
                            >
                              <div className="text-white group-active:scale-95">x2</div>
                            </button>
                            <div className="h-full w-px bg-white/10"></div>
                            <button
                              type="button"
                              className="group h-full w-[40%] touch-manipulation rounded-r-md px-4 py-2.5 duration-150 hover:bg-white/10 hover:text-white md:py-2.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => setBet(Math.min(100, balance))}
                              disabled={game.status === "flipping" || game.status === "finished"}
                            >
                              <div className="whitespace-nowrap text-white group-active:scale-95">Max</div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 75, 100].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      className="border-white/10 bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        const newBet = Math.min(amount, balance, 100);
                        setBet(newBet);
                      }}
                      disabled={game.status === "flipping" || game.status === "finished" || amount > balance}
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
              </div>

              {errorMessage && (
                <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                  {errorMessage}
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#15293b]/90 p-6 shadow-none">
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                {copy.sidebar.historyTitle}
              </p>
              <div className="mt-4 space-y-3">
                {history.length === 0 && (
                  <p className="text-sm text-slate-500">
                    {copy.sidebar.historyEmpty}
                  </p>
                )}
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#182f44]/80 px-4 py-3 text-sm font-medium"
                  >
                    <span className="font-medium text-slate-200">
                      {entry.choice === "heads" ? copy.actions.heads : copy.actions.tails} → {entry.result === "heads" ? copy.actions.heads : copy.actions.tails}
                    </span>
                    <span
                      className={cn(
                        "font-semibold",
                        entry.won
                          ? "text-emerald-400"
                          : "text-rose-400"
                      )}
                    >
                      {entry.won ? "+" : ""}
                      {entry.net.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="relative flex flex-col items-center justify-center overflow-hidden rounded-[36px] border border-[#112233] bg-[#081a2b] px-6 py-14 shadow-inner sm:px-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {game.status === "idle" ? copy.labels.choose : copy.labels.result}
              </h2>
              {game.status === "finished" && game.result && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-slate-400">{copy.labels.result}:</span>
                  <img 
                    src={game.result === "heads" ? "/ChevalPile.png" : "/LapinFace.png"}
                    alt={game.result === "heads" ? copy.actions.heads : copy.actions.tails}
                    className="w-8 h-8 object-cover rounded-full"
                  />
                </div>
              )}
            </div>

            <div className="mb-12">
              {renderCoin()}
            </div>

            {game.status === "idle" && (
              <div className="flex gap-4 flex-wrap justify-center">
                <Button
                  onClick={() => startNewRound("heads")}
                  disabled={startDisabled}
                  size="lg"
                  className="min-w-[150px] rounded-2xl bg-gradient-to-br from-[#3862ff] to-[#214de0] text-white transition-transform hover:scale-[1.03] hover:from-[#4670ff] hover:to-[#2a58ea]"
                >
                  {copy.actions.heads}
                </Button>
                <Button
                  onClick={handleRandomChoice}
                  disabled={startDisabled}
                  size="lg"
                  className="min-w-[150px] rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] text-white transition-transform hover:scale-[1.03] hover:from-[#8b5cf6] hover:to-[#6d28d9]"
                >
                  {copy.actions.random}
                </Button>
                <Button
                  onClick={() => startNewRound("tails")}
                  disabled={startDisabled}
                  size="lg"
                  className="min-w-[150px] rounded-2xl bg-gradient-to-br from-[#3862ff] to-[#214de0] text-white transition-transform hover:scale-[1.03] hover:from-[#4670ff] hover:to-[#2a58ea]"
                >
                  {copy.actions.tails}
                </Button>
              </div>
            )}

            {(game.status === "flipping" || game.status === "finished") && (
              <div className="mt-6 text-center">
                <Button
                  onClick={() => {
                    setGame(createIdleState());
                    setErrorMessage(null);
                  }}
                  size="lg"
                  className="min-w-[200px] rounded-2xl bg-gradient-to-br from-[#3862ff] to-[#214de0] text-white transition-transform hover:scale-[1.03]"
                >
                  {copy.sidebar.start}
                </Button>
              </div>
            )}

            <div className="mt-10 text-center text-xs uppercase tracking-[0.3em] text-slate-500">
              {currentStatusLabel()}
            </div>
          </section>
        </div>
      </CardContent>
    </UiCard>
  );
};

export default CoinFlipGame;

