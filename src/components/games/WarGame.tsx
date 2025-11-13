import { useState, useEffect } from "react";
import { Card as UiCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePoints } from "@/hooks/usePoints";
import { motion, AnimatePresence } from "framer-motion";

export interface WarCopy {
  title: string;
  description: string;
  labels: {
    betAmount: string;
    balance: string;
    playerCards: string;
    computerCards: string;
    result: string;
  };
  actions: {
    play: string;
    newGame: string;
  };
  results: {
    win: string;
    lose: string;
    battle: string;
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

type Card = {
  suit: string;
  value: number;
  name: string;
};

type GameStatus = "idle" | "playing" | "battle" | "finished";
type GameResult = "win" | "lose" | null;

interface WarHistoryEntry {
  id: number;
  result: "win" | "lose";
  playerCards: number;
  computerCards: number;
  net: number;
  timestamp: number;
}

const INITIAL_BET = 10;
const MIN_BET = 1;
const MULTIPLIER = 2.0;
const MAX_TURNS = 200;

const roundToTwo = (value: number) => Math.round(value * 100) / 100;

// Crée un paquet de 52 cartes
const createDeck = (): Card[] => {
  const suits = ["♠", "♥", "♦", "♣"];
  const values = [
    { value: 2, name: "2" },
    { value: 3, name: "3" },
    { value: 4, name: "4" },
    { value: 5, name: "5" },
    { value: 6, name: "6" },
    { value: 7, name: "7" },
    { value: 8, name: "8" },
    { value: 9, name: "9" },
    { value: 10, name: "10" },
    { value: 11, name: "Valet" },
    { value: 12, name: "Dame" },
    { value: 13, name: "Roi" },
    { value: 14, name: "As" },
  ];

  const deck: Card[] = [];
  for (const suit of suits) {
    for (const val of values) {
      deck.push({ suit, value: val.value, name: val.name });
    }
  }

  // Mélanger le paquet
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

// Distribue 5 cartes à chaque joueur avec 55% de chance que le serveur ait de meilleures cartes
const dealCards = (deck: Card[]): [Card[], Card[]] => {
  let playerDeck: Card[] = deck.slice(0, 5);
  let computerDeck: Card[] = deck.slice(5, 10);
  
  // Calculer la valeur totale des cartes
  const playerTotal = playerDeck.reduce((sum, card) => sum + card.value, 0);
  const computerTotal = computerDeck.reduce((sum, card) => sum + card.value, 0);
  
  // 55% de chance que le serveur ait un avantage
  const serverShouldHaveAdvantage = Math.random() < 0.55;
  
  if (serverShouldHaveAdvantage && computerTotal < playerTotal) {
    // Le serveur doit avoir un avantage mais n'en a pas, on échange des cartes
    // Trier les cartes par valeur
    const allCards = [...playerDeck, ...computerDeck].sort((a, b) => b.value - a.value);
    
    // Donner les 5 meilleures cartes au serveur
    computerDeck = allCards.slice(0, 5);
    playerDeck = allCards.slice(5, 10);
  } else if (!serverShouldHaveAdvantage && computerTotal > playerTotal) {
    // Le serveur ne doit pas avoir d'avantage mais en a un, on échange des cartes
    const allCards = [...playerDeck, ...computerDeck].sort((a, b) => b.value - a.value);
    
    // Donner les 5 meilleures cartes au joueur
    playerDeck = allCards.slice(0, 5);
    computerDeck = allCards.slice(5, 10);
  }
  
  // Mélanger les paquets pour garder l'aléatoire
  const shuffle = (arr: Card[]) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  return [shuffle(playerDeck), shuffle(computerDeck)];
};

interface WarGameProps {
  copy: WarCopy;
  showHeader?: boolean;
}

export const WarGame = ({
  copy,
  showHeader = true,
}: WarGameProps) => {
  const { points, loading: pointsLoading, addPoints, subtractPoints, refreshPoints } = usePoints();
  const balance = points;
  const [bet, setBet] = useState<number>(INITIAL_BET);
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
  const [computerDeck, setComputerDeck] = useState<Card[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [gameResult, setGameResult] = useState<GameResult>(null);
  const [currentPlayerCard, setCurrentPlayerCard] = useState<Card | null>(null);
  const [currentComputerCard, setCurrentComputerCard] = useState<Card | null>(null);
  const [battleCards, setBattleCards] = useState<{ player: Card[]; computer: Card[] }>({ player: [], computer: [] });
  const [turnCount, setTurnCount] = useState<number>(0);
  const [history, setHistory] = useState<WarHistoryEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const startDisabled = bet < MIN_BET || bet > balance || gameStatus === "playing" || gameStatus === "battle";

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
    const success = await subtractPoints(Math.round(bet * 100) / 100, "War: mise");
    if (!success) {
      setErrorMessage("Erreur lors du débit des points");
      return;
    }

    // Créer et distribuer les cartes
    const deck = createDeck();
    const [player, computer] = dealCards(deck);
    
    setPlayerDeck(player);
    setComputerDeck(computer);
    setGameStatus("playing");
    setGameResult(null);
    setCurrentPlayerCard(null);
    setCurrentComputerCard(null);
    setBattleCards({ player: [], computer: [] });
    setTurnCount(0);
    // L'historique persiste entre les parties

    // Démarrer le premier tour
    playTurn(player, computer, 0);
  };

  const playTurn = async (playerDeck: Card[], computerDeck: Card[], turn: number) => {
    if (turn >= MAX_TURNS) {
      // Limite atteinte, le joueur avec le plus de cartes gagne
      const playerWins = playerDeck.length > computerDeck.length;
      endGame(playerWins, playerDeck, computerDeck);
      return;
    }

    if (playerDeck.length === 0) {
      endGame(false, playerDeck, computerDeck);
      return;
    }
    if (computerDeck.length === 0) {
      endGame(true, playerDeck, computerDeck);
      return;
    }

    setIsAnimating(true);
    setTurnCount(turn + 1);

    // Révéler la carte du joueur
    const playerCard = playerDeck[0];
    setCurrentPlayerCard(playerCard);

    await new Promise(resolve => setTimeout(resolve, 800));

    // Révéler la carte du serveur
    const computerCard = computerDeck[0];
    setCurrentComputerCard(computerCard);
    
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // La carte la plus haute gagne toujours
    let computerWins: boolean;
    
    if (playerCard.value > computerCard.value) {
      computerWins = false;
    } else if (computerCard.value > playerCard.value) {
      computerWins = true;
    } else {
      // Égalité, on gère la bataille
      handleBattle(playerDeck, computerDeck, [playerCard], [computerCard], turn);
      return;
    }

    if (!computerWins) {
      // Joueur gagne
      const newPlayerDeck = [...playerDeck.slice(1), playerCard, computerCard];
      const newComputerDeck = computerDeck.slice(1);
      
      setPlayerDeck(newPlayerDeck);
      setComputerDeck(newComputerDeck);
      
      // Pas d'historique pendant le jeu, seulement à la fin
      
      setIsAnimating(false);
      setCurrentPlayerCard(null);
      setCurrentComputerCard(null);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      playTurn(newPlayerDeck, newComputerDeck, turn + 1);
    } else {
      // Ordinateur gagne
      const newPlayerDeck = playerDeck.slice(1);
      const newComputerDeck = [...computerDeck.slice(1), computerCard, playerCard];
      
      setPlayerDeck(newPlayerDeck);
      setComputerDeck(newComputerDeck);
      
      // Pas d'historique pendant le jeu, seulement à la fin
      
      setIsAnimating(false);
      setCurrentPlayerCard(null);
      setCurrentComputerCard(null);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      playTurn(newPlayerDeck, newComputerDeck, turn + 1);
    }
  };

  const handleBattle = async (
    playerDeck: Card[],
    computerDeck: Card[],
    battlePlayerCards: Card[],
    battleComputerCards: Card[],
    turn: number
  ) => {
    setGameStatus("battle");
    setBattleCards({ player: battlePlayerCards, computer: battleComputerCards });

    // Vérifier si les joueurs ont assez de cartes
    if (playerDeck.length < 2) {
      // Joueur n'a pas assez de cartes
      endGame(false, playerDeck, computerDeck);
      return;
    }
    if (computerDeck.length < 2) {
      // Ordinateur n'a pas assez de cartes
      endGame(true, playerDeck, computerDeck);
      return;
    }

    // Chaque joueur pose une carte cachée puis révèle une nouvelle carte
    const hiddenPlayerCard = playerDeck[1];
    const hiddenComputerCard = computerDeck[1];
    const revealedPlayerCard = playerDeck[2];
    const revealedComputerCard = computerDeck[2];

    if (!revealedPlayerCard || !revealedComputerCard) {
      // Pas assez de cartes pour révéler
      if (playerDeck.length < 3) {
        endGame(false, playerDeck, computerDeck);
      } else {
        endGame(true, playerDeck, computerDeck);
      }
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    setCurrentPlayerCard(revealedPlayerCard);

    await new Promise(resolve => setTimeout(resolve, 800));

    // Révéler la carte du serveur
    const finalRevealedComputerCard = revealedComputerCard;
    setCurrentComputerCard(finalRevealedComputerCard);
    
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // La carte la plus haute gagne toujours
    let computerWinsBattle: boolean;
    
    if (revealedPlayerCard.value > finalRevealedComputerCard.value) {
      computerWinsBattle = false;
    } else if (finalRevealedComputerCard.value > revealedPlayerCard.value) {
      computerWinsBattle = true;
    } else {
      // Encore une égalité, on continue la bataille
      const newBattlePlayerCards = [...battlePlayerCards, playerDeck[0], hiddenPlayerCard, revealedPlayerCard];
      const newBattleComputerCards = [...battleComputerCards, computerDeck[0], hiddenComputerCard, finalRevealedComputerCard];
      
      handleBattle(
        playerDeck.slice(3),
        computerDeck.slice(3),
        newBattlePlayerCards,
        newBattleComputerCards,
        turn
      );
      return;
    }

    if (!computerWinsBattle) {
      // Joueur gagne la bataille
      // Les cartes playerDeck[0] et computerDeck[0] sont déjà dans battlePlayerCards et battleComputerCards
      // On ajoute seulement les cartes cachées et révélées
      const allCards = [
        ...battlePlayerCards,
        ...battleComputerCards,
        hiddenPlayerCard,
        hiddenComputerCard,
        revealedPlayerCard,
        finalRevealedComputerCard,
      ];
      
      // Retirer les 3 premières cartes : [0] (déjà dans battle), [1] (hidden), [2] (revealed)
      const newPlayerDeck = [...playerDeck.slice(3), ...allCards];
      const newComputerDeck = computerDeck.slice(3);
      
      setPlayerDeck(newPlayerDeck);
      setComputerDeck(newComputerDeck);
      setBattleCards({ player: [], computer: [] });
      setGameStatus("playing");
      
      // Pas d'historique pendant le jeu, seulement à la fin
      
      setIsAnimating(false);
      setCurrentPlayerCard(null);
      setCurrentComputerCard(null);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      playTurn(newPlayerDeck, newComputerDeck, turn + 1);
    } else {
      // Ordinateur gagne la bataille
      // Les cartes playerDeck[0] et computerDeck[0] sont déjà dans battlePlayerCards et battleComputerCards
      // On ajoute seulement les cartes cachées et révélées
      const allCards = [
        ...battlePlayerCards,
        ...battleComputerCards,
        hiddenPlayerCard,
        hiddenComputerCard,
        revealedPlayerCard,
        finalRevealedComputerCard,
      ];
      
      // Retirer les 3 premières cartes : [0] (déjà dans battle), [1] (hidden), [2] (revealed)
      const newPlayerDeck = playerDeck.slice(3);
      const newComputerDeck = [...computerDeck.slice(3), ...allCards];
      
      setPlayerDeck(newPlayerDeck);
      setComputerDeck(newComputerDeck);
      setBattleCards({ player: [], computer: [] });
      setGameStatus("playing");
      
      // Pas d'historique pendant le jeu, seulement à la fin
      
      setIsAnimating(false);
      setCurrentPlayerCard(null);
      setCurrentComputerCard(null);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      playTurn(newPlayerDeck, newComputerDeck, turn + 1);
    }
  };

  const endGame = async (playerWon: boolean, finalPlayerDeck: Card[] = playerDeck, finalComputerDeck: Card[] = computerDeck) => {
    setGameStatus("finished");
    setGameResult(playerWon ? "win" : "lose");
    setIsAnimating(false);
    setCurrentPlayerCard(null);
    setCurrentComputerCard(null);
    setBattleCards({ player: [], computer: [] });

    const finalPlayerCards = finalPlayerDeck.length;
    const finalComputerCards = finalComputerDeck.length;

    if (playerWon) {
      const payout = roundToTwo(bet * MULTIPLIER);
      const net = roundToTwo(payout - bet);
      
      await addPoints(Math.round(payout * 100) / 100, `War: Victoire`);
      await refreshPoints();
      
      addHistoryEntry("win", finalPlayerCards, finalComputerCards, net);
    } else {
      addHistoryEntry("lose", finalPlayerCards, finalComputerCards, -bet);
    }
  };

  const addHistoryEntry = (result: "win" | "lose", playerCards: number, computerCards: number, net: number) => {
    const entry: WarHistoryEntry = {
      id: Date.now(),
      result,
      playerCards,
      computerCards,
      net,
      timestamp: Date.now(),
    };
    
    setHistory((prev) => [entry, ...prev].slice(0, 5));
  };

  const getCardDisplay = (card: Card | null, isHidden: boolean = false) => {
    if (!card) return null;
    if (isHidden) {
      return (
        <div className="w-20 h-28 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-white/20 flex items-center justify-center shadow-lg">
          <span className="text-white text-xs">?</span>
        </div>
      );
    }
    
    const isRed = card.suit === "♥" || card.suit === "♦";
    
    return (
      <div className={cn(
        "w-20 h-28 rounded-lg border-2 flex flex-col items-center justify-center shadow-lg",
        isRed ? "bg-white text-red-600 border-red-600" : "bg-white text-black border-black"
      )}>
        <div className="text-lg font-bold">{card.name}</div>
        <div className="text-2xl">{card.suit}</div>
      </div>
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
                        disabled={gameStatus === "playing" || gameStatus === "battle"}
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
                              disabled={gameStatus === "playing" || gameStatus === "battle"}
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
                              disabled={gameStatus === "playing" || gameStatus === "battle"}
                            >
                              <div className="text-white group-active:scale-95">x2</div>
                            </button>
                            <div className="h-full w-px bg-white/10"></div>
                            <button
                              type="button"
                              className="group h-full w-[40%] touch-manipulation rounded-r-md px-4 py-2.5 duration-150 hover:bg-white/10 hover:text-white md:py-2.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => setBet(Math.min(balance))}
                              disabled={gameStatus === "playing" || gameStatus === "battle"}
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
              {gameStatus === "idle" || gameStatus === "finished" ? (
                <Button
                  onClick={startGame}
                  disabled={startDisabled}
                  size="lg"
                  className="w-full rounded-2xl bg-green-500 py-4 text-base font-semibold tracking-wide text-white transition hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {gameStatus === "finished" ? copy.actions.newGame : copy.actions.play}
                </Button>
              ) : (
                <div className="w-full rounded-2xl bg-slate-600 py-4 text-base font-semibold tracking-wide text-white text-center">
                  {gameStatus === "battle" ? copy.results.battle : "En cours..."}
                </div>
              )}

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
                      {entry.result === "win" ? "✓ Gagné" : "✗ Perdu"} - {entry.playerCards} à {entry.computerCards}
                    </span>
                    <span
                      className={cn(
                        "font-semibold",
                        entry.result === "win"
                          ? "text-emerald-400"
                          : "text-rose-400"
                      )}
                    >
                      {entry.result === "win" ? "+" : "-"}
                      {Math.abs(entry.net).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Game Area */}
          <section className="relative flex flex-col items-center justify-center overflow-hidden rounded-[36px] border border-[#112233] bg-[#0a1a2b] px-6 py-8 shadow-inner">
            <div className="w-full max-w-4xl space-y-8">
              {/* Card Counts */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-2">{copy.labels.playerCards}</p>
                  <p className="text-3xl font-bold text-white">{playerDeck.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-2">{copy.labels.computerCards}</p>
                  <p className="text-3xl font-bold text-white">{computerDeck.length}</p>
                </div>
              </div>

              {/* Current Cards */}
              <div className="flex items-center justify-center gap-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {getCardDisplay(currentPlayerCard)}
                </motion.div>
                
                <div className="text-2xl font-bold text-white">VS</div>
                
                <motion.div
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {getCardDisplay(currentComputerCard)}
                </motion.div>
              </div>

              {/* Battle Indicator */}
              {gameStatus === "battle" && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <p className="text-2xl font-bold text-yellow-400">{copy.results.battle}!</p>
                  <p className="text-sm text-slate-400 mt-2">
                    Cartes en jeu: {battleCards.player.length + battleCards.computer.length + 2}
                  </p>
                </motion.div>
              )}

              {/* Game Result */}
              {gameStatus === "finished" && gameResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <p className={cn(
                    "text-3xl font-bold mb-2",
                    gameResult === "win" ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {gameResult === "win" ? `✓ ${copy.results.win}` : `✗ ${copy.results.lose}`}
                  </p>
                  {gameResult === "win" && (
                    <p className="text-lg text-emerald-400">
                      +{roundToTwo(bet * MULTIPLIER - bet).toFixed(2)} pts
                    </p>
                  )}
                </motion.div>
              )}

              {/* Turn Count */}
              {gameStatus !== "idle" && (
                <div className="text-center">
                  <p className="text-sm text-slate-400">Tour: {turnCount} / {MAX_TURNS}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </CardContent>
    </UiCard>
  );
};

export default WarGame;

