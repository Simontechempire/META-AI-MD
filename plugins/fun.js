// plugins/fun.js - META AI MD FUN BY SIMON TECH
const axios = require('axios');

const MENU_PFP = "https://i.postimg.cc/GmSz8cDT/IMG-20261105-WA0073.jpg";

const JOKES = [
  "Why did the chicken cross the road? To see META AI MD 😂",
  "My phone battery low, but my rizz high 🔥",
  "Why did Simon Tech make bot? Because WhatsApp no gree rest 😂",
  "What do you call a fish without eyes? A fsh 🐟",
  "Why did the scarecrow win award? He was outstanding in his field 🌾",
  "I told my computer I need a break, now e no dey send me spam 😂",
  "Why NEPA dey take light? Because dem no like META AI MD 💡😭",
  "What do you call fake spaghetti? An impasta 🍝",
  "Why did the math book look sad? Too many problems 📚",
  "My girlfriend say I be like WiFi, she fit connect but no fit understand me 😂"
];

const TRUTHS = [
  "Wetin be your biggest secret wey nobody know?",
  "Who be your crush for this group? Mention am 😏",
  "Have you ever stalk your ex for Instagram?",
  "Wetin be the most embarrassing thing wey don happen to you?",
  "If you fit date anybody for this group, who e go be?",
  "Have you ever lie to your parents say you dey school?",
  "Wetin be your last search for Google? No lie 😂",
  "Have you ever chop person food for fridge?",
  "Who be the last person you think about before sleep?",
  "Have you ever cry because of love?"
];

const DARES = [
  "Send voice note sing Asake - Lonely 😂",
  "Change your DP to META AI MD for 1 hour",
  "Text your crush 'I miss you' now 😏",
  "Send your last screenshot for group",
  "Dance and send video for group 💃",
  "Call your best friend tell am say you love am",
  "Send 'I be mumu' for status 😂",
  "Do 10 pushups send video",
  "Speak like baby for 1 minute voice note",
  "Send your gallery 5th picture for group"
];

const FACTS = [
  "Honey never spoils. Archaeologists don find 3000 years old honey wey still good 🍯",
  "Octopus get 3 hearts 🐙",
  "Banana na berry, but strawberry no be berry 🍌",
  "Your brain dey use 20% of your body energy 🧠",
  "Sharks don dey before trees exist 🦈",
  "Water fit boil and freeze at same time - e call am triple point 💧",
  "Nigeria na the most populous black nation for world 🇳🇬",
  "Cat fit make over 100 different sounds 🐱",
  "Your nose fit remember 1 trillion smells 👃",
  "The first WhatsApp message na 'Hello' 👋"
];

const ROASTS = [
  "Your face be like WiFi - everybody dey see am but nobody wan connect 😂",
  "If laziness na Olympic sport, you go win gold medal 🥇",
  "Your brain na like NEPA light - e dey on and off 😭",
  "You be like expired bread - nobody want you 😂",
  "Your jokes dry pass harmattan 😂",
  "If ugliness na crime, you for don dey prison for life",
  "Your DP need filter, filter need filter 😂",
  "You be like 2G network - slow for everything",
  "Even Google no fit find your sense 😂",
  "Your destiny helper don block you 😭"
];

const COMPLIMENTS = [
  "You fine pass morning sun 🌞",
  "Your smile fit solve NEPA problem 😍",
  "You be the reason why group sweet like this ❤️",
  "If beauty na crime, you for don life sentence 😍",
  "Your vibe na 100% - nobody reach you ✨",
  "You smart pass ChatGPT + META AI join 😎",
  "God take time create you, no be rush work ❤️",
  "Your energy dey make everybody happy 🥰",
  "You be CEO of fine people 👑",
  "Even camera dey shy to snap you 📸"
];

const RIZZ = [
  "Are you WiFi? Cause I dey feel connection 😏",
  "Are you NEPA? Cause you light up my world 💡❤️",
  "If you be song, you go be my favorite playlist 🎵",
  "Are you Google? Cause you be everything I dey search for 🔍",
  "Your name suppose be Sweet, cause you too sweet 🍬",
  "Even if I be blind, I go still find you 😍",
  "Are you jollof rice? Cause everybody want you 🍚😂",
  "You be like data - I no fit live without you 📶",
  "If love na exam, I go score 100% because of you 💯",
  "Are you SIM card? Cause you complete me 📱"
];

const RIDDLES = [
  { q: "What has keys but can't open locks?", a: "Piano 🎹" },
  { q: "What gets wetter the more it dries?", a: "Towel" },
  { q: "I speak without mouth, hear without ears. Who am I?", a: "Echo" },
  { q: "What has face and two hands but no arms or legs?", a: "Clock 🕐" },
  { q: "The more you take, the more you leave behind. What am I?", a: "Footsteps 👣" },
  { q: "What comes once in a minute, twice in a moment, but never in a thousand years?", a: "Letter M" },
  { q: "What can you catch but never throw?", a: "Cold 🤧" },
  { q: "What has a head and tail but no body?", a: "Coin 🪙" },
];

const QUIZ = [
  { q: "Wetin be capital of Nigeria?", a: "Abuja", opt: "A) Lagos  B) Abuja  C) Kano" },
  { q: "Who be the first President of Nigeria?", a: "Nnamdi Azikiwe", opt: "A) Buhari  B) Azikiwe  C) Obasanjo" },
  { q: "How many states Nigeria get?", a: "36", opt: "A) 30  B) 36  C) 40" },
  { q: "Wetin be 2 + 2 x 2?", a: "6", opt: "A) 8  B) 6  C) 4" },
  { q: "Which animal be king of jungle?", a: "Lion", opt: "A) Tiger  B) Lion  C) Elephant" },
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

module.exports = async (sock, m, ctx) => {
  const { prefix, cmdName, args, q, reply, from, config } = ctx;
  const p = prefix;
  const sender = m.sender;
  const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

  // ============ JOKE / QUOTE / FACT / MEME ============
  if (cmdName === 'joke') return await reply(`> 😂 𝙹𝙾𝙺𝙴 𝙾𝙵 𝚃𝙷𝙴 𝙳𝙰𝚈\n\n${pick(JOKES)}\n\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  if (cmdName === 'fact') return await reply(`> 🧠 𝙳𝙸𝙳 𝚈𝙾𝚄 𝙺𝙽𝙾𝚆?\n\n${pick(FACTS)}\n\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  if (cmdName === 'quote') {
    try {
      let r = await axios.get('https://api.quotable.io/random');
      return await reply(`> ✨ 𝚀𝚄𝙾𝚃𝙴\n\n"${r.data.content}"\n\n— ${r.data.author}\n\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
    } catch { return await reply(`> ✨ 𝚀𝚄𝙾𝚃𝙴\n\n"Success no be luck, na consistency."\n\n— 𝚂𝙸𝙼𝙾𝙽 𝚃𝙴𝙲𝙷`); }
  }
  if (cmdName === 'meme') {
    try {
      let r = await axios.get('https://meme-api.com/gimme');
      return await sock.sendMessage(from, { image: { url: r.data.url }, caption: `> 😂 𝙼𝙴𝙼𝙴\n> ${r.data.title}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳` }, { quoted: m });
    } catch { return await reply(`> 😂 𝙼𝙴𝙼𝙴 𝙵𝙰𝙸𝙻𝙴𝙳, 𝚃𝚁𝚈 𝙰𝙶𝙰𝙸𝙽`); }
  }

  // ============ TRUTH / DARE ============
  if (cmdName === 'truth') return await reply(`> 😏 𝚃𝚁𝚄𝚃𝙷\n\n${pick(TRUTHS)}\n\n> 𝙰𝙽𝚂𝚆𝙴𝚁 𝙰𝙼 𝙽𝙾 𝙻𝙸𝙴 😂\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  if (cmdName === 'dare') return await reply(`> 🔥 𝙳𝙰𝚁𝙴\n\n${pick(DARES)}\n\n> 𝙳𝙾 𝙰𝙼 𝙾𝚁 𝙽𝙾 𝙳𝙾 𝙰𝙼 😂\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);

  // ============ SHIP / COMPATIBILITY ============
  if (['ship', 'compatibility'].includes(cmdName)) {
    let target = mentioned || sender;
    let target2 = args[1] ? args[1] : sender;
    let percent = Math.floor(Math.random() * 101);
    let bar = '❤️'.repeat(Math.floor(percent / 20)) + '🤍'.repeat(5 - Math.floor(percent / 20));
    let msg = percent > 80 ? "Perfect match! Go marry 😍💍" : percent > 50 ? "Good match, fit work ❤️" : percent > 30 ? "Manage am small 😂" : "No match at all, run! 😭";
    return await reply(`> 💘 𝚂𝙷𝙸𝙿 𝚁𝙴𝚂𝚄𝙻𝚃\n\n> @${sender.split('@')[0]} ❤️ @${target.split('@')[0]}\n> 𝙲𝙾𝙼𝙿𝙰𝚃𝙸𝙱𝙸𝙻𝙸𝚃𝚈 : ${percent}%\n> ${bar}\n> ${msg}\n\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`, { mentions: [sender, target] });
  }

  // ============ RATE / ROAST / COMPLIMENT / INSULT / RIZZ / HACK ============
  if (cmdName === 'rate') {
    let target = mentioned || sender;
    let percent = Math.floor(Math.random() * 101);
    return await reply(`> ⭐ 𝚁𝙰𝚃𝙴\n\n> @${target.split('@')[0]} na ${percent}% ${q || 'fine'} 😂\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`, { mentions: [target] });
  }
  if (cmdName === 'roast') {
    let target = mentioned || sender;
    return await reply(`> 🔥 𝚁𝙾𝙰𝚂𝚃 𝙵𝙾𝚁 @${target.split('@')[0]}\n\n${pick(ROASTS)}\n\n> 𝙽𝙾 𝚅𝙴𝚇, 𝙽𝙰 𝙹𝙾𝙺𝙴 😂`, { mentions: [target] });
  }
  if (cmdName === 'compliment') {
    let target = mentioned || sender;
    return await reply(`> 🥰 𝙲𝙾𝙼𝙿𝙻𝙸𝙼𝙴𝙽𝚃 𝙵𝙾𝚁 @${target.split('@')[0]}\n\n${pick(COMPLIMENTS}`, { mentions: [target] });
  }
  if (cmdName === 'insult') {
    let target = mentioned || sender;
    return await reply(`> 😤 𝙸𝙽𝚂𝚄𝙻𝚃 𝙵𝙾𝚁 @${target.split('@')[0]}\n\n${pick(ROASTS}`, { mentions: [target] });
  }
  if (cmdName === 'rizz') return await reply(`> 😏 𝚁𝙸𝚉𝚉 𝙻𝙸𝙽𝙴\n\n${pick(RIZZ)}\n\n> 𝚄𝚂𝙴 𝙰𝙼 𝙵𝙾𝚁 𝚈𝙾𝚄𝚁 𝙲𝚁𝚄𝚂𝙷 😂`);
  if (cmdName === 'hack') {
    let target = mentioned || sender;
    return await reply(`> 💻 𝙷𝙰𝙲𝙺𝙸𝙽𝙶 @${target.split('@')[0]}...\n\n> 𝙸𝚗𝚓𝚎𝚌𝚝𝚒𝚗𝚐 𝚅𝚒𝚛𝚞𝚜... ✅\n> 𝙷𝚊𝚌𝚔𝚒𝚗𝚐 𝙿𝚊𝚜𝚜𝚠𝚘𝚛𝚍... ✅\n> 𝙶𝚎𝚝𝚝𝚒𝚗𝚐 𝙶𝚊𝚕𝚕𝚎𝚛𝚢... ✅\n> 𝙳𝙾𝙽𝙴!\n\n> 😂 𝙸𝚃 𝚆𝙰𝚂 𝙰 𝙿𝚁𝙰𝙽𝙺, 𝙽𝙾 𝙵𝙴𝙰𝚁`, { mentions: [target] });
  }

  // ============ CHARACTER / ANIME / ANIMALS ============
  if (cmdName === 'character') {
    let chars = ['You be CEO 👑', 'You be Comedian 😂', 'You be Lover Boy ❤️', 'You be Hacker 💻', 'You be Pastor 🙏', 'You be Yahoo Boy 😭', 'You be Doctor 🩺', 'You be Teacher 📚'];
    return await reply(`> 🎭 𝙲𝙷𝙰𝚁𝙰𝙲𝚃𝙴𝚁\n\n> @${sender.split('@')[0]} - ${pick(chars)}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`, { mentions: [sender] });
  }
  if (cmdName === 'anime') {
    try {
      let r = await axios.get('https://api.waifu.pics/sfw/waifu');
      return await sock.sendMessage(from, { image: { url: r.data.url }, caption: `> ✨ 𝙰𝙽𝙸𝙼𝙴 𝙿𝙸𝙲\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳` }, { quoted: m });
    } catch { return await reply(`> ❌ 𝙰𝙽𝙸𝙼𝙴 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if (['cat', 'dog', 'fox', 'bird'].includes(cmdName)) {
    try {
      let urls = {
        cat: 'https://api.thecatapi.com/v1/images/search',
        dog: 'https://dog.ceo/api/breeds/image/random',
        fox: 'https://randomfox.ca/floof/',
        bird: 'https://api.vreden.my.id/api/bird'
      };
      let r = await axios.get(urls[cmdName]);
      let img = cmdName === 'cat' ? r.data[0].url : cmdName === 'dog' ? r.data.message : cmdName === 'fox' ? r.data.image : MENU_PFP;
      return await sock.sendMessage(from, { image: { url: img }, caption: `> 🐾 ${cmdName.toUpperCase()} 𝙿𝙸𝙲\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳` }, { quoted: m });
    } catch { return await reply(`> ❌ ${cmdName.toUpperCase()} 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }

  // ============ GAMES ============
  if (cmdName === 'coinflip') {
    let res = Math.random() > 0.5 ? 'HEADS 🪙' : 'TAILS 🪙';
    return await reply(`> 🪙 𝙲𝙾𝙸𝙽𝙵𝙻𝙸𝙿\n\n> 𝚁𝙴𝚂𝚄𝙻𝚃 : ${res}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }
  if (cmdName === 'dice') {
    let n = Math.floor(Math.random() * 6) + 1;
    return await reply(`> 🎲 𝙳𝙸𝙲𝙴\n\n> 𝚈𝙾𝚄 𝚁𝙾𝙻𝙻 : ${n}\n> ${['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][n]}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }
  if (cmdName === 'rps') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}rps rock\n> 𝙾𝙿𝚃𝙸𝙾𝙽𝚂 : rock | paper | scissors`);
    let choices = ['rock', 'paper', 'scissors'];
    let bot = pick(choices);
    let user = q.toLowerCase().trim();
    if (!choices.includes(user)) return await reply(`> 𝚄𝚂𝙴 rock / paper / scissors`);
    let win = (user === 'rock' && bot === 'scissors') || (user === 'paper' && bot === 'rock') || (user === 'scissors' && bot === 'paper');
    let draw = user === bot;
    return await reply(`> ✂️ 𝚁𝙾𝙲𝙺 𝙿𝙰𝙿𝙴𝚁 𝚂𝙲𝙸𝚂𝚂𝙾𝚁𝚂\n\n> 𝚈𝙾𝚄 : ${user}\n> 𝙱𝙾𝚃 : ${bot}\n> 𝚁𝙴𝚂𝚄𝙻𝚃 : ${draw ? 'DRAW 🤝' : win ? 'YOU WIN 🎉' : 'BOT WIN 😂'}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }
  if (cmdName === 'guess') {
    let num = Math.floor(Math.random() * 10) + 1;
    if (!q) return await reply(`> 𝙶𝚄𝙴𝚂𝚂 𝙰 𝙽𝚄𝙼𝙱𝙴𝚁 1-10\n> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}guess 5`);
    let g = parseInt(q);
    return await reply(g === num ? `> 🎉 𝚈𝙾𝚄 𝙶𝚄𝙴𝚂𝚂 𝙰𝙼! 𝙸𝚃 𝚆𝙰𝚂 ${num}` : `> ❌ 𝚆𝚁𝙾𝙽𝙶! 𝙸𝚃 𝚆𝙰𝚂 ${num}, 𝚈𝙾𝚄 𝙿𝙸𝙲𝙺 ${g}`);
  }
  if (cmdName === 'riddle') {
    let r = pick(RIDDLES);
    return await reply(`> 🧩 𝚁𝙸𝙳𝙳𝙻𝙴\n\n${r.q}\n\n> 𝚁𝙴𝙿𝙻𝚈 𝚆𝙸𝚃𝙷 ${p}answer <your answer>\n> 𝙰𝙽𝚂𝚆𝙴𝚁 : || ${r.a} ||`);
  }
  if (cmdName === 'answer') {
    return await reply(`> ✅ 𝙰𝙽𝚂𝚆𝙴𝚁 𝚁𝙴𝙲𝙴𝙸𝚅𝙴𝙳\n\n> 𝚈𝙾𝚄𝚁 𝙰𝙽𝚂𝚆𝙴𝚁 : ${q || 'Empty'}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳 𝙶𝙾 𝙲𝙷𝙴𝙲𝙺 𝙰𝙼 😂`);
  }
  if (cmdName === 'quiz') {
    let quiz = pick(QUIZ);
    return await reply(`> ❓ 𝚀𝚄𝙸𝚉\n\n${quiz.q}\n\n${quiz.opt}\n\n> 𝙰𝙽𝚂𝚆𝙴𝚁 : || ${quiz.a} ||`);
  }

  return false;
};

module.exports.MENU_PFP = MENU_PFP;
