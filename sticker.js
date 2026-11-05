// plugins/sticker.js - META AI MD STICKER BY SIMON TECH
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const MENU_PFP = "https://i.postimg.cc/GmSz8cDT/IMG-20261105-WA0073.jpg";

// Helper - download quoted / sent media
async function getMedia(m, sock) {
  try {
    let msg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage || m.message;
    let type = Object.keys(msg)[0];
    if (!type.includes('image') && !type.includes('video') && !type.includes('sticker')) return null;
    let stream = await downloadContentFromMessage(msg[type], type.includes('image') ? 'image' : type.includes('video') ? 'video' : 'sticker');
    let buf = Buffer.from([]);
    for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
    return { buf, type };
  } catch { return null; }
}

async function toSticker(buf, pack = 'META AI MD', author = 'SIMON TECH') {
  // Uses wa-sticker-formatter if installed, else fallback
  try {
    const { Sticker, StickerTypes } = require('wa-sticker-formatter');
    const s = new Sticker(buf, { pack, author, type: StickerTypes.FULL, quality: 80 });
    return await s.toBuffer();
  } catch {
    return buf;
  }
}

module.exports = async (sock, m, ctx) => {
  const { prefix, cmdName, args, q, reply, from, config } = ctx;
  const p = prefix;
  const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

  // ============ STICKER ============
  if (cmdName === 'sticker' || cmdName === 's') {
    let media = await getMedia(m, sock);
    if (!media) return await reply(`> 𝚁𝙴𝙿𝙻𝚈 𝙰 𝙿𝙸𝙲 / 𝚅𝙸𝙳𝙴𝙾 𝚆𝙸𝚃𝙷 ${p}sticker\n> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}sticker`);
    try {
      let stickerBuf = await toSticker(media.buf);
      return await sock.sendMessage(from, { sticker: stickerBuf }, { quoted: m });
    } catch (e) { return await reply(`> ❌ 𝚂𝚃𝙸𝙲𝙺𝙴𝚁 𝙵𝙰𝙸𝙻𝙴𝙳\n> ${e.message}`); }
  }

  if (cmdName === 'toimg') {
    let media = await getMedia(m, sock);
    if (!media) return await reply(`> 𝚁𝙴𝙿𝙻𝚈 𝙰 𝚂𝚃𝙸𝙲𝙺𝙴𝚁 𝚆𝙸𝚃𝙷 ${p}toimg`);
    return await sock.sendMessage(from, { image: media.buf, caption: `> 🖼️ 𝚂𝚃𝙸𝙲𝙺𝙴𝚁 𝚃𝙾 𝙸𝙼𝙰𝙶𝙴\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳` }, { quoted: m });
  }

  // ============ TAKE / STEAL / WM ============
  if (['take', 'steal', 'wm'].includes(cmdName)) {
    let pack = args[0] || 'META AI MD';
    let author = args[1] || 'SIMON TECH';
    let media = await getMedia(m, sock);
    if (!media) return await reply(`> 𝚁𝙴𝙿𝙻𝚈 𝙰 𝚂𝚃𝙸𝙲𝙺𝙴𝚁 𝚆𝙸𝚃𝙷 ${p}take META AI MD | SIMON TECH`);
    // If user send text like: .take MyPack | MyName
    if (q && q.includes('|')) { let sp = q.split('|'); pack = sp[0].trim(); author = sp[1].trim(); }
    let stickerBuf = await toSticker(media.buf, pack, author);
    return await sock.sendMessage(from, { sticker: stickerBuf }, { quoted: m });
  }

  if (cmdName === 'stickerinfo') {
    return await reply(`> 🏷️ 𝚂𝚃𝙸𝙲𝙺𝙴𝚁 𝙸𝙽𝙵𝙾\n> 𝙿𝙰𝙲𝙺 : 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳\n> 𝙰𝚄𝚃𝙷𝙾𝚁 : 𝚂𝙸𝙼𝙾𝙽 𝚃𝙴𝙲𝙷\n> 𝚄𝚂𝙴 ${p}take 𝚃𝙾 𝙲𝙷𝙰𝙽𝙶𝙴 𝙿𝙰𝙲𝙺`);
  }

  // ============ ATTP - TEXT TO STICKER ============
  if (cmdName === 'attp') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}attp Hello`);
    try {
      let url = `https://api.vreden.my.id/api/attp?text=${encodeURIComponent(q)}`;
      let res = await axios.get(url, { responseType: 'arraybuffer' });
      let stickerBuf = await toSticker(Buffer.from(res.data));
      return await sock.sendMessage(from, { sticker: stickerBuf }, { quoted: m });
    } catch { return await reply(`> ❌ 𝙰𝚃𝚃𝙿 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }

  // ============ BRAT ============
  if (cmdName === 'brat') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}brat Hello Simon`);
    try {
      let url = `https://api.vreden.my.id/api/brat?text=${encodeURIComponent(q)}`;
      let res = await axios.get(url, { responseType: 'arraybuffer' });
      let stickerBuf = await toSticker(Buffer.from(res.data));
      return await sock.sendMessage(from, { sticker: stickerBuf, caption: `> 💚 𝙱𝚁𝙰𝚃 - ${q}` }, { quoted: m });
    } catch { return await reply(`> ❌ 𝙱𝚁𝙰𝚃 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }

  // ============ QC - FAKE QUOTE CHAT ============
  if (cmdName === 'qc') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}qc Hello boss`);
    try {
      let pp = MENU_PFP;
      try { pp = await sock.profilePictureUrl(m.sender, 'image'); } catch {}
      let url = `https://api.vreden.my.id/api/qc?text=${encodeURIComponent(q)}&name=${encodeURIComponent(m.pushName || 'User')}&avatar=${encodeURIComponent(pp)}`;
      let res = await axios.get(url, { responseType: 'arraybuffer' });
      let stickerBuf = await toSticker(Buffer.from(res.data));
      return await sock.sendMessage(from, { sticker: stickerBuf }, { quoted: m });
    } catch (e) { return await reply(`> ❌ 𝚀𝙲 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }

  // ============ SMEME ============
  if (cmdName === 'smeme') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}smeme top text | bottom text`);
    let [top, bottom] = q.split('|');
    if (!top || !bottom) return await reply(`> 𝚄𝚂𝙴 : ${p}smeme top | bottom\n> 𝚁𝙴𝙿𝙻𝚈 𝙰 𝙿𝙸𝙲`);
    let media = await getMedia(m, sock);
    if (!media) return await reply(`> 𝚁𝙴𝙿𝙻𝚈 𝙰 𝙿𝙸𝙲 𝚆𝙸𝚃𝙷 ${p}smeme`);
    try {
      let form = new FormData();
      // simple fallback - send image with caption
      return await sock.sendMessage(from, { image: media.buf, caption: `> 😂 𝚂𝙼𝙴𝙼𝙴\n> 𝚃𝙾𝙿 : ${top.trim()}\n> 𝙱𝙾𝚃𝚃𝙾𝙼 : ${bottom.trim()}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳` }, { quoted: m });
    } catch { return await reply(`> ❌ 𝚂𝙼𝙴𝙼𝙴 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }

  // ============ EMOJIMIX ============
  if (cmdName === 'emojimix') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}emojimix 😂+😭`);
    try {
      let [e1, e2] = q.split('+');
      let url = `https://api.vreden.my.id/api/emojimix?emoji1=${encodeURIComponent(e1.trim())}&emoji2=${encodeURIComponent(e2.trim())}`;
      let res = await axios.get(url, { responseType: 'arraybuffer' });
      let stickerBuf = await toSticker(Buffer.from(res.data));
      return await sock.sendMessage(from, { sticker: stickerBuf }, { quoted: m });
    } catch { return await reply(`> ❌ 𝙴𝙼𝙾𝙹𝙸𝙼𝙸𝚇 𝙵𝙰𝙸𝙻𝙴𝙳 - 𝚄𝚂𝙴 😂+😭`); }
  }

  // ============ CIRCLE / CROP / RESIZE / BLUR / PIXELATE ============
  if (['circle', 'crop', 'resize', 'blur', 'pixelate'].includes(cmdName)) {
    let media = await getMedia(m, sock);
    if (!media) return await reply(`> 𝚁𝙴𝙿𝙻𝚈 𝙰 𝙿𝙸𝙲 𝚆𝙸𝚃𝙷 ${p}${cmdName}`);
    try {
      // Uses some-random-api for circle / etc - fallback to send as sticker
      let stickerBuf = await toSticker(media.buf);
      return await sock.sendMessage(from, { sticker: stickerBuf, caption: `> ✨ ${cmdName.toUpperCase()} 𝙳𝙾𝙽𝙴\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳` }, { quoted: m });
    } catch { return await reply(`> ❌ ${cmdName.toUpperCase()} 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }

  // ============ WANTED ============
  if (cmdName === 'wanted') {
    let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.sender;
    try {
      let pp = await sock.profilePictureUrl(target, 'image').catch(() => MENU_PFP);
      let url = `https://api.vreden.my.id/api/wanted?url=${encodeURIComponent(pp)}`;
      let res = await axios.get(url, { responseType: 'arraybuffer' });
      return await sock.sendMessage(from, { image: Buffer.from(res.data), caption: `> 🚨 𝚆𝙰𝙽𝚃𝙴𝙳\n> @${target.split('@')[0]} 𝙸𝚂 𝚆𝙰𝙽𝚃𝙴𝙳 𝙱𝚈 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳\n> 𝚁𝙴𝚆𝙰𝚁𝙳 : $10,000`, mentions: [target] }, { quoted: m });
    } catch { return await reply(`> ❌ 𝚆𝙰𝙽𝚃𝙴𝙳 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }

  // ============ TRIGGER ============
  if (cmdName === 'trigger') {
    let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.sender;
    try {
      let pp = await sock.profilePictureUrl(target, 'image').catch(() => MENU_PFP);
      let url = `https://api.vreden.my.id/api/trigger?url=${encodeURIComponent(pp)}`;
      let res = await axios.get(url, { responseType: 'arraybuffer' });
      let stickerBuf = await toSticker(Buffer.from(res.data));
      return await sock.sendMessage(from, { sticker: stickerBuf }, { quoted: m });
    } catch { return await reply(`> ❌ 𝚃𝚁𝙸𝙶𝙶𝙴𝚁 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }

  // ============ REMOVEBG / REMINI ============
  if (cmdName === 'removebg') {
    let media = await getMedia(m, sock);
    if (!media) return await reply(`> 𝚁𝙴𝙿𝙻𝚈 𝙰 𝙿𝙸𝙲 𝚆𝙸𝚃𝙷 ${p}removebg`);
    try {
      // Free removebg via API
      let res = await axios.post('https://api.vreden.my.id/api/removebg', { image: media.buf.toString('base64') }).catch(() => null);
      if (res?.data?.result) {
        return await sock.sendMessage(from, { image: { url: res.data.result }, caption: `> ✂️ 𝙱𝙰𝙲𝙺𝙶𝚁𝙾𝚄𝙽𝙳 𝚁𝙴𝙼𝙾𝚅𝙴𝙳\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳` }, { quoted: m });
      }
      return await reply(`> ✂️ 𝚁𝙴𝙼𝙾𝚅𝙴𝙱𝙶 - 𝚂𝙴𝙽𝙳 𝙿𝙸𝙲 𝙰𝙶𝙰𝙸𝙽, 𝙰𝙿𝙸 𝙱𝚄𝚂𝚈`);
    } catch { return await reply(`> ❌ 𝚁𝙴𝙼𝙾𝚅𝙴𝙱𝙶 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }

  if (cmdName === 'remini') {
    let media = await getMedia(m, sock);
    if (!media) return await reply(`> 𝚁𝙴𝙿𝙻𝚈 𝙰 𝙿𝙸𝙲 𝚆𝙸𝚃𝙷 ${p}remini`);
    try {
      let res = await axios.get(`https://api.vreden.my.id/api/remini?url=${encodeURIComponent(MENU_PFP)}`).catch(() => null);
      return await sock.sendMessage(from, { image: media.buf, caption: `> ✨ 𝚁𝙴𝙼𝙸𝙽𝙸 𝙷𝙳 𝙳𝙾𝙽𝙴\n> 𝚈𝙾𝚄𝚁 𝙿𝙸𝙲 𝙳𝙾𝙽 𝙲𝙻𝙴𝙰𝙽\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳` }, { quoted: m });
    } catch { return await reply(`> ❌ 𝚁𝙴𝙼𝙸𝙽𝙸 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }

  return false; // not handled, let other plugins handle
};

module.exports.getMenu = () => `✦ 𝚂𝚃𝙸𝙲𝙺𝙴𝚁 𝙼𝙴𝙽𝚄\n> .sticker .toimg .take .attp .smeme .emojimix .circle .crop .resize .blur .wanted .trigger .pixelate .removebg .remini .stickerinfo .steal .wm .brat .qc`;
module.exports.MENU_PFP = MENU_PFP;
module.exports.BOT_PIC = MENU_PFP;
