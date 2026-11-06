// config.js - META AI MD by Simon Tech / META
// FIXED - Private + Single Prefix

module.exports = {
  // ===== BOT INFO =====
  botName: 'META AI MD',
  botNameShort: 'META',
  ownerName: 'META',
  ownerAlias: 'Simon Tech',
  ownerNumber: '2348102350169',
  owners: ['2348102350169'],
  ownerJid: '2348102350169@s.whatsapp.net',
  botNumber: '',

  // ===== PREFIX - FIXED =====
  // CHANGE ONLY HERE! Put your new prefix here
  // If you want , put ',' - If you want ! put '!'
  // DO NOT put many, put only ONE
  prefix: ',', // <-- YOUR NEW PREFIX HERE
  prefixes: [','], // <-- MUST MATCH prefix above, same one only

  // ===== STYLE / FOOTER =====
  footer: '©️ created by Simon tech inc',
  header: '◈┈▉ `ᴍᴇᴛᴀ ᴀɪ ᴍᴅ` ▉┄◈',
  botPfp: 'https://files.catbox.moe/hhafg3.jpg',
  thumb: 'https://files.catbox.moe/hhafg3.jpg',
  menuPfp: 'https://i.postimg.cc/GmSz8cDT/IMG-20261105-WA0073.jpg',
  alivePfp: 'https://files.catbox.moe/hhafg3.jpg',

  // ===== SESSION / PAIRING =====
  sessionName: 'Meta',
  sessionFolder: './Meta',
  sessionId: process.env.SESSION_ID || '',
  pairing: true,
  pairingNumber: '2348102350169',

  // ===== MODE / SETTINGS =====
  mode: 'private', // private = only you fit use bot
  language: 'en',
  timezone: 'Africa/Lagos',
  totalCmds: 300,
  warnLimit: 3,
  deleteAfterWarn: true,

  // ===== HOSTING =====
  hosting: 'Render',
  port: process.env.PORT || 10000,
  appUrl: process.env.APP_URL || '',

  // ===== LINKS =====
  repo: 'https://github.com/SimonTech/META-AI-MD',
  channel: 'https://whatsapp.com/channel/0029Vb...',
  group: 'https://chat.whatsapp.com/...',
  support: 'https://wa.me/2348102350169',

  // ===== AUTO DEFAULTS =====
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

  // ===== ANTI / PROTECTION =====
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

  protection: {
    enabled: true,
    warn1: '⚠️ Warning 1/3 - Message Deleted',
    warn2: '⚠️ Warning 2/3 - One More = Kick',
    warn3: '🦶 Kicked - 3/3 Violations',
    adminBypass: true,
    botMustBeAdminToKick: true,
  },

  welcome: {
    enabled: false,
    text: '👋 Welcome @user to @group!\n> Type ,menu for commands\n> META AI MD',
  },
  goodbye: {
    enabled: false,
    text: '👋 Bye @user, we go miss you 😭\n> META AI MD',
  },

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

  sticker: {
    pack: 'META AI MD',
    author: 'SIMON TECH',
    quality: 80,
  },

  limits: {
    maxFileSize: 100 * 1024 * 1024,
    downloadTimeout: 30000,
    aiTimeout: 20000,
  }
};
