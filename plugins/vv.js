// commands/vv.js - VV / VIEW ONCE MENU 141-150 by Simon Tech
// How e work: Reply to a View Once message with .vv
// Bot go download am and send am back as normal message

async function getVV(m, F) {
  // Check quoted first, then current msg
  let ctx = m.message?.extendedTextMessage?.contextInfo;
  let quoted = ctx?.quotedMessage;
  // 1. Quoted is viewOnce
  if (quoted?.viewOnceMessage) return { msg: quoted.viewOnceMessage.message, key: { remoteJid: m.key.remoteJid, id: ctx.stanzaId, participant: ctx.participant } };
  if (quoted?.viewOnceMessageV2) return { msg: quoted.viewOnceMessageV2.message, key: { remoteJid: m.key.remoteJid, id: ctx.stanzaId, participant: ctx.participant } };
  // 2. Current msg is viewOnce
  if (m.message?.viewOnceMessage) return { msg: m.message.viewOnceMessage.message, key: m.key };
  if (m.message?.viewOnceMessageV2) return { msg: m.message.viewOnceMessageV2.message, key: m.key };
  // 3. Quoted is image/video with viewOnce flag
  if (quoted?.imageMessage?.viewOnce || quoted?.videoMessage?.viewOnce || quoted?.audioMessage?.viewOnce) return { msg: quoted, key: { remoteJid: m.key.remoteJid, id: ctx.stanzaId, participant: ctx.participant } };
  return null;
}

async function downloadVV(sock, vv, F) {
  // Build fake message for downloadContentFromMessage
  let type = Object.keys(vv.msg)[0];
  let mediaMsg = { message: vv.msg };
  // Use Baileys download via sock - we use helper from function.js if available
  try {
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
    let stream = await downloadContentFromMessage(vv.msg[type], type.replace('Message',''));
    let chunks = [];
    for await (let c of stream) chunks.push(c);
    return { buf: Buffer.concat(chunks), type };
  } catch(e) { return { buf: null, type }; }
}

async function sendVV({ reply, sock, from, m, F }, onlyType = null) {
  let vv = await getVV(m, F);
  if (!vv) return reply('👁️ *Reply to a View Once message first!*\n\nUsage: Reply to VV photo/video with .vv\n\n©️ created by Simon tech inc');
  let { buf, type } = await downloadVV(sock, vv, F);
  if (!buf) return reply('❌ Failed to download VV. Try again, or sender don open am already.');
  if (onlyType && !type.includes(onlyType)) return reply(`This VV is ${type}, not ${onlyType}. Use .vv for all.`);
  let caption = `✅ *VIEW ONCE SAVED*\nType: ${type}\n\n©️ created by Simon tech inc`;
  if (type === 'imageMessage') return sock.sendMessage(from, { image: buf, caption }, { quoted: m });
  if (type === 'videoMessage') return sock.sendMessage(from, { video: buf, caption }, { quoted: m });
  if (type === 'audioMessage') return sock.sendMessage(from, { audio: buf, mimetype: 'audio/mp4', ptt: true }, { quoted: m });
  return sock.sendMessage(from, { text: caption + '\nSaved but unknown type' }, { quoted: m });
}

module.exports = [
{
  name: 'vv', aliases: ['viewonce', 'saveview', 'readview'], category: 'vv',
  run: async (ctx) => { return sendVV(ctx); }
},
{
  name: 'viewonce', category: 'vv',
  run: async (ctx) => { return sendVV(ctx); }
},
{
  name: 'saveview', category: 'vv',
  run: async (ctx) => { return sendVV(ctx); }
},
{
  name: 'readview', category: 'vv',
  run: async (ctx) => { return sendVV(ctx); }
},
{
  name: 'vvimage', category: 'vv',
  run: async (ctx) => { return sendVV(ctx, 'image'); }
},
{
  name: 'vvvideo', category: 'vv',
  run: async (ctx) => { return sendVV(ctx, 'video'); }
},
{
  name: 'vvaudio', category: 'vv',
  run: async (ctx) => { return sendVV(ctx, 'audio'); }
},
{
  name: 'vvinfo', category: 'vv',
  run: async ({ reply, m, F }) => {
    let vv = await getVV(m, F);
    if (!vv) return reply('👁️ Reply to a VV message to see info');
    let type = Object.keys(vv.msg)[0];
    let inner = vv.msg[type];
    return reply(`👁️ *VV INFO*\n\nType: ${type}\nCaption: ${inner.caption || 'No caption'}\nView Once: ${inner.viewOnce ? 'Yes' : 'No'}\nMimetype: ${inner.mimetype || 'unknown'}\n\nUse .vv to save am`);
  }
},
{
  name: 'vvstatus', category: 'vv',
  run: async ({ reply }) => {
    return reply(`👁️ *VV STATUS*\n\nVV saver is ACTIVE ✅\n\nHow to use:\n1. Someone send you View Once\n2. Reply am with .vv\n3. Bot go send am back as normal photo/video\n\nNo need open am before - if you open am, e go disappear!`);
  }
},
{
  name: 'vvhelp', category: 'vv',
  run: async ({ reply, prefix }) => {
    return reply(`👁️ *VV HELP - VIEW ONCE SAVER*\n\n${prefix}vv - Save any VV (photo/video/audio)\n${prefix}vvimage - Save VV photo only\n${prefix}vvvideo - Save VV video only\n${prefix}vvaudio - Save VV audio only\n${prefix}vvinfo - See VV info\n${prefix}vvstatus - Check if VV active\n\n*IMPORTANT:*\n• Reply to VV message, no open am\n• If you open am before, e go disappear\n• Bot must be in same chat\n\n©️ created by Simon tech inc`);
  }
},
];
