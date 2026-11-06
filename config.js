// config.js - META AI MD by Simon Tech / META
// Re-edited - Clean + Complete - PRIVATE FIXED

module.exports = {
  // ===== BOT INFO =====
  botName: 'META AI MD',
  botNameShort: 'META',
  ownerName: 'META',
  ownerAlias: 'Simon Tech',
  ownerNumber: '2348102350169', // +234 810 235 0169 - no + , no space
  owners: ['2348102350169'], // Phone numbers only - person wey pair the bot = MAIN OWNER
  ownerLids: ['23223458631686'], // LID of owner - for LID match ONLY, no be phone number
  ownerJid: '2348102350169@s.whatsapp.net',
  botNumber: '', // auto-filled after pairing, leave empty

  // ===== PREFIX =====
  // Bot go answer to ALL of these
  prefixes: ['.', ',', '!', '?', '@', '-', '/'],
  prefix: '.',

  // ===== STYLE / FOOTER / FANCY / REACTION =====
  footer: '©️ created by Simon tech inc',
  header: '◈┈▉ `ᴍᴇᴛᴀ ᴀɪ ᴍᴅ` ▉┄◈',
  botPfp: 'https://files.catbox.moe/hhafg3.jpg',
  thumb: 'https://files.catbox.moe/hhafg3.jpg',
  menuPfp: 'https://i.postimg.cc/GmSz8cDT/IMG-20261105-WA0073.jpg',
  alivePfp: 'https://files.catbox.moe/hhafg3.jpg',
  fancy: true, // Fancy Bold keyboard style ON - F.fancy() / F.bold()
  reaction: { await: '⏳', done: '💀' }, // Await ⏳ when action dey execute, Complete 💀 when action complete

  // ===== SESSION / PAIRING =====
  sessionName: 'Meta',
  sessionFolder: './Meta',
  sessionId: process.env.SESSION_ID || '', // paste your session id here if you get one
  pairing: true, // true = use pairing code, false = QR
  pairingNumber: '2348102350169', // number wey go receive pairing code

  // ===== MODE / SETTINGS =====
  // IMPORTANT: This na DEFAULT for FIRST START ONLY - no be force again.
  // DB (database.json) na truth after first start. ,mode public / ,mode private go win + survive restart.
  // 'private' = only owner (2348102350169 - person wey pair bot) fit use bot, isOwner ❌ = IGNORE silent
  // 'public' = everybody fit use bot, Owner & isOwner ✅ = reply
  // If you want make bot ALWAYS start private after Render restart, delete database.json before restart.
  mode: 'private',
  forceConfigMode: false, // FIXED: Was true - e dey force private forever, ,mode public never work. Now false = DB wins.
  forceConfigPrefix: false, // FIXED: Was true - e dey reset ,setprefix after restart. Now false = DB wins.
  language: 'en',
  timezone: 'Africa/Lagos',
  totalCmds: 300,
  warnLimit: 3, // 3 warns = kick
  deleteAfterWarn: true,

  // ===== HOSTING =====
  hosting: 'Render',
  port: process.env.PORT || 10000,
  appUrl: process.env.APP_URL || '', // e.g https://meta-ai-md.onrender.com

  // ===== LINKS =====
  repo: 'https://github.com/SimonTech/META-AI-MD',
  channel: 'https://whatsapp.com/channel/0029Vb...', // put your channel
  group: 'https://chat.whatsapp.com/...', // put your group
  support: 'https://wa.me/2348102350169',

  // ===== AUTO DEFAULTS (all OFF by default) =====
  auto: {
    autoread: false,
    autotyping: false,
    autoonline: false,
    autorecording: false,
    autoreact: false,
    autoreply: false,
    autosticker: false,
    autoview: false, // autoview status
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
  // All OFF by default - Admin go turn ON with .antigroupstatus on etc
  anti: {
    antigroupstatus: false, // mention/tag for status - delete + warn
    antigcstatus: false,    // share group status if not admin - delete + warn
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
    adminBypass: true, // admins no go chop warn
    botMustBeAdminToKick: true,
  },

  // ===== WELCOME / GOODBYE =====
  welcome: {
    enabled: false,
    text: '👋 Welcome @user to @group!\n> Type .menu for commands\n> META AI MD',
  },
  goodbye: {
    enabled: false,
    text: '👋 Bye @user, we go miss you 😭\n> META AI MD',
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
    noPerm: '❌ You no get permission.',
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
