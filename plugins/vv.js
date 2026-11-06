// plugins/vv.js - VV / VIEW ONCE MENU by Simon Tech
// How it works: Reply to a View Once message with .vv
// Bot downloads it and sends it back as a normal message

function unwrap(msg){
  if (!msg) return null;
  if (msg.ephemeralMessage) return unwrap(msg.ephemeralMessage.message);
  if (msg.viewOnceMessage) return msg.viewOnceMessage.message;
  if (msg.viewOnceMessageV2) return msg.viewOnceMessageV2.message;
  if (msg.viewOnceMessageV2Extension) return msg.viewOnceMessageV2Extension.message;
  return msg;
}

async function getVV(m, F) {
  // Check quoted first, then current msg
  let ctx = m.message?.extendedTextMessage?.contextInfo
    || m.message?.ephemeralMessage?.message?.extendedTextMessage?.contextInfo;
  let quoted = ctx?.quotedMessage;
  let quotedUnwrapped = unwrap(quoted);

  // 1. Quoted is viewOnce (including ephemeral-wrapped)
  if (quoted?.viewOnceMessage) return { msg: quoted.viewOnceMessage.message, key: { remoteJid: m.key.remoteJid, id: ctx.stanzaId, participant: ctx.participant } };
  if (quoted?.viewOnceMessageV2) return { msg: quoted.viewOnceMessageV2.message, key: { remoteJid: m.key.remoteJid, id: ctx.stanzaId, participant: ctx.participant } };
  if (quoted?.viewOnceMessageV2Extension) return { msg: quoted.viewOnceMessageV2Extension.message, key: { remoteJid: m.key.remoteJid, id: ctx.stanzaId, participant: ctx.participant } };
  if (quotedUnwrapped && (quotedUnwrapped.imageMessage || quotedUnwrapped.videoMessage || quotedUnwrapped.audioMessage)) {
    let inner = quotedUnwrapped.imageMessage || quotedUnwrapped.videoMessage || quotedUnwrapped.audioMessage;
    if (inner?.viewOnce) return { msg: quotedUnwrapped, key: { remoteJid: m.key.remoteJid, id: ctx.stanzaId, participant: ctx.participant } };
  }
  // 2. Current msg is viewOnce
  if (m.message?.viewOnceMessage) return { msg: m.message.viewOnceMessage.message, key: m.key };
  if (m.message?.viewOnceMessageV2) return { msg: m.message.viewOnceMessageV2.message, key: m.key };
  if (m.message?.viewOnceMessageV2Extension) return { msg: m.message.viewOnceMessageV2Extension.message, key: m.key };
  // 3. Quoted is image/video with viewOnce flag
  if (quoted?.imageMessage?.viewOnce || quoted?.videoMessage?.viewOnce || quoted?.audioMessage?.viewOnce) return { msg: quoted, key: { remoteJid: m.key.remoteJid, id: ctx.stanzaId, participant: ctx.participant } };
  return null;
}

async function downloadVV(sock, vv, F, m) {
  // Try F.downloadMedia first - it already handles view-once + ephemeral
  try {
    if (F?.downloadMedia) {
      let fake = { message: vv.msg, key: vv.key };
      // downloadMedia expects m.message, so pass fake with same shape
      let buf = await F.downloadMedia({ message: { viewOnceMessage: { message: vv.msg } }, key: vv.key });
      if (buf) {
        let type = Object.keys(vv.msg || {})[0] || 'unknown';
        return { buf, type };
      }
    }
  } catch(e){}
  try {
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
    let type = Object.keys(vv.msg)[0];
    let stream = await downloadContentFromMessage(vv.msg[type], type.replace('Message',''));
    let chunks = [];
    for await (let c of stream) chunks.push(c);
    return { buf: Buffer.concat(chunks), type };
  } catch(e) { return { buf: null, type: Object.keys(vv.msg || {})[0] || 'unknown' }; }
}

async function sendVV({ reply, sock, from, m, F }, onlyType = null) {
  let vv = await getVV(m, F);
  if (!vv) return reply('👁️ *Reply to a View Once message first!*\n\nUsage: Reply to a VV photo/video with .vv\n\n©️ Created by Simon Tech Inc');
  let { buf, type } = await downloadVV(sock, vv, F, m);
  if (!buf) return reply('❌ Failed to download VV. Try again, or the sender already opened it.');
  if (onlyType && !type.includes(onlyType)) return reply(`This VV is ${type}, not ${onlyType}. Use .vv for all types.`);
  let caption = `✅ *VIEW ONCE SAVED*\nType: ${type}\n\n©️ Created by Simon Tech Inc`;
  if (type === 'imageMessage') return sock.sendMessage(from, { image: buf, caption }, { quoted: m });
  if (type === 'videoMessage') return sock.sendMessage(from, { video: buf, caption }, { quoted: m });
  if (type === 'audioMessage') return sock.sendMessage(from, { audio: buf, mimetype: 'audio/mp4', ptt: true }, { quoted: m });
  return sock.sendMessage(from, { text: caption + '\nSaved but unknown type.' }, { quoted: m });
}

module.exports = [
{
  name: 'vv', aliases: ['viewonce', 'saveview', 'readview'], category: 'vv',
  run: async (ctx) => { return sendVV(ctx); }
},
// NOTE: viewonce / saveview / readview are aliases of vv above - do NOT add separate entries
// or index.js will log Duplicate command and skip them.
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
    if (!vv) return reply('👁️ Reply to a VV message to see its info.');
    let type = Object.keys(vv.msg || {})[0] || 'unknown';
    let inner = vv.msg?.[type] || {};
    return reply(`👁️ *VV INFO*\n\nType: ${type}\nCaption: ${inner.caption || 'No caption'}\nView Once: ${inner.viewOnce ? 'Yes' : 'No'}\nMimetype: ${inner.mimetype || 'unknown'}\nFile size: ${inner.fileLength ? Math.round(Number(inner.fileLength)/1024)+' KB' : 'unknown'}\n\nUse .vv to save it.`);
  }
},
{
  name: 'vvstatus', category: 'vv',
  run: async ({ reply }) => {
    return reply(`👁️ *VV STATUS*\n\nVV saver is ACTIVE ✅\n\nHow to use:\n1. Someone sends you a View Once message\n2. Reply to it with .vv\n3. The bot sends it back as a normal photo/video\n\nDo not open it before - if you open it, it will disappear!`);
  }
},
{
  name: 'vvhelp', category: 'vv',
  run: async ({ reply, prefix }) => {
    return reply(`👁️ *VV HELP - VIEW ONCE SAVER*\n\n${prefix}vv - Save any VV (photo/video/audio)\n${prefix}vvimage - Save VV photo only\n${prefix}vvvideo - Save VV video only\n${prefix}vvaudio - Save VV audio only\n${prefix}vvinfo - See VV info\n${prefix}vvstatus - Check if VV is active\n\n*IMPORTANT:*\n• Reply to the VV message, do not open it\n• If you open it before, it will disappear\n• The bot must be in the same chat\n\n©️ Created by Simon Tech Inc`);
  }
},
];
