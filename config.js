// config.js - META AI MD by Simon Tech / META
module.exports = {
  // ===== BOT INFO =====
  botName: 'META AI MD',
  botNameShort: 'META',
  ownerName: 'META',
  ownerAlias: 'Simon Tech',
  ownerNumber: '2348102350169', // +234 810 235 0169 - no + , no space
  owners: ['2348102350169'],
  botNumber: '', // auto-filled after pairing, leave empty

  // ===== PREFIX =====
  // Bot go answer to ALL of these
  prefixes: ['.', '!', '?', '@', '-', '/'],
  prefix: '.',

  // ===== STYLE / FOOTER =====
  footer: '©️ created by Simon tech inc',
  header: '◈┈▉ `meta ai ｍｄ` ▉┄◈',
  botPfp: 'https://files.catbox.moe/hhafg3.jpg',
  thumb: 'https://files.catbox.moe/hhafg3.jpg',

  // ===== SESSION =====
  sessionName: 'Meta',
  sessionFolder: './Meta',

  // ===== MODE / SETTINGS =====
  mode: 'public', // public | private
  language: 'en',
  timezone: 'Africa/Lagos',
  totalCmds: 300,

  // ===== HOSTING =====
  hosting: 'Render',
  port: process.env.PORT || 10000,

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
    autolikemsg: false
  },

  // ===== ANTI DEFAULTS =====
  anti: {
    antilink: false,
    antibadword: false,
    antisticker: false,
    antiimage: false,
    antivideo: false,
    antiaudio: false,
    antidocument: false
  },

  // ===== MESSAGES =====
  messages: {
    ownerOnly: '❌ Owner only command.',
    adminOnly: '❌ Admins only.',
    botAdmin: '❌ Bot must be admin first.',
    groupOnly: '❌ Group only command.',
    needText: '❌ Give me text. Example: ',
    needReply: '❌ Reply to a message first.',
    needMedia: '❌ Send / reply to image / video / sticker first.',
    error: '❌ Error, try again.',
    wait: '⏳ Processing...'
  },

  // ===== API (free, no key) =====
  apis: {
    ai: 'https://api.pollinations.ai/v1/chat/completions',
    image: 'https://image.pollinations.ai/prompt/',
    joke: 'https://official-joke-api.appspot.com/random_joke',
    quote: 'https://api.quotable.io/random',
    meme: 'https://meme-api.com/gimme',
    cat: 'https://api.thecatapi.com/v1/images/search',
    dog: 'https://dog.ceo/api/breeds/image/random',
    fox: 'https://randomfox.ca/floof/',
    wiki: 'https://en.wikipedia.org/api/rest_v1/page/summary/'
  }
};
