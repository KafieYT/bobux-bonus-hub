export const gamesCopy = {
  fr: {
    title: "JEUX 🎮",
    subtitle:
      "Amuse-toi avec nos mini-jeux exclusifs et tente ta chance face au croupier ou au Plinko !",
    blackjack: {
      title: "Blackjack",
      description:
        "Affronte le croupier avec toutes les options classiques : tirer, rester, doubler et splitter.",
      labels: {
        dealer: "Croupier",
        hand: "Main",
        total: "Total",
        bet: "Mise",
        status: {
          idle: "Prêt à distribuer",
          playerTurn: "À toi de jouer",
          dealerTurn: "Tour du croupier",
          finished: "Résultats finaux",
        },
        results: {
          win: "Gagné",
          lose: "Perdu",
          push: "Égalité",
        },
      },
      actions: {
        hit: "Tirer",
        stand: "Rester",
        double: "Doubler",
        split: "Split",
      },
      infos: {
        blackjack:
          "Un Blackjack (21 en deux cartes) bat toutes les autres mains sauf un Blackjack du croupier.",
        instructions:
          "Utilise les boutons pour jouer ta main. Tu peux splitter lorsque tes deux premières cartes ont la même valeur.",
        splitNotice:
          "Limité à deux mains actives en simultané. Le double tire une carte supplémentaire puis termine la main.",
        waiting: "Clique sur « Lancer une partie » pour recevoir tes cartes.",
      },
      sidebar: {
        balance: "Balance disponible",
        bet: "Montant du pari",
        start: "Lancer une partie",
        half: "1/2",
        double: "2x",
        historyTitle: "Parties récentes",
        historyEmpty: "Aucune partie enregistrée.",
        insufficientBalance: "Balance insuffisante pour ce pari.",
        roundInProgress: "Termine la main en cours avant d'en lancer une nouvelle.",
        resultLabels: {
          win: "Victoire",
          lose: "Défaite",
          push: "Égalité",
        },
      },
    },
    plinko: {
      title: "Plinko",
      description: "",
      labels: {
        bet: "Mise",
        risk: "Risque",
        lastResult: "Dernier résultat",
        history: "Historique",
        multiplier: "Multiplicateur",
        payout: "Gain",
      },
      riskLevels: {
        low: "Faible",
        medium: "Moyen",
        high: "Élevé",
      },
      actions: {
        drop: "Lancer la bille",
      },
    },
    coinFlip: {
      title: "Pile ou Face",
      description: "",
      labels: {
        bet: "Mise",
        choose: "Choisis ton côté",
        result: "Résultat",
        status: {
          idle: "Prêt à jouer",
          flipping: "Lancement en cours...",
          finished: "Résultat final",
        },
        results: {
          win: "Gagné",
          lose: "Perdu",
        },
      },
      actions: {
        heads: "Pile",
        tails: "Face",
        flip: "Lancer",
        random: "Aléatoire",
      },
      sidebar: {
        balance: "Balance disponible",
        bet: "Montant du pari",
        start: "Nouveau jeu",
        half: "1/2",
        double: "2x",
        historyTitle: "Parties récentes",
        historyEmpty: "Aucune partie enregistrée.",
        insufficientBalance: "Balance insuffisante pour ce pari.",
        roundInProgress: "Termine la partie en cours avant d'en lancer une nouvelle.",
        resultLabels: {
          win: "Victoire",
          lose: "Défaite",
        },
      },
    },
    limbo: {
      title: "Limbo",
      description: "Misez et regardez le multiplicateur monter. Cash out avant qu'il ne crash !",
      labels: {
        betAmount: "Montant de la mise",
        profitOnWin: "Profit sur gain",
        targetMultiplier: "Multiplicateur cible",
        winChance: "Chance de gagner",
        balance: "Balance",
      },
      actions: {
        bet: "Miser",
        cashOut: "Cash Out",
        manual: "Manuel",
        auto: "Auto",
      },
      sidebar: {
        balance: "Balance disponible",
        bet: "Montant du pari",
        half: "1/2",
        double: "2x",
        historyTitle: "Historique",
        historyEmpty: "Aucune partie enregistrée.",
        insufficientBalance: "Balance insuffisante pour ce pari.",
      },
    },
    rockPaperScissors: {
      title: "Pierre Feuille Ciseaux",
      description: "Choisis Rock, Paper ou Scissors et affronte l'ordinateur. Multiplicateur fixe x2.00 !",
      labels: {
        betAmount: "Montant de la mise",
        choose: "Choisis ton coup",
        result: "Résultat",
        balance: "Balance",
      },
      actions: {
        rock: "Pierre",
        paper: "Feuille",
        scissors: "Ciseaux",
        play: "Jouer",
      },
      results: {
        win: "Victoire",
        lose: "Défaite",
        tie: "Égalité",
        playerChoice: "Ton choix",
        computerChoice: "Choix ordinateur",
      },
      sidebar: {
        balance: "Balance disponible",
        bet: "Montant du pari",
        half: "1/2",
        double: "2x",
        historyTitle: "Historique",
        historyEmpty: "Aucune partie enregistrée.",
        insufficientBalance: "Balance insuffisante pour ce pari.",
        roundInProgress: "Partie en cours...",
      },
    },
    war: {
      title: "Bataille",
      description: "Affrontez l'ordinateur dans un jeu de Bataille. Gagnez toutes les cartes pour remporter la partie !",
      labels: {
        betAmount: "Montant de la mise",
        balance: "Balance",
        playerCards: "Vos cartes",
        computerCards: "Cartes ordinateur",
        result: "Résultat",
      },
      actions: {
        play: "Jouer",
        newGame: "Nouvelle partie",
      },
      results: {
        win: "Victoire",
        lose: "Défaite",
        battle: "Bataille",
      },
      sidebar: {
        balance: "Balance disponible",
        bet: "Montant du pari",
        half: "1/2",
        double: "2x",
        historyTitle: "Historique",
        historyEmpty: "Aucune partie enregistrée.",
        insufficientBalance: "Balance insuffisante pour ce pari.",
      },
    },
  },
  en: {
    title: "GAMES 🎮",
    subtitle:
      "Have fun with our exclusive mini-games and try your luck against the dealer or the Plinko board!",
    blackjack: {
      title: "Blackjack",
      description:
        "Play against the dealer with all classic actions: hit, stand, double and split.",
      labels: {
        dealer: "Dealer",
        hand: "Hand",
        total: "Total",
        bet: "Bet",
        status: {
          idle: "Ready to deal",
          playerTurn: "Your turn",
          dealerTurn: "Dealer's turn",
          finished: "Final results",
        },
        results: {
          win: "Win",
          lose: "Lose",
          push: "Push",
        },
      },
      actions: {
        hit: "Hit",
        stand: "Stand",
        double: "Double",
        split: "Split",
      },
      infos: {
        blackjack:
          "A Blackjack (21 with two cards) beats every other hand except the dealer's Blackjack.",
        instructions:
          "Use the action buttons to play your hand. You can split when your first two cards share the same value.",
        splitNotice:
          "Limited to two active hands at a time. Doubling adds one card and stands automatically.",
        waiting: "Click “Start a game” to receive your first cards.",
      },
      sidebar: {
        balance: "Available balance",
        bet: "Bet amount",
        start: "Start a game",
        half: "1/2",
        double: "2x",
        historyTitle: "Recent games",
        historyEmpty: "No games yet.",
        insufficientBalance: "Not enough balance for that bet.",
        roundInProgress: "Finish the current hand before starting a new one.",
        resultLabels: {
          win: "Win",
          lose: "Loss",
          push: "Push",
        },
      },
    },
    plinko: {
      title: "Plinko",
      description:
        "Pick your risk level, set your stake and drop the ball to multiply your bet.",
      labels: {
        bet: "Stake",
        risk: "Risk",
        lastResult: "Last result",
        history: "History",
        multiplier: "Multiplier",
        payout: "Payout",
      },
      riskLevels: {
        low: "Low",
        medium: "Medium",
        high: "High",
      },
      actions: {
        drop: "Drop ball",
      },
    },
    coinFlip: {
      title: "Coin Flip",
      description: "",
      labels: {
        bet: "Bet",
        choose: "Choose your side",
        result: "Result",
        status: {
          idle: "Ready to play",
          flipping: "Flipping...",
          finished: "Final result",
        },
        results: {
          win: "Win",
          lose: "Lose",
        },
      },
      actions: {
        heads: "Heads",
        tails: "Tails",
        flip: "Flip",
        random: "Random",
      },
      sidebar: {
        balance: "Available balance",
        bet: "Bet amount",
        start: "New game",
        half: "1/2",
        double: "2x",
        historyTitle: "Recent games",
        historyEmpty: "No games yet.",
        insufficientBalance: "Not enough balance for that bet.",
        roundInProgress: "Finish the current game before starting a new one.",
        resultLabels: {
          win: "Win",
          lose: "Loss",
        },
      },
    },
    limbo: {
      title: "Limbo",
      description: "Place your bet and watch the multiplier rise. Cash out before it crashes!",
      labels: {
        betAmount: "Bet Amount",
        profitOnWin: "Profit on Win",
        targetMultiplier: "Target Multiplier",
        winChance: "Win Chance",
        balance: "Balance",
      },
      actions: {
        bet: "Bet",
        cashOut: "Cash Out",
        manual: "Manual",
        auto: "Auto",
      },
      sidebar: {
        balance: "Available balance",
        bet: "Bet amount",
        half: "1/2",
        double: "2x",
        historyTitle: "History",
        historyEmpty: "No games yet.",
        insufficientBalance: "Not enough balance for that bet.",
      },
    },
    rockPaperScissors: {
      title: "Rock Paper Scissors",
      description: "Choose Rock, Paper or Scissors and face the computer. Fixed multiplier x2.00!",
      labels: {
        betAmount: "Bet Amount",
        choose: "Choose your move",
        result: "Result",
        balance: "Balance",
      },
      actions: {
        rock: "Rock",
        paper: "Paper",
        scissors: "Scissors",
        play: "Play",
      },
      results: {
        win: "Win",
        lose: "Lose",
        tie: "Tie",
        playerChoice: "Your choice",
        computerChoice: "Computer choice",
      },
      sidebar: {
        balance: "Available balance",
        bet: "Bet amount",
        half: "1/2",
        double: "2x",
        historyTitle: "History",
        historyEmpty: "No games yet.",
        insufficientBalance: "Not enough balance for that bet.",
        roundInProgress: "Game in progress...",
      },
    },
    war: {
      title: "War",
      description: "Face the computer in a game of War. Win all the cards to win the game!",
      labels: {
        betAmount: "Bet Amount",
        balance: "Balance",
        playerCards: "Your cards",
        computerCards: "Computer cards",
        result: "Result",
      },
      actions: {
        play: "Play",
        newGame: "New Game",
      },
      results: {
        win: "Win",
        lose: "Lose",
        battle: "War",
      },
      sidebar: {
        balance: "Available balance",
        bet: "Bet amount",
        half: "1/2",
        double: "2x",
        historyTitle: "History",
        historyEmpty: "No games yet.",
        insufficientBalance: "Not enough balance for that bet.",
      },
    },
  },
} as const;

export type GamesCopy = typeof gamesCopy;

