// plugins/meta.js - META AI MD ALL IN ONE - FIXED - BY SIMON TECH
const axios = require('axios');
const MENU_PFP = "https://i.postimg.cc/GmSz8cDT/IMG-20261105-WA0073.jpg";
const BOT_PIC = MENU_PFP;

function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function getMenu(o={}){
  const p = o.prefix || '.';
  const owner = o.ownerName || 'SIMON TECH';
  const bot = o.botUser || 'META AI MD';
  const hosting = o.hosting || 'Render';
  const date = new Date().toLocaleDateString('en-NG',{timeZone:'Africa/Lagos'});
  return `◈┈▉ \`ᴍᴇᴛᴀ ᴀɪ ᴍᴅ\` ▉┄◈\n\n> ╭────↯\n> │ ➠ 𝙾𝚆𝙽𝙴𝚁 : ${owner}\n> │ ➠ 𝙿𝚁𝙴𝙵𝙸𝚇 : ${p}\n> ╰────↯\n> 𝙱𝙾𝚃 𝚄𝚂𝙴𝚁 : ${bot}\n> 𝙷𝙾𝚂𝚃𝙸𝙽𝙶 : ${hosting}\n> 𝙳𝙰𝚃𝙴 : ${date}\n\n✦ 𝙾𝚆𝙽𝙴𝚁 𝙼𝙴𝙽𝚄\n╭──────────◈\n┆ ◈ ${p}menu | ${p}ping | ${p}alive | ${p}owner\n┆ ◈ ${p}runtime | ${p}botinfo | ${p}restart\n╰──────────◈\n\n✦ 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁 𝙼𝙴𝙽𝚄\n╭──────────◈\n┆ ◈ ${p}play | ${p}song | ${p}video\n┆ ◈ ${p}tiktok | ${p}instagram | ${p}facebook\n┆ ◈ ${p}mediafire | ${p}apk | ${p}pinterest\n┆ ◈ ${p}spotify | ${p}youtube | ${p}ytmp3 | ${p}ytmp4\n╰──────────◈\n\n✦ 𝚃𝙾𝙾𝙻𝚂 𝙼𝙴𝙽𝚄\n╭──────────◈\n┆ ◈ ${p}weather | ${p}translate | ${p}calculate\n┆ ◈ ${p}shorturl | ${p}qr | ${p}ssweb | ${p}fetch\n┆ ◈ ${p}base64 | ${p}encode | ${p}decode | ${p}binary\n┆ ◈ ${p}hash | ${p}password | ${p}uuid | ${p}time\n┆ ◈ ${p}define | ${p}wiki | ${p}ipinfo\n╰──────────◈\n\n✦ 𝚃𝙴𝚇𝚃 𝙼𝙴𝙽𝚄\n╭──────────◈\n┆ ◈ ${p}attp | ${p}smeme | ${p}emojimix\n┆ ◈ ${p}qc | ${p}brat | ${p}take | ${p}wm\n┆ ◈ ${p}fancy | ${p}style | ${p}smalltext\n╰──────────◈\n\n✦ 𝚂𝙴𝚃𝚃𝙸𝙽𝙶𝚂 𝙼𝙴𝙽𝚄\n╭──────────◈\n┆ ◈ ${p}settings | ${p}prefix | ${p}public | ${p}private\n┆ ◈ ${p}setmode | ${p}setbotname | ${p}setownername\n╰──────────◈\n\n✦ 𝚂𝚃𝙸𝙲𝙺𝙴𝚁 𝙼𝙴𝙽𝚄\n╭──────────◈\n┆ ◈ ${p}sticker | ${p}toimg | ${p}take | ${p}attp\n┆ ◈ ${p}smeme | ${p}emojimix | ${p}wanted | ${p}trigger\n╰──────────◈\n\n✦ 𝙵𝚄𝙽 𝙼𝙴𝙽𝚄\n╭──────────◈\n┆ ◈ ${p}joke | ${p}quote | ${p}meme | ${p}truth | ${p}dare\n┆ ◈ ${p}fact | ${p}riddle | ${p}ship | ${p}rate\n┆ ◈ ${p}roast | ${p}compliment | ${p}rizz | ${p}hack\n┆ ◈ ${p}cat | ${p}dog | ${p}coinflip | ${p}dice | ${p}rps\n╰──────────◈\n\n✦ 𝙰𝙸 𝙼𝙴𝙽𝚄\n╭──────────◈\n┆ ◈ ${p}ai | ${p}chatgpt | ${p}meta | ${p}gemini\n┆ ◈ ${p}imagine | ${p}image | ${p}vision | ${p}describe\n┆ ◈ ${p}summarize | ${p}rewrite | ${p}grammar | ${p}code\n┆ ◈ ${p}explain | ${p}story | ${p}poem | ${p}essay | ${p}math\n╰──────────◈\n\n◈┈▉ \`ᴍᴇᴛᴀ ᴀɪ ᴍᴅ\` ▉┄◈\n> 🐺 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳 𝙿𝙾𝚆𝙴𝚁 𝙱𝚈 𝚂𝙸𝙼𝙾𝙽 𝚃𝙴𝙲𝙷`;
}

const JOKES = ["Why did chicken cross road? To see META AI MD 😂","My phone battery low, but my rizz high 🔥","Why NEPA dey take light? Dem no like META AI MD 💡😭","What do you call fake spaghetti? An impasta 🍝","Why did math book look sad? Too many problems 📚"];
const TRUTHS = ["Wetin be your biggest secret?","Who be your crush for this group? 😏","Have you ever stalk your ex?","Wetin be most embarrassing thing wey don happen to you?"];
const DARES = ["Send voice note sing Asake - Lonely 😂","Change DP to META AI MD for 1 hour","Text your crush 'I miss you' 😏","Send your last screenshot for group"];
const FACTS = ["Honey never spoils 🍯","Octopus get 3 hearts 🐙","Banana na berry, strawberry no be berry 🍌","Nigeria na most populous black nation 🇳🇬"];
const ROASTS = ["Your face be like WiFi - everybody see am but nobody wan connect 😂","If laziness na Olympic, you go win gold 🥇","Your brain na like NEPA - on and off 😭"];
const COMPLIMENTS = ["You fine pass morning sun 🌞","Your smile fit solve NEPA problem 😍","You be reason why group sweet ❤️"];
const RIZZ = ["Are you WiFi? Cause I dey feel connection 😏","Are you NEPA? Cause you light up my world 💡❤️","Are you Google? Cause you be everything I dey search for 🔍"];

async function askAI(prompt){
  const urls = [
    `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
    `https://api.vreden.my.id/api/gpt?query=${encodeURIComponent(prompt)}`
  ];
  for(let url of urls){
    try{
      let r = await axios.get(url,{timeout:20000});
      let txt = typeof r.data==='string' ? r.data : (r.data?.result || r.data?.answer || r.data?.response);
      if(txt && txt.length>2) return txt;
    }catch(e){}
  }
  return null;
}
async function toSticker(buf){
  try{
    const {Sticker, StickerTypes} = require('wa-sticker-formatter');
    const s = new Sticker(buf,{pack:'META AI MD',author:'SIMON TECH',type:StickerTypes.FULL,quality:80});
    return await s.toBuffer();
  }catch(e){ return buf; }
}

async function handler(sock, m, ctx){
  const { prefix, cmdName, q, reply, from, config } = ctx;
  const p = prefix || '.';
  const sender = m.sender;
  const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

  if(['menu','help','allmenu','list'].includes(cmdName)){
    let txt = getMenu({ ownerName: config?.ownerAlias || 'SIMON TECH', prefix: p, botUser: config?.botName || 'META AI MD', hosting: config?.hosting || 'Render' });
    return await sock.sendMessage(from,{image:{url:MENU_PFP},caption:txt},{quoted:m});
  }
  if(cmdName==='ping'){
    let s=Date.now(); await reply('> 🏓 𝙿𝙸𝙽𝙶𝙸𝙽𝙶...');
    return await sock.sendMessage(from,{text:`> 🏓 𝙿𝙾𝙽𝙶 !\n> ⚡ 𝚂𝙿𝙴𝙴𝙳 : ${Date.now()-s}ms\n> 🤖 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳 𝙸𝚂 𝙰𝙻𝙸𝚅𝙴 ✅`},{quoted:m});
  }
  if(cmdName==='alive'){
    return await sock.sendMessage(from,{image:{url:MENU_PFP},caption:`◈┈▉ \`ᴍᴇᴛᴀ ᴀɪ ᴍᴅ\` ▉┄◈\n\n> 🤖 𝙱𝙾𝚃 : 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳\n> 👑 𝙾𝚆𝙽𝙴𝚁 : 𝚂𝙸𝙼𝙾𝙽 𝚃𝙴𝙲𝙷\n> ⚡ 𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙾𝙽𝙻𝙸𝙽𝙴 ✅\n> 🕐 𝚄𝙿𝚃𝙸𝙼𝙴 : ${Math.floor(process.uptime()/60)} 𝚖𝚒𝚗𝚜`},{quoted:m});
  }
  if(cmdName==='owner') return await reply(`◈┈▉ \`ᴍᴇᴛᴀ ᴀɪ ᴍᴅ\` ▉┄◈\n\n> 👑 𝙾𝚆𝙽𝙴𝚁 : 𝚂𝙸𝙼𝙾𝙽 𝚃𝙴𝙲𝙷\n> 🤖 𝙱𝙾𝚃 : 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  if(cmdName==='runtime') return await reply(`> ⏰ 𝚁𝚄𝙽𝚃𝙸𝙼𝙴 : ${Math.floor(process.uptime()/60)} 𝚖𝚒𝚗𝚜`);
  if(cmdName==='botinfo') return await reply(`> 🤖 𝙱𝙾𝚃𝙸𝙽𝙵𝙾\n\n> 𝙽𝙰𝙼𝙴 : 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳\n> 𝙾𝚆𝙽𝙴𝚁 : 𝚂𝙸𝙼𝙾𝙽 𝚃𝙴𝙲𝙷\n> 𝙿𝚁𝙴𝙵𝙸𝚇 : ${p}\n> 𝙷𝙾𝚂𝚃𝙸𝙽𝙶 : Render\n> 𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙾𝙽𝙻𝙸𝙽𝙴 ✅`);

  if(['play','song','ytmp3'].includes(cmdName)){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}play Asake Lonely`);
    await reply(`> 🎵 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙸𝙽𝙶 ${q}... ⏳`);
    try{
      let r = await axios.get(`https://api.vreden.my.id/api/ytplaymp3?query=${encodeURIComponent(q)}`,{timeout:30000});
      let d = r.data?.result || r.data;
      let url = d?.download?.url || d?.url;
      if(!url) throw new Error('no audio');
      return await sock.sendMessage(from,{audio:{url},mimetype:'audio/mpeg',fileName:`${q}.mp3`},{quoted:m});
    }catch(e){ return await reply(`> ❌ 𝙰𝚄𝙳𝙸𝙾 𝙵𝙰𝙸𝙻𝙴𝙳, 𝚃𝚁𝚈 𝙰𝙶𝙰𝙸𝙽`); }
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
    }catch(e){ return await reply(`> ❌ 𝚅𝙸𝙳𝙴𝙾 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(['tiktok','ttdl'].includes(cmdName)){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}tiktok <link>`);
    try{
      let r = await axios.get(`https://api.vreden.my.id/api/tiktok?url=${encodeURIComponent(q)}`,{timeout:30000});
      let d = r.data?.result || r.data;
      let url = d?.nowm || d?.video || d?.play || d?.url;
      if(!url) throw new Error('fail');
      return await sock.sendMessage(from,{video:{url},caption:`> 🎵 𝚃𝙸𝙺𝚃𝙾𝙺 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝙳\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`},{quoted:m});
    }catch(e){ return await reply(`> ❌ 𝚃𝙸𝙺𝚃𝙾𝙺 𝙵𝙰𝙸𝙻𝙴𝙳`); }
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
    }catch(e){ return await reply(`> ❌ 𝙰𝙿𝙺 𝙽𝙾𝚃 𝙵𝙾𝚄𝙽𝙳`); }
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
      return true;
    }catch(e){ return await reply(`> ❌ 𝙿𝙸𝙽𝚃𝙴𝚁𝙴𝚂𝚃 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='lyrics'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}lyrics Asake Lonely`);
    try{
      let parts=q.split(' '); let artist=parts[0]; let title=parts.slice(1).join(' ')||parts[0];
      let r = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
      if(!r.data.lyrics) throw new Error('fail');
      return await reply(`> 🎤 𝙻𝚈𝚁𝙸𝙲𝚂 - ${q.toUpperCase()}\n\n${r.data.lyrics.slice(0,3500)}`);
    }catch(e){ return await reply(`> ❌ 𝙻𝚈𝚁𝙸𝙲𝚂 𝙽𝙾𝚃 𝙵𝙾𝚄𝙽𝙳`); }
  }
  if(cmdName==='github'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}github user/repo`);
    try{
      let r = await axios.get(`https://api.github.com/repos/${q}`);
      return await reply(`> 🐙 𝙶𝙸𝚃𝙷𝚄𝙱\n\n> 📦 ${r.data.full_name}\n> 📝 ${r.data.description||'No desc'}\n> ⭐ ${r.data.stargazers_count} | 🍴 ${r.data.forks_count}\n> 🔗 ${r.data.html_url}`);
    }catch(e){ return await reply(`> ❌ 𝚁𝙴𝙿𝙾 𝙽𝙾𝚃 𝙵𝙾𝚄𝙽𝙳`); }
  }
  if(cmdName==='weather'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}weather Lagos`);
    try{
      let r = await axios.get(`https://wttr.in/${encodeURIComponent(q)}?format=j1`);
      let c = r.data.current_condition[0];
      return await reply(`> 🌤️ 𝚆𝙴𝙰𝚃𝙷𝙴𝚁 - ${q.toUpperCase()}\n\n> 🌡️ 𝚃𝙴𝙼𝙿 : ${c.temp_C}°C | 𝙵𝙴𝙴𝙻𝚂 : ${c.FeelsLikeC}°C\n> ☁️ ${c.weatherDesc[0].value}\n> 💧 𝙷𝚄𝙼𝙸𝙳𝙸𝚃𝚈 : ${c.humidity}%\n> 💨 𝚆𝙸𝙽𝙳 : ${c.windspeedKmph} km/h`);
    }catch(e){ return await reply(`> ❌ 𝚆𝙴𝙰𝚃𝙷𝙴𝚁 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='translate'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}translate en|Hello`);
    try{
      let parts = q.split('|'); let lang = (parts[0]||'en').trim().slice(0,2); let text = parts[1] || q;
      let r = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${lang}`);
      return await reply(`> 🌍 𝚃𝚁𝙰𝙽𝚂𝙻𝙰𝚃𝙴\n\n> 𝙾𝚁𝙸𝙶𝙸𝙽𝙰𝙻 : ${text}\n> 𝚃𝚁𝙰𝙽𝚂𝙻𝙰𝚃𝙴𝙳 : ${r.data.responseData.translatedText}`);
    }catch(e){ return await reply(`> ❌ 𝚃𝚁𝙰𝙽𝚂𝙻𝙰𝚃𝙴 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(['calculate','calc'].includes(cmdName)){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}calc 2 + 2`);
    try{
      let expr = q.replace(/[^0-9+\-*/(). ]/g,'');
      let res = eval(expr);
      return await reply(`> 🧮 𝙲𝙰𝙻𝙲\n\n> ${q} = ${res}`);
    }catch(e){ return await reply(`> ❌ 𝙸𝙽𝚅𝙰𝙻𝙸𝙳 𝙼𝙰𝚃𝙷`); }
  }
  if(['shorturl','tinyurl'].includes(cmdName)){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}shorturl https://google.com`);
    try{
      let r = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(q)}`);
      return await reply(`> 🔗 𝚂𝙷𝙾𝚁𝚃 𝚄𝚁𝙻\n\n> 𝙾𝚁𝙸𝙶𝙸𝙽𝙰𝙻 : ${q}\n> 𝚂𝙷𝙾𝚁𝚃 : ${r.data}`);
    }catch(e){ return await reply(`> ❌ 𝚂𝙷𝙾𝚁𝚃 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='qr'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}qr Hello`);
    return await sock.sendMessage(from,{image:{url:`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(q)}`},caption:`> 📱 𝚀𝚁 - ${q}`},{quoted:m});
  }
  if(cmdName==='ssweb'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}ssweb https://google.com`);
    return await sock.sendMessage(from,{image:{url:`https://image.thum.io/get/width/1200/crop/800/fullpage/${q}`},caption:`> 📸 𝚂𝚂 - ${q}`},{quoted:m});
  }
  if(cmdName==='fetch'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}fetch https://google.com`);
    try{
      let r = await axios.get(q,{timeout:15000});
      return await reply(`> 🌐 𝙵𝙴𝚃𝙲𝙷\n\n> 𝚄𝚁𝙻 : ${q}\n> 𝚂𝚃𝙰𝚃𝚄𝚂 : ${r.status}`);
    }catch(e){ return await reply(`> ❌ 𝙵𝙴𝚃𝙲𝙷 𝙵𝙰𝙸𝙻𝙴𝙳 : ${e.message}`); }
  }
  if(cmdName==='base64'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}base64 Hello`);
    return await reply(`> 🔐 𝙱𝙰𝚂𝙴64\n\n> ${Buffer.from(q).toString('base64')}`);
  }
  if(cmdName==='decode'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}decode SGVsbG8=`);
    try{ return await reply(`> 🔓 𝙳𝙴𝙲𝙾𝙳𝙴𝙳\n\n> ${Buffer.from(q,'base64').toString()}`); }catch(e){ return await reply(`> ❌ 𝙳𝙴𝙲𝙾𝙳𝙴 𝙵𝙰𝙸𝙻𝙴𝙳`); }
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
    return await reply(`> 🔑 𝙿𝙰𝚂𝚂𝚆𝙾𝚁𝙳\n\n> ${pass}\n> 𝙻𝙴𝙽𝙶𝚃𝙷 : ${len}`);
  }
  if(cmdName==='uuid'){
    const crypto=require('crypto'); return await reply(`> 🆔 𝚄𝚄𝙸𝙳\n\n> ${crypto.randomUUID()}`);
  }
  if(cmdName==='time') return await reply(`> 🕐 𝚃𝙸𝙼𝙴\n\n> ${new Date().toLocaleString('en-NG',{timeZone:'Africa/Lagos'})}`);
  if(cmdName==='date') return await reply(`> 📅 𝙳𝙰𝚃𝙴\n\n> ${new Date().toLocaleDateString('en-NG',{timeZone:'Africa/Lagos',weekday:'long',year:'numeric',month:'long',day:'numeric'})}`);
  if(cmdName==='ipinfo'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}ipinfo 8.8.8.8`);
    try{
      let r = await axios.get(`http://ip-api.com/json/${q}`);
      return await reply(`> 🌐 𝙸𝙿 𝙸𝙽𝙵𝙾 - ${q}\n\n> 🌍 ${r.data.country} | ${r.data.city}\n> 🏢 ${r.data.isp}\n> 📍 ${r.data.lat}, ${r.data.lon}`);
    }catch(e){ return await reply(`> ❌ 𝙸𝙿 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='define'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}define Love`);
    try{
      let r = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(q)}`);
      let d = r.data[0]; let def = d.meanings[0].definitions[0].definition;
      return await reply(`> 📖 𝙳𝙴𝙵𝙸𝙽𝙴 - ${q.toUpperCase()}\n\n> ${def}`);
    }catch(e){ return await reply(`> ❌ 𝙳𝙴𝙵𝙸𝙽𝙸𝚃𝙸𝙾𝙽 𝙽𝙾𝚃 𝙵𝙾𝚄𝙽𝙳`); }
  }
  if(cmdName==='wiki'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}wiki Nigeria`);
    try{
      let r = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`);
      return await reply(`> 📚 𝚆𝙸𝙺𝙸 - ${r.data.title}\n\n> ${(r.data.extract||'').slice(0,1000)}\n> 🔗 ${r.data.content_urls?.desktop?.page||''}`);
    }catch(e){ return await reply(`> ❌ 𝚆𝙸𝙺𝙸 𝙽𝙾𝚃 𝙵𝙾𝚄𝙽𝙳`); }
  }
  if(['fancy','style'].includes(cmdName)){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}fancy Hello`);
    const map={a:'𝙰',b:'𝙱',c:'𝙲',d:'𝙳',e:'𝙴',f:'𝙵',g:'𝙶',h:'𝙷',i:'𝙸',j:'𝙹',k:'𝙺',l:'𝙻',m:'𝙼',n:'𝙽',o:'𝙾',p:'𝙿',q:'𝚀',r:'𝚁',s:'𝚂',t:'𝚃',u:'𝚄',v:'𝚅',w:'𝚆',x:'𝚇',y:'𝚈',z:'𝚉'};
    let out = q.toLowerCase().split('').map(c=>map[c]||c).join('');
    return await reply(`> ✨ 𝙵𝙰𝙽𝙲𝚈\n\n> ${out}`);
  }
  if(cmdName==='smalltext'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}smalltext Hello`);
    const map={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
    return await reply(`> ✨ 𝚂𝙼𝙰𝙻𝙻 𝚃𝙴𝚇𝚃\n\n> ${q.toLowerCase().split('').map(c=>map[c]||c).join('')}`);
  }
  if(cmdName==='bold') return await reply(`> *${q || 'Hello'}*`);
  if(cmdName==='reverse') return await reply(`> 🔄 𝚁𝙴𝚅𝙴𝚁𝚂𝙴\n\n> ${q.split('').reverse().join('')}`);
  if(cmdName==='uppercase') return await reply(`> ${q.toUpperCase()}`);
  if(['settings','setmode','setbotname','setownername','setmenu','setthumb','setbanner','setfooter','settheme','setemoji','setautobio','setstatus','setprefix'].includes(cmdName)){
    if(cmdName==='settings') return await reply(`> ⚙️ 𝚂𝙴𝚃𝚃𝙸𝙽𝙶𝚂\n\n> 𝙱𝙾𝚃 : 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳\n> 𝙾𝚆𝙽𝙴𝚁 : 𝚂𝙸𝙼𝙾𝙽 𝚃𝙴𝙲𝙷\n> 𝙿𝚁𝙴𝙵𝙸𝚇 : ${p}\n> 𝙼𝙾𝙳𝙴 : 𝙿𝚄𝙱𝙻𝙸𝙲`);
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}${cmdName} <value>`);
    return await reply(`> ✅ 𝚂𝙴𝚃𝚃𝙸𝙽𝙶 𝚂𝙰𝚅𝙴𝙳\n\n> ${cmdName.toUpperCase()} : ${q}`);
  }
  if(cmdName==='prefix') return await reply(`> 𝙿𝚁𝙴𝙵𝙸𝚇 : ${p}\n> 𝚄𝚂𝙴 ${p}𝚖𝚎𝚗𝚞`);
  if(cmdName==='public' || cmdName==='private') return await reply(`> ✅ 𝙼𝙾𝙳𝙴 𝙲𝙷𝙰𝙽𝙶𝙴𝙳 𝚃𝙾 ${cmdName.toUpperCase()}`);
  if(cmdName==='attp'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}attp Hello`);
    try{
      let res = await axios.get(`https://api.vreden.my.id/api/attp?text=${encodeURIComponent(q)}`,{responseType:'arraybuffer'});
      let buf = await toSticker(Buffer.from(res.data));
      return await sock.sendMessage(from,{sticker:buf},{quoted:m});
    }catch(e){ return await reply(`> ❌ 𝙰𝚃𝚃𝙿 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='brat'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}brat Hello`);
    try{
      let res = await axios.get(`https://api.vreden.my.id/api/brat?text=${encodeURIComponent(q)}`,{responseType:'arraybuffer'});
      let buf = await toSticker(Buffer.from(res.data));
      return await sock.sendMessage(from,{sticker:buf},{quoted:m});
    }catch(e){ return await reply(`> ❌ 𝙱𝚁𝙰𝚃 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
    if(cmdName==='qc'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}qc Hello boss`);
    try{
      let pp = MENU_PFP; try{ pp = await sock.profilePictureUrl(sender,'image'); }catch(e){}
      let res = await axios.get(`https://api.vreden.my.id/api/qc?text=${encodeURIComponent(q)}&name=${encodeURIComponent(m.pushName||'User')}&avatar=${encodeURIComponent(pp)}`,{responseType:'arraybuffer'});
      let buf = await toSticker(Buffer.from(res.data));
      return await sock.sendMessage(from,{sticker:buf},{quoted:m});
    }catch(e){ return await reply(`> ❌ 𝚀𝙲 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='emojimix'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}emojimix 😂+😭`);
    try{
      let parts=q.split('+'); let e1=parts[0]; let e2=parts[1];
      let res = await axios.get(`https://api.vreden.my.id/api/emojimix?emoji1=${encodeURIComponent(e1.trim())}&emoji2=${encodeURIComponent(e2.trim())}`,{responseType:'arraybuffer'});
      let buf = await toSticker(Buffer.from(res.data));
      return await sock.sendMessage(from,{sticker:buf},{quoted:m});
    }catch(e){ return await reply(`> ❌ 𝙴𝙼𝙾𝙹𝙸𝙼𝙸𝚇 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='wanted'){
    let target = mentioned || sender;
    try{
      let pp = await sock.profilePictureUrl(target,'image').catch(()=>MENU_PFP);
      let res = await axios.get(`https://api.vreden.my.id/api/wanted?url=${encodeURIComponent(pp)}`,{responseType:'arraybuffer'});
      return await sock.sendMessage(from,{image:Buffer.from(res.data),caption:`> 🚨 𝚆𝙰𝙽𝚃𝙴𝙳 @${target.split('@')[0]}`,mentions:[target]},{quoted:m});
    }catch(e){ return await reply(`> ❌ 𝚆𝙰𝙽𝚃𝙴𝙳 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='trigger'){
    let target = mentioned || sender;
    try{
      let pp = await sock.profilePictureUrl(target,'image').catch(()=>MENU_PFP);
      let res = await axios.get(`https://api.vreden.my.id/api/trigger?url=${encodeURIComponent(pp)}`,{responseType:'arraybuffer'});
      let buf = await toSticker(Buffer.from(res.data));
      return await sock.sendMessage(from,{sticker:buf},{quoted:m});
    }catch(e){ return await reply(`> ❌ 𝚃𝚁𝙸𝙶𝙶𝙴𝚁 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='joke') return await reply(`> 😂 𝙹𝙾𝙺𝙴\n\n${pick(JOKES)}`);
  if(cmdName==='fact') return await reply(`> 🧠 𝙳𝙸𝙳 𝚈𝙾𝚄 𝙺𝙽𝙾𝚆?\n\n${pick(FACTS)}`);
  if(cmdName==='quote'){
    try{
      let r = await axios.get('https://api.quotable.io/random');
      return await reply(`> ✨ 𝚀𝚄𝙾𝚃𝙴\n\n"${r.data.content}"\n\n— ${r.data.author}`);
    }catch(e){ return await reply(`> ✨ 𝚀𝚄𝙾𝚃𝙴\n\n"Success no be luck, na consistency."\n\n— 𝚂𝙸𝙼𝙾𝙽 𝚃𝙴𝙲𝙷`); }
  }
  if(cmdName==='meme'){
    try{
      let r = await axios.get('https://meme-api.com/gimme');
      return await sock.sendMessage(from,{image:{url:r.data.url},caption:`> 😂 𝙼𝙴𝙼𝙴\n> ${r.data.title}`},{quoted:m});
    }catch(e){ return await reply(`> ❌ 𝙼𝙴𝙼𝙴 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='truth') return await reply(`> 😏 𝚃𝚁𝚄𝚃𝙷\n\n${pick(TRUTHS)}`);
  if(cmdName==='dare') return await reply(`> 🔥 𝙳𝙰𝚁𝙴\n\n${pick(DARES)}`);
  if(['ship','compatibility'].includes(cmdName)){
    let target = mentioned || sender; let per = Math.floor(Math.random()*101);
    return await reply(`> 💘 𝚂𝙷𝙸𝙿\n\n> @${sender.split('@')[0]} ❤️ @${target.split('@')[0]}\n> 𝙲𝙾𝙼𝙿𝙰𝚃𝙸𝙱𝙸𝙻𝙸𝚃𝚈 : ${per}%`,{mentions:[sender,target]});
  }
  if(cmdName==='rate'){
    let target = mentioned || sender; let per = Math.floor(Math.random()*101);
    return await reply(`> ⭐ 𝚁𝙰𝚃𝙴\n\n> @${target.split('@')[0]} na ${per}% ${q||'fine'} 😂`,{mentions:[target]});
  }
  if(cmdName==='roast'){
    let target = mentioned || sender;
    return await reply(`> 🔥 𝚁𝙾𝙰𝚂𝚃 𝙵𝙾𝚁 @${target.split('@')[0]}\n\n${pick(ROASTS)}`,{mentions:[target]});
  }
  if(cmdName==='compliment'){
    let target = mentioned || sender;
    return await reply(`> 🥰 𝙲𝙾𝙼𝙿𝙻𝙸𝙼𝙴𝙽𝚃 𝙵𝙾𝚁 @${target.split('@')[0]}\n\n${pick(COMPLIMENTS)}`,{mentions:[target]});
  }
  if(cmdName==='insult'){
    let target = mentioned || sender;
    return await reply(`> 😤 𝙸𝙽𝚂𝚄𝙻𝚃 𝙵𝙾𝚁 @${target.split('@')[0]}\n\n${pick(ROASTS)}`,{mentions:[target]});
  }
  if(cmdName==='rizz') return await reply(`> 😏 𝚁𝙸𝚉𝚉\n\n${pick(RIZZ)}`);
  if(cmdName==='hack'){
    let target = mentioned || sender;
    return await reply(`> 💻 𝙷𝙰𝙲𝙺𝙸𝙽𝙶 @${target.split('@')[0]}...\n\n> 𝙸𝚗𝚓𝚎𝚌𝚝𝚒𝚗𝚐 𝚅𝚒𝚛𝚞𝚜... ✅\n> 𝙳𝙾𝙽𝙴!\n\n> 😂 𝙸𝚃 𝚆𝙰𝚂 𝙰 𝙿𝚁𝙰𝙽𝙺`,{mentions:[target]});
  }
  if(['cat','dog','fox'].includes(cmdName)){
    try{
      let urls={cat:'https://api.thecatapi.com/v1/images/search',dog:'https://dog.ceo/api/breeds/image/random',fox:'https://randomfox.ca/floof/'};
      let r = await axios.get(urls[cmdName]);
      let img = cmdName==='cat'?r.data[0].url:cmdName==='dog'?r.data.message:r.data.image;
      return await sock.sendMessage(from,{image:{url:img},caption:`> 🐾 ${cmdName.toUpperCase()}`},{quoted:m});
    }catch(e){ return await reply(`> ❌ ${cmdName.toUpperCase()} 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='coinflip') return await reply(`> 🪙 𝙲𝙾𝙸𝙽𝙵𝙻𝙸𝙿\n\n> ${Math.random()>0.5?'HEADS 🪙':'TAILS 🪙'}`);
  if(cmdName==='dice'){ let n=Math.floor(Math.random()*6)+1; return await reply(`> 🎲 𝙳𝙸𝙲𝙴\n\n> 𝚈𝙾𝚄 𝚁𝙾𝙻𝙻 : ${n}`); }
  if(cmdName==='rps'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}rps rock`);
    let bot=pick(['rock','paper','scissors']); let user=q.toLowerCase().trim();
    let win=(user==='rock'&&bot==='scissors')||(user==='paper'&&bot==='rock')||(user==='scissors'&&bot==='paper');
    return await reply(`> ✂️ 𝚁𝙿𝚂\n\n> 𝚈𝙾𝚄 : ${user}\n> 𝙱𝙾𝚃 : ${bot}\n> ${user===bot?'DRAW 🤝':win?'YOU WIN 🎉':'BOT WIN 😂'}`);
  }
  if(cmdName==='guess'){
    let num=Math.floor(Math.random()*10)+1;
    if(!q) return await reply(`> 𝙶𝚄𝙴𝚂𝚂 1-10 : ${p}guess 5`);
    return await reply(parseInt(q)===num?`> 🎉 𝚈𝙾𝚄 𝙶𝚄𝙴𝚂𝚂 𝙰𝙼! 𝙸𝚃 𝚆𝙰𝚂 ${num}`:`> ❌ 𝚆𝚁𝙾𝙽𝙶! 𝙸𝚃 𝚆𝙰𝚂 ${num}`);
  }
  if(cmdName==='quiz') return await reply(`> ❓ 𝚀𝚄𝙸𝚉\n\n> 𝚆𝚑𝚊𝚝 𝚒𝚜 𝚌𝚊𝚙𝚒𝚝𝚊𝚕 𝚘𝚏 𝙽𝚒𝚐𝚎𝚛𝚒𝚊?\n> 𝙰) 𝙻𝚊𝚐𝚘𝚜  𝙱) 𝙰𝚋𝚞𝚓𝚊  𝙲) 𝙺𝚊𝚗𝚘`);
  if(cmdName==='riddle') return await reply(`> 🧩 𝚁𝙸𝙳𝙳𝙻𝙴\n\n> What has keys but can't open locks?\n> 𝙰𝙽𝚂𝚆𝙴𝚁 : Piano 🎹`);
  if(['ai','chatgpt','meta','gemini','blackbox','deepseek','copilot','ask','question'].includes(cmdName)){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}ai Who be Simon Tech?`);
    await reply(`> 🤖 𝙼𝙴𝚃𝙰 𝙰𝙸 𝚃𝙷𝙸𝙽𝙺𝙸𝙽𝙶... ⏳`);
    let ans = await askAI(q);
    if(!ans) return await reply(`> ❌ 𝙰𝙸 𝙱𝚄𝚂𝚈, 𝚃𝚁𝚈 𝙰𝙶𝙰𝙸𝙽`);
    return await reply(`> 🤖 𝙰𝙸 - ${cmdName.toUpperCase()}\n\n${ans}\n\n> 🐺 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳 𝙱𝚈 𝚂𝙸𝙼𝙾𝙽 𝚃𝙴𝙲𝙷`);
  }
  if(['imagine','image'].includes(cmdName)){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}imagine A lion wearing suit in Lagos`);
    let url = `https://image.pollinations.ai/prompt/${encodeURIComponent(q)}?width=1024&height=1024&seed=${Math.floor(Math.random()*99999)}&nologo=true`;
    return await sock.sendMessage(from,{image:{url},caption:`> 🎨 𝙸𝙼𝙰𝙶𝙸𝙽𝙴𝙳 𝙱𝚈 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳\n\n> 📝 ${q}`},{quoted:m});
  }
  if(cmdName==='summarize'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}summarize <long text>`);
    let ans = await askAI(`Summarize this short: ${q}`);
    return await reply(`> 📝 𝚂𝚄𝙼𝙼𝙰𝚁𝚈\n\n${ans||q.slice(0,500)}`);
  }
  if(cmdName==='rewrite'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}rewrite I am fine`);
    let ans = await askAI(`Rewrite this fancy: ${q}`);
    return await reply(`> ✍️ 𝚁𝙴𝚆𝚁𝙸𝚃𝙴\n\n${ans||q}`);
  }
  if(cmdName==='grammar'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}grammar I is going`);
    let ans = await askAI(`Correct grammar: ${q}`);
    return await reply(`> ✍️ 𝙶𝚁𝙰𝙼𝙼𝙰𝚁\n\n${ans||q}`);
  }
  if(cmdName==='code'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}code Write JS to add 2 numbers`);
    let ans = await askAI(`Write code for: ${q}`);
    return await reply(`> 💻 𝙲𝙾𝙳𝙴\n\n${ans||'// code'}`);
  }
  if(cmdName==='debug'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}debug <error>`);
    let ans = await askAI(`Debug and fix, explain simple: ${q}`);
    return await reply(`> 🐛 𝙳𝙴𝙱𝚄𝙶\n\n${ans||'Check brackets 😂'}`);
  }
  if(cmdName==='explain'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}explain Photosynthesis`);
    let ans = await askAI(`Explain simple like 10 years old: ${q}`);
    return await reply(`> 📖 𝙴𝚇𝙿𝙻𝙰𝙸𝙽\n\n${ans||q}`);
  }
  if(cmdName==='story'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}story A boy in Lagos`);
    let ans = await askAI(`Write short funny story about: ${q}`);
    return await reply(`> 📖 𝚂𝚃𝙾𝚁𝚈\n\n${ans||'Once upon...'}`);
  }
  if(cmdName==='poem'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}poem Love`);
    let ans = await askAI(`Write short poem about: ${q}`);
    return await reply(`> ✨ 𝙿𝙾𝙴𝙼\n\n${ans||q}`);
  }
  if(cmdName==='essay'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}essay Education`);
    let ans = await askAI(`Write school essay about: ${q}`);
    return await reply(`> 📝 𝙴𝚂𝚂𝙰𝚈\n\n${ans||q}`);
  }
  if(cmdName==='math'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}math 2 + 2 x 5`);
    let ans = await askAI(`Solve math step by step: ${q}`);
    return await reply(`> 🧮 𝙼𝙰𝚃𝙷\n\n${ans||q}`);
  }
  if(cmdName==='clearchat') return await reply(`> 🧹 𝙲𝙷𝙰𝚃 𝙲𝙻𝙴𝙰𝚁𝙴𝙳`);
  return false;
}

module.exports = handler;
module.exports.getMenu = getMenu;
module.exports.MENU_PFP = MENU_PFP;
module.exports.BOT_PIC = BOT_PIC;
module.exports.askAI = askAI;
