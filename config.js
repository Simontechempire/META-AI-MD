// config.js - META AI MD by Simon Tech
// Owner number / LID are set via Environment Variables - do NOT hardcode them here
// Render -> Environment -> OWNER_NUMBER, OWNER_LID, SESSION_ID

const OWNER_NUMBER = String(process.env.OWNER_NUMBER || '').replace(/[^0-9]/g, '');
const OWNER_LID = String(process.env.OWNER_LID || '').replace(/[^0-9]/g, '');

module.exports = {
  // ===== BOT INFO =====
  botName: 'META AI MD',
  botNameShort: 'META',
  ownerName: 'META',
  ownerAlias: 'Simon Tech',
  ownerNumber: OWNER_NUMBER, // Set in Render Env Vars - e.g. 2348102350169
  owners: OWNER_NUMBER ? [OWNER_NUMBER] : [], // Phone numbers only - person who paired the bot = MAIN OWNER
  ownerLids: OWNER_LID ? [OWNER_LID] : [], // LID of owner - for LID match only
  ownerJid: OWNER_NUMBER ? `${OWNER_NUMBER}@s.whatsapp.net` : '',
  botNumber: '', // Auto-filled after pairing, leave empty

  // ===== PREFIX =====
  // Bot responds to all of these
  prefixes: ['.', ',', '!', '?', '/'],
  prefix: '.',

  // ===== STYLE / FOOTER / FANCY / REACTION =====
  footer: '©️ Created by Simon Tech Inc',
  header: '◈┈▉ `META AI MD` ▉┄◈',
  botPfp: 'https://files.catbox.moe/hhafg3.jpg',
  thumb: 'https://files.catbox.moe/hhafg3.jpg',
  menuPfp: 'https://i.postimg.cc/GmSz8cDT/IMG-20261105-WA0073.jpg',
  alivePfp: 'https://files.catbox.moe/hhafg3.jpg',
  fancy: true, // Fancy Bold style ON - F.fancy() / F.bold()
  reaction: { await: '⏳', done: '✅' }, // Await when action is running, Done when action completes

  // ===== SESSION / PAIRING =====
  sessionName: 'Meta',
  sessionFolder: './Meta',
  sessionId: process.env.SESSION_ID || '',
  pairing: true, // true = use pairing code, false = QR
  pairingNumber: OWNER_NUMBER, // Number that receives pairing code

  // ===== MODE / SETTINGS =====
  // This is DEFAULT for FIRST START ONLY.
  // DB (database.json) is truth after first start. .mode public / .mode private wins + survives restart.
  // 'private' = only owner can use bot, non-owner = IGNORE silent
  // 'public' = everyone can use bot
  // To force bot to start private after Render restart, delete database.json before restart.
  mode: 'private',
  forceConfigMode: false, // Was true - forced private forever, .mode public never worked. Now false = DB wins.
  forceConfigPrefix: false, // Was true - reset .setprefix after restart. Now false = DB wins.
  language: 'en',
  timezone: process.env.TZ || 'UTC',
  totalCmds: 300,
  warnLimit: 3, // 3 warns = kick
  deleteAfterWarn: true,

  // ===== HOSTING =====
  hosting: 'Render',
  port: process.env.PORT || 10000,
  appUrl: process.env.APP_URL || '',

  // ===== LINKS =====
  repo: 'https://github.com/SimonTech/META-AI-MD',
  channel: '', // Put your real channel link here
  group: '', // Put your real group link here
  support: OWNER_NUMBER ? `https://wa.me/${OWNER_NUMBER}` : '',

  // ===== AUTO DEFAULTS (all OFF by default) =====
  auto: {
    autoread: false,
    autotyping: false,
    autoonline: false,
    autorecording: false,
    autoreact: false,
    autoreply: false,
    autosticker: false,
    autoview: false,
    autobio: false,
    autolikestatus: false,
    autodownload: false,
    autowelcome: false,
    autogoodbye: false,
    autolikemsg: false,
    autotranslate: false,
    autopresence: false,
    autostatus: false,
    autorespond: false,
    autoclean: false,
  },

  // ===== ANTI / PROTECTION DEFAULTS =====
  // All OFF by default - Admins turn ON with .antilink on etc
  anti: {
    antigroupstatus: false,
    antigcstatus: false,
    antilink: false,
    antibadword: false,
    antisticker: false,
    antiimage: false,
    antivideo: false,
    antiaudio: false,
    antidocument: false,
    antiforward: false,
    antispam: false,
    antiflood: false,
    antitag: false,
    antimention: false,
    antidelete: false,
    antifake: false,
    antibot: false,
    antinsfw: false,
    antiviewonce: false,
    antiedit: false,
    antipromote: false,
    antidemote: false,
  },

  // ===== PROTECTION RULE =====
  protection: {
    enabled: true,
    warn1: '⚠️ Warning 1/3 - Message Deleted',
    warn2: '⚠️ Warning 2/3 - One More = Kick',
    warn3: '🦶 Kicked - 3/3 Violations',
    adminBypass: true, // Admins do not get warnings
    botMustBeAdminToKick: true,
  },

  // ===== WELCOME / GOODBYE =====
  welcome: {
    enabled: false,
    text: '👋 Welcome @user to @group!\n> Type .menu for commands\n> META AI MD',
  },
  goodbye: {
    enabled: false,
    text: '👋 Goodbye @user, we will miss you\n> META AI MD',
  },

  // ===== MESSAGES =====
  messages: {
    ownerOnly: '❌ Owner only command.',
    adminOnly: '❌ Admins only.',
    botAdmin: '❌ Bot must be admin first.',
    groupOnly: '❌ Group only command.',
    privateOnly: '❌ Private only command.',
    needText: '❌ Give me text. Example: ',
    needReply: '❌ Reply to a message first.',
    needMedia: '❌ Send / reply to image / video / sticker first.',
    needLink: '❌ Give me link. Example: ',
    error: '❌ Error, try again.',
    wait: '⏳ Processing...',
    success: '✅ Done!',
    notFound: '❌ Not found.',
    noPerm: '❌ You do not have permission.',
    warn: '⚠️ Warning',
    kicked: '🦶 Kicked for breaking rules',
  },

  // ===== API (free, no key) =====
  apis: {
    ai: 'https://text.pollinations.ai/',
    ai2: 'https://api.vreden.my.id/api/gpt?query=',
    image: 'https://image.pollinations.ai/prompt/',
    joke: 'https://official-joke-api.appspot.com/random_joke',
    quote: 'https://api.quotable.io/random',
    meme: 'https://meme-api.com/gimme',
    cat: 'https://api.thecatapi.com/v1/images/search',
    dog: 'https://dog.ceo/api/breeds/image/random',
    fox: 'https://randomfox.ca/floof/',
    wiki: 'https://en.wikipedia.org/api/rest_v1/page/summary/',
    weather: 'https://wttr.in/',
    lyrics: 'https://api.lyrics.ovh/v1/',
    tiktok: 'https://api.vreden.my.id/api/tiktok?url=',
    ytplay: 'https://api.vreden.my.id/api/ytplaymp3?query=',
    ytvideo: 'https://api.vreden.my.id/api/ytplaymp4?query=',
    attp: 'https://api.vreden.my.id/api/attp?text=',
    brat: 'https://api.vreden.my.id/api/brat?text=',
    qc: 'https://api.vreden.my.id/api/qc?text=',
    emojimix: 'https://api.vreden.my.id/api/emojimix',
    wanted: 'https://api.vreden.my.id/api/wanted?url=',
    trigger: 'https://api.vreden.my.id/api/trigger?url=',
  },

  // ===== STICKER =====
  sticker: {
    pack: 'META AI MD',
    author: 'SIMON TECH',
    quality: 80,
  },

  // ===== LIMITS =====
  limits: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    downloadTimeout: 30000,
    aiTimeout: 20000,
  }
};
