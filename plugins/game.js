// plugins/game.js - META AI MD GAME - FIXED - BY SIMON TECH
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }

const TRIVIA = [
  { q: "What is capital of Nigeria?", a: "Abuja", opts: "A) Lagos  B) Abuja  C) Kano" },
  { q: "Who is president of Nigeria in 2024?", a: "Tinubu", opts: "A) Buhari  B) Tinubu  C) Obi" },
  { q: "How many states in Nigeria?", a: "36", opts: "A) 36  B) 30  C) 40" },
  { q: "What is 2 + 2 x 5?", a: "12", opts: "A) 20  B) 12  C) 10" },
  { q: "Which animal is called man's best friend?", a: "Dog", opts: "A) Cat  B) Dog  C) Lion" }
];

const RIDDLES = [
  { q: "What has keys but can't open locks?", a: "Piano" },
  { q: "What has face and two hands but no arms or legs?", a: "Clock" },
  { q: "What gets wetter the more it dries?", a: "Towel" },
  { q: "I speak without mouth and hear without ears. Who am I?", a: "Echo" }
];

const WOULD_YOU = [
  "Would you rather be rich and lonely or poor and happy?",
  "Would you rather have unlimited data or unlimited money?",
  "Would you rather never use WhatsApp again or never eat jollof again?",
  "Would you rather be famous for 1 day or rich forever?"
];

async function handler(sock, m, ctx){
  const { prefix, cmdName, q, reply, from } = ctx;
  const p = prefix || '.';
  const sender = ctx.sender;
  const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  const target = mentioned || sender;

  if(cmdName==='gamemenu' || cmdName==='games'){
    return await reply(`> 🎮 𝙶𝙰𝙼𝙴 𝙼𝙴𝙽𝚄\n\n> ${p}trivia | ${p}riddle | ${p}guess | ${p}wouldyou\n> ${p}truth | ${p}dare | ${p}coinflip | ${p}dice | ${p}rps\n> ${p}slot | ${p}blackjack | ${p}hangman | ${p}word\n> ${p}mathgame | ${p}fasttype | ${p}quiz\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }
  if(cmdName==='trivia'){
    let t = pick(TRIVIA);
    return await reply(`> ❓ 𝚃𝚁𝙸𝚅𝙸𝙰\n\n> ${t.q}\n> ${t.opts}\n\n> 𝙰𝙽𝚂𝚆𝙴𝚁 : ${t.a}`);
  }
  if(cmdName==='riddle'){
    let r = pick(RIDDLES);
    return await reply(`> 🧩 𝚁𝙸𝙳𝙳𝙻𝙴\n\n> ${r.q}\n\n> 𝙰𝙽𝚂𝚆𝙴𝚁 : ${r.a}`);
  }
  if(cmdName==='wouldyou' || cmdName==='wyr'){
    return await reply(`> 🤔 𝚆𝙾𝚄𝙻𝙳 𝚈𝙾𝚄 𝚁𝙰𝚃𝙷𝙴𝚁\n\n> ${pick(WOULD_YOU)}`);
  }
  if(cmdName==='guess'){
    let num = Math.floor(Math.random()*10)+1;
    if(!q) return await reply(`> 𝙶𝚄𝙴𝚂𝚂 1-10 : ${p}guess 5`);
    return await reply(parseInt(q)===num ? `> 🎉 𝚈𝙾𝚄 𝙶𝚄𝙴𝚂𝚂 𝙰𝙼! 𝙸𝚃 𝚆𝙰𝚂 ${num}` : `> ❌ 𝚆𝚁𝙾𝙽𝙶! 𝙸𝚃 𝚆𝙰𝚂 ${num}`);
  }
  if(cmdName==='coinflip'){
    return await reply(`> 🪙 𝙲𝙾𝙸𝙽𝙵𝙻𝙸𝙿\n\n> ${Math.random()>0.5 ? 'HEADS 🪙' : 'TAILS 🪙'}`);
  }
  if(cmdName==='dice'){
    let n = Math.floor(Math.random()*6)+1;
    return await reply(`> 🎲 𝙳𝙸𝙲𝙴\n\n> 𝚈𝙾𝚄 𝚁𝙾𝙻𝙻 : ${n}`);
  }
  if(cmdName==='rps'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}rps rock`);
    let bot = pick(['rock','paper','scissors']);
    let user = q.toLowerCase().trim();
    let win = (user==='rock'&&bot==='scissors')||(user==='paper'&&bot==='rock')||(user==='scissors'&&bot==='paper');
    return await reply(`> ✂️ 𝚁𝙿𝚂\n\n> 𝚈𝙾𝚄 : ${user}\n> 𝙱𝙾𝚃 : ${bot}\n> ${user===bot ? 'DRAW 🤝' : win ? 'YOU WIN 🎉' : 'BOT WIN 😂'}`);
  }
  if(cmdName==='slot'){
    let emojis = ['🍒','🍋','🔔','⭐','💎','🍇','🍀'];
    let s1 = pick(emojis);
    let s2 = pick(emojis);
    let s3 = pick(emojis);
    let win = (s1===s2 && s2===s3);
    return await reply(`> 🎰 𝚂𝙻𝙾𝚃 𝙼𝙰𝙲𝙷𝙸𝙽𝙴\n\n> | ${s1} | ${s2} | ${s3} |\n\n> ${win ? '🎉 JACKPOT! YOU WIN!' : '❌ Try again!'}`);
  }
  if(cmdName==='blackjack' || cmdName==='bj'){
    let you = Math.floor(Math.random()*11)+10;
    let bot = Math.floor(Math.random()*11)+10;
    let res = you>bot ? 'YOU WIN 🎉' : you<bot ? 'BOT WIN 😂' : 'DRAW 🤝';
    return await reply(`> 🃏 𝙱𝙻𝙰𝙲𝙺𝙹𝙰𝙲𝙺\n\n> 𝚈𝙾𝚄 : ${you}\n> 𝙱𝙾𝚃 : ${bot}\n\n> ${res}`);
  }
  if(cmdName==='hangman'){
    return await reply(`> 🎯 𝙷𝙰𝙽𝙶𝙼𝙰𝙽\n\n> _ _ _ _ _\n> Hint: Bot name\n> Guess with ${p}guessword META`);
  }
  if(cmdName==='word' || cmdName==='wordgame'){
    let words = ['LAGOS','ABUJA','JOLLOF','NEPA','WHATSAPP','SIMON','META'];
    let w = pick(words);
    let scrambled = w.split('').sort(()=>Math.random()-0.5).join('');
    return await reply(`> 🔤 𝚆𝙾𝚁𝙳 𝙶𝙰𝙼𝙴\n\n> Unscramble: ${scrambled}\n> Hint: ${w.length} letters`);
  }
  if(cmdName==='mathgame' || cmdName==='mathquiz'){
    let a = Math.floor(Math.random()*20)+1;
    let b = Math.floor(Math.random()*20)+1;
    let ans = a + b;
    return await reply(`> 🧮 𝙼𝙰𝚃𝙷 𝙶𝙰𝙼𝙴\n\n> What is ${a} + ${b} ?\n\n> ANSWER : ${ans}`);
  }
  if(cmdName==='fasttype'){
    let words = ['META AI MD','SIMON TECH','JOLLOF RICE','LAGOS BOY','WHATSAPP BOT'];
    return await reply(`> ⌨️ 𝙵𝙰𝚂𝚃 𝚃𝚈𝙿𝙴\n\n> Type this fast:\n> ${pick(words)}`);
  }
  if(cmdName==='quiz'){
    return await reply(`> ❓ 𝚀𝚄𝙸𝚉\n\n> What is capital of Nigeria?\n> A) Lagos  B) Abuja  C) Kano\n> ANSWER : B`);
  }
  if(cmdName==='truth'){
    let truths = ["Who be your crush?", "Wetin be your biggest secret?", "Have you ever stalk your ex?"];
    return await reply(`> 😏 𝚃𝚁𝚄𝚃𝙷\n\n${pick(truths)}`);
  }
  if(cmdName==='dare'){
    let dares = ["Send voice note sing Asake", "Change DP to META AI MD", "Text your crush I miss you"];
    return await reply(`> 🔥 𝙳𝙰𝚁𝙴\n\n${pick(dares)}`);
  }
  if(cmdName==='love' || cmdName==='lovecalc'){
    let per = Math.floor(Math.random()*101);
    return await reply(`> 💘 𝙻𝙾𝚅𝙴 𝙲𝙰𝙻𝙲\n\n> @${sender.split('@')[0]} ❤️ @${target.split('@')[0]}\n> 𝙻𝙾𝚅𝙴 : ${per}%`, {mentions:[sender,target]});
  }
  if(cmdName==='8ball' || cmdName==='eightball'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}8ball Will I be rich?`);
    let answers = ["Yes ✅","No ❌","Maybe 🤔","Definitely 🔥","Ask again later","100% YES!","No chance 😂"];
    return await reply(`> 🎱 8𝙱𝙰𝙻𝙻\n\n> Q: ${q}\n> A: ${pick(answers)}`);
  }
  if(cmdName==='fortune'){
    let f = ["You go blow this year 🔥","Money dey come 💰","Your crush go reply you ❤️","NEPA go bring light today 💡😂"];
    return await reply(`> 🔮 𝙵𝙾𝚁𝚃𝚄𝙽𝙴\n\n> ${pick(f)}`);
  }
  return false;
}

module.exports = handler;
