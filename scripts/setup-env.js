const fs = require('fs');
const path = require('path');

const envExamplePath = path.join(__dirname, '..', 'env.example');
const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  console.log('✅ Le fichier .env existe déjà');
  process.exit(0);
}

if (!fs.existsSync(envExamplePath)) {
  console.error('❌ Le fichier env.example n\'existe pas');
  process.exit(1);
}

// Copier env.example vers .env
fs.copyFileSync(envExamplePath, envPath);
console.log('✅ Fichier .env créé depuis env.example');
console.log('⚠️  N\'oubliez pas de remplir vos vraies valeurs dans .env !');

