import { useState } from "react";
import { Card as UiCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePoints } from "@/hooks/usePoints";
import { motion, AnimatePresence } from "framer-motion";

export interface RockPaperScissorsCopy {
  title: string;
  description: string;
  labels: {
    betAmount: string;
    choose: string;
    result: string;
    balance: string;
  };
  actions: {
    rock: string;
    paper: string;
    scissors: string;
    play: string;
  };
  results: {
    win: string;
    lose: string;
    tie: string;
    playerChoice: string;
    computerChoice: string;
  };
  sidebar: {
    balance: string;
    bet: string;
    half: string;
    double: string;
    historyTitle: string;
    historyEmpty: string;
    insufficientBalance: string;
    roundInProgress: string;
  };
}

type Choice = "rock" | "paper" | "scissors";
type GameStatus = "idle" | "playing" | "finished";

interface RPSHistoryEntry {
  id: number;
  playerChoice: Choice;
  computerChoice: Choice;
  result: "win" | "lose" | "tie";
  net: number;
  timestamp: number;
}

const INITIAL_BET = 10;
const MIN_BET = 1;
const MULTIPLIER = 2.0;

const roundToTwo = (value: number) => Math.round(value * 100) / 100;

// Détermine le résultat du jeu
const getGameResult = (player: Choice, computer: Choice): "win" | "lose" | "tie" => {
  if (player === computer) return "tie";
  
  if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && computer === "rock") ||
    (player === "scissors" && computer === "paper")
  ) {
    return "win";
  }
  
  return "lose";
};

// Génère un choix pour l'ordinateur avec 55% de chance de gagner (serveur) et 45% de chance de perdre (joueur)
// Permet aussi les égalités (environ 10% de chance)
const generateComputerChoice = (playerChoice: Choice): Choice => {
  const random = Math.random();
  
  // Environ 10% de chance d'égalité
  if (random < 0.10) {
    return playerChoice; // Égalité
  }
  
  // Sur les 90% restants, on veut 55% serveur et 45% joueur
  // Pour avoir exactement 55% serveur et 45% joueur au total :
  // Sur les 90% de non-égalités, on ajuste : 55/90 = 61.11% serveur, 45/90 = 50% joueur
  // Mais cela fait 111.11%, donc on normalise différemment :
  // On veut que sur 100% : 55% serveur, 45% joueur, donc sur 90% : 55% et 45% proportionnellement
  // Solution : sur les 90%, on fait 55/(55+45) = 55% serveur et 45/(55+45) = 45% joueur
  const nonTieRandom = (random - 0.10) / 0.90; // Normaliser entre 0 et 1
  
  // Sur les non-égalités : 55% serveur, 45% joueur (55/(55+45) = 0.55)
  if (nonTieRandom < 0.55) {
    // Serveur gagne
    switch (playerChoice) {
      case "rock": return "paper"; // Paper bat Rock
      case "paper": return "scissors"; // Scissors bat Paper
      case "scissors": return "rock"; // Rock bat Scissors
    }
  } else {
    // Joueur gagne
    switch (playerChoice) {
      case "rock": return "scissors"; // Scissors perd contre Rock
      case "paper": return "rock"; // Rock perd contre Paper
      case "scissors": return "paper"; // Paper perd contre Scissors
    }
  }
};

interface RockPaperScissorsGameProps {
  copy: RockPaperScissorsCopy;
  showHeader?: boolean;
}

export const RockPaperScissorsGame = ({
  copy,
  showHeader = true,
}: RockPaperScissorsGameProps) => {
  const { points, loading: pointsLoading, addPoints, subtractPoints, refreshPoints } = usePoints();
  const balance = points;
  const [bet, setBet] = useState<number>(INITIAL_BET);
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [result, setResult] = useState<"win" | "lose" | "tie" | null>(null);
  const [history, setHistory] = useState<RPSHistoryEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startDisabled = bet < MIN_BET || bet > balance || gameStatus === "playing";

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

  const startGame = () => {
    if (bet < MIN_BET || balance < bet) {
      setErrorMessage(copy.sidebar.insufficientBalance);
      return;
    }
    if (pointsLoading) {
      setErrorMessage("Chargement des points...");
      return;
    }

    setErrorMessage(null);
    setGameStatus("playing");
    setComputerChoice(null);
    setResult(null);
    setPlayerChoice(null);
  };

  const handleChoice = async (choice: Choice) => {
    if (gameStatus !== "playing") return;
    
    setPlayerChoice(choice);
    
    // Débiter les points maintenant que le choix est fait
    const success = await subtractPoints(Math.round(bet * 100) / 100, "Rock Paper Scissors: mise");
    if (!success) {
      setErrorMessage("Erreur lors du débit des points");
      setGameStatus("idle");
      setPlayerChoice(null);
      return;
    }

    const roundId = Date.now();

    // Animation avant de révéler le choix de l'ordinateur
    setTimeout(async () => {
      const computer = generateComputerChoice(choice);
      const gameResult = getGameResult(choice, computer);
      
      setComputerChoice(computer);
      setResult(gameResult);
      setGameStatus("finished");

      if (gameResult === "win") {
        // Gain = mise × 2.00
        const payout = roundToTwo(bet * MULTIPLIER);
        const net = roundToTwo(payout - bet);
        
        addPoints(Math.round(payout * 100) / 100, `Rock Paper Scissors: Victoire`).then(() => {
          refreshPoints();
        });
        
        setHistory((prev) => [
          {
            id: roundId,
            playerChoice: choice,
            computerChoice: computer,
            result: "win",
            net,
            timestamp: Date.now(),
          },
          ...prev,
        ].slice(0, 4));
      } else if (gameResult === "lose") {
        // Perte = mise déjà débitée
        setHistory((prev) => [
          {
            id: roundId,
            playerChoice: choice,
            computerChoice: computer,
            result: "lose",
            net: -bet,
            timestamp: Date.now(),
          },
          ...prev,
        ].slice(0, 4));
      } else {
        // Égalité : rembourser la mise et rejouer automatiquement
        await addPoints(Math.round(bet * 100) / 100, `Rock Paper Scissors: égalité - remboursement`);
        await refreshPoints();
        
        setHistory((prev) => [
          {
            id: roundId,
            playerChoice: choice,
            computerChoice: computer,
            result: "tie",
            net: 0,
            timestamp: Date.now(),
          },
          ...prev,
        ].slice(0, 4));

        // Rejouer automatiquement après égalité
        setTimeout(() => {
          setGameStatus("idle");
          setComputerChoice(null);
          setResult(null);
          // Le joueur garde son choix, on peut rejouer directement
        }, 2000);
        return;
      }

      // Réinitialiser après 3 secondes (sauf en cas d'égalité)
      setTimeout(() => {
        setGameStatus("idle");
        setComputerChoice(null);
        setResult(null);
        setPlayerChoice(null);
      }, 3000);
    }, 1000);
  };

  const getChoiceImage = (choice: Choice | null): string => {
    if (!choice) return "";
    switch (choice) {
      case "rock": return "/P.png";
      case "paper": return "/F.png";
      case "scissors": return "/C.png";
    }
  };

  const getChoiceLabel = (choice: Choice): string => {
    switch (choice) {
      case "rock": return copy.actions.rock;
      case "paper": return copy.actions.paper;
      case "scissors": return copy.actions.scissors;
    }
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
                        disabled={gameStatus === "playing"}
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
                              disabled={gameStatus === "playing"}
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
                              disabled={gameStatus === "playing"}
                            >
                              <div className="text-white group-active:scale-95">x2</div>
                            </button>
                            <div className="h-full w-px bg-white/10"></div>
                            <button
                              type="button"
                              className="group h-full w-[40%] touch-manipulation rounded-r-md px-4 py-2.5 duration-150 hover:bg-white/10 hover:text-white md:py-2.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => setBet(Math.min(balance))}
                              disabled={gameStatus === "playing"}
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

              {/* Play Button */}
              <Button
                onClick={startGame}
                disabled={startDisabled}
                size="lg"
                className="w-full rounded-2xl bg-green-500 py-4 text-base font-semibold tracking-wide text-white transition hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {gameStatus === "playing" ? "..." : copy.actions.play}
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
                    <span className="font-medium text-slate-200 flex items-center gap-2">
                      <img 
                        src={getChoiceImage(entry.playerChoice)} 
                        alt={getChoiceLabel(entry.playerChoice)}
                        className="w-6 h-6 object-contain"
                      />
                      <span>{getChoiceLabel(entry.playerChoice)}</span>
                      <span>vs</span>
                      <img 
                        src={getChoiceImage(entry.computerChoice)} 
                        alt={getChoiceLabel(entry.computerChoice)}
                        className="w-6 h-6 object-contain"
                      />
                      <span>{getChoiceLabel(entry.computerChoice)}</span>
                    </span>
                    <span
                      className={cn(
                        "font-semibold",
                        entry.result === "win"
                          ? "text-emerald-400"
                          : entry.result === "lose"
                          ? "text-rose-400"
                          : "text-slate-400"
                      )}
                    >
                      {entry.result === "win" ? "+" : entry.result === "lose" ? "-" : ""}
                      {entry.net !== 0 && entry.net.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      {entry.net === 0 && "0.00"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Game Area */}
          <section className="relative flex flex-col items-center justify-center overflow-hidden rounded-[36px] border border-[#112233] bg-[#0a1a2b] px-6 py-8 shadow-inner">
            {/* Choice Selection */}
            <div className="w-full max-w-2xl space-y-6">
              {gameStatus === "playing" && (
                <h2 className="text-2xl font-semibold text-white text-center mb-4">
                  {copy.labels.choose}
                </h2>
              )}
              {gameStatus === "finished" && (
                <h2 className="text-2xl font-semibold text-white text-center mb-4">
                  {copy.labels.result}
                </h2>
              )}

              <div className="grid grid-cols-3 gap-6">
                {/* Rock */}
                <motion.button
                  whileHover={{ scale: gameStatus === "playing" ? 1.05 : 1 }}
                  whileTap={{ scale: gameStatus === "playing" ? 0.95 : 1 }}
                  onClick={() => handleChoice("rock")}
                  disabled={gameStatus !== "playing"}
                  className={cn(
                    "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 p-8 transition-all",
                    playerChoice === "rock"
                      ? "border-teal-400 bg-teal-400/10"
                      : "border-white/10 bg-[#1b3146]/80",
                    gameStatus === "playing" 
                      ? "hover:border-white/20 cursor-pointer" 
                      : "opacity-50 cursor-not-allowed"
                  )}
                >
                  <img 
                    src="/P.png" 
                    alt={copy.actions.rock}
                    className="w-20 h-20 object-contain"
                  />
                  <span className="text-lg font-semibold text-white">
                    {copy.actions.rock}
                  </span>
                </motion.button>

                {/* Paper */}
                <motion.button
                  whileHover={{ scale: gameStatus === "playing" ? 1.05 : 1 }}
                  whileTap={{ scale: gameStatus === "playing" ? 0.95 : 1 }}
                  onClick={() => handleChoice("paper")}
                  disabled={gameStatus !== "playing"}
                  className={cn(
                    "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 p-8 transition-all",
                    playerChoice === "paper"
                      ? "border-teal-400 bg-teal-400/10"
                      : "border-white/10 bg-[#1b3146]/80",
                    gameStatus === "playing" 
                      ? "hover:border-white/20 cursor-pointer" 
                      : "opacity-50 cursor-not-allowed"
                  )}
                >
                  <img 
                    src="/F.png" 
                    alt={copy.actions.paper}
                    className="w-20 h-20 object-contain"
                  />
                  <span className="text-lg font-semibold text-white">
                    {copy.actions.paper}
                  </span>
                </motion.button>

                {/* Scissors */}
                <motion.button
                  whileHover={{ scale: gameStatus === "playing" ? 1.05 : 1 }}
                  whileTap={{ scale: gameStatus === "playing" ? 0.95 : 1 }}
                  onClick={() => handleChoice("scissors")}
                  disabled={gameStatus !== "playing"}
                  className={cn(
                    "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 p-8 transition-all",
                    playerChoice === "scissors"
                      ? "border-teal-400 bg-teal-400/10"
                      : "border-white/10 bg-[#1b3146]/80",
                    gameStatus === "playing" 
                      ? "hover:border-white/20 cursor-pointer" 
                      : "opacity-50 cursor-not-allowed"
                  )}
                >
                  <img 
                    src="/C.png" 
                    alt={copy.actions.scissors}
                    className="w-20 h-20 object-contain"
                  />
                  <span className="text-lg font-semibold text-white">
                    {copy.actions.scissors}
                  </span>
                </motion.button>
              </div>

              {/* Result Display */}
              <AnimatePresence>
                {gameStatus === "finished" && computerChoice && result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-8 space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <p className="text-sm text-slate-400 mb-2">{copy.results.playerChoice}</p>
                        <div className="mb-2 flex justify-center">
                          <img 
                            src={getChoiceImage(playerChoice)} 
                            alt={playerChoice ? getChoiceLabel(playerChoice) : ""}
                            className="w-16 h-16 object-contain"
                          />
                        </div>
                        <p className="text-lg font-semibold text-white">
                          {playerChoice && getChoiceLabel(playerChoice)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-400 mb-2">{copy.results.computerChoice}</p>
                        <div className="mb-2 flex justify-center">
                          <img 
                            src={getChoiceImage(computerChoice)} 
                            alt={getChoiceLabel(computerChoice)}
                            className="w-16 h-16 object-contain"
                          />
                        </div>
                        <p className="text-lg font-semibold text-white">
                          {getChoiceLabel(computerChoice)}
                        </p>
                      </div>
                    </div>

                    <div className="text-center">
                      <p
                        className={cn(
                          "text-2xl font-bold",
                          result === "win"
                            ? "text-emerald-400"
                            : result === "lose"
                            ? "text-rose-400"
                            : "text-slate-400"
                        )}
                      >
                        {result === "win"
                          ? `✓ ${copy.results.win}`
                          : result === "lose"
                          ? `✗ ${copy.results.lose}`
                          : `⚪ ${copy.results.tie}`}
                      </p>
                      {result === "win" && (
                        <p className="text-lg text-emerald-400 mt-2">
                          +{roundToTwo(bet * MULTIPLIER - bet).toFixed(2)} pts
                        </p>
                      )}
                      {result === "tie" && (
                        <p className="text-sm text-slate-400 mt-2">
                          {copy.results.tie} - Rejouer automatiquement
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </CardContent>
    </UiCard>
  );
};

export default RockPaperScissorsGame;

