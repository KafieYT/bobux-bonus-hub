# Configuration Discord OAuth

## Étapes de configuration

### 1. Créer une application Discord

1. Allez sur https://discord.com/developers/applications
2. Cliquez sur "New Application"
3. Donnez un nom à votre application (ex: "Bobux Bonus Hub")
4. Cliquez sur "Create"

### 2. Configurer OAuth2

1. Dans le menu de gauche, cliquez sur "OAuth2"
2. Dans la section "Redirects", ajoutez :
   - Pour le développement : `http://localhost:3001/api/auth/discord/callback`
   - Pour la production : `https://votre-domaine.com/api/auth/discord/callback`
3. Copiez le **Client ID** et le **Client Secret**

### 3. Configurer les variables d'environnement

1. Copiez le fichier `env.example` en `.env` :
   ```bash
   cp env.example .env
   ```
   (ou créez manuellement un fichier `.env` à la racine du projet)

2. Ouvrez le fichier `.env` et remplissez avec vos vraies valeurs :
   ```env
   DISCORD_CLIENT_ID=votre_client_id_ici
   DISCORD_CLIENT_SECRET=votre_client_secret_ici
   DISCORD_REDIRECT_URI=http://localhost:3001/api/auth/discord/callback
   FRONTEND_URL=http://localhost:8080
   ```

3. ⚠️ **IMPORTANT** : Le fichier `.env` est déjà dans `.gitignore` pour éviter de commiter vos secrets. Ne le partagez jamais publiquement !

### 4. Permissions Discord OAuth

Les scopes utilisés sont :
- `identify` : Pour obtenir le nom d'utilisateur et l'avatar
- `email` : Pour obtenir l'adresse email

Ces permissions sont déjà configurées dans le code.

### 5. Tester

1. Démarrez le serveur : `npm run dev:server`
2. Démarrez le frontend : `npm run dev`
3. Cliquez sur le bouton "Connexion" dans le header
4. Autorisez l'application Discord
5. Vous serez redirigé vers l'application avec vos informations Discord

## Stockage des données

Les utilisateurs Discord sont stockés dans `data/discord_users.json` avec les informations suivantes :
- `id` : ID Discord unique
- `username` : Nom d'utilisateur
- `email` : Adresse email
- `avatar` : Hash de l'avatar
- `global_name` : Nom global Discord
- `updatedAt` : Date de dernière mise à jour

## Notes importantes

- Les sessions sont stockées en mémoire (Map). Pour la production, utilisez Redis ou une base de données.
- Les cookies sont configurés avec `HttpOnly` pour la sécurité.
- Le CORS est configuré pour permettre les cookies entre le frontend et le backend.

