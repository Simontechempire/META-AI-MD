// plugins/meta.js - META AI MD ALL IN ONE BY SIMON TECH
const axios = require('axios');

const MENU_PFP = "https://i.postimg.cc/GmSz8cDT/IMG-20261105-WA0073.jpg";
const BOT_PIC = MENU_PFP;

function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function fancyHead(title){
  return `◈┈▉ \`ᴍᴇᴛᴀ ᴀɪ ᴍᴅ\` ▉┄◈\n\n> ${title}\n> ────────────\n`;
}

// ============ MENU ============
function getMenu({ ownerName = 'SIMON TECH', prefix = '.', botUser = 'META AI MD', hosting = 'Render', date = new Date().toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' }) } = {}) {
  const head = `◈┈▉ \`ᴍᴇᴛᴀ ᴀɪ ᴍᴅ\` ▉┄◈\n\n> ╭────↯\n> │ ➠ 𝙾𝚆𝙽𝙴𝚁 : ${ownerName}\n> │ ➠ 𝙿𝚁𝙴𝙵𝙸𝚇 : ${prefix}\n> ╰────↯\n> 𝙱𝙾𝚃 𝚄𝚂𝙴𝚁 : ${botUser}\n> 𝙷𝙾𝚂𝚃𝙸𝙽𝙶 : ${hosting}\n> 𝙳𝙰𝚃𝙴 : ${date}`;
  const p = prefix;
  return `${head}

✦ 𝙾𝚆𝙽𝙴𝚁 𝙼𝙴𝙽𝚄
\`\`\`text
╭──────────◈
┆ ◈ ${p}menu | ${p}ping | ${p}alive | ${p}owner
┆ ◈ ${p}runtime | ${p}botinfo | ${p}restart
┆ ◈ ${p}broadcast | ${p}setprefix | ${p}setpp
┆ ◈ ${p}block | ${p}unblock | ${p}ban | ${p}unban
┆ ◈ ${p}public | ${p}private | ${p}update | ${p}repo
╰──────────◈
\`\`\`

✦ 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁 𝙼𝙴𝙽𝚄
\`\`\`text
╭──────────◈
┆ ◈ ${p}play | ${p}song | ${p}video
┆ ◈ ${p}tiktok | ${p}instagram | ${p}facebook
┆ ◈ ${p}mediafire | ${p}apk | ${p}pinterest
┆ ◈ ${p}spotify | ${p}youtube | ${p}ytmp3 | ${p}ytmp4
┆ ◈ ${p}gdrive | ${p}terabox | ${p}capcut
┆ ◈ ${p}threads | ${p}reddit | ${p}telegram
┆ ◈ ${p}fbdl | ${p}igdl | ${p}ttdl | ${p}lyrics
╰──────────◈
\`\`\`

✦ 𝚃𝙾𝙾𝙻𝚂 𝙼𝙴𝙽𝚄
\`\`\`text
╭──────────◈
┆ ◈ ${p}weather | ${p}translate | ${p}calculate
┆ ◈ ${p}shorturl | ${p}qr | ${p}ssweb | ${p}fetch
┆ ◈ ${p}tinyurl | ${p}base64 | ${p}encode | ${p}decode
┆ ◈ ${p}binary | ${p}hash | ${p}password | ${p}uuid
┆ ◈ ${p}time | ${p}date | ${p}ipinfo | ${p}whois
┆ ◈ ${p}define | ${p}wiki | ${p}device | ${p}calc
╰──────────◈
\`\`\`

✦ 𝚃𝙴𝚇𝚃 𝙼𝙴𝙽𝚄
\`\`\`text
╭──────────◈
┆ ◈ ${p}attp | ${p}smeme | ${p}emojimix
┆ ◈ ${p}qc | ${p}brat | ${p}take | ${p}wm
┆ ◈ ${p}fancy | ${p}style | ${p}smalltext
┆ ◈ ${p}bold | ${p}reverse | ${p}uppercase
╰──────────◈
\`\`\`

✦ 𝚂𝙴𝚃𝚃𝙸𝙽𝙶𝚂 𝙼𝙴𝙽𝚄
\`\`\`text
╭──────────◈
┆ ◈ ${p}prefix | ${p}public | ${p}private
┆ ◈ ${p}setmode | ${p}setbotname | ${p}setownername
┆ ◈ ${p}setmenu | ${p}setthumb | ${p}setbanner
┆ ◈ ${p}setfooter | ${p}settheme | ${p}setemoji
┆ ◈ ${p}setautobio | ${p}setstatus | ${p}settings
╰──────────◈
\`\`\`

✦ 𝚂𝚃𝙸𝙲𝙺𝙴𝚁 𝙼𝙴𝙽𝚄
\`\`\`text
╭──────────◈
┆ ◈ ${p}sticker | ${p}toimg | ${p}take | ${p}attp
┆ ◈ ${p}smeme | ${p}emojimix | ${p}circle | ${p}crop
┆ ◈ ${p}resize | ${p}blur | ${p}wanted | ${p}trigger
┆ ◈ ${p}pixelate | ${p}removebg | ${p}remini | ${p}steal
┆ ◈ ${p}wm | ${p}brat | ${p}qc | ${p}stickerinfo
╰──────────◈
\`\`\`

✦ 𝙵𝚄𝙽 𝙼𝙴𝙽𝚄
\`\`\`text
╭──────────◈
┆ ◈ ${p}joke | ${p}quote | ${p}meme | ${p}truth | ${p}dare
┆ ◈ ${p}fact | ${p}riddle | ${p}ship | ${p}compatibility
┆ ◈ ${p}rate | ${p}roast | ${p}compliment | ${p}insult
┆ ◈ ${p}cat | ${p}dog | ${p}fox | ${p}coinflip | ${p}dice
┆ ◈ ${p}guess | ${p}quiz | ${p}rps | ${p}hack | ${p}rizz
╰──────────◈
\`\`\`

✦ 𝙰𝙸 𝙼𝙴𝙽𝚄
\`\`\`text
╭──────────◈
┆ ◈ ${p}ai | ${p}chatgpt | ${p}meta | ${p}gemini
┆ ◈ ${p}blackbox | ${p}deepseek | ${p}copilot | ${p}imagine
┆ ◈ ${p}image | ${p}vision | ${p}describe | ${p}summarize
┆ ◈ ${p}rewrite | ${p}grammar | ${p}question | ${p}code
┆ ◈ ${p}debug | ${p}explain | ${p}story | ${p}poem
┆ ◈ ${p}essay | ${p}math | ${p}ask | ${p}clearchat
╰──────────◈
\`\`\`

◈┈▉ \`ᴍᴇᴛᴀ ᴀɪ ᴍᴅ\` ▉┄◈
> 🐺 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳 𝙿𝙾𝚆𝙴𝚁 𝙱𝚈 𝚂𝙸𝙼𝙾𝙽 𝚃𝙴𝙲𝙷`;
}

// ============ DATA ============
const JOKES = ["Why did chicken cross road? To see META AI MD 😂","My phone battery low, but my rizz high 🔥","Why NEPA dey take light? Dem no like META AI MD 💡😭","What do you call fake spaghetti? An impasta 🍝","Why did math book look sad? Too many problems 📚"];
const TRUTHS = ["Wetin be your biggest secret?","Who be your crush for this group? 😏","Have you ever stalk your ex?","Wetin be most embarrassing thing wey don happen to you?","If you fit date anybody for group, who?"];
const DARES = ["Send voice note sing Asake - Lonely 😂","Change DP to META AI MD for 1 hour","Text your crush 'I miss you' 😏","Send your last screenshot for group","Dance send video 💃"];
const FACTS = ["Honey never spoils 🍯","Octopus get 3 hearts 🐙","Banana na berry, strawberry no be berry 🍌","Nigeria na most populous black nation 🇳🇬","Cat fit make over 100 sounds 🐱"];
const ROASTS = ["Your face be like WiFi - everybody see am but nobody wan connect 😂","If laziness na Olympic, you go win gold 🥇","Your brain na like NEPA - on and off 😭","Your jokes dry pass harmattan 😂","Even Google no fit find your sense 😂"];
const COMPLIMENTS = ["You fine pass morning sun 🌞","Your smile fit solve NEPA problem 😍","You be reason why group sweet ❤️","If beauty na crime, you for life sentence 😍","Your vibe na 100% ✨"];
const RIZZ = ["Are you WiFi? Cause I dey feel connection 😏","Are you NEPA? Cause you light up my world 💡❤️","Are you Google? Cause you be everything I dey search for 🔍","You be like data - I no fit live without you 📶"];

async function askAI(prompt){
  const tries = [
    `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
    `https://api.vreden.my.id/api/gpt?query=${encodeURIComponent(prompt)}`,
    `https://api.davidcyriltech.my.id/ai/chatbot?query=${encodeURIComponent(prompt)}`
  ];
  for(let url of tries){
    try{
      let r = await axios.get(url, {timeout:20000});
      let txt = typeof r.data==='string' ? r.data : (r.data?.result || r.data?.answer || r.data?.response || r.data?.message);
      if(txt && txt.length>2) return txt;
    }catch{}
  }
  return null;
}
async function toSticker(buf){
  try{
    const {Sticker, StickerTypes} = require('wa-sticker-formatter');
    const s = new Sticker(buf,{pack:'META AI MD',author:'SIMON TECH',type:StickerTypes.FULL,quality:80});
    return await s.toBuffer();
  }catch{ return buf; }
}

// ============ MAIN ============
module.exports = async (sock, m, ctx) => {
  const { prefix, cmdName, args, q, reply, from, config } = ctx;
  const p = prefix;
  const sender = m.sender;
  const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

  // ----- MENU / OWNER -----
  if(['menu','help','allmenu','list'].includes(cmdName)){
    let txt = getMenu({ ownerName: config?.ownerAlias || 'SIMON TECH', prefix:p, botUser: config?.botName || 'META AI MD', hosting: config?.hosting || 'Render' });
    return await sock.sendMessage(from,{image:{url:MENU_PFP},caption:txt},{quoted:m});
  }
  if(cmdName==='ping'){
    let s=Date.now(); await reply('> 🏓 𝙿𝙸𝙽𝙶𝙸𝙽𝙶...');
    return await sock.sendMessage(from,{text:`> 🏓 𝙿𝙾𝙽𝙶 !\n> ⚡ 𝚂𝙿𝙴𝙴𝙳 : ${Date.now()-s}ms\n> 🤖 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳 𝙸𝚂 𝙰𝙻𝙸𝚅𝙴 ✅`},{quoted:m});
  }
  if(cmdName==='alive'){
    return await sock.sendMessage(from,{image:{url:MENU_PFP},caption:`◈┈▉ \`ᴍᴇᴛᴀ ᴀɪ ᴍᴅ\` ▉┄◈\n\n> 🤖 𝙱𝙾𝚃 : 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳\n> 👑 𝙾𝚆𝙽𝙴𝚁 : 𝚂𝙸𝙼𝙾𝙽 𝚃𝙴𝙲𝙷\n> ⚡ 𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙾𝙽𝙻𝙸𝙽𝙴 ✅\n> 🕐 𝚄𝙿𝚃𝙸𝙼𝙴 : ${Math.floor(process.uptime()/60)} 𝚖𝚒𝚗𝚜\n\n> 𝚃𝚈𝙿𝙴 ${p}𝚖𝚎𝚗𝚞 𝙵𝙾𝚁 𝙲𝙾𝙼𝙼𝙰𝙽𝙳𝚂`},{quoted:m});
  }
  if(cmdName==='owner') return await reply(`◈┈▉ \`ᴍᴇᴛᴀ ᴀɪ ᴍᴅ\` ▉┄◈\n\n> 👑 𝙾𝚆𝙽𝙴𝚁 : 𝚂𝙸𝙼𝙾𝙽 𝚃𝙴𝙲𝙷\n> 🤖 𝙱𝙾𝚃 : 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳\n> 💬 𝙲𝙷𝙰𝚃 𝙾𝚆𝙽𝙴𝚁 𝙵𝙾𝚁 𝙷𝙴𝙻𝙿`);
  if(cmdName==='runtime') return await reply(`> ⏰ 𝚁𝚄𝙽𝚃𝙸𝙼𝙴 : ${Math.floor(process.uptime()/60)} 𝚖𝚒𝚗𝚜`);
  if(cmdName==='botinfo') return await reply(`> 🤖 𝙱𝙾𝚃𝙸𝙽𝙵𝙾\n\n> 𝙽𝙰𝙼𝙴 : 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳\n> 𝙾𝚆𝙽𝙴𝚁 : 𝚂𝙸𝙼𝙾𝙽 𝚃𝙴𝙲𝙷\n> 𝙿𝚁𝙴𝙵𝙸𝚇 : ${p}\n> 𝙷𝙾𝚂𝚃𝙸𝙽𝙶 : Render\n> 𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙾𝙽𝙻𝙸𝙽𝙴 ✅`);

  // ----- DOWNLOADER -----
  if(['play','song','ytmp3'].includes(cmdName)){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}play Asake Lonely`);
    await reply(`> 🎵 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙸𝙽𝙶 ${q}... ⏳`);
    try{
      let r = await axios.get(`https://api.vreden.my.id/api/ytplaymp3?query=${encodeURIComponent(q)}`,{timeout:30000});
      let d = r.data?.result || r.data;
      let url = d?.download?.url || d?.url;
      if(!url) throw new Error('no audio');
      return await sock.sendMessage(from,{audio:{url},mimetype:'audio/mpeg',fileName:`${q}.mp3`},{quoted:m});
    }catch{ return await reply(`> ❌ 𝙰𝚄𝙳𝙸𝙾 𝙵𝙰𝙸𝙻𝙴𝙳, 𝚃𝚁𝚈 𝙰𝙶𝙰𝙸𝙽`); }
  }
  if(['video','ytmp4'].includes(cmdName)){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}video Asake Lonely`);
    await reply(`> 🎬 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙸𝙽𝙶 𝚅𝙸𝙳𝙴𝙾... ⏳`);
    try{
      let api = q.includes('youtu') ? `https://api.vreden.my.id/api/ytmp4?url=${encodeURIComponent(q)}` : `https://api.vreden.my.id/api/ytplaymp4?query=${encodeURIComponent(q)}`;
      let r = await axios.get(api,{timeout:30000});
      let d = r.data?.result || r.data;
      let url = d?.download?.url || d?.url;
      if(!url) throw new Error('no video');
      return await sock.sendMessage(from,{video:{url},caption:`> 🎬 ${q}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`},{quoted:m});
    }catch{ return await reply(`> ❌ 𝚅𝙸𝙳𝙴𝙾 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(['tiktok','ttdl'].includes(cmdName)){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}tiktok <link>`);
    try{
      let r = await axios.get(`https://api.vreden.my.id/api/tiktok?url=${encodeURIComponent(q)}`,{timeout:30000});
      let d = r.data?.result || r.data;
      let url = d?.nowm || d?.video || d?.play || d?.url;
      if(!url) throw new Error('fail');
      return await sock.sendMessage(from,{video:{url},caption:`> 🎵 𝚃𝙸𝙺𝚃𝙾𝙺 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝙳\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`},{quoted:m});
    }catch{ return await reply(`> ❌ 𝚃𝙸𝙺𝚃𝙾𝙺 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(['instagram','igdl','facebook','fbdl','twitter','threads','spotify','soundcloud','mediafire','gdrive','terabox','capcut','snapchat','reddit','telegram'].includes(cmdName)){
    if(!q) return await reply(`> 𝚄𝚂𝙰𝙶𝙴 : ${p}${cmdName} <link>`);
    return await reply(`> ⬇️ 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙸𝙽𝙶 ${cmdName.toUpperCase()}...\n> 🔗 ${q}\n> 𝙿𝙻𝙴𝙰𝚂𝙴 𝚆𝙰𝙸𝚃 - 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳 𝙸𝚂 𝙵𝙴𝚃𝙲𝙷𝙸𝙽𝙶`);
  }
  if(cmdName==='apk'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}apk WhatsApp`);
    try{
      let r = await axios.get(`https://api.vreden.my.id/api/apk?query=${encodeURIComponent(q)}`,{timeout:30000});
      let d = r.data?.result || r.data;
      let url = d?.download || d?.url;
      if(!url) throw new Error('fail');
      return await sock.sendMessage(from,{document:{url},fileName:`${d?.name||q}.apk`,mimetype:'application/vnd.android.package-archive'},{quoted:m});
    }catch{ return await reply(`> ❌ 𝙰𝙿𝙺 𝙽𝙾𝚃 𝙵𝙾𝚄𝙽𝙳`); }
  }
  if(cmdName==='pinterest'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}pinterest Cute cat`);
    try{
      let r = await axios.get(`https://api.vreden.my.id/api/pinterest?query=${encodeURIComponent(q)}`,{timeout:30000});
      let d = r.data?.result || r.data;
      let list = Array.isArray(d) ? d : [d];
      for(let i=0;i<Math.min(3,list.length);i++){
        let url = list[i]?.image || list[i]?.url || list[i];
        if(url) await sock.sendMessage(from,{image:{url},caption:`> 📌 ${q} ${i+1}/3\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`},{quoted:m});
      }
      return;
    }catch{ return await reply(`> ❌ 𝙿𝙸𝙽𝚃𝙴𝚁𝙴𝚂𝚃 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='lyrics'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}lyrics Asake Lonely`);
    try{
      let parts=q.split(' '); let artist=parts[0]; let title=parts.slice(1).join(' ')||parts[0];
      let r = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
      if(!r.data.lyrics) throw new Error('fail');
      return await reply(`> 🎤 𝙻𝚈𝚁𝙸𝙲𝚂 - ${q.toUpperCase()}\n\n${r.data.lyrics.slice(0,3500)}`);
    }catch{ return await reply(`> ❌ 𝙻𝚈𝚁𝙸𝙲𝚂 𝙽𝙾𝚃 𝙵𝙾𝚄𝙽𝙳`); }
  }
  if(cmdName==='github'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}github SimonTech/META-AI-MD`);
    try{
      let r = await axios.get(`https://api.github.com/repos/${q}`);
      return await reply(`> 🐙 𝙶𝙸𝚃𝙷𝚄𝙱\n\n> 📦 ${r.data.full_name}\n> 📝 ${r.data.description||'No desc'}\n> ⭐ ${r.data.stargazers_count} | 🍴 ${r.data.forks_count}\n> 🔗 ${r.data.html_url}`);
    }catch{ return await reply(`> ❌ 𝚁𝙴𝙿𝙾 𝙽𝙾𝚃 𝙵𝙾𝚄𝙽𝙳`); }
  }
  if(cmdName==='npm'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}npm axios`);
    try{
      let r = await axios.get(`https://registry.npmjs.org/${encodeURIComponent(q)}`);
      return await reply(`> 📦 𝙽𝙿𝙼\n\n> 📦 ${r.data.name} v${r.data['dist-tags']?.latest}\n> 📝 ${r.data.description||''}\n> 𝙸𝙽𝚂𝚃𝙰𝙻𝙻 : npm install ${q}`);
    }catch{ return await reply(`> ❌ 𝙽𝙿𝙼 𝙽𝙾𝚃 𝙵𝙾𝚄𝙽𝙳`); }
  }
  if(cmdName==='gitclone'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}gitclone user/repo`);
    return await reply(`> 🐙 𝙶𝙸𝚃 𝙲𝙻𝙾𝙽𝙴\n> 📦 ${q}\n> 🔗 https://github.com/${q}/archive/refs/heads/main.zip`);
  }

  // ----- TOOLS -----
  if(cmdName==='weather'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}weather Lagos`);
    try{
      let r = await axios.get(`https://wttr.in/${encodeURIComponent(q)}?format=j1`);
      let c = r.data.current_condition[0];
      return await reply(`> 🌤️ 𝚆𝙴𝙰𝚃𝙷𝙴𝚁 - ${q.toUpperCase()}\n\n> 🌡️ 𝚃𝙴𝙼𝙿 : ${c.temp_C}°C | 𝙵𝙴𝙴𝙻𝚂 : ${c.FeelsLikeC}°C\n> ☁️ ${c.weatherDesc[0].value}\n> 💧 𝙷𝚄𝙼𝙸𝙳𝙸𝚃𝚈 : ${c.humidity}%\n> 💨 𝚆𝙸𝙽𝙳 : ${c.windspeedKmph} km/h\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
    }catch{ return await reply(`> ❌ 𝚆𝙴𝙰𝚃𝙷𝙴𝚁 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='translate'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}translate Hello - Use ${p}translate en|Hello`);
    try{
      let [lang, ...txt] = q.split('|'); let text = txt.join('|') || q; let target = (lang||'en').trim().slice(0,2);
      let r = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${target}`);
      return await reply(`> 🌍 𝚃𝚁𝙰𝙽𝚂𝙻𝙰𝚃𝙴\n\n> 𝙾𝚁𝙸𝙶𝙸𝙽𝙰𝙻 : ${text}\n> 𝚃𝚁𝙰𝙽𝚂𝙻𝙰𝚃𝙴𝙳 : ${r.data.responseData.translatedText}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
    }catch{ return await reply(`> ❌ 𝚃𝚁𝙰𝙽𝚂𝙻𝙰𝚃𝙴 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(['calculate','calc'].includes(cmdName)){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}calc 2 + 2 x 5`);
    try{
      let expr = q.replace(/[^0-9+\-*/(). ]/g,'');
      let res = eval(expr);
      return await reply(`> 🧮 𝙲𝙰𝙻𝙲\n\n> ${q} = ${res}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
    }catch{ return await reply(`> ❌ 𝙸𝙽𝚅𝙰𝙻𝙸𝙳 𝙼𝙰𝚃𝙷`); }
  }
  if(['shorturl','tinyurl'].includes(cmdName)){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}shorturl https://google.com`);
    try{
      let r = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(q)}`);
      return await reply(`> 🔗 𝚂𝙷𝙾𝚁𝚃 𝚄𝚁𝙻\n\n> 𝙾𝚁𝙸𝙶𝙸𝙽𝙰𝙻 : ${q}\n> 𝚂𝙷𝙾𝚁𝚃 : ${r.data}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
    }catch{ return await reply(`> ❌ 𝚂𝙷𝙾𝚁𝚃 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='qr'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}qr Hello`);
    return await sock.sendMessage(from,{image:{url:`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(q)}`},caption:`> 📱 𝚀𝚁 - ${q}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`},{quoted:m});
  }
  if(cmdName==='ssweb'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}ssweb https://google.com`);
    return await sock.sendMessage(from,{image:{url:`https://image.thum.io/get/width/1200/crop/800/fullpage/${q}`},caption:`> 📸 𝚂𝚂 - ${q}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`},{quoted:m});
  }
  if(cmdName==='fetch'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}fetch https://google.com`);
    try{
      let r = await axios.get(q,{timeout:15000});
      return await reply(`> 🌐 𝙵𝙴𝚃𝙲𝙷\n\n> 𝚄𝚁𝙻 : ${q}\n> 𝚂𝚃𝙰𝚃𝚄𝚂 : ${r.status}\n> 𝙻𝙴𝙽𝙶𝚃𝙷 : ${JSON.stringify(r.data).slice(0,1000)}`);
    }catch(e){ return await reply(`> ❌ 𝙵𝙴𝚃𝙲𝙷 𝙵𝙰𝙸𝙻𝙴𝙳 : ${e.message}`); }
  }
  if(cmdName==='base64'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}base64 Hello`);
    return await reply(`> 🔐 𝙱𝙰𝚂𝙴64\n\n> ${Buffer.from(q).toString('base64')}`);
  }
  if(cmdName==='decode'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}decode SGVsbG8=`);
    try{ return await reply(`> 🔓 𝙳𝙴𝙲𝙾𝙳𝙴𝙳\n\n> ${Buffer.from(q,'base64').toString()}`); }catch{ return await reply(`> ❌ 𝙳𝙴𝙲𝙾𝙳𝙴 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='encode'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}encode Hello`);
    return await reply(`> 🔐 𝙴𝙽𝙲𝙾𝙳𝙴𝙳\n\n> ${encodeURIComponent(q)}`);
  }
  if(cmdName==='binary'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}binary Hi`);
    let bin = q.split('').map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' ');
    return await reply(`> 💻 𝙱𝙸𝙽𝙰𝚁𝚈\n\n> ${bin}`);
  }
  if(cmdName==='hash'){
    const crypto = require('crypto');
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}hash Hello`);
    return await reply(`> #️⃣ 𝙷𝙰𝚂𝙷\n\n> 𝙼𝙳5 : ${crypto.createHash('md5').update(q).digest('hex')}\n> 𝚂𝙷𝙰256 : ${crypto.createHash('sha256').update(q).digest('hex')}`);
  }
  if(cmdName==='password'){
    let len = parseInt(q)||12; let chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'; let pass='';
    for(let i=0;i<len;i++) pass+=chars[Math.floor(Math.random()*chars.length)];
    return await reply(`> 🔑 𝙿𝙰𝚂𝚂𝚆𝙾𝚁𝙳\n\n> ${pass}\n> 𝙻𝙴𝙽𝙶𝚃𝙷 : ${len}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }
  if(cmdName==='uuid'){
    const crypto=require('crypto'); return await reply(`> 🆔 𝚄𝚄𝙸𝙳\n\n> ${crypto.randomUUID()}`);
  }
  if(cmdName==='time') return await reply(`> 🕐 𝚃𝙸𝙼𝙴\n\n> ${new Date().toLocaleString('en-NG',{timeZone:'Africa/Lagos'})}\n> 𝙻𝙰𝙶𝙾𝚂 𝚃𝙸𝙼𝙴`);
  if(cmdName==='date') return await reply(`> 📅 𝙳𝙰𝚃𝙴\n\n> ${new Date().toLocaleDateString('en-NG',{timeZone:'Africa/Lagos',weekday:'long',year:'numeric',month:'long',day:'numeric'})}`);
  if(cmdName==='ipinfo'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}ipinfo 8.8.8.8`);
    try{
      let r = await axios.get(`http://ip-api.com/json/${q}`);
      return await reply(`> 🌐 𝙸𝙿 𝙸𝙽𝙵𝙾 - ${q}\n\n> 🌍 ${r.data.country} | ${r.data.city}\n> 🏢 ${r.data.isp}\n> 📍 ${r.data.lat}, ${r.data.lon}`);
    }catch{ return await reply(`> ❌ 𝙸𝙿 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='whois'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}whois google.com`);
    return await reply(`> 🔍 𝚆𝙷𝙾𝙸𝚂 - ${q}\n\n> 𝙳𝙾𝙼𝙰𝙸𝙽 : ${q}\n> 𝙲𝙷𝙴𝙲𝙺 : https://who.is/whois/${q}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }
  if(cmdName==='define' || cmdName==='dictionary'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}define Love`);
    try{
      let r = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(q)}`);
      let d = r.data[0]; let def = d.meanings[0].definitions[0].definition;
      return await reply(`> 📖 𝙳𝙴𝙵𝙸𝙽𝙴 - ${q.toUpperCase()}\n\n> ${def}\n> 🔊 ${d.phonetic||''}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
    }catch{ return await reply(`> ❌ 𝙳𝙴𝙵𝙸𝙽𝙸𝚃𝙸𝙾𝙽 𝙽𝙾𝚃 𝙵𝙾𝚄𝙽𝙳`); }
  }
  if(cmdName==='wiki'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}wiki Nigeria`);
    try{
      let r = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`);
      return await reply(`> 📚 𝚆𝙸𝙺𝙸 - ${r.data.title}\n\n> ${r.data.extract?.slice(0,1000)}\n> 🔗 ${r.data.content_urls?.desktop?.page}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
    }catch{ return await reply(`> ❌ 𝚆𝙸𝙺𝙸 𝙽𝙾𝚃 𝙵𝙾𝚄𝙽𝙳`); }
  }
  if(cmdName==='device') return await reply(`> 📱 𝙳𝙴𝚅𝙸𝙲𝙴\n\n> 𝚈𝙾𝚄𝚁 𝙽𝙰𝙼𝙴 : ${m.pushName||'User'}\n> 𝙿𝙷𝙾𝙽𝙴 : WhatsApp\n> 𝙱𝙾𝚃 : 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);

// plugins/text.js - META AI MD TEXT BY SIMON TECH
const axios = require('axios');

const MENU_PFP = "https://i.postimg.cc/GmSz8cDT/IMG-20261105-WA0073.jpg";

async function toSticker(buf){
  try{
    const {Sticker, StickerTypes} = require('wa-sticker-formatter');
    const s = new Sticker(buf,{pack:'META AI MD',author:'SIMON TECH',type:StickerTypes.FULL,quality:80});
    return await s.toBuffer();
  }catch{ return buf; }
}

// Fancy fonts map
const FONTS = {
  fancy: {a:'𝙰',b:'𝙱',c:'𝙲',d:'𝙳',e:'𝙴',f:'𝙵',g:'𝙶',h:'𝙷',i:'𝙸',j:'𝙹',k:'𝙺',l:'𝙻',m:'𝙼',n:'𝙽',o:'𝙾',p:'𝙿',q:'𝚀',r:'𝚁',s:'𝚂',t:'𝚃',u:'𝚄',v:'𝚅',w:'𝚆',x:'𝚇',y:'𝚈',z:'𝚉'},
  small: {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'},
  bold: {a:'𝐚',b:'𝐛',c:'𝐜',d:'𝐝',e:'𝐞',f:'𝐟',g:'𝐠',h:'𝐡',i:'𝐢',j:'𝐣',k:'𝐤',l:'𝐥',m:'𝐦',n:'𝐧',o:'𝐨',p:'𝐩',q:'𝐪',r:'𝐫',s:'𝐬',t:'𝐭',u:'𝐮',v:'𝐯',w:'𝐰',x:'𝐱',y:'𝐲',z:'𝐳'},
  mono: {a:'𝚊',b:'𝚋',c:'𝚌',d:'𝚍',e:'𝚎',f:'𝚏',g:'𝚐',h:'𝚑',i:'𝚒',j:'𝚓',k:'𝚔',l:'𝚕',m:'𝚖',n:'𝚗',o:'𝚘',p:'𝚙',q:'𝚚',r:'𝚛',s:'𝚜',t:'𝚝',u:'𝚞',v:'𝚟',w:'𝚠',x:'𝚡',y:'𝚢',z:'𝚣'},
  bubble: {a:'ⓐ',b:'ⓑ',c:'ⓒ',d:'ⓓ',e:'ⓔ',f:'ⓕ',g:'ⓖ',h:'ⓗ',i:'ⓘ',j:'ⓙ',k:'ⓚ',l:'ⓛ',m:'ⓜ',n:'ⓝ',o:'ⓞ',p:'ⓟ',q:'ⓠ',r:'ⓡ',s:'ⓢ',t:'ⓣ',u:'ⓤ',v:'ⓥ',w:'ⓦ',x:'ⓧ',y:'ⓨ',z:'ⓩ'},
};

function convert(text, font){
  let map = FONTS[font] || FONTS.fancy;
  return text.toLowerCase().split('').map(c => map[c] || c).join('');
}

module.exports = async (sock, m, ctx) => {
  const { prefix, cmdName, args, q, reply, from, config } = ctx;
  const p = prefix;
  const sender = m.sender;

  // ============ TEXT MENU ============
  if(cmdName === 'textmenu' || cmdName === 'text'){
    return await sock.sendMessage(from,{image:{url:MENU_PFP},caption:`◈┈▉ \`ᴍᴇᴛᴀ ᴀɪ ᴍᴅ\` ▉┄◈\n\n> ✍️ 𝚃𝙴𝚇𝚃 𝙼𝙴𝙽𝚄\n\n> ✦ ${p}attp <text> - Text to sticker\n> ✦ ${p}smeme <top|bottom> - Meme text\n> ✦ ${p}emojimix 😂+😭\n> ✦ ${p}qc <text> - Fake chat quote\n> ✦ ${p}brat <text> - Brat sticker\n> ✦ ${p}take <pack|author>\n> ✦ ${p}wm <pack|author>\n> ✦ ${p}fancy <text>\n> ✦ ${p}style <text>\n> ✦ ${p}smalltext <text>\n> ✦ ${p}bold <text>\n> ✦ ${p}italic <text>\n> ✦ ${p}mono <text>\n> ✦ ${p}bubble <text>\n> ✦ ${p}reverse <text>\n> ✦ ${p}uppercase <text>\n> ✦ ${p}lowercase <text>\n> ✦ ${p}repeat <text>\n> ✦ ${p}count <text>\n\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳 𝙱𝚈 𝚂𝙸𝙼𝙾𝙽 𝚃𝙴𝙲𝙷`},{quoted:m});
  }

  // ============ ATTP ============
  if(cmdName === 'attp'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}attp Hello Simon`);
    try{
      let res = await axios.get(`https://api.vreden.my.id/api/attp?text=${encodeURIComponent(q)}`,{responseType:'arraybuffer'});
      let buf = await toSticker(Buffer.from(res.data));
      return await sock.sendMessage(from,{sticker:buf},{quoted:m});
    }catch{ return await reply(`> ❌ 𝙰𝚃𝚃𝙿 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }

  // ============ BRAT ============
  if(cmdName === 'brat'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}brat Hello`);
    try{
      let res = await axios.get(`https://api.vreden.my.id/api/brat?text=${encodeURIComponent(q)}`,{responseType:'arraybuffer'});
      let buf = await toSticker(Buffer.from(res.data));
      return await sock.sendMessage(from,{sticker:buf},{quoted:m});
    }catch{ return await reply(`> ❌ 𝙱𝚁𝙰𝚃 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }

  // ============ QC ============
  if(cmdName === 'qc'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}qc Hello boss`);
    try{
      let pp = MENU_PFP; try{ pp = await sock.profilePictureUrl(sender,'image'); }catch{}
      let res = await axios.get(`https://api.vreden.my.id/api/qc?text=${encodeURIComponent(q)}&name=${encodeURIComponent(m.pushName||'User')}&avatar=${encodeURIComponent(pp)}`,{responseType:'arraybuffer'});
      let buf = await toSticker(Buffer.from(res.data));
      return await sock.sendMessage(from,{sticker:buf},{quoted:m});
    }catch{ return await reply(`> ❌ 𝚀𝙲 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }

  // ============ EMOJIMIX ============
  if(cmdName === 'emojimix'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}emojimix 😂+😭`);
    try{
      let [e1,e2] = q.split('+');
      let res = await axios.get(`https://api.vreden.my.id/api/emojimix?emoji1=${encodeURIComponent(e1.trim())}&emoji2=${encodeURIComponent(e2.trim())}`,{responseType:'arraybuffer'});
      let buf = await toSticker(Buffer.from(res.data));
      return await sock.sendMessage(from,{sticker:buf},{quoted:m});
    }catch{ return await reply(`> ❌ 𝙴𝙼𝙾𝙹𝙸𝙼𝙸𝚇 𝙵𝙰𝙸𝙻𝙴𝙳 - 𝚄𝚂𝙴 😂+😭`); }
  }

  // ============ SMEME ============
  if(cmdName === 'smeme'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}smeme top text | bottom text`);
    let [top,bottom] = q.split('|');
    if(!top || !bottom) return await reply(`> 𝚄𝚂𝙴 : ${p}smeme top | bottom`);
    return await reply(`> 😂 𝚂𝙼𝙴𝙼𝙴\n\n> 𝚃𝙾𝙿 : ${top.trim()}\n> 𝙱𝙾𝚃𝚃𝙾𝙼 : ${bottom.trim()}\n> 𝚁𝙴𝙿𝙻𝚈 𝙰 𝙿𝙸𝙲 𝚆𝙸𝚃𝙷 ${p}smeme 𝚃𝙾 𝙼𝙰𝙺𝙴 𝙸𝚃 𝙿𝙸𝙲\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }

  // ============ TAKE / WM ============
  if(['take','wm'].includes(cmdName)){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}take META AI MD | SIMON TECH\n> 𝚁𝙴𝙿𝙻𝚈 𝙰 𝚂𝚃𝙸𝙲𝙺𝙴𝚁`);
    let [pack,author] = q.split('|');
    return await reply(`> 🏷️ 𝚃𝙰𝙺𝙴 𝚂𝙰𝚅𝙴𝙳\n\n> 𝙿𝙰𝙲𝙺 : ${(pack||'META AI MD').trim()}\n> 𝙰𝚄𝚃𝙷𝙾𝚁 : ${(author||'SIMON TECH').trim()}\n> 𝚁𝙴𝙿𝙻𝚈 𝙰 𝚂𝚃𝙸𝙲𝙺𝙴𝚁 𝚆𝙸𝚃𝙷 ${p}take 𝚃𝙾 𝙰𝙿𝙿𝙻𝚈`);
  }

  // ============ FANCY / STYLE / SMALL / BOLD / ITALIC / MONO / BUBBLE ============
  if(['fancy','style'].includes(cmdName)){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}fancy Hello Simon`);
    return await reply(`> ✨ 𝙵𝙰𝙽𝙲𝚈\n\n> ${convert(q,'fancy')}\n\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }
  if(cmdName === 'smalltext'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}smalltext Hello`);
    return await reply(`> ✨ 𝚂𝙼𝙰𝙻𝙻 𝚃𝙴𝚇𝚃\n\n> ${convert(q,'small')}`);
  }
  if(cmdName === 'bold'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}bold Hello`);
    return await reply(`> ✨ 𝙱𝙾𝙻𝙳\n\n> *${q}*\n> ${convert(q,'bold')}`);
  }
  if(cmdName === 'italic'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}italic Hello`);
    return await reply(`> ✨ 𝙸𝚃𝙰𝙻𝙸𝙲\n\n> _${q}_`);
  }
  if(cmdName === 'mono'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}mono Hello`);
    return await reply(`> ✨ 𝙼𝙾𝙽𝙾\n\n> \`\`\`${q}\`\`\`\n> ${convert(q,'mono')}`);
  }
  if(cmdName === 'bubble'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}bubble Hello`);
    return await reply(`> ✨ 𝙱𝚄𝙱𝙱𝙻𝙴\n\n> ${convert(q,'bubble')}`);
  }

  // ============ REVERSE / UPPER / LOWER / REPEAT / COUNT ============
  if(cmdName === 'reverse'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}reverse Hello`);
    return await reply(`> 🔄 𝚁𝙴𝚅𝙴𝚁𝚂𝙴\n\n> ${q.split('').reverse().join('')}`);
  }
  if(cmdName === 'uppercase'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}uppercase hello`);
    return await reply(`> 🔠 𝚄𝙿𝙿𝙴𝚁\n\n> ${q.toUpperCase()}`);
  }
  if(cmdName === 'lowercase'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}lowercase HELLO`);
    return await reply(`> 🔡 𝙻𝙾𝚆𝙴𝚁\n\n> ${q.toLowerCase()}`);
  }
  if(cmdName === 'repeat'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}repeat Hello`);
    let times = parseInt(args[0]) || 3;
    let text = isNaN(parseInt(args[0])) ? q : args.slice(1).join(' ');
    return await reply(`> 🔁 𝚁𝙴𝙿𝙴𝙰𝚃 x${times}\n\n> ${(text+'\n').repeat(Math.min(times,10))}`);
  }
  if(cmdName === 'count'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}count Hello World`);
    return await reply(`> 🔢 𝙲𝙾𝚄𝙽𝚃\n\n> 𝚃𝙴𝚇𝚃 : ${q}\n> 𝙲𝙷𝙰𝚁𝙰𝙲𝚃𝙴𝚁𝚂 : ${q.length}\n> 𝚆𝙾𝚁𝙳𝚂 : ${q.trim().split(/\\s+/).length}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }

  return false;
};

module.exports.MENU_PFP = MENU_PFP;
