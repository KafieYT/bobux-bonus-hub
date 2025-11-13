# Supprimer les BonusHunt

## Méthode 1 : Via la console du navigateur (Rapide)

1. Ouvrez la console du navigateur (F12)
2. Collez et exécutez cette commande :

```javascript
localStorage.removeItem('bonus_hunts');
console.log('✅ Tous les BonusHunt ont été supprimés');
```

## Méthode 2 : Via la page Admin

1. Connectez-vous avec votre compte Discord admin
2. Allez sur `/admin/hunts`
3. Cliquez sur "Supprimer tous les hunts"

## Méthode 3 : Via l'API (si les hunts sont sur le serveur)

```bash
curl -X DELETE http://localhost:3001/api/hunts \
  -H "Cookie: sessionId=VOTRE_SESSION_ID" \
  --credentials include
```

