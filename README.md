# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/02c2bae6-7b39-4860-99fd-6dc83a370773

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/02c2bae6-7b39-4860-99fd-6dc83a370773) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Système de Tirage

Ce projet inclut un système de tirage au sort intégré. Pour l'utiliser :

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

### Accès aux pages

- **Page publique** : http://localhost:8080/tirage
- **Liste des participants** : http://localhost:8080/tirage/liste
- **API Backend** : http://localhost:3001/api

### Configuration

Le mot de passe admin est défini dans `server.js` (variable `ADMIN_PASS`). Par défaut : `KafieLEPlusBo`

Les données sont stockées dans le dossier `data/` :
- `data.json` : Participants inscrits
- `winners.json` : Historique des gagnants
- `ips.json` : Gestion des IPs (blocage)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/02c2bae6-7b39-4860-99fd-6dc83a370773) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
