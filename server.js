import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import dotenv from "dotenv";

// Charger les variables d'environnement depuis .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ on est derrière Nginx/Cloudflare
app.set("trust proxy", true);

const DB_FILE  = path.join(__dirname, "data", "data.json");
const WIN_FILE = path.join(__dirname, "data", "winners.json");
const IP_FILE  = path.join(__dirname, "data", "ips.json");
const VIDEOS_FILE = path.join(__dirname, "data", "videos.json");
const BONUS_FILE = path.join(__dirname, "data", "bonus.json");
const SOCIAL_LINKS_FILE = path.join(__dirname, "data", "socialLinks.json");
const BRAND_TEXT_FILE = path.join(__dirname, "data", "brandText.json");
const CLICKS_FILE = path.join(__dirname, "data", "clicks.json");
const SLOTS_FILE = path.join(__dirname, "data", "slots_by_provider.json");
const USERS_FILE = path.join(__dirname, "data", "discord_users.json");
const ADMINS_FILE = path.join(__dirname, "data", "admins.json");
const HUNTS_FILE = path.join(__dirname, "data", "hunts.json");
const CALLS_FILE = path.join(__dirname, "data", "calls.json");
const ORDERS_FILE = path.join(__dirname, "data", "orders.json");
const WAGERS_FILE = path.join(__dirname, "data", "wagers.json");
const COUPONS_FILE = path.join(__dirname, "data", "coupons.json");
const GIVEAWAYS_FILE = path.join(__dirname, "data", "giveaways.json");
const ROLES_FILE = path.join(__dirname, "data", "roles.json");
const ADMIN_PASS = "KafieLEPlusBo"; // Gardé pour rétrocompatibilité

// Discord OAuth Configuration
// Les variables sont chargées depuis le fichier .env
// Voir .env.example pour la configuration
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || "http://localhost:3001/api/auth/discord/callback";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080";

// Vérifier que les variables essentielles sont configurées
if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
  console.warn("⚠️  DISCORD_CLIENT_ID et DISCORD_CLIENT_SECRET ne sont pas configurés dans .env");
  console.warn("⚠️  L'authentification Discord ne fonctionnera pas sans ces variables");
  console.warn("⚠️  Copiez .env.example en .env et configurez vos identifiants Discord");
}

// Créer le dossier data s'il n'existe pas
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialiser le fichier admins.json avec le premier admin
if (!fs.existsSync(ADMINS_FILE)) {
  const initialAdmins = {
    "1138468177030951013": {
      id: "1138468177030951013",
      username: "kafieleretour",
      global_name: "! KafieLeRetour",
      addedAt: new Date().toISOString(),
    }
  };
  fs.writeFileSync(ADMINS_FILE, JSON.stringify(initialAdmins, null, 2));
}

// ---------- helpers fichiers ----------
function ensure(file, fallback) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
}
ensure(DB_FILE, []);
ensure(WIN_FILE, []);
ensure(IP_FILE, { attempts: {}, blocked: {} });
ensure(COUPONS_FILE, []);
ensure(VIDEOS_FILE, [
  {
    id: "1",
    title: "ÉNORME BONUS CASINO - Comment gagner 500€",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    category: "Casino",
    url: "https://youtube.com",
  },
  {
    id: "2",
    title: "TOP 5 DES MEILLEURS BONUS DU MOIS",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    category: "Bonus",
    url: "https://youtube.com",
  },
]);
ensure(BONUS_FILE, [
  {
    id: 1,
    platform: "Stake",
    title: "30€ OFFERTS",
    description: "Dépôt minimum: 20€",
    category: "casino",
    highlight: true,
    link: "https://t.me/+pXb2z1iLR3g5YWY8",
  },
  {
    id: 2,
    platform: "BC.Game",
    title: "200% BONUS",
    description: "Dépôt minimum: 200€",
    category: "casino",
    highlight: true,
    link: "https://t.me/+pXb2z1iLR3g5YWY8",
  },
]);
ensure(SOCIAL_LINKS_FILE, {
  discord: "https://discord.gg/tWEr7z8NM9",
  twitter: "https://x.com/intent/user?screen_name=JUNI_CLIP",
  telegram: "",
  dlive: "https://dlive.tv/Junikeit",
  youtube: "https://www.youtube.com/@junikeit",
  joinCommunity: "https://discord.gg/tWEr7z8NM9",
});
ensure(BRAND_TEXT_FILE, {
  brandName: "BOBUXBONUS.COM",
  brandShort: "BOBUX",
  creatorName: "TheBibux",
  creatorShort: "Bobux",
});
ensure(CLICKS_FILE, {
  bonuses: {},
  videos: {},
});
ensure(USERS_FILE, {});
ensure(ROLES_FILE, {});

const readJSON  = f => JSON.parse(fs.readFileSync(f, "utf8"));
const writeJSON = (f, v) => fs.writeFileSync(f, JSON.stringify(v, null, 2));

const readDB = () => readJSON(DB_FILE);
const writeDB = d => writeJSON(DB_FILE, d);
const readWinners = () => readJSON(WIN_FILE);
const writeWinners = d => writeJSON(WIN_FILE, d);
const readIPs = () => readJSON(IP_FILE);
const writeIPs = d => writeJSON(IP_FILE, d);
const readVideos = () => readJSON(VIDEOS_FILE);
const writeVideos = d => writeJSON(VIDEOS_FILE, d);
const readBonus = () => readJSON(BONUS_FILE);
const writeBonus = d => writeJSON(BONUS_FILE, d);
const readSocialLinks = () => readJSON(SOCIAL_LINKS_FILE);
const writeSocialLinks = d => writeJSON(SOCIAL_LINKS_FILE, d);
const readBrandText = () => readJSON(BRAND_TEXT_FILE);
const writeBrandText = d => writeJSON(BRAND_TEXT_FILE, d);
const readClicks = () => readJSON(CLICKS_FILE);
const writeClicks = d => writeJSON(CLICKS_FILE, d);
const readUsers = () => readJSON(USERS_FILE);
const writeUsers = d => writeJSON(USERS_FILE, d);
const readAdmins = () => readJSON(ADMINS_FILE);
const writeAdmins = d => writeJSON(ADMINS_FILE, d);
const readHunts = () => {
  if (!fs.existsSync(HUNTS_FILE)) return [];
  return readJSON(HUNTS_FILE);
};
const writeHunts = d => writeJSON(HUNTS_FILE, d);
const readCalls = () => {
  if (!fs.existsSync(CALLS_FILE)) return [];
  return readJSON(CALLS_FILE);
};
const writeCalls = d => writeJSON(CALLS_FILE, d);
const readOrders = () => {
  if (!fs.existsSync(ORDERS_FILE)) return [];
  return readJSON(ORDERS_FILE);
};
const writeOrders = d => writeJSON(ORDERS_FILE, d);
const readWagers = () => {
  if (!fs.existsSync(WAGERS_FILE)) return {};
  return readJSON(WAGERS_FILE);
};
const writeWagers = d => writeJSON(WAGERS_FILE, d);
const readCoupons = () => {
  if (!fs.existsSync(COUPONS_FILE)) return [];
  return readJSON(COUPONS_FILE);
};
const writeCoupons = d => writeJSON(COUPONS_FILE, d);
const readGiveaways = () => {
  if (!fs.existsSync(GIVEAWAYS_FILE)) return [];
  return readJSON(GIVEAWAYS_FILE);
};
const writeGiveaways = d => writeJSON(GIVEAWAYS_FILE, d);
const readRoles = () => {
  if (!fs.existsSync(ROLES_FILE)) return {};
  return readJSON(ROLES_FILE);
};
const writeRoles = d => writeJSON(ROLES_FILE, d);

// Cache slots list to avoid re-reading large JSON file on every request
let cachedSlotsIndex = null;
function loadSlotsIndex() {
  if (cachedSlotsIndex) return cachedSlotsIndex;
  try {
    const raw = readJSON(SLOTS_FILE);
    cachedSlotsIndex = Object.entries(raw).flatMap(([providerName, slots]) =>
      slots.map(slot => ({
        id: slot.id,
        name: slot.name,
        slug: slot.slug,
        provider: providerName,
      })),
    );
  } catch (e) {
    console.error("Erreur chargement slots:", e);
    cachedSlotsIndex = [];
  }
  return cachedSlotsIndex;
}
function refreshSlotsIndex() {
  cachedSlotsIndex = null;
  return loadSlotsIndex();
}

// ---------- IP utils ----------
function parseXFF(xff) {
  if (!xff) return null;
  const first = xff.split(",")[0].trim();
  return first || null;
}
function normalizeIp(ip) {
  if (!ip) return ip;
  const m = ip.match(/::ffff:(\d+\.\d+\.\d+\.\d+)/);
  if (m) return m[1];
  return ip;
}
function getClientIp(req) {
  const cf = req.headers["cf-connecting-ip"];
  const xff = parseXFF(req.headers["x-forwarded-for"]);
  const xri = req.headers["x-real-ip"];
  const sock = req.socket?.remoteAddress;

  const chosen = cf || xff || xri || sock || req.ip;
  return normalizeIp(chosen);
}

// block logic
function incrAttempt(ip) {
  const ips = readIPs();
  ips.attempts[ip] = (ips.attempts[ip] || 0) + 1;
  if (ips.attempts[ip] >= 2) {
    ips.blocked[ip] = { reason: "too_many_attempts", at: new Date().toISOString() };
  }
  writeIPs(ips);
}
function blockIp(ip, reason = "after_success") {
  const ips = readIPs();
  ips.blocked[ip] = { reason, at: new Date().toISOString() };
  writeIPs(ips);
}
function isBlocked(ip) {
  const ips = readIPs();
  return Boolean(ips.blocked[ip]);
}

// ---------- app ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  // Pour les cookies, on doit spécifier l'origine exacte, pas "*"
  const origin = req.headers.origin || FRONTEND_URL;
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Simple session storage (in-memory, pour production utiliser redis ou une vraie DB)
const sessions = new Map();
function getSessionId(req) {
  return req.headers.cookie?.split("sessionId=")[1]?.split(";")[0];
}
function createSession(userId) {
  const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  sessions.set(sessionId, { userId, createdAt: Date.now() });
  return sessionId;
}
function getSession(sessionId) {
  return sessions.get(sessionId);
}
function deleteSession(sessionId) {
  sessions.delete(sessionId);
}

// Vérifier si un utilisateur a un rôle
function hasRole(userId, role) {
  const roles = readRoles();
  return roles[userId] && roles[userId].includes(role);
}

// Vérifier si un utilisateur est admin via Discord OAuth
function checkAdminBySession(req) {
  const sessionId = getSessionId(req);
  if (!sessionId) return false;
  
  const session = getSession(sessionId);
  if (!session) return false;
  
  // Vérifier d'abord les rôles
  if (hasRole(session.userId, "ADMIN")) return true;
  
  // Rétrocompatibilité avec l'ancien système d'admins
  const admins = readAdmins();
  return Boolean(admins[session.userId]);
}

// Vérifier via mot de passe (rétrocompatibilité)
function checkAdmin(pw) { return pw === ADMIN_PASS; }

// Vérifier si un utilisateur est admin (Discord OAuth ou mot de passe)
function isAdmin(req) {
  // D'abord vérifier via Discord OAuth
  if (checkAdminBySession(req)) return true;
  // Ensuite vérifier via mot de passe (rétrocompatibilité)
  return checkAdmin(req.body?.password);
}

// -------- PUBLIC: participer --------
app.post("/api/participer", (req, res) => {
  const { pseudoGamba, pseudoDiscord } = req.body || {};
  const ip = getClientIp(req);

  if (!ip) return res.status(400).json({ error: "IP non détectée" });
  if (isBlocked(ip)) return res.status(403).json({ error: "Accès bloqué (IP)" });

  if (!pseudoGamba || !pseudoDiscord) {
    incrAttempt(ip);
    return res.status(400).json({ error: "Champs manquants" });
  }

  const data = readDB();

  // Doublon Discord
  const already = data.find(
    p => p.pseudoDiscord.toLowerCase() === String(pseudoDiscord).toLowerCase()
  );
  if (already) {
    incrAttempt(ip);
    return res.status(400).json({ error: "Déjà inscrit avec ce pseudo Discord" });
  }

  // ✅ Ajout
  data.push({ pseudoGamba, pseudoDiscord, date: new Date().toISOString(), ip });
  writeDB(data);

  // 🔒 Politique stricte demandée: 1 inscription par IP => bloque après succès
  blockIp(ip, "one_success_per_ip");

  return res.json({ success: true });
});

// -------- ADMIN: liste --------
app.post("/api/liste", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  res.json({ participants: readDB() });
});

// -------- ADMIN: tirage (étape 1) --------
app.post("/api/tirage", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  const data = readDB();
  if (!data.length) return res.status(400).json({ error: "Aucun participant" });
  const gagnant = data[Math.floor(Math.random() * data.length)];
  const currentWinnerFile = path.join(__dirname, "data", "currentWinner.json");
  writeJSON(currentWinnerFile, gagnant);
  res.json({ success: true, gagnant });
});

// -------- ADMIN: fin bonus (étape 2: enregistre multiplicateur) --------
app.post("/api/fin-bonus", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });

  const { multiplicateur } = req.body || {};
  const currentWinnerFile = path.join(__dirname, "data", "currentWinner.json");
  const winner = fs.existsSync(currentWinnerFile) ? readJSON(currentWinnerFile) : null;
  if (!winner) return res.status(400).json({ error: "Aucun gagnant en attente" });

  const mult = parseFloat(multiplicateur);
  if (Number.isNaN(mult) || mult <= 0) return res.status(400).json({ error: "Multiplicateur invalide" });

  const winners = readWinners();
  winners.push({ gagnant: winner, multiplicateur: mult, date: new Date().toISOString() });
  writeWinners(winners);

  if (fs.existsSync(currentWinnerFile)) fs.unlinkSync(currentWinnerFile);
  res.json({ success: true, message: "Multiplicateur enregistré ✅" });
});

// -------- ADMIN: winners --------
app.post("/api/winners", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  res.json({ winners: readWinners() });
});

// -------- ADMIN: classement --------
app.post("/api/winners/ranking", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  const ranking = readWinners()
    .sort((a, b) => (b.multiplicateur || 0) - (a.multiplicateur || 0))
    .map((x, i) => ({
      rang: i + 1,
      medaille: i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅",
      pseudo: x.gagnant.pseudoGamba,
      multiplicateur: x.multiplicateur,
    }));
  res.json({ ranking });
});

// -------- ADMIN: reset DB --------
app.post("/api/delete-all", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  writeDB([]);
  writeWinners([]);
  res.json({ success: true });
});

// -------- ADMIN IPs --------
app.post("/api/ips", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  res.json({ ips: readIPs() });
});
app.post("/api/ips/reset", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  writeIPs({ attempts: {}, blocked: {} });
  res.json({ success: true, message: "IPs réinitialisées" });
});

// -------- VIDEOS API --------
// GET: Liste des vidéos (public)
app.get("/api/videos", (req, res) => {
  res.json({ videos: readVideos() });
});

// POST: Créer une vidéo (admin)
app.post("/api/videos", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  const { title, thumbnail, category, url } = req.body || {};
  if (!title || !thumbnail || !category || !url) {
    return res.status(400).json({ error: "Champs manquants" });
  }
  const videos = readVideos();
  const newId = String(Math.max(...videos.map(v => Number(v.id) || 0), 0) + 1);
  videos.push({ id: newId, title, thumbnail, category, url });
  writeVideos(videos);
  res.json({ success: true, video: videos[videos.length - 1] });
});

// PUT: Modifier une vidéo (admin)
app.put("/api/videos/:id", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  const { title, thumbnail, category, url } = req.body || {};
  const videos = readVideos();
  const index = videos.findIndex(v => v.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Vidéo non trouvée" });
  if (title) videos[index].title = title;
  if (thumbnail) videos[index].thumbnail = thumbnail;
  if (category) videos[index].category = category;
  if (url) videos[index].url = url;
  writeVideos(videos);
  res.json({ success: true, video: videos[index] });
});

// DELETE: Supprimer une vidéo (admin)
app.delete("/api/videos/:id", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  const videos = readVideos();
  const filtered = videos.filter(v => v.id !== req.params.id);
  if (filtered.length === videos.length) return res.status(404).json({ error: "Vidéo non trouvée" });
  writeVideos(filtered);
  res.json({ success: true });
});

// -------- BONUS API --------
// GET: Liste des bonus (public)
app.get("/api/bonus", (req, res) => {
  res.json({ bonuses: readBonus() });
});

// POST: Créer un bonus (admin)
app.post("/api/bonus", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  const { platform, title, description, category, highlight, link, image } = req.body || {};
  if (!platform || !title || !description || !category || !link) {
    return res.status(400).json({ error: "Champs manquants" });
  }
  const bonuses = readBonus();
  const newId = Math.max(...bonuses.map(b => b.id || 0), 0) + 1;
  bonuses.push({ id: newId, platform, title, description, category, highlight: Boolean(highlight), link, image: image && image.trim() ? image.trim() : undefined });
  writeBonus(bonuses);
  res.json({ success: true, bonus: bonuses[bonuses.length - 1] });
});

// PUT: Modifier un bonus (admin)
app.put("/api/bonus/:id", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  const { platform, title, description, category, highlight, link, image } = req.body || {};
  const bonuses = readBonus();
  const index = bonuses.findIndex(b => b.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Bonus non trouvé" });
  if (platform) bonuses[index].platform = platform;
  if (title) bonuses[index].title = title;
  if (description) bonuses[index].description = description;
  if (category) bonuses[index].category = category;
  if (highlight !== undefined) bonuses[index].highlight = Boolean(highlight);
  if (link) bonuses[index].link = link;
  if (image !== undefined) bonuses[index].image = image && image.trim() ? image.trim() : undefined;
  writeBonus(bonuses);
  res.json({ success: true, bonus: bonuses[index] });
});

// DELETE: Supprimer un bonus (admin)
app.delete("/api/bonus/:id", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  const bonuses = readBonus();
  const filtered = bonuses.filter(b => b.id !== Number(req.params.id));
  if (filtered.length === bonuses.length) return res.status(404).json({ error: "Bonus non trouvé" });
  writeBonus(filtered);
  res.json({ success: true });
});

// -------- SOCIAL LINKS API --------
// GET: Liste des liens sociaux (public)
app.get("/api/social-links", (req, res) => {
  res.json({ links: readSocialLinks() });
});

// PUT: Modifier les liens sociaux (admin)
app.put("/api/social-links", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  const { discord, twitter, telegram, dlive, youtube, instagram, joinCommunity } = req.body || {};
  const links = readSocialLinks();
  if (discord !== undefined) links.discord = discord || "";
  if (twitter !== undefined) links.twitter = twitter || "";
  if (telegram !== undefined) links.telegram = telegram || "";
  if (dlive !== undefined) links.dlive = dlive || "";
  if (youtube !== undefined) links.youtube = youtube || "";
  if (instagram !== undefined) links.instagram = instagram || "";
  if (joinCommunity !== undefined) links.joinCommunity = joinCommunity || "";
  writeSocialLinks(links);
  res.json({ success: true, links });
});

// -------- BRAND TEXT API --------
// GET: Textes de marque (public)
app.get("/api/brand-text", (req, res) => {
  res.json({ text: readBrandText() });
});

// PUT: Modifier les textes de marque (admin)
app.put("/api/brand-text", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  const { brandName, brandShort, creatorName, creatorShort } = req.body || {};
  const text = readBrandText();
  if (brandName !== undefined) text.brandName = brandName || "";
  if (brandShort !== undefined) text.brandShort = brandShort || "";
  if (creatorName !== undefined) text.creatorName = creatorName || "";
  if (creatorShort !== undefined) text.creatorShort = creatorShort || "";
  writeBrandText(text);
  res.json({ success: true, text });
});

// -------- CLICKS API --------
// POST: Enregistrer un clic sur un bonus (public)
app.post("/api/bonus/:id/click", (req, res) => {
  const bonusId = String(req.params.id);
  const clicks = readClicks();
  if (!clicks.bonuses[bonusId]) {
    clicks.bonuses[bonusId] = { count: 0, lastClick: null };
  }
  clicks.bonuses[bonusId].count += 1;
  clicks.bonuses[bonusId].lastClick = new Date().toISOString();
  writeClicks(clicks);
  res.json({ success: true, count: clicks.bonuses[bonusId].count });
});

// POST: Enregistrer un clic sur une vidéo (public)
app.post("/api/videos/:id/click", (req, res) => {
  const videoId = String(req.params.id);
  const clicks = readClicks();
  if (!clicks.videos[videoId]) {
    clicks.videos[videoId] = { count: 0, lastClick: null };
  }
  clicks.videos[videoId].count += 1;
  clicks.videos[videoId].lastClick = new Date().toISOString();
  writeClicks(clicks);
  res.json({ success: true, count: clicks.videos[videoId].count });
});

// GET: Récupérer les statistiques de clics (admin)
app.get("/api/stats", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  const clicks = readClicks();
  const bonuses = readBonus();
  const videos = readVideos();
  
  // Enrichir les bonus avec les stats
  const bonusStats = bonuses.map(bonus => ({
    ...bonus,
    clicks: clicks.bonuses[String(bonus.id)] || { count: 0, lastClick: null },
  }));
  
  // Enrichir les vidéos avec les stats
  const videoStats = videos.map(video => ({
    ...video,
    clicks: clicks.videos[String(video.id)] || { count: 0, lastClick: null },
  }));
  
  res.json({ 
    success: true, 
    bonuses: bonusStats,
    videos: videoStats,
    totalBonusClicks: Object.values(clicks.bonuses).reduce((sum, stat) => sum + (stat.count || 0), 0),
    totalVideoClicks: Object.values(clicks.videos).reduce((sum, stat) => sum + (stat.count || 0), 0),
  });
});

// -------- SLOTS SEARCH API --------
app.get("/api/slots/search", (req, res) => {
  try {
  const query = (req.query.q || "").toString().trim();
  const providerFilter = (req.query.provider || "").toString().trim().toLowerCase();
    const limit = parseInt(req.query.limit || "10");

  if (query.length < 2) {
    return res.json({ slots: [] });
  }

    if (!fs.existsSync(SLOTS_FILE)) {
      console.error(`Fichier slots introuvable: ${SLOTS_FILE}`);
      return res.status(500).json({ error: "Fichier de slots introuvable", slots: [] });
    }

    const slotsData = readJSON(SLOTS_FILE);
    if (!slotsData || typeof slotsData !== "object") {
      console.error("Format de fichier slots invalide");
      return res.status(500).json({ error: "Format de fichier slots invalide", slots: [] });
    }

  const normalizedQuery = query.toLowerCase();
  const matches = [];
    
    // Parcourir tous les providers
    for (const providerName in slotsData) {
      if (!slotsData.hasOwnProperty(providerName)) continue;
      
      const providerSlots = slotsData[providerName];
      if (!Array.isArray(providerSlots)) continue;
      
      for (const slot of providerSlots) {
        if (!slot || typeof slot !== "object") continue;
        
        if (slot.name && typeof slot.name === "string" && slot.name.toLowerCase().includes(normalizedQuery)) {
          if (!providerFilter || providerName.toLowerCase().includes(providerFilter)) {
            matches.push({
              id: slot.id || "",
              name: slot.name || "",
              thumbnailUrl: slot.thumbnailUrl || "",
              provider: providerName, // Utiliser le nom du provider depuis la clé du JSON
            });
      }
    }
        if (matches.length >= limit) break;
      }
      if (matches.length >= limit) break;
  }

  res.json({ slots: matches });
  } catch (error) {
    console.error("Erreur lors de la recherche de slots:", error);
    res.status(500).json({ error: "Erreur lors de la recherche de slots", slots: [] });
  }
});

// -------- DISCORD OAUTH --------
// Initiate Discord OAuth flow
app.get("/api/auth/discord", (req, res) => {
  const state = Math.random().toString(36).substring(2, 15);
  const scope = "identify email";
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;
  res.redirect(discordAuthUrl);
});

// Discord OAuth callback
app.get("/api/auth/discord/callback", async (req, res) => {
  const { code, state } = req.query;
  
  if (!code) {
    return res.redirect(`${FRONTEND_URL}?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info from Discord
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to get user info");
    }

    const discordUser = await userResponse.json();

    // Save user to database
    const users = readUsers();
    const existingUser = users[discordUser.id];
    
    // Récupérer l'IP de connexion
    const clientIp = getClientIp(req);
    
    // Initialiser l'historique de connexions si nécessaire
    const loginHistory = existingUser?.loginHistory || [];
    loginHistory.push({
      ip: clientIp,
      date: new Date().toISOString(),
    });
    
    // Garder seulement les 10 dernières connexions
    if (loginHistory.length > 10) {
      loginHistory.shift();
    }
    
    const userData = {
      id: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      email: discordUser.email,
      avatar: discordUser.avatar,
      global_name: discordUser.global_name,
      points: existingUser?.points || 0, // Conserver les points existants ou initialiser à 0
      loginHistory: loginHistory,
      updatedAt: new Date().toISOString(),
      createdAt: existingUser?.createdAt || new Date().toISOString(),
    };

    users[discordUser.id] = userData;
    writeUsers(users);

    // Create session
    const sessionId = createSession(discordUser.id);

    // Redirect to frontend with session cookie
    res.setHeader("Set-Cookie", `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`);
    res.redirect(`${FRONTEND_URL}?discord_auth=success`);
  } catch (error) {
    console.error("Discord OAuth error:", error);
    res.redirect(`${FRONTEND_URL}?error=oauth_failed`);
  }
});

// Get current user
app.get("/api/auth/me", (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    return res.json({ user: null });
  }

  const session = getSession(sessionId);
  if (!session) {
    return res.json({ user: null });
  }

  const users = readUsers();
  const user = users[session.userId];
  
  if (!user) {
    return res.json({ user: null });
  }

  // Mettre à jour l'historique de connexions (une fois par jour max ou si IP différente)
  const clientIp = getClientIp(req);
  const loginHistory = user.loginHistory || [];
  const lastLogin = loginHistory.length > 0 ? loginHistory[loginHistory.length - 1] : null;
  const now = new Date();
  
  // Ajouter une nouvelle entrée si l'IP a changé ou si c'est la première connexion du jour
  const shouldAddEntry = !lastLogin || 
    lastLogin.ip !== clientIp || 
    (now.getTime() - new Date(lastLogin.date).getTime()) > 24 * 60 * 60 * 1000;
  
  if (shouldAddEntry && clientIp) {
    loginHistory.push({
      ip: clientIp,
      date: now.toISOString(),
    });
    
    // Garder seulement les 10 dernières connexions
    if (loginHistory.length > 10) {
      loginHistory.shift();
    }
    
    users[session.userId] = {
      ...user,
      loginHistory: loginHistory,
      updatedAt: now.toISOString(),
    };
    writeUsers(users);
  }

  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      global_name: user.global_name,
      points: Math.round((user.points || 0) * 100) / 100, // Arrondir à 2 décimales
    },
  });
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  const sessionId = getSessionId(req);
  if (sessionId) {
    deleteSession(sessionId);
  }
  res.setHeader("Set-Cookie", `sessionId=; HttpOnly; Path=/; Max-Age=0`);
  res.json({ success: true });
});

// -------- POINTS SYSTEM --------
// Get user points
app.get("/api/points", (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  const session = getSession(sessionId);
  if (!session) {
    return res.status(401).json({ error: "Session invalide" });
  }

  const users = readUsers();
  const user = users[session.userId];
  
  if (!user) {
    return res.status(404).json({ error: "Utilisateur non trouvé" });
  }

  res.json({ points: Math.round((user.points || 0) * 100) / 100 }); // Arrondir à 2 décimales
});

// Add points to user
app.post("/api/points/add", (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  const session = getSession(sessionId);
  if (!session) {
    return res.status(401).json({ error: "Session invalide" });
  }

  const { amount, reason, userId, betId, multiplier } = req.body || {};
  const pointsToAdd = Math.round((parseFloat(amount) || 0) * 100) / 100; // Arrondir à 2 décimales

  if (pointsToAdd <= 0) {
    return res.status(400).json({ error: "Le montant doit être positif" });
  }

  const users = readUsers();
  
  // Si userId est fourni, vérifier que c'est un admin
  const targetUserId = userId || session.userId;
  if (targetUserId !== session.userId && !checkAdminBySession(req)) {
    return res.status(403).json({ error: "Seuls les admins peuvent ajouter des points à d'autres utilisateurs" });
  }
  
  const user = users[targetUserId];
  
  if (!user) {
    return res.status(404).json({ error: "Utilisateur non trouvé" });
  }

  const oldPoints = user.points || 0;
  const newPoints = Math.round((oldPoints + pointsToAdd) * 100) / 100; // Arrondir à 2 décimales

  users[targetUserId] = {
    ...user,
    points: newPoints,
    updatedAt: new Date().toISOString(),
  };
  writeUsers(users);

  // Si c'est un résultat de jeu (gain ou perte), mettre à jour le résultat du pari
  if (reason && (reason.includes("Victoire") || reason.includes("Défaite") || reason.includes("gain") || reason.includes("gagné") || reason.includes("perdu") || reason.includes("win") || reason.includes("lose") || reason.includes("push"))) {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const wagers = readWagers();
    
    // Extraire le nom du jeu depuis le reason (ex: "Blackjack: Victoire" -> "Blackjack")
    const gameName = reason.split(":")[0].trim();
    const isWin = reason.includes("Victoire") || reason.includes("gain") || reason.includes("gagné") || reason.includes("win") || reason.includes("push");
    const isLose = reason.includes("Défaite") || reason.includes("perdu") || reason.includes("lose");
    
    if (wagers[monthKey] && wagers[monthKey][targetUserId] && wagers[monthKey][targetUserId].bets) {
      // Trouver le dernier pari sans résultat pour ce jeu spécifique
      const bets = wagers[monthKey][targetUserId].bets;
      
      // Chercher dans les 10 derniers paris pour ce jeu (pour éviter les problèmes de timing)
      const recentBets = bets.slice(-10).reverse();
      
      for (let i = 0; i < recentBets.length; i++) {
        const bet = recentBets[i];
        // Vérifier que c'est le bon jeu et qu'il n'a pas encore de résultat
        if ((bet.result === null || bet.result === undefined) && bet.game === gameName) {
          // Vérifier que le pari a été fait récemment (dans les 5 dernières minutes)
          const betDate = new Date(bet.date);
          const now = new Date();
          const diffMinutes = (now - betDate) / (1000 * 60);
          
          if (diffMinutes <= 5) {
            if (isWin) {
              // Pour les gains, on enregistre le montant total reçu (qui inclut la mise déjà débitée)
              bets[bets.length - 1 - i].result = pointsToAdd;
              bets[bets.length - 1 - i].isWin = true;
              bets[bets.length - 1 - i].multiplier = multiplier ? parseFloat(multiplier) : null;
            } else if (isLose) {
              // Pari perdu
              bets[bets.length - 1 - i].result = 0;
              bets[bets.length - 1 - i].isWin = false;
              bets[bets.length - 1 - i].multiplier = null;
            }
            writeWagers(wagers);
            break;
          }
        }
      }
    }
  }

  res.json({
    success: true,
    points: newPoints,
    added: pointsToAdd,
    reason: reason || "Points ajoutés",
  });
});

// Subtract points from user
app.post("/api/points/subtract", (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  const session = getSession(sessionId);
  if (!session) {
    return res.status(401).json({ error: "Session invalide" });
  }

  const { amount, reason, userId } = req.body || {};
  const pointsToSubtract = Math.round((parseFloat(amount) || 0) * 100) / 100; // Arrondir à 2 décimales

  if (pointsToSubtract <= 0) {
    return res.status(400).json({ error: "Le montant doit être positif" });
  }

  const users = readUsers();
  
  // Si userId est fourni, vérifier que c'est un admin
  const targetUserId = userId || session.userId;
  if (targetUserId !== session.userId && !checkAdminBySession(req)) {
    return res.status(403).json({ error: "Seuls les admins peuvent retirer des points à d'autres utilisateurs" });
  }
  
  const user = users[targetUserId];
  
  if (!user) {
    return res.status(404).json({ error: "Utilisateur non trouvé" });
  }

  const oldPoints = user.points || 0;
  const newPoints = Math.round(Math.max(0, oldPoints - pointsToSubtract) * 100) / 100; // Ne pas aller en négatif et arrondir à 2 décimales

  users[targetUserId] = {
    ...user,
    points: newPoints,
    updatedAt: new Date().toISOString(),
  };
  writeUsers(users);

  // Tracker les wagers si c'est une mise de jeu
  if (reason && (reason.includes("mise") || reason.includes(": mise"))) {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Extraire le nom du jeu depuis le reason (ex: "Blackjack: mise" -> "Blackjack")
    const gameName = reason.split(":")[0].trim();
    
    const wagers = readWagers();
    if (!wagers[monthKey]) {
      wagers[monthKey] = {};
    }
    if (!wagers[monthKey][targetUserId]) {
      wagers[monthKey][targetUserId] = {
        userId: targetUserId,
        totalWager: 0,
        betCount: 0,
        bets: [], // Historique des mises
        rewardsValidated: false, // Si les récompenses ont été validées
      };
    }
    
    // Initialiser les champs manquants pour les anciennes données
    if (!wagers[monthKey][targetUserId].bets) {
      wagers[monthKey][targetUserId].bets = [];
    }
    if (wagers[monthKey][targetUserId].rewardsValidated === undefined) {
      wagers[monthKey][targetUserId].rewardsValidated = false;
    }
    
    // Ajouter la mise à l'historique
    wagers[monthKey][targetUserId].bets.push({
      game: gameName,
      amount: pointsToSubtract,
      date: now.toISOString(),
      result: null, // Sera mis à jour lors du gain
      isWin: null, // Sera mis à jour lors du gain
      multiplier: null, // Sera mis à jour lors du gain
    });
    
    wagers[monthKey][targetUserId].totalWager = Math.round((wagers[monthKey][targetUserId].totalWager + pointsToSubtract) * 100) / 100;
    wagers[monthKey][targetUserId].betCount += 1;
    
    writeWagers(wagers);
  }

  res.json({
    success: true,
    points: newPoints,
    subtracted: pointsToSubtract,
    reason: reason || "Points retirés",
  });
});

// Set points (admin only or for specific use cases)
app.post("/api/points/set", (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  const session = getSession(sessionId);
  if (!session) {
    return res.status(401).json({ error: "Session invalide" });
  }

  const { amount, userId, reason } = req.body || {};
  const newPoints = Math.round((parseFloat(amount) || 0) * 100) / 100; // Arrondir à 2 décimales

  if (isNaN(newPoints) || newPoints < 0) {
    return res.status(400).json({ error: "Le montant doit être un nombre positif" });
  }

  const users = readUsers();
  
  // Si userId est fourni, vérifier que c'est un admin
  const targetUserId = userId || session.userId;
  if (targetUserId !== session.userId && !checkAdminBySession(req)) {
    return res.status(403).json({ error: "Seuls les admins peuvent définir les points d'autres utilisateurs" });
  }
  
  const user = users[targetUserId];
  
  if (!user) {
    return res.status(404).json({ error: "Utilisateur non trouvé" });
  }

  users[targetUserId] = {
    ...user,
    points: newPoints,
    updatedAt: new Date().toISOString(),
  };
  writeUsers(users);

  res.json({
    success: true,
    points: newPoints,
    reason: reason || "Points définis",
  });
});

// Get leaderboard (top users by points)
app.get("/api/points/leaderboard", (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const users = readUsers();
  
  const leaderboard = Object.values(users)
    .map(user => ({
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      global_name: user.global_name,
      points: Math.round((user.points || 0) * 100) / 100, // Arrondir à 2 décimales
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, limit)
    .map((user, index) => ({
      rank: index + 1,
      ...user,
    }));

  res.json({ leaderboard });
});

// Get wager leaderboard for current month
app.get("/api/wager/leaderboard", (req, res) => {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthName = now.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  
  const wagers = readWagers();
  const users = readUsers();
  const monthWagers = wagers[monthKey] || {};
  
  // Calculer les statistiques
  let totalWager = 0;
  let totalBets = 0;
  
  const leaderboard = Object.values(monthWagers)
    .map(entry => {
      totalWager += entry.totalWager;
      totalBets += entry.betCount;
      
      const user = users[entry.userId];
      // Construire l'URL complète de l'avatar Discord si disponible
      let avatarUrl = null;
      if (user?.avatar && user?.id) {
        // Si l'avatar commence par "http", c'est déjà une URL complète
        if (user.avatar.startsWith("http")) {
          avatarUrl = user.avatar;
        } else {
          // Sinon, construire l'URL Discord
          avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
        }
      }
      
      return {
        userId: entry.userId,
        username: user?.username || "Inconnu",
        global_name: user?.global_name || user?.username || "Inconnu",
        avatar: avatarUrl,
        totalWager: entry.totalWager,
        betCount: entry.betCount,
      };
    })
    .filter(entry => entry.username !== "Inconnu")
    .sort((a, b) => b.totalWager - a.totalWager)
    .slice(0, 20)
    .map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));
  
  const averageWager = leaderboard.length > 0 ? Math.round((totalWager / leaderboard.length) * 100) / 100 : 0;
  
  res.json({
    month: monthKey,
    monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
    stats: {
      totalWager: Math.round(totalWager * 100) / 100,
      totalBets: totalBets,
      averageWager: averageWager,
    },
    leaderboard: leaderboard,
  });
});

// Get wager details for admin (with bet history)
app.get("/api/wager/admin/details", (req, res) => {
  if (!checkAdminBySession(req)) {
    return res.status(403).json({ error: "Accès non autorisé" });
  }

  const month = req.query.month || null;
  const now = new Date();
  const monthKey = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthName = new Date(monthKey + "-01").toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  
  const wagers = readWagers();
  const users = readUsers();
  const monthWagers = wagers[monthKey] || {};
  
  const details = Object.values(monthWagers)
    .map(entry => {
      const user = users[entry.userId];
      // Construire l'URL complète de l'avatar Discord si disponible
      let avatarUrl = null;
      if (user?.avatar && user?.id) {
        if (user.avatar.startsWith("http")) {
          avatarUrl = user.avatar;
        } else {
          avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
        }
      }
      
      return {
        userId: entry.userId,
        username: user?.username || "Inconnu",
        global_name: user?.global_name || user?.username || "Inconnu",
        avatar: avatarUrl,
        totalWager: entry.totalWager,
        betCount: entry.betCount,
        bets: entry.bets || [],
        rewardsValidated: entry.rewardsValidated || false,
      };
    })
    .filter(entry => entry.username !== "Inconnu")
    .sort((a, b) => b.totalWager - a.totalWager)
    .map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));
  
  res.json({
    month: monthKey,
    monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
    details: details,
  });
});

// Validate rewards for a month (admin only)
app.post("/api/wager/admin/validate-rewards", (req, res) => {
  if (!checkAdminBySession(req)) {
    return res.status(403).json({ error: "Accès non autorisé" });
  }

  const { month } = req.body;
  if (!month) {
    return res.status(400).json({ error: "Le mois est requis" });
  }

  const wagers = readWagers();
  const users = readUsers();
  const monthWagers = wagers[month] || {};
  
  // Récompenses pour les 3 premiers
  const getReward = (rank) => {
    if (rank === 1) return 1000;
    if (rank === 2) return 900;
    if (rank === 3) return 850;
    return 0;
  };

  // Trier par totalWager pour déterminer les rangs
  const sortedEntries = Object.values(monthWagers)
    .sort((a, b) => b.totalWager - a.totalWager)
    .slice(0, 3);

  let validated = 0;
  let errors = [];

  sortedEntries.forEach((entry, index) => {
    const rank = index + 1;
    const reward = getReward(rank);
    
    if (reward > 0 && !entry.rewardsValidated) {
      const user = users[entry.userId];
      if (user) {
        const oldPoints = Math.round((user.points || 0) * 100) / 100;
        const newPoints = Math.round((oldPoints + reward) * 100) / 100;
        
        users[entry.userId] = {
          ...user,
          points: newPoints,
          updatedAt: new Date().toISOString(),
        };
        
        monthWagers[entry.userId].rewardsValidated = true;
        validated++;
      } else {
        errors.push(`Utilisateur ${entry.userId} non trouvé`);
      }
    }
  });

  writeUsers(users);
  wagers[month] = monthWagers;
  writeWagers(wagers);

  res.json({
    success: true,
    validated: validated,
    errors: errors,
    message: `${validated} récompense(s) validée(s)`,
  });
});

// Get all users (admin only)
app.get("/api/users", (req, res) => {
  if (!isAdmin(req)) {
    return res.status(401).json({ error: "Accès non autorisé" });
  }
  
  const users = readUsers();
  const roles = readRoles();
  
  const usersList = Object.values(users).map(user => ({
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    global_name: user.global_name,
    email: user.email,
    points: user.points || 0,
    roles: roles[user.id] || [],
    gambaUsername: user.gambaUsername || "",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
  
  res.json({ users: usersList });
});

// -------- ADMIN MANAGEMENT API --------
// GET: Vérifier si l'utilisateur connecté est admin
app.get("/api/admin/check", (req, res) => {
  const isUserAdmin = checkAdminBySession(req);
  res.json({ isAdmin: isUserAdmin });
});

// GET: Liste des admins (admin only)
app.get("/api/admin/list", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  const admins = readAdmins();
  res.json({ admins: Object.values(admins) });
});

// POST: Ajouter un admin (admin only)
app.post("/api/admin/add", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: "userId requis" });
  
  const admins = readAdmins();
  const users = readUsers();
  const user = users[userId];
  
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
  
  admins[userId] = {
    id: user.id,
    username: user.username,
    global_name: user.global_name,
    addedAt: new Date().toISOString(),
  };
  writeAdmins(admins);
  
  res.json({ success: true, admin: admins[userId] });
});

// DELETE: Retirer un admin (admin only)
app.delete("/api/admin/:userId", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  const { userId } = req.params;
  
  const admins = readAdmins();
  if (!admins[userId]) return res.status(404).json({ error: "Admin non trouvé" });
  
  delete admins[userId];
  writeAdmins(admins);
  
  res.json({ success: true });
});

// -------- ROLES API --------
// POST: Assigner un rôle à un utilisateur (admin only)
app.post("/api/roles/:userId", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  
  const { role } = req.body || {};
  const { userId } = req.params;
  
  if (!role || (role !== "ADMIN" && role !== "AFFILIÉ")) {
    return res.status(400).json({ error: "Rôle invalide. Les rôles valides sont: ADMIN, AFFILIÉ" });
  }
  
  const users = readUsers();
  if (!users[userId]) {
    return res.status(404).json({ error: "Utilisateur non trouvé" });
  }
  
  const roles = readRoles();
  if (!roles[userId]) {
    roles[userId] = [];
  }
  
  // Vérifier si le rôle existe déjà
  if (roles[userId].includes(role)) {
    return res.status(400).json({ error: "L'utilisateur a déjà ce rôle" });
  }
  
  roles[userId].push(role);
  writeRoles(roles);
  
  res.json({ success: true, roles: roles[userId] });
});

// DELETE: Retirer un rôle d'un utilisateur (admin only)
app.delete("/api/roles/:userId", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  
  const { role } = req.body || {};
  const { userId } = req.params;
  
  if (!role || (role !== "ADMIN" && role !== "AFFILIÉ")) {
    return res.status(400).json({ error: "Rôle invalide. Les rôles valides sont: ADMIN, AFFILIÉ" });
  }
  
  const roles = readRoles();
  if (!roles[userId] || !roles[userId].includes(role)) {
    return res.status(404).json({ error: "L'utilisateur n'a pas ce rôle" });
  }
  
  roles[userId] = roles[userId].filter(r => r !== role);
  
  // Supprimer l'entrée si plus de rôles
  if (roles[userId].length === 0) {
    delete roles[userId];
  }
  
  writeRoles(roles);
  
  res.json({ success: true, roles: roles[userId] || [] });
});

// GET: Obtenir les rôles d'un utilisateur (authentifié)
app.get("/api/roles/:userId", (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId) return res.status(401).json({ error: "Non authentifié" });
  
  const session = getSession(sessionId);
  if (!session) return res.status(401).json({ error: "Session invalide" });
  
  const { userId } = req.params;
  
  // Un utilisateur peut voir ses propres rôles, ou un admin peut voir tous les rôles
  if (session.userId !== userId && !isAdmin(req)) {
    return res.status(403).json({ error: "Accès non autorisé" });
  }
  
  const roles = readRoles();
  res.json({ roles: roles[userId] || [] });
});

// -------- BONUS HUNTS API --------
// GET: Liste des hunts (public)
app.get("/api/hunts", (req, res) => {
  const hunts = readHunts();
  res.json({ hunts });
});

// GET: Récupérer un hunt par ID (public)
app.get("/api/hunts/:id", (req, res) => {
  const hunts = readHunts();
  const hunt = hunts.find(h => h.id === req.params.id);
  if (!hunt) return res.status(404).json({ error: "Hunt non trouvé" });
  res.json({ hunt });
});

// POST: Créer un hunt (authentifié)
app.post("/api/hunts", (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId) return res.status(401).json({ error: "Non authentifié" });
  
  const session = getSession(sessionId);
  if (!session) return res.status(401).json({ error: "Session invalide" });
  
  const users = readUsers();
  const user = users[session.userId];
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
  
  const { title, startAmount, currency } = req.body || {};
  if (!title || !startAmount || !currency) {
    return res.status(400).json({ error: "Champs manquants" });
  }
  
  const hunts = readHunts();
  const newHunt = {
    id: randomUUID(),
    title,
    startAmount: parseFloat(startAmount),
    currency,
    slots: [],
    createdAt: new Date().toISOString(),
    creator: user.global_name || user.username,
    creatorId: user.id,
  };
  
  hunts.push(newHunt);
  writeHunts(hunts);
  
  res.json({ success: true, hunt: newHunt });
});

// PUT: Modifier un hunt (créateur ou admin)
app.put("/api/hunts/:id", (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId) return res.status(401).json({ error: "Non authentifié" });
  
  const session = getSession(sessionId);
  if (!session) return res.status(401).json({ error: "Session invalide" });
  
  const hunts = readHunts();
  const huntIndex = hunts.findIndex(h => h.id === req.params.id);
  if (huntIndex === -1) return res.status(404).json({ error: "Hunt non trouvé" });
  
  const hunt = hunts[huntIndex];
  const isCreator = hunt.creatorId === session.userId;
  const isUserAdmin = checkAdminBySession(req);
  
  if (!isCreator && !isUserAdmin) {
    return res.status(403).json({ error: "Accès non autorisé" });
  }
  
  const { title, startAmount, currency, slots } = req.body || {};
  if (title !== undefined) hunt.title = title;
  if (startAmount !== undefined) hunt.startAmount = parseFloat(startAmount);
  if (currency !== undefined) hunt.currency = currency;
  if (slots !== undefined) hunt.slots = slots;
  
  hunts[huntIndex] = hunt;
  writeHunts(hunts);
  
  res.json({ success: true, hunt });
});

// DELETE: Supprimer un hunt (créateur ou admin)
app.delete("/api/hunts/:id", (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId) return res.status(401).json({ error: "Non authentifié" });
  
  const session = getSession(sessionId);
  if (!session) return res.status(401).json({ error: "Session invalide" });
  
  const hunts = readHunts();
  const huntIndex = hunts.findIndex(h => h.id === req.params.id);
  if (huntIndex === -1) return res.status(404).json({ error: "Hunt non trouvé" });
  
  const hunt = hunts[huntIndex];
  const isCreator = hunt.creatorId === session.userId;
  const isUserAdmin = checkAdminBySession(req);
  
  if (!isCreator && !isUserAdmin) {
    return res.status(403).json({ error: "Accès non autorisé" });
  }
  
  hunts.splice(huntIndex, 1);
  writeHunts(hunts);
  
  res.json({ success: true });
});

// DELETE: Supprimer tous les hunts (admin only)
app.delete("/api/hunts", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  writeHunts([]);
  res.json({ success: true, message: "Tous les hunts ont été supprimés" });
});

// -------- CALLS API --------
// GET: Liste des calls (public)
app.get("/api/calls", (req, res) => {
  const calls = readCalls();
  // Enrichir avec les infos utilisateur
  const users = readUsers();
  const enrichedCalls = calls.map(call => {
    const user = users[call.userId];
    return {
      ...call,
      username: user?.global_name || user?.username || "Utilisateur inconnu",
      usernameSecondary: user?.username,
      avatar: user?.avatar,
    };
  });
  res.json({ calls: enrichedCalls });
});

// GET: Vérifier le cooldown pour créer un call
app.get("/api/calls/cooldown", (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    return res.json({ canCreate: false, reason: "not_authenticated" });
  }
  
  const session = getSession(sessionId);
  if (!session) {
    return res.json({ canCreate: false, reason: "invalid_session" });
  }
  
  const calls = readCalls();
  const userCalls = calls.filter(c => c.userId === session.userId);
  
  if (userCalls.length === 0) {
    return res.json({ canCreate: true });
  }
  
  // Trier par date décroissante
  userCalls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const lastCall = userCalls[0];
  const lastCallDate = new Date(lastCall.createdAt);
  const now = new Date();
  
  // Comparer seulement le jour/mois/année (ignorer l'heure)
  const lastCallDay = new Date(lastCallDate.getFullYear(), lastCallDate.getMonth(), lastCallDate.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Si le dernier call n'est pas aujourd'hui, on peut créer un call
  if (lastCallDay.getTime() < today.getTime()) {
    return res.json({ canCreate: true });
  }
  
  // Le dernier call est aujourd'hui, calculer le prochain jour disponible
  const nextCallDate = new Date(today);
  nextCallDate.setDate(nextCallDate.getDate() + 1);
  nextCallDate.setHours(0, 0, 0, 0);
  
  return res.json({
    canCreate: false,
    nextCallTime: nextCallDate.toISOString(),
    reason: "already_created_today",
  });
});

// POST: Créer un call (authentifié)
app.post("/api/calls", (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId) return res.status(401).json({ error: "Non authentifié" });
  
  const session = getSession(sessionId);
  if (!session) return res.status(401).json({ error: "Session invalide" });
  
  const users = readUsers();
  const user = users[session.userId];
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
  
  // Vérifier le cooldown (1 call par jour)
  const calls = readCalls();
  const userCalls = calls.filter(c => c.userId === session.userId);
  
  if (userCalls.length > 0) {
    userCalls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const lastCall = userCalls[0];
    const lastCallDate = new Date(lastCall.createdAt);
    const now = new Date();
    
    // Comparer seulement le jour/mois/année (ignorer l'heure)
    const lastCallDay = new Date(lastCallDate.getFullYear(), lastCallDate.getMonth(), lastCallDate.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Si le dernier call est aujourd'hui, on ne peut pas créer un nouveau call
    if (lastCallDay.getTime() === today.getTime()) {
      const nextCallDate = new Date(today);
      nextCallDate.setDate(nextCallDate.getDate() + 1);
      nextCallDate.setHours(0, 0, 0, 0);
      return res.status(429).json({
        error: "Vous ne pouvez faire qu'un seul call par jour",
        nextCallTime: nextCallDate.toISOString(),
      });
    }
  }
  
  const { slot, slotId, slotImage, slotProvider } = req.body || {};
  if (!slot) {
    return res.status(400).json({ error: "Le nom du slot est requis" });
  }
  
  const newCall = {
    id: randomUUID(),
    userId: session.userId,
    slot,
    slotId: slotId || null,
    slotImage: slotImage || null,
    slotProvider: slotProvider || null,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  
  calls.push(newCall);
  writeCalls(calls);
  
  res.json({ success: true, call: newCall });
});

// PUT: Mettre à jour un call (admin ou créateur)
app.put("/api/calls/:id", (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId) return res.status(401).json({ error: "Non authentifié" });
  
  const session = getSession(sessionId);
  if (!session) return res.status(401).json({ error: "Session invalide" });
  
  const calls = readCalls();
  const callIndex = calls.findIndex(c => c.id === req.params.id);
  if (callIndex === -1) return res.status(404).json({ error: "Call non trouvé" });
  
  const call = calls[callIndex];
  const isCreator = call.userId === session.userId;
  const isUserAdmin = checkAdminBySession(req);
  
  if (!isCreator && !isUserAdmin) {
    return res.status(403).json({ error: "Accès non autorisé" });
  }
  
  const { multiplier, points, status } = req.body || {};
  if (multiplier !== undefined) call.multiplier = multiplier;
  if (points !== undefined) call.points = points;
  if (status !== undefined) call.status = status;
  
  calls[callIndex] = call;
  writeCalls(calls);
  
  res.json({ success: true, call });
});

// DELETE: Supprimer un call (admin ou créateur)
app.delete("/api/calls/:id", (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId) return res.status(401).json({ error: "Non authentifié" });
  
  const session = getSession(sessionId);
  if (!session) return res.status(401).json({ error: "Session invalide" });
  
  const calls = readCalls();
  const callIndex = calls.findIndex(c => c.id === req.params.id);
  if (callIndex === -1) return res.status(404).json({ error: "Call non trouvé" });
  
  const call = calls[callIndex];
  const isCreator = call.userId === session.userId;
  const isUserAdmin = checkAdminBySession(req);
  
  if (!isCreator && !isUserAdmin) {
    return res.status(403).json({ error: "Accès non autorisé" });
  }
  
  calls.splice(callIndex, 1);
  writeCalls(calls);
  
  res.json({ success: true });
});

// -------- ORDERS API (Boutique) --------
// GET: Liste des commandes (admin only)
app.get("/api/orders", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  
  const orders = readOrders();
  const users = readUsers();
  
  // Enrichir avec les infos utilisateur
  const enrichedOrders = orders.map(order => {
    const user = users[order.userId];
    return {
      ...order,
      username: user?.global_name || user?.username || "Utilisateur inconnu",
      usernameSecondary: user?.username,
      avatar: user?.avatar,
    };
  });
  
  res.json({ orders: enrichedOrders });
});

// POST: Créer une commande (authentifié)
app.post("/api/orders", (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId) return res.status(401).json({ error: "Non authentifié" });
  
  const session = getSession(sessionId);
  if (!session) return res.status(401).json({ error: "Session invalide" });
  
  const users = readUsers();
  const user = users[session.userId];
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
  
  const { itemId, itemName, itemCategory, price } = req.body || {};
  
  if (!itemId || !itemName || !price) {
    return res.status(400).json({ error: "Les informations de l'article sont requises" });
  }
  
  // Vérifier que l'utilisateur a assez de points
  const userPoints = Math.round((user.points || 0) * 100) / 100; // Arrondir à 2 décimales
  if (userPoints < price) {
    return res.status(400).json({ error: "Points insuffisants" });
  }
  
  // Créer la commande
  const newOrder = {
    id: randomUUID(),
    userId: session.userId,
    itemId,
    itemName,
    itemCategory: itemCategory || "other",
    price,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  
  const orders = readOrders();
  orders.push(newOrder);
  writeOrders(orders);
  
  // Déduire les points
  users[session.userId] = {
    ...user,
    points: userPoints - price,
    updatedAt: new Date().toISOString(),
  };
  writeUsers(users);
  
  res.json({ success: true, order: newOrder });
});

// PUT: Mettre à jour le statut d'une commande (admin only)
app.put("/api/orders/:id", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  
  const orders = readOrders();
  const orderIndex = orders.findIndex(o => o.id === req.params.id);
  if (orderIndex === -1) return res.status(404).json({ error: "Commande non trouvée" });
  
  const order = orders[orderIndex];
  const oldStatus = order.status;
  const { status } = req.body || {};
  
  if (status && ["pending", "completed", "cancelled"].includes(status)) {
    const users = readUsers();
    const user = users[order.userId];
    
    // Si on annule une commande (qui n'était pas déjà annulée), rembourser les points
    if (status === "cancelled" && oldStatus !== "cancelled") {
      if (user) {
        const currentPoints = Math.round((user.points || 0) * 100) / 100; // Arrondir à 2 décimales
        users[order.userId] = {
          ...user,
          points: Math.round((currentPoints + order.price) * 100) / 100, // Arrondir à 2 décimales
          updatedAt: new Date().toISOString(),
        };
        writeUsers(users);
      }
    }
    
    // Si on passe d'annulé à un autre statut, déduire à nouveau les points
    if (oldStatus === "cancelled" && status !== "cancelled") {
      if (user) {
        const currentPoints = Math.round((user.points || 0) * 100) / 100; // Arrondir à 2 décimales
        if (currentPoints >= order.price) {
          users[order.userId] = {
            ...user,
            points: Math.round((currentPoints - order.price) * 100) / 100, // Arrondir à 2 décimales
            updatedAt: new Date().toISOString(),
          };
          writeUsers(users);
        } else {
          return res.status(400).json({ error: "L'utilisateur n'a pas assez de points pour cette opération" });
        }
      }
    }
    
    orders[orderIndex].status = status;
    if (status === "completed") {
      orders[orderIndex].completedAt = new Date().toISOString();
    } else if (status === "cancelled") {
      orders[orderIndex].cancelledAt = new Date().toISOString();
    }
    writeOrders(orders);
    res.json({ success: true, order: orders[orderIndex] });
  } else {
    res.status(400).json({ error: "Statut invalide" });
  }
});

// DELETE: Supprimer une commande (admin only)
app.delete("/api/orders/:id", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  
  const orders = readOrders();
  const orderIndex = orders.findIndex(o => o.id === req.params.id);
  if (orderIndex === -1) return res.status(404).json({ error: "Commande non trouvée" });
  
  orders.splice(orderIndex, 1);
  writeOrders(orders);
  
  res.json({ success: true });
});

// -------- GIVEAWAYS API --------
// GET: Liste des giveaways (public)
app.get("/api/giveaways", (req, res) => {
  const giveaways = readGiveaways();
  res.json(giveaways);
});

// POST: Créer un giveaway (admin only)
app.post("/api/giveaways", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  
  const { title, description, prize, ticketPrice, endDate, isAffiliateOnly } = req.body || {};
  
  if (!title || !description || !prize || !ticketPrice || !endDate) {
    return res.status(400).json({ error: "Champs manquants" });
  }
  
  const giveaways = readGiveaways();
  const newId = randomUUID();
  
  const newGiveaway = {
    id: newId,
    title,
    description,
    prize,
    ticketPrice: parseInt(ticketPrice) || 1,
    endDate: new Date(endDate).toISOString(),
    createdAt: new Date().toISOString(),
    isAffiliateOnly: Boolean(isAffiliateOnly),
    entries: [],
    winners: [],
  };
  
  giveaways.push(newGiveaway);
  writeGiveaways(giveaways);
  
  res.json({ success: true, giveaway: newGiveaway });
});

// PUT: Modifier un giveaway (admin only)
app.put("/api/giveaways/:id", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  
  const { title, description, prize, ticketPrice, endDate, isAffiliateOnly } = req.body || {};
  const giveaways = readGiveaways();
  const index = giveaways.findIndex(g => g.id === req.params.id);
  
  if (index === -1) return res.status(404).json({ error: "Giveaway non trouvé" });
  
  if (title) giveaways[index].title = title;
  if (description) giveaways[index].description = description;
  if (prize) giveaways[index].prize = prize;
  if (ticketPrice !== undefined) giveaways[index].ticketPrice = parseInt(ticketPrice) || 1;
  if (endDate) giveaways[index].endDate = new Date(endDate).toISOString();
  if (isAffiliateOnly !== undefined) giveaways[index].isAffiliateOnly = Boolean(isAffiliateOnly);
  
  writeGiveaways(giveaways);
  
  res.json({ success: true, giveaway: giveaways[index] });
});

// DELETE: Supprimer un giveaway (admin only)
app.delete("/api/giveaways/:id", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  
  const giveaways = readGiveaways();
  const filtered = giveaways.filter(g => g.id !== req.params.id);
  
  if (filtered.length === giveaways.length) {
    return res.status(404).json({ error: "Giveaway non trouvé" });
  }
  
  writeGiveaways(filtered);
  
  res.json({ success: true });
});

// POST: Acheter des tickets (authentifié)
app.post("/api/giveaways/purchase", (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId) return res.status(401).json({ error: "Non authentifié" });
  
  const session = getSession(sessionId);
  if (!session) return res.status(401).json({ error: "Session invalide" });
  
  const { giveawayId, tickets } = req.body || {};
  
  if (!giveawayId || !tickets || tickets < 1) {
    return res.status(400).json({ error: "Paramètres invalides" });
  }
  
  const giveaways = readGiveaways();
  const giveaway = giveaways.find(g => g.id === giveawayId);
  
  if (!giveaway) return res.status(404).json({ error: "Giveaway non trouvé" });
  
  // Vérifier que le giveaway est actif
  const now = new Date();
  const endDate = new Date(giveaway.endDate);
  if (endDate <= now || giveaway.winners.length > 0) {
    return res.status(400).json({ error: "Ce giveaway n'est plus actif" });
  }
  
  // Vérifier si le giveaway est réservé aux affiliés
  if (giveaway.isAffiliateOnly) {
    const roles = readRoles();
    if (!roles[session.userId] || !roles[session.userId].includes("AFFILIÉ")) {
      return res.status(403).json({ error: "Ce giveaway est réservé aux affiliés uniquement" });
    }
  }
  
  const users = readUsers();
  const user = users[session.userId];
  
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
  
  const totalCost = giveaway.ticketPrice * tickets;
  const userPoints = Math.round((user.points || 0) * 100) / 100;
  
  if (userPoints < totalCost) {
    return res.status(400).json({ error: "Points insuffisants" });
  }
  
  // Déduire les points
  const newPoints = Math.round((userPoints - totalCost) * 100) / 100;
  users[session.userId] = {
    ...user,
    points: newPoints,
    updatedAt: new Date().toISOString(),
  };
  writeUsers(users);
  
  // Ajouter les tickets
  const entryId = randomUUID();
  const existingEntryIndex = giveaway.entries.findIndex(
    e => e.user.id === session.userId
  );
  
  if (existingEntryIndex >= 0) {
    giveaway.entries[existingEntryIndex].tickets += tickets;
  } else {
    giveaway.entries.push({
      id: entryId,
      user: {
        id: session.userId,
        name: user.username || user.global_name || "Utilisateur",
      },
      tickets,
    });
  }
  
  writeGiveaways(giveaways);
  
  res.json({
    success: true,
    points: newPoints,
    tickets: existingEntryIndex >= 0 ? giveaway.entries[existingEntryIndex].tickets : tickets,
  });
});

// POST: Sélectionner les gagnants (admin only)
app.post("/api/giveaways/:id/winners", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  
  const { count } = req.body || {};
  const winnerCount = parseInt(count) || 1;
  
  const giveaways = readGiveaways();
  const giveaway = giveaways.find(g => g.id === req.params.id);
  
  if (!giveaway) return res.status(404).json({ error: "Giveaway non trouvé" });
  
  if (giveaway.winners.length > 0) {
    return res.status(400).json({ error: "Les gagnants ont déjà été sélectionnés" });
  }
  
  if (giveaway.entries.length === 0) {
    return res.status(400).json({ error: "Aucun participant" });
  }
  
  if (winnerCount > giveaway.entries.length) {
    return res.status(400).json({ error: "Trop de gagnants demandés" });
  }
  
  // Si le giveaway est réservé aux affiliés, filtrer les participants
  let eligibleEntries = giveaway.entries;
  if (giveaway.isAffiliateOnly) {
    const roles = readRoles();
    eligibleEntries = giveaway.entries.filter(entry => {
      return roles[entry.user.id] && roles[entry.user.id].includes("AFFILIÉ");
    });
    
    if (eligibleEntries.length === 0) {
      return res.status(400).json({ error: "Aucun participant affilié trouvé" });
    }
  }
  
  // Créer un pool de tickets pondéré avec les participants éligibles
  const ticketPool = [];
  eligibleEntries.forEach(entry => {
    for (let i = 0; i < entry.tickets; i++) {
      ticketPool.push(entry.user);
    }
  });
  
  // Sélectionner les gagnants aléatoirement (pondéré par le nombre de tickets)
  const selectedWinners = [];
  const usedUserIds = new Set();
  
  // Mélanger le pool de tickets
  for (let i = ticketPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ticketPool[i], ticketPool[j]] = [ticketPool[j], ticketPool[i]];
  }
  
  // Sélectionner les gagnants uniques
  for (let i = 0; i < ticketPool.length && selectedWinners.length < winnerCount; i++) {
    const winner = ticketPool[i];
    if (!usedUserIds.has(winner.id)) {
      usedUserIds.add(winner.id);
      selectedWinners.push({
        id: randomUUID(),
        user: {
          id: winner.id,
          name: winner.name,
        },
      });
    }
  }
  
  giveaway.winners = selectedWinners;
  writeGiveaways(giveaways);
  
  res.json({ success: true, winners: selectedWinners });
});

// POST: Reroll un giveaway (admin only) - Réinitialise les gagnants
app.post("/api/giveaways/:id/reroll", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Accès non autorisé" });
  
  const giveaways = readGiveaways();
  const giveaway = giveaways.find(g => g.id === req.params.id);
  
  if (!giveaway) return res.status(404).json({ error: "Giveaway non trouvé" });
  
  if (giveaway.winners.length === 0) {
    return res.status(400).json({ error: "Ce giveaway n'a pas encore de gagnants" });
  }
  
  // Réinitialiser les gagnants
  giveaway.winners = [];
  writeGiveaways(giveaways);
  
  res.json({ success: true, message: "Giveaway rerollé avec succès" });
});

// GET: Stats utilisateur (authentifié)
app.get("/api/user/stats", (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId) return res.status(401).json({ error: "Non authentifié" });
  
  const session = getSession(sessionId);
  if (!session) return res.status(401).json({ error: "Session invalide" });
  
  const users = readUsers();
  const user = users[session.userId];
  
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
  
  // Récupérer tous les paris de l'utilisateur depuis tous les mois
  const wagers = readWagers();
  const allBets = [];
  
  for (const monthKey in wagers) {
    if (wagers[monthKey][session.userId] && wagers[monthKey][session.userId].bets) {
      const userBets = wagers[monthKey][session.userId].bets;
      userBets.forEach(bet => {
        allBets.push(bet);
      });
    }
  }
  
  // Calculer les statistiques
  let totalWager = 0;
  let totalWinnings = 0;
  let totalBets = allBets.length;
  let winningBetsCount = 0;
  let bestWin = 0;
  
  allBets.forEach(bet => {
    // Ajouter le montant misé au total
    totalWager += Math.round((bet.amount || 0) * 100) / 100;
    
    // Si le pari a un résultat et est gagnant
    if (bet.isWin === true && bet.result !== null && bet.result !== undefined) {
      const winAmount = Math.round((bet.result || 0) * 100) / 100;
      totalWinnings += winAmount;
      winningBetsCount += 1;
      
      // Mettre à jour le meilleur gain
      if (winAmount > bestWin) {
        bestWin = winAmount;
      }
    } else if (bet.isWin === false) {
      // Pari explicitement marqué comme perdu
      // Ne rien ajouter aux gains
    } else if (bet.isWin === null || bet.isWin === undefined) {
      // Pari sans résultat - considérer comme perdu si le pari a plus de 5 minutes
      const betDate = new Date(bet.date);
      const now = new Date();
      const diffMinutes = (now - betDate) / (1000 * 60);
      
      if (diffMinutes > 5) {
        // Pari ancien sans résultat = considéré comme perdu
        // Ne rien ajouter aux gains
      }
      // Sinon, on ne compte pas ce pari dans les statistiques (trop récent, peut-être en cours)
    }
  });
  
  // Calculer le taux de victoire
  const winRate = totalBets > 0 ? (winningBetsCount / totalBets) * 100 : 0;
  
  res.json({
    points: Math.round((user.points || 0) * 100) / 100,
    totalWager: Math.round(totalWager * 100) / 100,
    totalWinnings: Math.round(totalWinnings * 100) / 100,
    totalBets: totalBets,
    winningBetsCount: winningBetsCount,
    winRate: Math.round(winRate * 10) / 10, // Arrondir à 1 décimale
    bestWin: Math.round(bestWin * 100) / 100,
  });
});

// GET: Profil utilisateur complet (authentifié)
app.get("/api/user/profile", (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId) return res.status(401).json({ error: "Non authentifié" });
  
  const session = getSession(sessionId);
  if (!session) return res.status(401).json({ error: "Session invalide" });
  
  const users = readUsers();
  
  // Si userId est fourni dans la query, vérifier que c'est un admin
  const targetUserId = req.query.userId || session.userId;
  if (targetUserId !== session.userId && !isAdmin(req)) {
    return res.status(403).json({ error: "Accès non autorisé" });
  }
  
  const user = users[targetUserId];
  
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
  
  const roles = readRoles();
  
  res.json({
    id: user.id,
    username: user.username,
    global_name: user.global_name,
    email: user.email,
    avatar: user.avatar,
    points: Math.round((user.points || 0) * 100) / 100,
    roles: roles[user.id] || [],
    loginHistory: user.loginHistory || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    gambaUsername: user.gambaUsername || "",
    dliveUsername: user.dliveUsername || "",
  });
});

// POST: Mettre à jour le profil utilisateur (authentifié)
app.post("/api/user/profile", (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId) return res.status(401).json({ error: "Non authentifié" });
  
  const session = getSession(sessionId);
  if (!session) return res.status(401).json({ error: "Session invalide" });
  
  const users = readUsers();
  const user = users[session.userId];
  
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
  
  // Mettre à jour les champs du profil
  if (req.body.gambaUsername !== undefined) {
    // Si l'utilisateur a déjà un pseudo Gamba, ne pas permettre la modification
    if (user.gambaUsername && user.gambaUsername.trim() !== "" && req.body.gambaUsername !== user.gambaUsername) {
      return res.status(400).json({ error: "Le pseudo Gamba ne peut être modifié qu'une seule fois" });
    }
    // Permettre la première définition ou la modification si vide
    if (!user.gambaUsername || user.gambaUsername.trim() === "") {
      user.gambaUsername = req.body.gambaUsername;
    }
  }
  if (req.body.dliveUsername !== undefined) {
    user.dliveUsername = req.body.dliveUsername;
  }
  
  user.updatedAt = new Date().toISOString();
  users[session.userId] = user;
  writeUsers(users);
  
  res.json({ success: true, message: "Profil mis à jour avec succès" });
});

// GET: Historique des paris récents (authentifié)
app.get("/api/user/recent-bets", (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId) return res.status(401).json({ error: "Non authentifié" });
  
  const session = getSession(sessionId);
  if (!session) return res.status(401).json({ error: "Session invalide" });
  
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;
  
  const wagers = readWagers();
  const allBets = [];
  
  // Parcourir tous les mois pour récupérer tous les paris de l'utilisateur
  for (const monthKey in wagers) {
    if (wagers[monthKey][session.userId] && wagers[monthKey][session.userId].bets) {
      const userBets = wagers[monthKey][session.userId].bets;
      userBets.forEach(bet => {
        allBets.push({
          ...bet,
          id: `${monthKey}-${bet.date}-${Math.random().toString(36).substr(2, 9)}`,
        });
      });
    }
  }
  
  // Trier par date (plus récent en premier)
  allBets.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Pagination
  const totalBets = allBets.length;
  const paginatedBets = allBets.slice(offset, offset + limit);
  
  // Formater les paris pour l'affichage
  const formattedBets = paginatedBets.map(bet => {
    const betDate = new Date(bet.date);
    const now = new Date();
    const diffMs = now - betDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    let timeAgo = "Il y a moins d'une minute";
    if (diffMins > 0 && diffMins < 60) {
      timeAgo = `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours > 0 && diffHours < 24) {
      timeAgo = `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays > 0) {
      timeAgo = `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    }
    
    // Utiliser les résultats stockés si disponibles
    const result = bet.result !== null && bet.result !== undefined ? Math.round(bet.result * 100) / 100 : 0;
    const isWin = bet.isWin !== null && bet.isWin !== undefined ? bet.isWin : false;
    const multiplier = bet.multiplier !== null && bet.multiplier !== undefined ? parseFloat(bet.multiplier) : null;
    
    // Déterminer le statut pour l'affichage
    let status = "";
    if (isWin) {
      status = "Victoire";
    } else if (bet.isWin === false) {
      status = "Défaite";
    } else {
      status = "En cours";
    }
    
    return {
      id: bet.id,
      gameType: bet.game,
      betAmount: Math.round(bet.amount * 100) / 100,
      result: result,
      isWin: isWin,
      multiplier: multiplier,
      timeAgo: timeAgo,
      date: bet.date,
      status: status,
    };
  });
  
  res.json({
    bets: formattedBets,
    totalBets: totalBets,
    page: page,
    limit: limit,
  });
});

// GET: Historique des commandes (authentifié)
app.get("/api/user/orders", (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId) return res.status(401).json({ error: "Non authentifié" });
  
  const session = getSession(sessionId);
  if (!session) return res.status(401).json({ error: "Session invalide" });
  
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;
  
  const orders = readOrders();
  
  // Filtrer les commandes de l'utilisateur
  const userOrders = orders.filter(order => order.userId === session.userId);
  
  // Trier par date (plus récent en premier)
  userOrders.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
  
  // Pagination
  const totalOrders = userOrders.length;
  const paginatedOrders = userOrders.slice(offset, offset + limit);
  
  // Formater les commandes pour l'affichage
  const formattedOrders = paginatedOrders.map(order => {
    const orderDate = new Date(order.createdAt || order.date || new Date());
    const now = new Date();
    const diffMs = now - orderDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    let timeAgo = "Il y a moins d'une minute";
    if (diffMins > 0 && diffMins < 60) {
      timeAgo = `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours > 0 && diffHours < 24) {
      timeAgo = `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays > 0) {
      timeAgo = `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    }
    
    return {
      id: order.id || order._id || Math.random().toString(36).substr(2, 9),
      storeitem: order.storeitem || {
        name: order.itemName || "Article inconnu",
        category: order.category || "Autre",
        image: order.image,
      },
      quantity: order.quantity || 1,
      totalPrice: Math.round((order.totalPrice || order.price || 0) * 100) / 100,
      status: order.status || "pending",
      createdAt: order.createdAt || order.date || new Date().toISOString(),
      metadata: order.metadata,
      timeAgo: timeAgo,
    };
  });
  
  res.json({
    orders: formattedOrders,
    totalOrders: totalOrders,
    page: page,
    limit: limit,
  });
});

// -------- COUPONS API --------
// GET: Liste tous les coupons (admin only)
app.get("/api/coupons", (req, res) => {
  if (!checkAdminBySession(req)) {
    return res.status(403).json({ error: "Accès non autorisé" });
  }
  
  const coupons = readCoupons();
  res.json({ coupons });
});

// POST: Créer un nouveau coupon (admin only)
app.post("/api/coupons", (req, res) => {
  if (!checkAdminBySession(req)) {
    return res.status(403).json({ error: "Accès non autorisé" });
  }
  
  const { code, points, maxUses, expiresAt, description } = req.body;
  
  if (!code || !points) {
    return res.status(400).json({ error: "Le code et les points sont requis" });
  }
  
  const coupons = readCoupons();
  
  // Vérifier si le code existe déjà
  if (coupons.some(c => c.code.toUpperCase() === code.toUpperCase())) {
    return res.status(400).json({ error: "Ce code coupon existe déjà" });
  }
  
  const newCoupon = {
    id: Date.now().toString(),
    code: code.toUpperCase(),
    points: Math.round((parseFloat(points) || 0) * 100) / 100,
    maxUses: maxUses ? parseInt(maxUses) : null,
    currentUses: 0,
    expiresAt: expiresAt || null,
    description: description || "",
    createdAt: new Date().toISOString(),
    createdBy: req.session?.userId || "unknown",
  };
  
  coupons.push(newCoupon);
  writeCoupons(coupons);
  
  res.json({ success: true, coupon: newCoupon });
});

// PUT: Mettre à jour un coupon (admin only)
app.put("/api/coupons/:id", (req, res) => {
  if (!checkAdminBySession(req)) {
    return res.status(403).json({ error: "Accès non autorisé" });
  }
  
  const { id } = req.params;
  const { code, points, maxUses, expiresAt, description } = req.body;
  
  const coupons = readCoupons();
  const couponIndex = coupons.findIndex(c => c.id === id);
  
  if (couponIndex === -1) {
    return res.status(404).json({ error: "Coupon non trouvé" });
  }
  
  // Vérifier si le code existe déjà (sauf pour ce coupon)
  if (code && coupons.some(c => c.id !== id && c.code.toUpperCase() === code.toUpperCase())) {
    return res.status(400).json({ error: "Ce code coupon existe déjà" });
  }
  
  const updatedCoupon = {
    ...coupons[couponIndex],
    ...(code && { code: code.toUpperCase() }),
    ...(points !== undefined && { points: Math.round((parseFloat(points) || 0) * 100) / 100 }),
    ...(maxUses !== undefined && { maxUses: maxUses ? parseInt(maxUses) : null }),
    ...(expiresAt !== undefined && { expiresAt: expiresAt || null }),
    ...(description !== undefined && { description: description || "" }),
    updatedAt: new Date().toISOString(),
  };
  
  coupons[couponIndex] = updatedCoupon;
  writeCoupons(coupons);
  
  res.json({ success: true, coupon: updatedCoupon });
});

// DELETE: Supprimer un coupon (admin only)
app.delete("/api/coupons/:id", (req, res) => {
  if (!checkAdminBySession(req)) {
    return res.status(403).json({ error: "Accès non autorisé" });
  }
  
  const { id } = req.params;
  const coupons = readCoupons();
  const filteredCoupons = coupons.filter(c => c.id !== id);
  
  if (filteredCoupons.length === coupons.length) {
    return res.status(404).json({ error: "Coupon non trouvé" });
  }
  
  writeCoupons(filteredCoupons);
  res.json({ success: true });
});

// POST: Réclamer un coupon (authentifié)
app.post("/api/coupons/claim", (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  
  const session = getSession(sessionId);
  if (!session) {
    return res.status(401).json({ error: "Session invalide" });
  }
  
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: "Le code est requis" });
  }
  
  const coupons = readCoupons();
  const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
  
  if (!coupon) {
    return res.status(404).json({ error: "Code coupon invalide" });
  }
  
  // Vérifier si le coupon a expiré
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return res.status(400).json({ error: "Ce coupon a expiré" });
  }
  
  // Vérifier si le coupon a atteint sa limite d'utilisation
  if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
    return res.status(400).json({ error: "Ce coupon a atteint sa limite d'utilisation" });
  }
  
  // Vérifier si l'utilisateur a déjà utilisé ce coupon
  const users = readUsers();
  const user = users[session.userId];
  
  if (!user) {
    return res.status(404).json({ error: "Utilisateur non trouvé" });
  }
  
  if (!user.usedCoupons) {
    user.usedCoupons = [];
  }
  
  if (user.usedCoupons.includes(coupon.id)) {
    return res.status(400).json({ error: "Vous avez déjà utilisé ce coupon" });
  }
  
  // Ajouter les points
  const oldPoints = user.points || 0;
  const newPoints = Math.round((oldPoints + coupon.points) * 100) / 100;
  
  users[session.userId] = {
    ...user,
    points: newPoints,
    usedCoupons: [...user.usedCoupons, coupon.id],
    updatedAt: new Date().toISOString(),
  };
  writeUsers(users);
  
  // Mettre à jour le nombre d'utilisations du coupon
  coupon.currentUses += 1;
  coupon.lastUsedAt = new Date().toISOString();
  writeCoupons(coupons);
  
  res.json({
    success: true,
    points: newPoints,
    message: `Vous avez reçu ${coupon.points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} points !`,
  });
});

app.listen(PORT, () => console.log(`✅ Serveur API lancé sur http://localhost:${PORT}`));

