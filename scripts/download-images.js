const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const JSON_FILE = path.join(__dirname, '../data/slots_by_provider.json');
const IMAGES_DIR = path.join(__dirname, '../Images/games');
const MAPPING_FILE = path.join(__dirname, '../data/image-mapping.json');

// Créer le dossier Images/games s'il n'existe pas
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Fonction pour télécharger une image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Suivre les redirections
        return downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

// Fonction pour obtenir l'extension depuis l'URL ou le Content-Type
function getExtension(url, contentType) {
  if (contentType && contentType.includes('image/')) {
    const ext = contentType.split('image/')[1].split(';')[0];
    return ext === 'jpeg' ? 'jpg' : ext;
  }
  
  // Essayer de deviner depuis l'URL
  const urlPath = new URL(url).pathname;
  if (urlPath.includes('.')) {
    const ext = urlPath.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
      return ext;
    }
  }
  
  return 'jpg'; // Par défaut
}

// Fonction principale
async function downloadAllImages() {
  console.log('📖 Lecture du fichier JSON...');
  const data = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
  
  const allGames = Object.values(data).flat();
  console.log(`📦 ${allGames.length} jeux trouvés`);
  
  const mapping = {};
  let downloaded = 0;
  let failed = 0;
  let skipped = 0;
  
  // Charger le mapping existant si il existe
  if (fs.existsSync(MAPPING_FILE)) {
    Object.assign(mapping, JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8')));
    console.log(`📋 ${Object.keys(mapping).length} images déjà mappées`);
  }
  
  for (let i = 0; i < allGames.length; i++) {
    const game = allGames[i];
    const { id, thumbnailUrl } = game;
    
    if (!thumbnailUrl) {
      skipped++;
      continue;
    }
    
    // Vérifier si l'image existe déjà
    const existingPath = mapping[id];
    if (existingPath && fs.existsSync(path.join(__dirname, '..', existingPath))) {
      skipped++;
      continue;
    }
    
    // Créer un nom de fichier basé sur l'ID
    const filename = `${id}.jpg`;
    const filepath = path.join(IMAGES_DIR, filename);
    const relativePath = `Images/games/${filename}`;
    
    try {
      console.log(`⬇️  [${i + 1}/${allGames.length}] Téléchargement: ${game.name}`);
      await downloadImage(thumbnailUrl, filepath);
      mapping[id] = relativePath;
      downloaded++;
      
      // Sauvegarder le mapping toutes les 10 images
      if (downloaded % 10 === 0) {
        fs.writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2));
      }
    } catch (error) {
      console.error(`❌ Erreur pour ${game.name}:`, error.message);
      failed++;
    }
    
    // Petite pause pour ne pas surcharger le serveur
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Sauvegarder le mapping final
  fs.writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2));
  
  console.log('\n✅ Téléchargement terminé!');
  console.log(`📊 Statistiques:`);
  console.log(`   - Téléchargées: ${downloaded}`);
  console.log(`   - Échouées: ${failed}`);
  console.log(`   - Ignorées: ${skipped}`);
  console.log(`   - Total mappé: ${Object.keys(mapping).length}`);
}

// Lancer le script
downloadAllImages().catch(console.error);

