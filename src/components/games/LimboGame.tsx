import { useEffect, useState, useRef } from "react";
import { Card as UiCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePoints } from "@/hooks/usePoints";
import { motion } from "framer-motion";

export interface LimboCopy {
  title: string;
  description: string;
  labels: {
    betAmount: string;
    profitOnWin: string;
    targetMultiplier: string;
    winChance: string;
    balance: string;
  };
  actions: {
    bet: string;
    cashOut: string;
    manual: string;
    auto: string;
  };
  sidebar: {
    balance: string;
    bet: string;
    half: string;
    double: string;
    historyTitle: string;
    historyEmpty: string;
    insufficientBalance: string;
  };
}

type GameStatus = "idle" | "rolling" | "finished";

interface LimboHistoryEntry {
  id: number;
  multiplier: number;
  won: boolean;
  net: number;
  timestamp: number;
}

const INITIAL_BET = 10;
const MIN_BET = 1;
const MAX_MULTIPLIER = 1000;
const ROLL_DURATION = 800; // ms pour l'animation

const roundToTwo = (value: number) => Math.round(value * 100) / 100;

// Calcule la probabilité de gagner pour un multiplicateur cible donné
// Formule standard: P(x) = 0.98 / x (RTP ~96%)
// Vérifications:
// - P(2) = 0.98 / 2 = 0.49 = 49% ✓
// - P(1000) = 0.98 / 1000 = 0.00098 = 0.098% ≈ 0.099% ✓
const calculateWinChance = (targetMultiplier: number): number => {
  if (targetMultiplier <= 0) return 0;
  // Formule standard pour Limbo: P(x) = 0.98 / x
  const winChance = 0.98 / targetMultiplier;
  // Limiter entre 0.0001% et 98%
  return Math.max(0.0001, Math.min(0.98, winChance)) * 100;
};

// Génère un multiplicateur aléatoire selon la distribution Limbo
// Utilise la distribution inverse de P(x) = 0.98 / x
// Distribution: P(X >= x) = 0.98 / x
// Pour générer selon cette distribution, on inverse:
// Si P(X >= x) = random, alors 0.98 / x = random, donc x = 0.98 / random
// 
// Vérifications:
// - Pour 2x: P(X >= 2) = 0.49, donc si random = 0.49, alors x = 0.98 / 0.49 = 2.0 ✓
// - Pour 1000x: P(X >= 1000) = 0.00098, donc si random = 0.00098, alors x = 0.98 / 0.00098 = 1000 ✓
const generateRandomMultiplier = (): number => {
  // Génération d'un nombre aléatoire entre 0 et 1
  // random doit être uniforme sur [0, 1] pour respecter la distribution
  let random = Math.random();
  
  // Éviter random = 0 pour éviter division par zéro
  // Utiliser une valeur très petite mais non nulle
  if (random === 0) {
    random = Number.MIN_VALUE;
  }
  
  // Calculer le multiplicateur selon la distribution inverse
  let multiplier = 0.98 / random;
  
  // Limiter entre 1.00 et MAX_MULTIPLIER
  // Si le multiplicateur dépasse MAX_MULTIPLIER, on le limite
  // Cela garantit que P(X >= MAX_MULTIPLIER) = 0.98 / MAX_MULTIPLIER ≈ 0.00098 = 0.099%
  multiplier = Math.max(1.00, Math.min(MAX_MULTIPLIER, multiplier));
  
  return roundToTwo(multiplier);
};

interface LimboGameProps {
  copy: LimboCopy;
  showHeader?: boolean;
}

export const LimboGame = ({
  copy,
  showHeader = true,
}: LimboGameProps) => {
  const { points, loading: pointsLoading, addPoints, subtractPoints, refreshPoints } = usePoints();
  const balance = points;
  const [bet, setBet] = useState<number>(INITIAL_BET);
  const [targetMultiplier, setTargetMultiplier] = useState<number>(2.0);
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [resultMultiplier, setResultMultiplier] = useState<number | null>(null);
  const [isWon, setIsWon] = useState<boolean | null>(null);
  const [history, setHistory] = useState<LimboHistoryEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [displayMultiplier, setDisplayMultiplier] = useState<number>(1.0);

  const profitOnWin = roundToTwo(bet * (targetMultiplier - 1)); // Profit net (gain - mise)
  const totalPayout = roundToTwo(bet * targetMultiplier); // Gain total
  const winChance = calculateWinChance(targetMultiplier);

  const startDisabled = bet < MIN_BET || bet > balance || gameStatus === "rolling" || gameStatus === "finished";

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

  const handleTargetMultiplierInput = (value: string) => {
    const parsed = parseFloat(value.replace(",", "."));
    if (Number.isNaN(parsed)) {
      setTargetMultiplier(1.0);
      return;
    }
    setTargetMultiplier(Math.max(1.01, Math.min(parsed, MAX_MULTIPLIER)));
  };

  const startGame = async () => {
    if (bet < MIN_BET || balance < bet) {
      setErrorMessage(copy.sidebar.insufficientBalance);
      return;
    }
    if (pointsLoading) {
      setErrorMessage("Chargement des points...");
      return;
    }

    setErrorMessage(null);
    
    // Débiter les points
    const success = await subtractPoints(Math.round(bet * 100) / 100, "Limbo: mise");
    if (!success) {
      setErrorMessage("Erreur lors du débit des points");
      return;
    }

    const roundId = Date.now();
    setGameStatus("rolling");
    setResultMultiplier(null);
    setIsWon(null);
    setDisplayMultiplier(1.0);

    // Animation de "roll" avec des nombres qui changent rapidement
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      rollCount++;
      // Afficher des multiplicateurs aléatoires pendant l'animation
      const randomMultiplier = 1.0 + Math.random() * 10;
      setDisplayMultiplier(roundToTwo(randomMultiplier));
      
      if (rollCount >= 15) {
        clearInterval(rollInterval);
        
        // Générer le résultat final
        const result = generateRandomMultiplier();
        const won = result >= targetMultiplier;
        
        setResultMultiplier(result);
        setIsWon(won);
        setDisplayMultiplier(result);
        setGameStatus("finished");

        if (won) {
          // Gain = mise × multiplicateur cible (pas le résultat)
          const payout = roundToTwo(bet * targetMultiplier);
          const net = roundToTwo(payout - bet);
          
          addPoints(Math.round(payout * 100) / 100, `Limbo: Victoire x${targetMultiplier.toFixed(2)}`).then(() => {
            refreshPoints();
          });
          
          setHistory((prev) => [
            {
              id: roundId,
              multiplier: roundToTwo(result),
              won: true,
              net,
              timestamp: Date.now(),
            },
            ...prev,
          ].slice(0, 3));
        } else {
          // Perte = mise déjà débitée
          setHistory((prev) => [
            {
              id: roundId,
              multiplier: roundToTwo(result),
              won: false,
              net: -bet,
              timestamp: Date.now(),
            },
            ...prev,
          ].slice(0, 3));
        }

        // Réinitialiser après 3 secondes
        setTimeout(() => {
          setGameStatus("idle");
          setResultMultiplier(null);
          setIsWon(null);
          setDisplayMultiplier(1.0);
        }, 3000);
      }
    }, ROLL_DURATION / 15);
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
        <div className="grid flex-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-stretch">
          {/* Left Control Panel */}
          <aside className="space-y-6 self-start">
            <div className="rounded-3xl border border-white/10 bg-[#15293b]/90 p-6 shadow-none space-y-6">
              {/* Balance */}
              <div className="rounded-2xl border border-white/8 bg-[#162c41]/95 p-4">
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                  {copy.sidebar.balance}
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {pointsLoading ? (
                    <span className="text-sm text-slate-400">Chargement...</span>
                  ) : (
                    balance.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }) + " pts"
                  )}
                </p>
              </div>

              {/* Bet Amount */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                    {copy.labels.betAmount}
                  </label>
                  <span className="text-xs text-slate-500">
                    {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pts
                  </span>
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
                        max={balance}
                        value={bet}
                        onChange={(e) => handleBetInput(e.target.value)}
                        onBlur={(e) => {
                          const value = e.target.value === "" ? MIN_BET : parseFloat(e.target.value);
                          handleBetInput(isNaN(value) ? MIN_BET.toString() : Math.max(MIN_BET, Math.min(balance, value)).toString());
                        }}
                        placeholder="0"
                        className="peer block w-full rounded-lg bg-transparent py-2.5 text-base font-semibold text-white outline-0 placeholder:text-slate-500 focus:outline-0"
                        disabled={gameStatus === "rolling" || gameStatus === "finished"}
                      />
                    </div>
                    <div className="relative right-0 flex h-full flex-none items-center justify-center">
                      <div className="flex h-full items-center">
                        <div className="h-full min-w-[127px] rounded-r-sm bg-[#15293b] text-sm font-semibold text-slate-300 lg:text-base">
                          <div className="z-30 flex h-full w-full flex-row items-center justify-between">
                            <button
                              type="button"
                              className="group h-full w-[30%] touch-manipulation px-4 py-2.5 duration-150 hover:bg-white/10 hover:text-white md:py-2.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => {
                                const newBet = Math.max(MIN_BET, Math.round((bet / 2) * 100) / 100);
                                setBet(newBet);
                              }}
                              disabled={gameStatus === "rolling" || gameStatus === "finished"}
                            >
                              <div className="text-white group-active:scale-95">½</div>
                            </button>
                            <div className="h-full w-px bg-white/10"></div>
                            <button
                              type="button"
                              className="group h-full w-[30%] touch-manipulation px-4 py-2.5 duration-150 hover:bg-white/10 hover:text-white md:py-2.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => {
                                const newBet = Math.min(balance, bet * 2);
                                setBet(newBet);
                              }}
                              disabled={gameStatus === "rolling" || gameStatus === "finished"}
                            >
                              <div className="text-white group-active:scale-95">x2</div>
                            </button>
                            <div className="h-full w-px bg-white/10"></div>
                            <button
                              type="button"
                              className="group h-full w-[40%] touch-manipulation rounded-r-md px-4 py-2.5 duration-150 hover:bg-white/10 hover:text-white md:py-2.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => setBet(Math.min(balance))}
                              disabled={gameStatus === "rolling" || gameStatus === "finished"}
                            >
                              <div className="whitespace-nowrap text-white group-active:scale-95">Max</div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profit on Win */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                    {copy.labels.profitOnWin}
                  </label>
                  <span className="text-xs text-slate-500">
                    {profitOnWin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pts
                  </span>
                </div>
                <div className="rounded-lg border-2 border-white/10 bg-[#1b3146]/80 px-4 py-3">
                  <p className="text-lg font-semibold text-white">
                    {profitOnWin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pts
                  </p>
                </div>
              </div>

              {/* Bet Button */}
              <Button
                onClick={startGame}
                disabled={startDisabled}
                size="lg"
                className="w-full rounded-2xl bg-green-500 py-4 text-base font-semibold tracking-wide text-white transition hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {gameStatus === "rolling" ? "..." : copy.actions.bet}
              </Button>

              {errorMessage && (
                <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                  {errorMessage}
                </p>
              )}
            </div>

            {/* History */}
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
                      {entry.multiplier.toFixed(2)}x
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

          {/* Right Display Area */}
          <section className="relative flex flex-col items-center justify-center overflow-hidden rounded-[36px] border border-[#112233] bg-[#0a1a2b] px-6 py-14 shadow-inner">
            {/* Main Multiplier Display */}
            <motion.div
              key={displayMultiplier}
              initial={{ scale: 1 }}
              animate={{ 
                scale: gameStatus === "rolling" ? [1, 1.1, 1] : gameStatus === "finished" ? [1, 1.2, 1] : 1 
              }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <p className={cn(
                "text-7xl md:text-9xl font-bold transition-colors",
                gameStatus === "finished" && isWon === false ? "text-red-500" : 
                gameStatus === "finished" && isWon === true ? "text-green-500" : 
                "text-white"
              )}>
                {displayMultiplier.toFixed(2)}x
              </p>
              {gameStatus === "finished" && resultMultiplier !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <p className={cn(
                    "text-xl font-semibold",
                    isWon ? "text-green-400" : "text-red-400"
                  )}>
                    {isWon ? "✓ Gagné !" : "✗ Perdu"}
                  </p>
                  <p className="text-sm text-slate-400 mt-2">
                    Cible: {targetMultiplier.toFixed(2)}x | Résultat: {resultMultiplier.toFixed(2)}x
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Bottom Controls */}
            <div className="mt-12 grid grid-cols-2 gap-6 w-full max-w-2xl">
              {/* Target Multiplier */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 block">
                  {copy.labels.targetMultiplier}
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    min="1.01"
                    max={MAX_MULTIPLIER}
                    value={targetMultiplier}
                    onChange={(e) => handleTargetMultiplierInput(e.target.value)}
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value);
                      setTargetMultiplier(isNaN(value) ? 2.0 : Math.max(1.01, Math.min(MAX_MULTIPLIER, value)));
                    }}
                    disabled={gameStatus === "rolling" || gameStatus === "finished"}
                    className="w-full rounded-lg border-2 border-white/10 bg-[#1b3146]/80 py-3 pr-12 pl-4 text-lg font-semibold text-white focus:border-teal-400 disabled:opacity-50 h-[52px]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-lg">x</span>
                </div>
              </div>

              {/* Win Chance */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 block">
                  {copy.labels.winChance}
                </label>
                <div className="rounded-lg border-2 border-white/10 bg-[#1b3146]/80 px-4 py-3 h-[52px] flex items-center">
                  <p className="text-lg font-semibold text-white w-full">
                    {winChance.toFixed(8)}%
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </CardContent>
    </UiCard>
  );
};

export default LimboGame;

