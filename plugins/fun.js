// plugins/fun.js - META AI MD FUN - FIXED - BY SIMON TECH
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }

const JOKES = [
  "Why did chicken cross road? To see META AI MD 😂",
  "My phone battery low, but my rizz high 🔥",
  "Why NEPA dey take light? Dem no like META AI MD 💡😭",
  "What do you call fake spaghetti? An impasta 🍝",
  "Why did math book look sad? Too many problems 📚",
  "Why did scarecrow win award? He was outstanding in his field 🌾😂",
  "What do you call fish without eyes? A fsh 🐟😂"
];
const TRUTHS = [
  "Wetin be your biggest secret?",
  "Who be your crush for this group? 😏",
  "Have you ever stalk your ex?",
  "Wetin be most embarrassing thing wey don happen to you?",
  "Have you ever lie to your parents?",
  "Who be last person wey you stalk for WhatsApp?"
];
const DARES = [
  "Send voice note sing Asake - Lonely 😂",
  "Change DP to META AI MD for 1 hour",
  "Text your crush 'I miss you' 😏",
  "Send your last screenshot for group",
  "Do 10 pushups and send video 😂",
  "Call your crush and say I love you"
];
const FACTS = [
  "Honey never spoils 🍯",
  "Octopus get 3 hearts 🐙",
  "Banana na berry, strawberry no be berry 🍌",
  "Nigeria na most populous black nation 🇳🇬",
  "Your heart beats 100,000 times per day ❤️",
  "Sharks don exist before trees 🦈🌳"
];
const ROASTS = [
  "Your face be like WiFi - everybody see am but nobody wan connect 😂",
  "If laziness na Olympic, you go win gold 🥇",
  "Your brain na like NEPA - on and off 😭",
  "You be like MTN network - always disappointing 📶😂",
  "If ugly na job, you go be CEO 😂"
];
const COMPLIMENTS = [
  "You fine pass morning sun 🌞",
  "Your smile fit solve NEPA problem 😍",
  "You be reason why group sweet ❤️",
  "Your sense of humor na 100% 🔥",
  "You too fine, camera dey shy 📸😍"
];
const RIZZ = [
  "Are you WiFi? Cause I dey feel connection 😏",
  "Are you NEPA? Cause you light up my world 💡❤️",
  "Are you Google? Cause you be everything I dey search for 🔍",
  "Are you jollof rice? Cause I wan chop you every day 🍚😏",
  "Girl are you fuel? Cause my heart dey pump for you ⛽❤️"
];
const QUOTES = [
  "Success no be luck, na consistency. - SIMON TECH",
  "No gree for anybody. - META AI MD",
  "If you no fit fly, run. If you no fit run, walk. - MLK",
  "Hustle in silence, let success make noise 🔥"
];

async function handler(sock, m, ctx){
  const { prefix, cmdName, q, reply, from } = ctx;
  const p = prefix || '.';
  const sender = ctx.sender;
  const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  const target = mentioned || sender;

  if(cmdName==='joke') return await reply(`> 😂 𝙹𝙾𝙺𝙴\n\n${pick(JOKES)}`);
  if(cmdName==='fact') return await reply(`> 🧠 𝙳𝙸𝙳 𝚈𝙾𝚄 𝙺𝙽𝙾𝚆?\n\n${pick(FACTS)}`);
  if(cmdName==='quote') return await reply(`> ✨ 𝚀𝚄𝙾𝚃𝙴\n\n"${pick(QUOTES)}"`);
  if(cmdName==='truth') return await reply(`> 😏 𝚃𝚁𝚄𝚃𝙷\n\n${pick(TRUTHS)}`);
  if(cmdName==='dare') return await reply(`> 🔥 𝙳𝙰𝚁𝙴\n\n${pick(DARES)}`);
  if(cmdName==='meme'){
    try{
      const axios = require('axios');
      let r = await axios.get('https://meme-api.com/gimme');
      return await sock.sendMessage(from,{image:{url:r.data.url},caption:`> 😂 𝙼𝙴𝙼𝙴\n> ${r.data.title}`},{quoted:m});
    }catch(e){ return await reply(`> ❌ 𝙼𝙴𝙼𝙴 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(['ship','compatibility'].includes(cmdName)){
    let per = Math.floor(Math.random()*101);
    return await reply(`> 💘 𝚂𝙷𝙸𝙿\n\n> @${sender.split('@')[0]} ❤️ @${target.split('@')[0]}\n> 𝙲𝙾𝙼𝙿𝙰𝚃𝙸𝙱𝙸𝙻𝙸𝚃𝚈 : ${per}%`, {mentions:[sender,target]});
  }
  if(cmdName==='rate'){
    let per = Math.floor(Math.random()*101);
    return await reply(`> ⭐ 𝚁𝙰𝚃𝙴\n\n> @${target.split('@')[0]} na ${per}% ${q || 'fine'} 😂`, {mentions:[target]});
  }
  if(cmdName==='roast'){
    return await reply(`> 🔥 𝚁𝙾𝙰𝚂𝚃 𝙵𝙾𝚁 @${target.split('@')[0]}\n\n${pick(ROASTS)}`, {mentions:[target]});
  }
  if(cmdName==='compliment'){
    return await reply(`> 🥰 𝙲𝙾𝙼𝙿𝙻𝙸𝙼𝙴𝙽𝚃 𝙵𝙾𝚁 @${target.split('@')[0]}\n\n${pick(COMPLIMENTS)}`, {mentions:[target]});
  }
  if(cmdName==='insult'){
    return await reply(`> 😤 𝙸𝙽𝚂𝚄𝙻𝚃 𝙵𝙾𝚁 @${target.split('@')[0]}\n\n${pick(ROASTS)}`, {mentions:[target]});
  }
  if(cmdName==='rizz') return await reply(`> 😏 𝚁𝙸𝚉𝚉\n\n${pick(RIZZ)}`);
  if(cmdName==='hack'){
    return await reply(`> 💻 𝙷𝙰𝙲𝙺𝙸𝙽𝙶 @${target.split('@')[0]}...\n\n> 𝙸𝚗𝚓𝚎𝚌𝚝𝚒𝚗𝚐 𝚅𝚒𝚛𝚞𝚜... ✅\n> 𝙳𝙾𝙽𝙴!\n\n> 😂 𝙸𝚃 𝚆𝙰𝚂 𝙰 𝙿𝚁𝙰𝙽𝙺`, {mentions:[target]});
  }
  if(cmdName==='simp'){
    let per = Math.floor(Math.random()*101);
    return await reply(`> 🥺 𝚂𝙸𝙼𝙿 𝙼𝙴𝚃𝙴𝚁\n\n> @${target.split('@')[0]} na ${per}% simp 😂`, {mentions:[target]});
  }
  if(cmdName==='gay'){
    let per = Math.floor(Math.random()*101);
    return await reply(`> 🌈 𝙶𝙰𝚈 𝙼𝙴𝚃𝙴𝚁\n\n> @${target.split('@')[0]} na ${per}% 😂`, {mentions:[target]});
  }
  if(cmdName==='beautiful'){
    let per = Math.floor(Math.random()*101);
    return await reply(`> 😍 𝙱𝙴𝙰𝚄𝚃𝙸𝙵𝚄𝙻\n\n> @${target.split('@')[0]} na ${per}% beautiful 😍`, {mentions:[target]});
  }
  if(cmdName==='ugly'){
    let per = Math.floor(Math.random()*101);
    return await reply(`> 🤡 𝚄𝙶𝙻𝚈 𝙼𝙴𝚃𝙴𝚁\n\n> @${target.split('@')[0]} na ${per}% ugly 😂`, {mentions:[target]});
  }
  if(['cat','dog','fox'].includes(cmdName)){
    try{
      const axios = require('axios');
      let urls = {cat:'https://api.thecatapi.com/v1/images/search',dog:'https://dog.ceo/api/breeds/image/random',fox:'https://randomfox.ca/floof/'};
      let r = await axios.get(urls[cmdName]);
      let img = cmdName==='cat' ? r.data[0].url : cmdName==='dog' ? r.data.message : r.data.image;
      return await sock.sendMessage(from,{image:{url:img},caption:`> 🐾 ${cmdName.toUpperCase()}`},{quoted:m});
    }catch(e){ return await reply(`> ❌ ${cmdName.toUpperCase()} 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='coinflip') return await reply(`> 🪙 𝙲𝙾𝙸𝙽𝙵𝙻𝙸𝙿\n\n> ${Math.random()>0.5 ? 'HEADS 🪙' : 'TAILS 🪙'}`);
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
  if(cmdName==='guess'){
    let num = Math.floor(Math.random()*10)+1;
    if(!q) return await reply(`> 𝙶𝚄𝙴𝚂𝚂 1-10 : ${p}guess 5`);
    return await reply(parseInt(q)===num ? `> 🎉 𝚈𝙾𝚄 𝙶𝚄𝙴𝚂𝚂 𝙰𝙼! 𝙸𝚃 𝚆𝙰𝚂 ${num}` : `> ❌ 𝚆𝚁𝙾𝙽𝙶! 𝙸𝚃 𝚆𝙰𝚂 ${num}`);
  }
  if(cmdName==='quiz') return await reply(`> ❓ 𝚀𝚄𝙸𝚉\n\n> What is capital of Nigeria?\n> A) Lagos  B) Abuja  C) Kano`);
  if(cmdName==='riddle') return await reply(`> 🧩 𝚁𝙸𝙳𝙳𝙻𝙴\n\n> What has keys but can't open locks?\n> ANSWER : Piano 🎹`);
  if(cmdName==='funmenu'){
    return await reply(`> 😂 𝙵𝚄𝙽 𝙼𝙴𝙽𝚄\n\n> ${p}joke | ${p}quote | ${p}meme | ${p}truth | ${p}dare\n> ${p}fact | ${p}riddle | ${p}ship | ${p}rate\n> ${p}roast | ${p}compliment | ${p}rizz | ${p}hack\n> ${p}cat | ${p}dog | ${p}coinflip | ${p}dice | ${p}rps\n> ${p}simp | ${p}gay | ${p}beautiful | ${p}ugly\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }
  return false;
}

module.exports = handler;
