# Gamba - Plateforme de Jeux et Bonus

Plateforme complète de jeux de casino en ligne avec système de points, giveaways, classements et administration.

## 🎮 Fonctionnalités Principales

### Pages Publiques

#### 🏠 Accueil (`/`)
- Section héro avec les meilleurs bonus du moment
- Présentation des fonctionnalités principales (Blackjack, Plinko, Boutique, Bonus Hunt)
- Affichage des bonus exclusifs
- Liens vers les réseaux sociaux et la communauté

#### 🎰 Jeux (`/games`)
Plateforme de mini-jeux avec système de mise et de points :

- **Blackjack** (`/games/blackjack`)
  - Jeu de blackjack classique contre le croupier
  - Toutes les options classiques (Hit, Stand, Double, Split)
  - Historique des parties

- **Plinko** (`/games/plinko`)
  - Lancez la bille et gagnez selon le multiplicateur
  - Choix du niveau de risque
  - Mode auto disponible

- **Pile ou Face** (`/games/coinflip`)
  - Choisissez Pile ou Face et tentez votre chance
  - Bouton aléatoire disponible
  - Cotes : 60% serveur / 40% joueur
  - Images personnalisées pour Pile (Cheval) et Face (Lapin)

- **Limbo** (`/games/limbo`)
  - Prédisez un multiplicateur cible
  - Le résultat doit être égal ou supérieur pour gagner
  - Probabilités calculées : 2x = 49% de chance, 1000x = 0.099% de chance
  - Résultat instantané avec animation

- **Pierre-Feuille-Ciseaux** (`/games/rockpaperscissors`)
  - 1v1 contre l'ordinateur
  - Multiplicateur fixe x2.00 pour les victoires
  - Rejouer automatiquement en cas d'égalité
  - Cotes : 55% serveur / 45% joueur (avec possibilité d'égalité)
  - Images personnalisées pour chaque choix

- **Bataille (War)** (`/games/war`)
  - Jeu de cartes 1v1 contre l'ordinateur
  - Objectif : gagner toutes les cartes
  - Mécanique de bataille en cas d'égalité
  - 5 cartes par joueur au départ
  - Avantage serveur de 55% appliqué lors de la distribution initiale

#### 🏆 Wager Race (`/games/wager-race`)
- Classement mensuel des meilleurs wagers
- Top 20 des joueurs avec leurs statistiques
- Récompenses pour les 3 premiers (1000, 900, 850 pts)
- Statistiques mensuelles (Total Wager, Bets du Mois, Moyenne Wager)

#### 🎁 Giveaways (`/giveaways`)
- Concours avec système de tickets
- Achat de tickets avec points
- Giveaways réservés aux affiliés (option)
- Sélection de gagnants pondérée par le nombre de tickets
- Possibilité de reroll pour les admins

#### 🛒 Boutique (`/boutique`)
- Échangez vos points contre des récompenses
- Commandes gérées par les administrateurs

#### 🎯 Bonus Hunt (`/bonus-hunt`)
- Système de chasse aux bonus
- Inscription aux tirages
- Détails des hunts avec statistiques

#### 📊 Profil Utilisateur (`/profile`)
- Affichage des points
- Statistiques complètes :
  - Total Wager
  - Total Gains
  - Win Rate
  - Meilleur Gain
- Historique des paris (paginé)
- Historique des commandes (paginé)
- Édition du pseudo Gamba (une seule fois)
- Section codes coupons
- Liens rapides vers les autres sections

#### 📝 Autres Pages
- **Liste des Bonus** (`/bonuslist`) : Tous les bonus disponibles
- **Vidéos** (`/videos`) : Vidéos de la communauté
- **Communauté** (`/community`) : Page communautaire
- **Boosters** (`/boosters`) : Système de boosters
- **Call** (`/call`) : Système de calls
- **Tirage** (`/tirage`) : Inscription aux tirages
- **Jeu Responsable** (`/responsible-gaming`) : Informations sur le jeu responsable

### Panel d'Administration (`/admin`)

Accès réservé aux utilisateurs avec le rôle **ADMIN**.

#### 🎯 Tirage (`/admin/tirage`)
- Gérer les inscriptions aux tirages
- Effectuer les tirages au sort
- Historique des gagnants

#### 📝 Contenu (`/admin/content`)
- Gérer les vidéos
- Gérer les bonus
- Gérer le contenu du site

#### 📦 Bonus Hunts (`/admin/hunts`)
- Gérer les Bonus Hunts des joueurs
- Supprimer des hunts

#### 📞 Calls (`/admin/calls`)
- Valider les calls des joueurs
- Attribuer des points pour les calls validés

#### 🛒 Commandes (`/admin/orders`)
- Gérer les commandes de la boutique
- Attribuer les lots aux joueurs

#### 📊 Statistiques (`/admin/stats`)
- Voir les statistiques et analyses du site
- Tableaux de bord détaillés

#### 🏆 Wager Race (`/admin/wager-race`)
- Suivre les mises des joueurs par mois
- Voir le détail des paris de chaque joueur
- Valider les récompenses mensuelles pour le top 3
- Statut de validation des récompenses

#### 🎁 Giveaways (`/admin/giveaways`)
- Créer de nouveaux giveaways
- Modifier les giveaways existants
- Supprimer des giveaways
- Sélectionner les gagnants (pondéré par tickets)
- Reroll les gagnants
- Configurer les giveaways réservés aux affiliés

#### 👥 Information Joueurs (`/admin/roles`)
- Voir les informations des joueurs
- Gérer les rôles (ADMIN, AFFILIÉ)
- Ajouter des points aux joueurs
- Définir les points d'un joueur
- Retirer des points aux joueurs
- Voir les informations détaillées (email, historique de connexion, etc.)

#### 🎫 Coupons Bonus (`/admin/coupons`)
- Créer des coupons avec code, points, nombre d'utilisations max
- Modifier les coupons existants
- Supprimer des coupons
- Voir les statistiques d'utilisation

## 🔐 Système d'Authentification

- **Discord OAuth** : Connexion via Discord
- **Rôles** :
  - **ADMIN** : Accès complet au panel d'administration
  - **AFFILIÉ** : Accès aux giveaways réservés aux affiliés
- **Profil utilisateur** : Menu déroulant avec :
  - Points
  - Email (flouté par défaut, possibilité de déflouter)
  - Dernière connexion avec IP (floutée par défaut, possibilité de déflouter)
  - Rôles assignés
  - Lien vers le profil complet

## 💰 Système de Points

- Points affichés avec 2 décimales (ex: 4754.65 pts)
- Gagnés/perdus dans les jeux
- Utilisés pour acheter des tickets de giveaway
- Échangeables dans la boutique
- Gestion par les admins (ajout, définition, retrait)

## 📈 Système de Wager

- Tous les paris dans les mini-jeux sont trackés
- Calcul automatique du total wager par mois
- Classement mensuel (Wager Race)
- Récompenses pour le top 3 chaque mois
- Statistiques détaillées par joueur

## 🎲 Système de Jeux

Tous les jeux incluent :
- Système de mise avec points
- Historique des parties
- Calcul automatique des gains/pertes
- Tracking des wagers
- Affichage "Victoire" ou "Défaite" dans l'historique
- Statistiques intégrées au profil

## 🛠️ Technologies Utilisées

- **Frontend** :
  - React 18
  - TypeScript
  - Vite
  - Tailwind CSS
  - shadcn-ui
  - React Router
  - Framer Motion (animations)
  - TanStack Query

- **Backend** :
  - Node.js
  - Express
  - Discord OAuth2
  - Stockage JSON (fichiers)

- **Fonctionnalités** :
  - Internationalisation (FR/EN)
  - Responsive Design
  - Animations fluides
  - Gestion d'état avec React Hooks

## 📦 Installation

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou bun

### Installation des dépendances

```sh
npm install
```

### Démarrage du projet

**Option 1 : Lancer tout ensemble (recommandé)**
```sh
npm run dev:all
```
Cela lancera à la fois le serveur frontend (Vite) et le serveur backend (Express).

**Option 2 : Lancer séparément**

Terminal 1 - Frontend :
```sh
npm run dev
```

Terminal 2 - Backend :
```sh
npm run dev:server
```

### Configuration

1. **Variables d'environnement** :
   - Créez un fichier `.env` à la racine du projet
   - Configurez les variables nécessaires (Discord OAuth, etc.)

2. **Mot de passe admin** :
   - Défini dans `server.js` (variable `ADMIN_PASS`)
   - Par défaut : `KafieLEPlusBo`

3. **Données** :
   - Les données sont stockées dans le dossier `data/` :
     - `users.json` : Utilisateurs et leurs points
     - `wagers.json` : Historique des wagers par mois
     - `giveaways.json` : Giveaways créés
     - `roles.json` : Rôles des utilisateurs
     - `coupons.json` : Coupons disponibles
     - `bonuses.json` : Bonus disponibles
     - `videos.json` : Vidéos
     - `hunts.json` : Bonus Hunts
     - `orders.json` : Commandes de la boutique

### Accès aux pages

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3001/api

## 🚀 Déploiement

Le projet peut être déployé sur différentes plateformes :

- **Vercel** : Déploiement automatique depuis GitHub
- **Netlify** : Déploiement avec build automatique
- **Railway** : Déploiement full-stack
- **Heroku** : Déploiement classique

Assurez-vous de configurer les variables d'environnement sur la plateforme de déploiement.

## 📝 Structure du Projet

```
bobux-bonus-hub-main/
├── public/              # Fichiers statiques (images, favicon)
├── src/
│   ├── components/     # Composants React réutilisables
│   │   ├── games/      # Composants des jeux
│   │   └── ui/         # Composants UI (shadcn-ui)
│   ├── pages/          # Pages de l'application
│   ├── hooks/          # Hooks React personnalisés
│   ├── contexts/       # Contextes React
│   ├── data/           # Données et traductions
│   └── lib/            # Utilitaires
├── server.js           # Serveur Express
├── data/               # Fichiers JSON de stockage
└── package.json        # Dépendances et scripts
```

## 🔧 Scripts Disponibles

- `npm run dev` : Lance le serveur de développement frontend
- `npm run dev:server` : Lance le serveur backend
- `npm run dev:all` : Lance frontend et backend ensemble
- `npm run build` : Build de production
- `npm run preview` : Prévisualise le build de production

## 📄 Licence

Ce projet est privé et propriétaire.

## 👥 Contribution

Ce projet est privé. Pour toute question ou suggestion, contactez les administrateurs.

---

**Gamba** - Plateforme de jeux et bonus pour la communauté
