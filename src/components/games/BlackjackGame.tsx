import { useEffect, useMemo, useState } from "react";
import { Card as UiCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePoints } from "@/hooks/usePoints";
import { motion, AnimatePresence } from "framer-motion";

const cardBackImage = new URL("../../../Images/BJ.png", import.meta.url).href;

// Sound functions
const playSound = (soundName: string) => {
  try {
    const audio = new Audio(`/sounds/${soundName}.mp3`);
    audio.volume = 0.5;
    audio.play().catch((e) => console.log("Erreur audio:", e));
  } catch (e) {
    console.log("Erreur lors du chargement du son:", e);
  }
};

const playDealSound = () => playSound("deal");
const playFlipSound = () => playSound("flip");
const playMuckSound = () => playSound("muck");

export interface BlackjackCopy {
  title: string;
  description: string;
  labels: {
    dealer: string;
    hand: string;
    total: string;
    bet: string;
    status: {
      idle: string;
      playerTurn: string;
      dealerTurn: string;
      finished: string;
    };
    results: {
      win: string;
      lose: string;
      push: string;
    };
  };
  actions: {
    hit: string;
    stand: string;
    double: string;
    split: string;
  };
  infos: {
    blackjack: string;
    instructions: string;
    splitNotice: string;
    waiting: string;
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
      push: string;
    };
  };
}

type GameStatus = "idle" | "playerTurn" | "dealerTurn" | "finished";

type Suit = "♠" | "♥" | "♦" | "♣";

interface Card {
  rank: string;
  suit: Suit;
  value: number;
  hidden?: boolean; // Flag pour indiquer si la carte est cachée
}

interface PlayerHand {
  id: string;
  cards: Card[];
  bet: number;
  isStand: boolean;
  isBusted: boolean;
  isDouble: boolean;
  result?: "win" | "lose" | "push";
  isBlackjack?: boolean;
}

interface BlackjackState {
  deck: Card[];
  hands: PlayerHand[];
  dealerHand: Card[];
  currentHandIndex: number;
  status: GameStatus;
  roundId: number | null;
  payoutDelta: number;
  totalStake: number;
  message: string;
}

interface BlackjackHistoryEntry {
  id: number;
  net: number;
  result: "win" | "lose" | "push";
  timestamp: number;
}

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Array<{ rank: string; value: number }> = [
  { rank: "A", value: 11 },
  { rank: "K", value: 10 },
  { rank: "Q", value: 10 },
  { rank: "J", value: 10 },
  { rank: "10", value: 10 },
  { rank: "9", value: 9 },
  { rank: "8", value: 8 },
  { rank: "7", value: 7 },
  { rank: "6", value: 6 },
  { rank: "5", value: 5 },
  { rank: "4", value: 4 },
  { rank: "3", value: 3 },
  { rank: "2", value: 2 },
];

const INITIAL_BET = 10;
const MIN_BET = 1;
const MAX_HISTORY = 3;

const roundToTwo = (value: number) => Math.round(value * 100) / 100;

const createDeck = (): Card[] =>
  SUITS.flatMap((suit) =>
    RANKS.map(({ rank, value }) => ({
      rank,
      suit,
      value,
    }))
  );

const shuffle = (original: Card[]): Card[] => {
  const array = [...original];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const drawFromDeck = (deck: Card[]): [Card, Card[]] => {
  let nextDeck = [...deck];
  if (nextDeck.length === 0) {
    nextDeck = shuffle(createDeck());
  }
  const card = nextDeck.pop();
  if (!card) {
    return drawFromDeck(nextDeck);
  }
  return [card, nextDeck];
};

// Keep getHandValue for backward compatibility, but use judgeScore internally
const getHandValue = (cards: Card[]): number => {
  return judgeScore(cards);
};

const isBlackjack = (cards: Card[]) => cards.length === 2 && getHandValue(cards) === 21;

const canSplitHand = (hand: PlayerHand) =>
  hand.cards.length === 2 && hand.cards[0].rank === hand.cards[1].rank;

const formatCard = (card: Card) => `${card.rank}${card.suit}`;

const createIdleState = (): BlackjackState => ({
  deck: shuffle(createDeck()),
  hands: [],
  dealerHand: [],
  currentHandIndex: 0,
  status: "idle",
  roundId: null,
  payoutDelta: 0,
  totalStake: 0,
  message: "",
});

const createInitialState = (bet: number, roundId: number): BlackjackState => {
  let deck = shuffle(createDeck());
  const draw = () => {
    const result = drawFromDeck(deck);
    deck = result[1];
    return result[0];
  };

  const playerCards = [draw(), draw()];
  const dealerCards = [draw(), draw()];

  const playerHand: PlayerHand = {
    id: crypto.randomUUID(),
    cards: playerCards,
    bet,
    isStand: false,
    isBusted: false,
    isDouble: false,
  };

  // Use judgeRound to check initial status (matching rlcard)
  const playerResult = judgeRound(playerCards);
  const dealerResult = judgeRound(dealerCards);
  const playerBlackjack = isBlackjack(playerCards);
  const dealerBlackjack = isBlackjack(dealerCards);

  // Handle immediate blackjack situations (matching rlcard logic)
  if (playerBlackjack || dealerBlackjack) {
    // Use judgeGame to determine result
    const gameResult = judgeGame(
      playerCards,
      dealerCards,
      playerResult.status === "bust"
    );
    
    const result: PlayerHand["result"] =
      gameResult === 2 ? "win" : gameResult === 1 ? "push" : "lose";

    const payout =
      result === "win"
        ? bet * 2.5
        : result === "push"
        ? bet
        : 0;

    return {
      deck,
      hands: [
        {
          ...playerHand,
          isStand: true,
          isBusted: playerResult.status === "bust",
          result,
          isBlackjack: playerBlackjack,
        },
      ],
      dealerHand: dealerCards,
      currentHandIndex: 0,
      status: "finished",
      roundId,
      payoutDelta: payout,
      totalStake: bet,
      message: playerBlackjack && dealerBlackjack ? "double-blackjack" : playerBlackjack ? "player-blackjack" : "dealer-blackjack",
    };
  }

  return {
    deck,
    hands: [playerHand],
    dealerHand: dealerCards,
    currentHandIndex: 0,
    status: "playerTurn",
    roundId,
    payoutDelta: 0,
    totalStake: bet,
    message: "",
  };
};

const moveToNextHand = (state: BlackjackState, fromIndex: number): BlackjackState => {
  for (let i = fromIndex + 1; i < state.hands.length; i++) {
    const hand = state.hands[i];
    if (!hand.isStand && !hand.isBusted) {
      return { ...state, currentHandIndex: i };
    }
  }
  return resolveDealer({ ...state, status: "dealerTurn" });
};

// Judge score function matching rlcard logic
const judgeScore = (cards: Card[]): number => {
  const rank2score: Record<string, number> = {
    A: 11, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
    "10": 10, J: 10, Q: 10, K: 10
  };
  
  let score = 0;
  let countA = 0;
  
  for (const card of cards) {
    // Ignorer les cartes cachées dans le calcul du score
    if (card.hidden) continue;
    
    const cardScore = rank2score[card.rank] || card.value;
    score += cardScore;
    if (card.rank === "A") {
      countA += 1;
    }
  }
  
  // Adjust for aces if score > 21
  while (score > 21 && countA > 0) {
    countA -= 1;
    score -= 10;
  }
  
  return score;
};

// Judge round function matching rlcard logic
const judgeRound = (cards: Card[]): { status: "alive" | "bust"; score: number } => {
  const score = judgeScore(cards);
  if (score <= 21) {
    return { status: "alive", score };
  } else {
    return { status: "bust", score };
  }
};

// Judge game function matching rlcard logic
// Returns: 2 = win, 1 = tie, -1 = lose
const judgeGame = (
  playerCards: Card[],
  dealerCards: Card[],
  playerBusted: boolean
): number => {
  if (playerBusted) {
    return -1; // Player bust
  }
  
  const dealerResult = judgeRound(dealerCards);
  const playerResult = judgeRound(playerCards);
  
  if (dealerResult.status === "bust") {
    return 2; // Dealer bust, player wins
  }
  
  if (playerResult.score > dealerResult.score) {
    return 2; // Player has higher score
  } else if (playerResult.score < dealerResult.score) {
    return -1; // Dealer has higher score
  } else {
    return 1; // Tie
  }
};

// Fonction pour faire tirer le dealer progressivement avec animations
const resolveDealerProgressively = (
  state: BlackjackState,
  setGame: React.Dispatch<React.SetStateAction<BlackjackState>>,
  processRound: (state: BlackjackState) => Promise<void>
) => {
  let deck = [...state.deck];
  // Le dealer a déjà ses deux cartes (la deuxième a été tirée dans handleStand)
  let dealerCards = [...state.dealerHand];

  const drawNextCard = () => {
    const dealerScore = judgeScore(dealerCards);
    
    if (dealerScore >= 17) {
      // Le dealer a fini, résoudre le jeu
      const dealerResult = judgeRound(dealerCards);
      const dealerBusted = dealerResult.status === "bust";

      const hands = state.hands.map((hand) => {
        const playerResult = judgeRound(hand.cards);
        const playerBusted = hand.isBusted || playerResult.status === "bust";
        const isNaturalBlackjack = hand.cards.length === 2 && playerResult.score === 21;

        // Use rlcard judge_game logic
        const gameResult = judgeGame(hand.cards, dealerCards, playerBusted);
        
        let result: "win" | "lose" | "push";
        if (gameResult === 2) {
          result = "win";
        } else if (gameResult === 1) {
          result = "push";
        } else {
          result = "lose";
        }

        return { 
          ...hand, 
          result,
          isBlackjack: isNaturalBlackjack,
          isBusted: playerBusted
        };
      });

      // Calculate payout
      const payoutDelta = hands.reduce((acc, hand) => {
        if (hand.result === "win") {
          return acc + (hand.isBlackjack ? hand.bet * 2.5 : hand.bet * 2);
        }
        if (hand.result === "push") {
          return acc + hand.bet;
        }
        return acc;
      }, 0);

      const finalState: BlackjackState = {
        ...state,
        deck,
        dealerHand: dealerCards,
        hands,
        status: "finished",
        payoutDelta,
      };

      setGame(finalState);
      // Ne pas appeler processRound ici, laisser le useEffect le gérer
      // Cela évite les doubles appels
      
      return;
    }

    // Le dealer doit encore tirer
    const [card, nextDeck] = drawFromDeck(deck);
    dealerCards.push(card);
    deck = nextDeck;

    playDealSound();
    
    setGame((prev) => ({
      ...prev,
      deck,
      dealerHand: dealerCards,
      status: "dealerTurn",
    }));

    // Attendre avant de tirer la prochaine carte
    setTimeout(drawNextCard, 500);
  };

  // Le dealer a déjà ses deux cartes (la deuxième a été tirée dans handleStand)
  // Commencer à tirer des cartes supplémentaires si nécessaire après un court délai
  setTimeout(drawNextCard, 500);
};

const resolveDealer = (state: BlackjackState): BlackjackState => {
  let deck = [...state.deck];
  // Révéler la carte cachée
  let dealerCards = state.dealerHand.map(c => {
    if (c.rank === "🂠") {
      const [revealedCard] = drawFromDeck(deck);
      return revealedCard;
    }
    return c;
  });

  // Dealer must hit until score >= 17 (matching rlcard logic)
  while (judgeScore(dealerCards) < 17) {
    const [card, nextDeck] = drawFromDeck(deck);
    dealerCards.push(card);
    deck = nextDeck;
  }

  const dealerResult = judgeRound(dealerCards);
  const dealerValue = dealerResult.score;
  const dealerBusted = dealerResult.status === "bust";

  const hands = state.hands.map((hand) => {
    const playerResult = judgeRound(hand.cards);
    const playerValue = playerResult.score;
    const playerBusted = hand.isBusted || playerResult.status === "bust";
    const isNaturalBlackjack = hand.cards.length === 2 && playerValue === 21;

    // Use rlcard judge_game logic
    const gameResult = judgeGame(hand.cards, dealerCards, playerBusted);
    
    let result: "win" | "lose" | "push";
    if (gameResult === 2) {
      result = "win";
    } else if (gameResult === 1) {
      result = "push";
    } else {
      result = "lose";
    }

    return { 
      ...hand, 
      result,
      isBlackjack: isNaturalBlackjack,
      isBusted: playerBusted
    };
  });

  // Calculate payout based on rlcard payoffs (1, 0, -1) but convert to points
  // In rlcard: win = +1 chip, tie = 0 chips, lose = -1 chip
  // We convert: win = bet * 2 (get bet back + win), tie = bet (get bet back), lose = 0
  const payoutDelta = hands.reduce((acc, hand) => {
    if (hand.result === "win") {
      // Win: get bet back + win amount (2x bet total, or 2.5x for blackjack)
      return acc + (hand.isBlackjack ? hand.bet * 2.5 : hand.bet * 2);
    }
    if (hand.result === "push") {
      // Tie: get bet back
      return acc + hand.bet;
    }
    // Lose: nothing (bet already deducted)
    return acc;
  }, 0);

  return {
    ...state,
    deck,
    dealerHand: dealerCards,
    hands,
    status: "finished",
    currentHandIndex: 0,
    payoutDelta,
  };
};

interface BlackjackGameProps {
  copy: BlackjackCopy;
  showHeader?: boolean;
  showInfo?: boolean;
  showStatus?: boolean;
}

export const BlackjackGame = ({
  copy,
  showHeader = true,
  showInfo = true,
  showStatus = true,
}: BlackjackGameProps) => {
  const { points, loading: pointsLoading, addPoints, subtractPoints, refreshPoints } = usePoints();
  const balance = points; // Utiliser les points Discord comme balance
  const [bet, setBet] = useState<number>(INITIAL_BET);
  const [game, setGame] = useState<BlackjackState>(() => createIdleState());
  const [history, setHistory] = useState<BlackjackHistoryEntry[]>([]);
  const [lastResolvedRoundId, setLastResolvedRoundId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentHand =
    game.status === "playerTurn" ? game.hands[game.currentHandIndex] : null;

  const dealerCardsToDisplay = useMemo(() => {
    if (game.status === "idle") return [];
    if (game.status === "playerTurn") {
      // Pendant le tour du joueur, les cartes cachées restent cachées
      return game.dealerHand;
    }
    // Révéler toutes les cartes cachées
    return game.dealerHand.map(card => 
      card.hidden ? { ...card, hidden: false } : card
    );
  }, [game]);

  const dealerValueDisplay = useMemo(() => {
    if (game.status === "idle" || game.dealerHand.length === 0) return 0;
    if (game.status === "playerTurn") {
      return getHandValue([game.dealerHand[0]]);
    }
    return getHandValue(game.dealerHand);
  }, [game]);

  const currentStatusLabel = useMemo(() => {
    switch (game.status) {
      case "playerTurn":
        return copy.labels.status.playerTurn;
      case "dealerTurn":
        return copy.labels.status.dealerTurn;
      case "finished":
        return copy.labels.status.finished;
      default:
        return copy.labels.status.idle;
    }
  }, [copy.labels.status, game.status]);

  const hitDisabled = game.status !== "playerTurn" || !currentHand;
  const standDisabled = hitDisabled;
  const doubleDisabled =
    hitDisabled ||
    !currentHand ||
    currentHand.cards.length !== 2 ||
    currentHand.isDouble ||
    balance < currentHand.bet;
  const splitDisabled =
    hitDisabled ||
    !currentHand ||
    !canSplitHand(currentHand) ||
    game.hands.length >= 4 ||
    balance < currentHand.bet;
  const startDisabled =
    bet < MIN_BET || bet > balance || game.status === "playerTurn";

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

  const processRound = async (state: BlackjackState) => {
    if (!state.roundId) return;
    setLastResolvedRoundId(state.roundId);
    const net = roundToTwo(state.payoutDelta - state.totalStake);
    const result: "win" | "lose" | "push" =
      net > 0 ? "win" : net < 0 ? "lose" : "push";
    
    // Mettre à jour les points selon le résultat
    // payoutDelta contient le montant total à recevoir (mise + gains)
    // totalStake contient la mise totale déjà débitée
    // Si payoutDelta > totalStake : gains nets à ajouter
    // Si payoutDelta = totalStake : push, remboursement de la mise
    // Si payoutDelta < totalStake : perte totale (déjà débitée)
    
    if (state.payoutDelta > 0) {
      // Ajouter le montant total à recevoir (mise + gains)
      // La mise a déjà été débitée, donc on ajoute le montant total
      await addPoints(Math.round(state.payoutDelta * 100) / 100, `Blackjack: ${result === "win" || result === "push" ? "Victoire" : "Défaite"}`);
    }
    
    // Rafraîchir les points pour avoir la valeur à jour
    await refreshPoints();
    
    setHistory((prev) => [
      {
        id: state.roundId!,
        net,
        result,
        timestamp: Date.now(),
      },
      ...prev,
    ].slice(0, MAX_HISTORY));
  };

  const startNewRound = async () => {
    if (game.status === "playerTurn") {
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
    playMuckSound();
    
    // Débiter les points
    const success = await subtractPoints(Math.round(bet * 100) / 100, "Blackjack: mise");
    if (!success) {
      setErrorMessage("Erreur lors du débit des points");
      return;
    }
    
    // Créer le deck et préparer les cartes
    let deck = shuffle(createDeck());
    const draw = () => {
      const result = drawFromDeck(deck);
      deck = result[1];
      return result[0];
    };

    // Préparer les cartes à distribuer (4 cartes : 2 pour le joueur, 2 pour le dealer)
    const cardsToDeal = [
      { type: 'player', card: draw() },
      { type: 'dealer', card: draw() },
      { type: 'player', card: draw() },
      { type: 'dealer', card: draw(), hidden: true }, // 2ème carte du dealer cachée
    ];

    // État initial avec mains vides
    const initialHand: PlayerHand = {
      id: crypto.randomUUID(),
      cards: [],
      bet,
      isStand: false,
      isBusted: false,
      isDouble: false,
    };

    // Initialiser le deck dans l'état (deck contient maintenant les cartes restantes après avoir tiré les 3 cartes)
    setGame({
      deck: deck, // Le deck après avoir tiré les 3 cartes
      hands: [initialHand],
      dealerHand: [],
      currentHandIndex: 0,
      status: "idle",
      roundId: nextRoundId,
      payoutDelta: 0,
      totalStake: bet,
      message: "",
    });

    // Distribuer les cartes une par une avec animations (comme dans le code fourni)
    // Délai de 250ms entre chaque carte
    const playerFirstCard = cardsToDeal[0].card;
    const dealerFirstCard = cardsToDeal[1].card;
    const playerSecondCard = cardsToDeal[2].card;
    const dealerSecondCard = cardsToDeal[3].card;
    
    // 1ère carte : joueur
    setTimeout(() => {
      playDealSound();
      setGame((prev) => ({
        ...prev,
        hands: prev.hands.map((hand, idx) => 
          idx === 0 ? { ...hand, cards: [playerFirstCard] } : hand
        ),
      }));
    }, 250);
    
    // 2ème carte : dealer
    setTimeout(() => {
      playDealSound();
      setGame((prev) => ({
        ...prev,
        dealerHand: [dealerFirstCard],
      }));
    }, 500);
    
    // 3ème carte : joueur
    setTimeout(() => {
      playDealSound();
      setGame((prev) => ({
        ...prev,
        hands: prev.hands.map((hand, idx) => 
          idx === 0 ? { ...hand, cards: [...hand.cards, playerSecondCard] } : hand
        ),
      }));
    }, 750);
    
    // 4ème carte : dealer (cachée)
    setTimeout(() => {
      playDealSound();
      const hiddenCard = { ...dealerSecondCard, hidden: true };
      setGame((prev) => ({
        ...prev,
        dealerHand: [...prev.dealerHand, hiddenCard],
        deck: deck,
      }));
      
      // Après un court délai, vérifier le blackjack
      setTimeout(() => {
        setGame((prevState) => {
          const playerCards = [playerFirstCard, playerSecondCard];
          const dealerCardsForCheck = [dealerFirstCard, dealerSecondCard];
          
          const playerResult = judgeRound(playerCards);
          const dealerResult = judgeRound(dealerCardsForCheck);
          const playerBlackjack = isBlackjack(playerCards);
          const dealerBlackjack = isBlackjack(dealerCardsForCheck);

          if (playerBlackjack || dealerBlackjack) {
            // Si blackjack, révéler la carte cachée et terminer la partie
            playFlipSound();
            
            const gameResult = judgeGame(
              playerCards,
              dealerCardsForCheck,
              playerResult.status === "bust"
            );
            
            const result: PlayerHand["result"] =
              gameResult === 2 ? "win" : gameResult === 1 ? "push" : "lose";

            const payout =
              result === "win"
                ? bet * 2.5
                : result === "push"
                ? bet
                : 0;
            
            return {
              ...prevState,
              dealerHand: dealerCardsForCheck, // Révéler les deux cartes pour le blackjack
              hands: [
                {
                  ...prevState.hands[0],
                  isStand: true,
                  isBusted: playerResult.status === "bust",
                  result,
                  isBlackjack: playerBlackjack,
                },
              ],
              status: "finished" as const,
              payoutDelta: payout,
            };
          }

          // Pas de blackjack, passer au tour du joueur
          return {
            ...prevState,
            status: "playerTurn",
          };
        });
      }, 400);
    }, 1000);

    setLastResolvedRoundId(null);
  };

  const handleHit = () => {
    if (hitDisabled) return;
    setErrorMessage(null);
    playDealSound();
    setGame((prev) => {
      if (prev.status !== "playerTurn") return prev;
      const hand = prev.hands[prev.currentHandIndex];
      if (!hand || hand.isStand) return prev;

      let deck = [...prev.deck];
      const [card, nextDeck] = drawFromDeck(deck);
      deck = nextDeck;

      const newCards = [...hand.cards, card];
      // Use judgeRound to determine status (matching rlcard logic)
      const result = judgeRound(newCards);

      const updatedHand: PlayerHand = {
        ...hand,
        cards: newCards,
        isBusted: result.status === "bust",
        isStand: result.status === "bust", // Auto stand on bust
      };

      const updatedHands = prev.hands.map((h, idx) =>
        idx === prev.currentHandIndex ? updatedHand : h
      );

      const updatedState: BlackjackState = {
        ...prev,
        deck,
        hands: updatedHands,
      };

      // If bust, move to next hand (matching rlcard logic)
      if (updatedHand.isBusted) {
        return moveToNextHand(updatedState, prev.currentHandIndex);
      }
      return updatedState;
    });
  };

  const handleStand = () => {
    if (standDisabled) return;
    setErrorMessage(null);
    setGame((prev) => {
      if (prev.status !== "playerTurn") return prev;
      const updatedHands = prev.hands.map((hand, idx) =>
        idx === prev.currentHandIndex ? { ...hand, isStand: true } : hand
      );
      const updatedState: BlackjackState = {
        ...prev,
        hands: updatedHands,
      };
      
      // If last hand, reveal dealer's hidden card with animation and start dealer turn
      if (prev.currentHandIndex === prev.hands.length - 1) {
        playFlipSound();
        
        setTimeout(() => {
          setGame((prevState) => {
            // Révéler la carte cachée du dealer (la 2ème carte)
            const revealedDealerHand = prevState.dealerHand.map((c, idx) => {
              if (c.hidden && idx === 1) {
                // Récupérer la vraie carte en enlevant le flag hidden
                return {
                  ...c,
                  hidden: false,
                };
              }
              return c;
            });
            
            const stateWithRevealed = {
              ...prevState,
              dealerHand: revealedDealerHand,
              status: "dealerTurn" as const,
            };
            
            // Utiliser resolveDealerProgressively pour faire tirer le dealer avec animations
            setTimeout(() => {
              resolveDealerProgressively(
                stateWithRevealed,
                setGame,
                processRound
              );
            }, 600); // Attendre la fin de l'animation de retournement
            
            return stateWithRevealed;
          });
        }, 100);
        
        return updatedState;
      }
      
      return moveToNextHand(updatedState, prev.currentHandIndex);
    });
  };

  const handleDouble = async () => {
    if (doubleDisabled || !currentHand) return;
    setErrorMessage(null);
    
    // Débiter les points supplémentaires pour le double
    const success = await subtractPoints(Math.round(currentHand.bet * 100) / 100, "Blackjack: double");
    if (!success) {
      setErrorMessage("Erreur lors du débit des points");
      return;
    }
    
    playDealSound();
    
    setGame((prev) => {
      if (prev.status !== "playerTurn") return prev;
      const hand = prev.hands[prev.currentHandIndex];
      if (!hand || hand.cards.length !== 2 || hand.isDouble) return prev;

      let deck = [...prev.deck];
      const [card, nextDeck] = drawFromDeck(deck);
      deck = nextDeck;

      const newCards = [...hand.cards, card];
      // Use judgeRound to determine status (matching rlcard logic)
      const result = judgeRound(newCards);
      const isBusted = result.status === "bust";

      const updatedHand: PlayerHand = {
        ...hand,
        cards: newCards,
        bet: hand.bet * 2,
        isDouble: true,
        isStand: true,
        isBusted,
      };

      const updatedHands = prev.hands.map((h, idx) =>
        idx === prev.currentHandIndex ? updatedHand : h
      );

      const updatedState: BlackjackState = {
        ...prev,
        deck,
        hands: updatedHands,
        totalStake: prev.totalStake + hand.bet,
      };

      return moveToNextHand(updatedState, prev.currentHandIndex);
    });
  };

  const handleSplit = async () => {
    if (splitDisabled || !currentHand) return;
    setErrorMessage(null);
    
    // Débiter les points supplémentaires pour le split
    const success = await subtractPoints(Math.round(currentHand.bet * 100) / 100, "Blackjack: split");
    if (!success) {
      setErrorMessage("Erreur lors du débit des points");
      return;
    }
    
    setGame((prev) => {
      if (prev.status !== "playerTurn") return prev;
      const hand = prev.hands[prev.currentHandIndex];
      if (!hand || !canSplitHand(hand) || prev.hands.length >= 4) return prev;

      let deck = [...prev.deck];
      const draw = () => {
        const [card, nextDeck] = drawFromDeck(deck);
        deck = nextDeck;
        return card;
      };

      const [firstCard, secondCard] = hand.cards;

      const firstHand: PlayerHand = {
        id: crypto.randomUUID(),
        cards: [firstCard, draw()],
        bet: hand.bet,
        isStand: false,
        isBusted: false,
        isDouble: false,
      };

      const secondHand: PlayerHand = {
        id: crypto.randomUUID(),
        cards: [secondCard, draw()],
        bet: hand.bet,
        isStand: false,
        isBusted: false,
        isDouble: false,
      };

      const updatedHands = [...prev.hands];
      updatedHands.splice(prev.currentHandIndex, 1, firstHand, secondHand);

      return {
        ...prev,
        deck,
        hands: updatedHands,
        currentHandIndex: prev.currentHandIndex,
        totalStake: prev.totalStake + hand.bet,
      };
    });
  };

  useEffect(() => {
    if (
      game.status === "finished" &&
      game.roundId &&
      game.roundId !== lastResolvedRoundId
    ) {
      processRound(game);
    }
  }, [game, lastResolvedRoundId]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderCard = (card: Card, index: number, stacked?: boolean, handIndex?: number, result?: "win" | "lose" | "push", shouldFlip?: boolean) => {
    const isHidden = card.hidden === true;
    const isRed = !isHidden && (card.suit === "♥" || card.suit === "♦");
    
    // Determine ring color based on result
    const ringColor = result === "win" || result === "blackjack" 
      ? "ring-green-500 ring-opacity-75" 
      : result === "lose" 
      ? "ring-red-500 ring-opacity-75" 
      : result === "push" 
      ? "ring-blue-500 ring-opacity-75" 
      : "";

    return (
      <motion.div
        key={`${card.rank}${card.suit}${index}${handIndex || 0}`}
        initial={{ x: 350, y: -250, scale: 1, opacity: 0 }}
        animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          delay: 0.1 * index,
        }}
        className={cn(
          "relative w-16 h-24 md:w-24 md:h-36 rounded-lg flex-shrink-0",
          ringColor ? `ring-2 md:ring-4 ${ringColor}` : ""
        )}
        style={{
          perspective: 1000,
          WebkitPerspective: 1000,
          zIndex: stacked ? 50 - index : undefined,
        }}
      >
        <motion.div
          className="w-full h-full absolute"
          style={{
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
          }}
          initial={{ rotateY: isHidden ? 180 : (shouldFlip ? 180 : 0) }}
          animate={{ rotateY: isHidden ? 180 : 0 }}
          transition={{ 
            duration: shouldFlip ? 0.6 : (isHidden ? 0 : 0.4), 
            delay: shouldFlip ? 0 : (isHidden ? 0 : 0.1),
            ease: "easeInOut"
          }}
          key={`card-flip-${isHidden ? "hidden" : "revealed"}-${index}-${shouldFlip ? "flip" : "no-flip"}-${card.rank}-${card.suit}`}
        >
          {/* Card Back */}
          <div
            className="absolute w-full h-full"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="w-full h-full relative">
              <img
                src={cardBackImage}
                alt="Card back"
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-1 border border-white/30 rounded-md" />
            </div>
          </div>
          
          {/* Card Front */}
          <div
            className="absolute w-full h-full bg-white rounded-lg p-1 flex flex-col justify-between items-center text-black shadow-lg"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div className="w-full flex justify-start items-center">
              <span className={cn(
                "font-bold text-sm md:text-xl",
                isRed ? "text-red-500" : "text-black"
              )}>
                {card.rank}
              </span>
            </div>
            <div className={cn(
              "text-lg md:text-3xl",
              isRed ? "text-red-500" : "text-black"
            )}>
              {card.suit}
            </div>
            <div className="w-full flex justify-end items-center transform rotate-180">
              <span className={cn(
                "font-bold text-sm md:text-xl",
                isRed ? "text-red-500" : "text-black"
              )}>
                {card.rank}
              </span>
            </div>
          </div>
        </motion.div>
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
                    {/* Symbole à gauche */}
                    <div className="flex-none px-3">
                      <span className="text-sm font-semibold text-slate-300 md:text-base">pts</span>
                    </div>
                    
                    {/* Input au centre */}
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
                        disabled={game.status === "playerTurn"}
                      />
                    </div>
                    
                    {/* Boutons à droite */}
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
                              disabled={game.status === "playerTurn"}
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
                              disabled={game.status === "playerTurn"}
                            >
                              <div className="text-white group-active:scale-95">x2</div>
                            </button>
                            <div className="h-full w-px bg-white/10"></div>
                            <button
                              type="button"
                              className="group h-full w-[40%] touch-manipulation rounded-r-md px-4 py-2.5 duration-150 hover:bg-white/10 hover:text-white md:py-2.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => setBet(Math.min(100, balance))}
                              disabled={game.status === "playerTurn"}
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
                      disabled={game.status === "playerTurn" || amount > balance}
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                size="lg"
                className="w-full rounded-2xl bg-[#1f4fce] py-4 text-base font-semibold tracking-wide text-white transition hover:bg-[#1a3fa8]"
                onClick={startNewRound}
                disabled={startDisabled}
              >
                {copy.sidebar.start}
              </Button>

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
                    <span className="font-medium">
                      {copy.sidebar.resultLabels[entry.result]}
                    </span>
                    <span
                      className={cn(
                        "font-semibold",
                        entry.net > 0
                          ? "text-emerald-400"
                          : entry.net < 0
                          ? "text-rose-400"
                          : "text-blue-400"
                      )}
                    >
                      {entry.net > 0 ? "+" : ""}
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

          <section className="relative flex flex-col overflow-hidden rounded-[36px] border border-[#112233] bg-[#081a2b] px-6 py-14 shadow-inner sm:px-12">

            <div className="flex items-center justify-center gap-3">
              <span className="rounded-full bg-[#122438] px-5 py-2 text-xs font-medium text-slate-200">
                {copy.labels.dealer}
              </span>
              {game.status !== "idle" && (
                <span className="rounded-full bg-[#1a3154] px-4 py-1 text-xs font-semibold text-slate-100">
                  {dealerValueDisplay}
                </span>
              )}
            </div>

            <div className="mt-10 flex min-h-[120px] w-full flex-wrap justify-center gap-2 md:gap-3 relative">
              {dealerCardsToDisplay.length > 0 && (
                <>
                  {game.status !== "idle" && dealerValueDisplay > 0 && (
                    <div className="absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs md:text-sm font-bold px-2 md:px-3 py-1 rounded-full z-10">
                      {game.status === "playerTurn" ? getHandValue([game.dealerHand[0]]) : dealerValueDisplay}
                    </div>
                  )}
                  <AnimatePresence mode="popLayout">
                    {dealerCardsToDisplay.map((card, idx) => {
                      // La deuxième carte (idx === 1) doit avoir l'animation de retournement
                      // si elle vient d'être révélée (game.status === "dealerTurn" et elle n'est plus cachée)
                      const wasHidden = game.dealerHand[idx]?.hidden === true;
                      const isRevealing = idx === 1 && game.status === "dealerTurn" && !card.hidden && wasHidden;
                      const shouldFlip = isRevealing;
                      
                      return (
                        <div key={`dealer-card-${idx}-${card.rank}-${card.suit}-${card.hidden ? "hidden" : "revealed"}`} className="flex items-center justify-center">
                          {renderCard(
                            card, 
                            idx, 
                            false, 
                            undefined, 
                            undefined, 
                            shouldFlip
                          )}
                        </div>
                      );
                    })}
                  </AnimatePresence>
                </>
              )}
            </div>

            <div className="flex-1" />

            <div className="mt-10 flex min-h-[140px] w-full flex-wrap justify-center gap-10">
              {game.hands.length === 1 ? (
                <div className="flex flex-col items-center gap-4">
                  <AnimatePresence mode="popLayout">
                    {game.hands[0] && game.hands[0].cards.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 md:gap-3 relative">
                        {game.status !== "idle" && (
                          <div className="absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs md:text-sm font-bold px-2 md:px-3 py-1 rounded-full z-10">
                            {getHandValue(game.hands[0].cards)}
                          </div>
                        )}
                        {game.hands[0].cards.map((card, idx) => 
                          renderCard(card, idx, false, 0, game.status === "finished" ? game.hands[0].result : undefined)
                        )}
                      </div>
                    )}
                  </AnimatePresence>
                  {game.hands[0]?.isBlackjack && game.status === "finished" && (
                    <Badge className="bg-emerald-500/80 text-emerald-950">
                      Blackjack
                    </Badge>
                  )}
                </div>
              ) : (
                game.hands.map((hand, handIndex) => (
                  <div key={hand.id} className="flex flex-col items-center gap-4">
                    <div className="text-white text-xs md:text-sm font-bold mb-2 flex items-center gap-2">
                      <span>Main {handIndex + 1}</span>
                      {handIndex === game.currentHandIndex && game.status === "playerTurn" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                      )}
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 md:gap-3 relative">
                      {game.status !== "idle" && (
                        <div className={cn(
                          "absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2 text-xs md:text-sm font-bold px-2 md:px-3 py-1 rounded-full z-10",
                          handIndex === game.currentHandIndex && game.status === "playerTurn"
                            ? "bg-primary text-primary-foreground"
                            : "bg-black/50 text-white"
                        )}>
                          {getHandValue(hand.cards)}
                        </div>
                      )}
                      <AnimatePresence mode="popLayout">
                        {hand.cards.map((card, idx) => 
                          renderCard(card, idx, false, handIndex, game.status === "finished" ? hand.result : undefined)
                        )}
                      </AnimatePresence>
                    </div>
                    {hand.isBlackjack && game.status === "finished" && (
                      <Badge className="bg-emerald-500/80 text-emerald-950">
                        Blackjack
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-0 overflow-hidden rounded-full border border-[#1b2f46] bg-gradient-to-r from-[#0d1e31] via-[#0f2338] to-[#0d1e31] shadow-[0_18px_40px_-28px_rgba(15,35,60,0.65)]">
              <Button
                onClick={handleHit}
                disabled={hitDisabled || game.status === "idle"}
                size="lg"
                className="min-w-[150px] rounded-none border-r border-[#1b2f46] bg-gradient-to-br from-[#3862ff] to-[#214de0] text-white transition-transform hover:scale-[1.03] hover:from-[#4670ff] hover:to-[#2a58ea] focus-visible:ring-0"
              >
                {copy.actions.hit}
              </Button>
              <Button
                onClick={handleStand}
                disabled={standDisabled || game.status === "idle"}
                size="lg"
                variant="outline"
                className="min-w-[150px] rounded-none border-r border-[#1b2f46] bg-[#14273b]/90 text-white transition-transform hover:scale-[1.03] hover:bg-[#1a3148] focus-visible:ring-0"
              >
                {copy.actions.stand}
              </Button>
              <Button
                onClick={handleDouble}
                disabled={doubleDisabled || game.status === "idle"}
                size="lg"
                variant="secondary"
                className="min-w-[150px] rounded-none border-r border-[#1b2f46] bg-[#162d43]/90 text-white transition-transform hover:scale-[1.03] hover:bg-[#1f3d58] focus-visible:ring-0"
              >
                {copy.actions.double}
              </Button>
              <Button
                onClick={handleSplit}
                disabled={splitDisabled || game.status === "idle"}
                size="lg"
                variant="secondary"
                className="min-w-[150px] rounded-none bg-[#162d43]/90 text-white transition-transform hover:scale-[1.03] hover:bg-[#1f3d58] focus-visible:ring-0"
              >
                {copy.actions.split}
              </Button>
            </div>

            {showInfo && (
              <div className="mt-10 rounded-xl border border-white/10 bg-[#0d1f33] p-5 text-xs text-slate-400 space-y-2">
                <p>{copy.infos.instructions}</p>
                <p>{copy.infos.blackjack}</p>
                <p>{copy.infos.splitNotice}</p>
              </div>
            )}

            {showStatus && (
              <div className="mt-6 text-center text-xs uppercase tracking-[0.3em] text-slate-500">
                {currentStatusLabel}
              </div>
            )}
          </section>
        </div>
      </CardContent>
    </UiCard>
  );
};

export default BlackjackGame;

