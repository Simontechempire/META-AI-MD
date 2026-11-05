// plugins/text.js - META AI MD TEXT - FIXED - BY SIMON TECH
const axios = require('axios');
const MENU_PFP = "https://i.postimg.cc/GmSz8cDT/IMG-20261105-WA0073.jpg";

function pick(a){ return a[Math.floor(Math.random()*a.length)]; }

async function toSticker(buf){
  try{
    const { Sticker, StickerTypes } = require('wa-sticker-formatter');
    const s = new Sticker(buf, { pack: 'META AI MD', author: 'SIMON TECH', type: StickerTypes.FULL, quality: 80 });
    return await s.toBuffer();
  }catch(e){ return buf; }
}

async function handler(sock, m, ctx){
  const { prefix, cmdName, q, reply, from } = ctx;
  const p = prefix || '.';
  const sender = ctx.sender;
  const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  const target = mentioned || sender;

  if(cmdName==='textmenu' || cmdName==='text'){
    return await reply(`> ✨ 𝚃𝙴𝚇𝚃 𝙼𝙴𝙽𝚄\n\n> ${p}attp | ${p}smeme | ${p}emojimix\n> ${p}qc | ${p}brat | ${p}take | ${p}wm\n> ${p}fancy | ${p}style | ${p}smalltext\n> ${p}bold | ${p}reverse | ${p}uppercase\n> ${p}wanted | ${p}trigger | ${p}beautiful\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }
  if(cmdName==='attp'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}attp Hello`);
    try{
      let res = await axios.get(`https://api.vreden.my.id/api/attp?text=${encodeURIComponent(q)}`, { responseType: 'arraybuffer' });
      let buf = await toSticker(Buffer.from(res.data));
      return await sock.sendMessage(from, { sticker: buf }, { quoted: m });
    }catch(e){ return await reply(`> ❌ 𝙰𝚃𝚃𝙿 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='brat'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}brat Hello`);
    try{
      let res = await axios.get(`https://api.vreden.my.id/api/brat?text=${encodeURIComponent(q)}`, { responseType: 'arraybuffer' });
      let buf = await toSticker(Buffer.from(res.data));
      return await sock.sendMessage(from, { sticker: buf }, { quoted: m });
    }catch(e){ return await reply(`> ❌ 𝙱𝚁𝙰𝚃 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='qc'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}qc Hello boss`);
    try{
      let pp = MENU_PFP;
      try{ pp = await sock.profilePictureUrl(sender, 'image'); }catch(e){}
      let res = await axios.get(`https://api.vreden.my.id/api/qc?text=${encodeURIComponent(q)}&name=${encodeURIComponent(m.pushName || 'User')}&avatar=${encodeURIComponent(pp)}`, { responseType: 'arraybuffer' });
      let buf = await toSticker(Buffer.from(res.data));
      return await sock.sendMessage(from, { sticker: buf }, { quoted: m });
    }catch(e){ return await reply(`> ❌ 𝚀𝙲 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='emojimix'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}emojimix 😂+😭`);
    try{
      let parts = q.split('+');
      let e1 = parts[0];
      let e2 = parts[1];
      if(!e1 || !e2) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}emojimix 😂+😭`);
      let res = await axios.get(`https://api.vreden.my.id/api/emojimix?emoji1=${encodeURIComponent(e1.trim())}&emoji2=${encodeURIComponent(e2.trim())}`, { responseType: 'arraybuffer' });
      let buf = await toSticker(Buffer.from(res.data));
      return await sock.sendMessage(from, { sticker: buf }, { quoted: m });
    }catch(e){ return await reply(`> ❌ 𝙴𝙼𝙾𝙹𝙸𝙼𝙸𝚇 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='wanted'){
    try{
      let pp = await sock.profilePictureUrl(target, 'image').catch(()=>MENU_PFP);
      let res = await axios.get(`https://api.vreden.my.id/api/wanted?url=${encodeURIComponent(pp)}`, { responseType: 'arraybuffer' });
      return await sock.sendMessage(from, { image: Buffer.from(res.data), caption: `> 🚨 𝚆𝙰𝙽𝚃𝙴𝙳 @${target.split('@')[0]}`, mentions: [target] }, { quoted: m });
    }catch(e){ return await reply(`> ❌ 𝚆𝙰𝙽𝚃𝙴𝙳 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='trigger'){
    try{
      let pp = await sock.profilePictureUrl(target, 'image').catch(()=>MENU_PFP);
      let res = await axios.get(`https://api.vreden.my.id/api/trigger?url=${encodeURIComponent(pp)}`, { responseType: 'arraybuffer' });
      let buf = await toSticker(Buffer.from(res.data));
      return await sock.sendMessage(from, { sticker: buf }, { quoted: m });
    }catch(e){ return await reply(`> ❌ 𝚃𝚁𝙸𝙶𝙶𝙴𝚁 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='beautiful'){
    try{
      let pp = await sock.profilePictureUrl(target, 'image').catch(()=>MENU_PFP);
      let res = await axios.get(`https://api.vreden.my.id/api/beautiful?url=${encodeURIComponent(pp)}`, { responseType: 'arraybuffer' });
      return await sock.sendMessage(from, { image: Buffer.from(res.data), caption: `> 😍 𝙱𝙴𝙰𝚄𝚃𝙸𝙵𝚄𝙻 @${target.split('@')[0]}`, mentions: [target] }, { quoted: m });
    }catch(e){ return await reply(`> ❌ 𝙱𝙴𝙰𝚄𝚃𝙸𝙵𝚄𝙻 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(cmdName==='smeme' || cmdName==='meme'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}smeme Top text | Bottom text`);
    try{
      let parts = q.split('|');
      let top = (parts[0] || 'META').trim();
      let bottom = (parts[1] || 'AI MD').trim();
      let res = await axios.get(`https://api.vreden.my.id/api/smeme?top=${encodeURIComponent(top)}&bottom=${encodeURIComponent(bottom)}`, { responseType: 'arraybuffer' });
      let buf = await toSticker(Buffer.from(res.data));
      return await sock.sendMessage(from, { sticker: buf }, { quoted: m });
    }catch(e){ return await reply(`> ❌ 𝚂𝙼𝙴𝙼𝙴 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }
  if(['fancy','style'].includes(cmdName)){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}fancy Hello`);
    const map = { a:'𝙰', b:'𝙱', c:'𝙲', d:'𝙳', e:'𝙴', f:'𝙵', g:'𝙶', h:'𝙷', i:'𝙸', j:'𝙹', k:'𝙺', l:'𝙻', m:'𝙼', n:'𝙽', o:'𝙾', p:'𝙿', q:'𝚀', r:'𝚁', s:'𝚂', t:'𝚃', u:'𝚄', v:'𝚅', w:'𝚆', x:'𝚇', y:'𝚈', z:'𝚉' };
    let out = q.toLowerCase().split('').map(c=>map[c]||c).join('');
    return await reply(`> ✨ 𝙵𝙰𝙽𝙲𝚈\n\n> ${out}`);
  }
  if(cmdName==='smalltext'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}smalltext Hello`);
    const map = { a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ғ', g:'ɢ', h:'ʜ', i:'ɪ', j:'ᴊ', k:'ᴋ', l:'ʟ', m:'ᴍ', n:'ɴ', o:'ᴏ', p:'ᴘ', q:'ǫ', r:'ʀ', s:'s', t:'ᴛ', u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x', y:'ʏ', z:'ᴢ' };
    let out = q.toLowerCase().split('').map(c=>map[c]||c).join('');
    return await reply(`> ✨ 𝚂𝙼𝙰𝙻𝙻 𝚃𝙴𝚇𝚃\n\n> ${out}`);
  }
  if(cmdName==='bold'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}bold Hello`);
    return await reply(`> *${q}*`);
  }
  if(cmdName==='reverse'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}reverse Hello`);
    return await reply(`> 🔄 𝚁𝙴𝚅𝙴𝚁𝚂𝙴\n\n> ${q.split('').reverse().join('')}`);
  }
  if(cmdName==='uppercase'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}uppercase hello`);
    return await reply(`> ${q.toUpperCase()}`);
  }
  if(cmdName==='lowercase'){
    if(!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}lowercase HELLO`);
    return await reply(`> ${q.toLowerCase()}`);
  }
  if(cmdName==='take' || cmdName==='wm' || cmdName==='steal'){
    let pack = q.split('|')[0] || 'META AI MD';
    let author = q.split('|')[1] || 'SIMON TECH';
    return await reply(`> ✅ 𝚃𝙰𝙺𝙴 𝙳𝙾𝙽𝙴\n\n> Pack: ${pack.trim()}\n> Author: ${author.trim()}\n> Reply sticker with ${p}take to steal am`);
  }
  if(cmdName==='toimg'){
    return await reply(`> 🖼️ 𝚃𝙾𝙸𝙼𝙶\n\n> Reply a sticker with ${p}toimg to convert am to image`);
  }
  if(cmdName==='tovideo'){
    return await reply(`> 🎬 𝚃𝙾𝚅𝙸𝙳𝙴𝙾\n\n> Reply a sticker with ${p}tovideo`);
  }
  if(cmdName==='toaudio'){
    return await reply(`> 🎵 𝚃𝙾𝙰𝚄𝙳𝙸𝙾\n\n> Reply a video with ${p}toaudio`);
  }
  return false;
}

module.exports = handler;
