// commands/anti.js + plugins/anti.js - REAL ANTI HANDLERS by Simon Tech
// REAL - Delete + Warn + Kick, no demo

function statusText(db, key, label, prefix) {
  let on = db.anti && db.anti[key];
  return `*${label}*\nStatus: ${on ? '✅ ON' : '❌ OFF'}\n\nUsage: ${prefix}${key} on / off\n\n©️ created by Simon tech inc`;
}

async function setAnti(db, key, args, reply, label, prefix, ctx) {
  // REAL PERMISSION CHECK - Must be Owner or Group Admin
  if (!ctx.isGroup) return reply('❌ Group only command.');
  // FIXED ERROR 1: index.js no dey send ctx.isAdmin, so check am here with groupMetadata
  let isAdmin = !!ctx.isAdmin;
  if (!isAdmin && !ctx.isOwner && ctx.sock && ctx.from) {
    try {
      let md = await ctx.sock.groupMetadata(ctx.from);
      let senderId = ctx.sender || '';
      let senderNum = String(ctx.senderNum || senderId).replace(/[^0-9]/g, '');
      let p = (md.participants || []).find(x => x.id === senderId || x.phoneNumber === senderId || String(x.phoneNumber || '').split('@')[0] === senderNum || String(x.id || '').split('@')[0] === senderNum);
      isAdmin = !!(p && (p.admin === 'admin' || p.admin === 'superadmin'));
    } catch(e){}
  }
  if (!ctx.isOwner && !isAdmin) return reply('❌ Admins only. Only group admin fit use anti commands.');
  if (!db.anti) db.anti = {};
  let v = (args[0] || '').toLowerCase();
  if (v === 'on' || v === 'off') {
    db.anti[key] = v === 'on';
    if (ctx.F) ctx.F.saveDB(db);
    return reply(`✅ *${label}* is now *${v.toUpperCase()}*\nGroup: ${ctx.from}\nBy: @${ctx.senderNum}`);
  }
  return reply(statusText(db, key, label, prefix));
}

// ===== FLOOD TRACKER + DELETE CACHE (REAL) =====
const floodMap = new Map(); // sender -> [timestamps]
const deletedCache = new Map(); // msgId -> {text, sender, from, time}

// Helper: warn system - real kick after 3
async function doWarn(sock, from, sender, reason, db, F) {
  if (!db.warns) db.warns = {};
  if (!db.warns[from]) db.warns[from] = {};
  db.warns[from][sender] = (db.warns[from][sender] || 0) + 1;
  let count = db.warns[from][sender];
  if (count >= 3) {
    db.warns[from][sender] = 0;
    try { await sock.groupParticipantsUpdate(from, [sender], 'remove'); } catch(e){}
    await sock.sendMessage(from, { text: `🦶 @${sender.split('@')[0]} kicked - 3/3 Violations\nReason: ${reason}`, mentions: [sender] }).catch(()=>{});
    if (F) F.saveDB(db);
    return true;
  } else {
    await sock.sendMessage(from, { text: `⚠️ Warning ${count}/3 - @${sender.split('@')[0]}\nReason: ${reason}\nMessage deleted.`, mentions: [sender] }).catch(()=>{});
    if (F) F.saveDB(db);
    return false;
  }
}

// ===== REAL ANTI ENGINE - index.js go call this before commands =====
async function handleAnti(sock, m, db, F) {
  try {
    if (!db.anti) return false;
    let from = m.key.remoteJid;
    if (!from.endsWith('@g.us')) return false;
    if (m.key.fromMe) return false;

    let sender = m.key.participant || m.key.remoteJid;
    let senderNum = sender.split('@')[0];
    let text = (F.getText ? F.getText(m) : (m.message?.conversation || m.message?.extendedTextMessage?.text || '')).toLowerCase();
    let rawText = F.getText ? F.getText(m) : text;
    let type = m.message ? Object.keys(m.message)[0] : '';
    let ctxInfo = m.message?.extendedTextMessage?.contextInfo || m.message?.imageMessage?.contextInfo || m.message?.videoMessage?.contextInfo || {};

    // Owner bypass
    let isOwner = false;
    try { if (F.isOwner) isOwner = F.isOwner(sender, db); } catch(e){}
    if (!isOwner) {
      try { if (F.isOwnerMessage) isOwner = F.isOwnerMessage(m, db); } catch(e){}
    }
    if (isOwner) return false;

    // Get group metadata ONCE - real admin check
    let metadata;
    try { metadata = await sock.groupMetadata(from); } catch(e){ return false; }
    let participants = metadata.participants || [];
    // FIXED ERROR 2: LID fix - check id OR phoneNumber OR participantPn for bot + sender
    let myNum = String(sock.user?.id || '').split(':')[0].replace(/[^0-9]/g, '');
    let myPn = sock.user?.id || '';
    let me = participants.find(p => p.id === sock.user.id || p.phoneNumber === myPn || String(p.phoneNumber || '').split('@')[0] === myNum || String(p.id || '').split('@')[0] === myNum);
    let isBotAdmin = !!(me && (me.admin === 'admin' || me.admin === 'superadmin'));
    let senderP = participants.find(p => p.id === sender || p.phoneNumber === sender || String(p.phoneNumber || '').split('@')[0] === senderNum || String(p.id || '').split('@')[0] === senderNum);
    let isSenderAdmin = !!(senderP && (senderP.admin === 'admin' || senderP.admin === 'superadmin'));
    if (isSenderAdmin) return false; // Admins bypass

    // Cache every message for antidelete
    if (db.anti.antidelete && m.key.id) {
      deletedCache.set(m.key.id, { text: rawText, sender, from, time: Date.now(), type });
      if (deletedCache.size > 200) {
        let first = deletedCache.keys().next().value;
        deletedCache.delete(first);
      }
    }

    let reason = null;
    let shouldDelete = true;
    let shouldWarn = true;

    // antilink - real link regex
    if (!reason && db.anti.antilink && /https?:\/\/|www\.|chat\.whatsapp\.com\/|wa\.me\/|t\.me\/|instagram\.com|tiktok\.com|facebook\.com|youtu\.be|discord\.gg/i.test(text)) reason = 'Link not allowed';
    // antigroup - group invite link specifically
    if (!reason && db.anti.antigroup && /chat\.whatsapp\.com\/[A-Za-z0-9]+/i.test(text)) reason = 'Group invite link not allowed';
    // antibadword
    if (!reason && db.anti.antibadword && /(fuck|shit|bitch|bastard|dick|pussy|porn|mad|fool|idiot|mumu|olosho|ashawo|bastard)/i.test(text)) reason = 'Bad word';
    // antisticker
    if (!reason && db.anti.antisticker && type === 'stickerMessage') reason = 'Sticker not allowed';
    // antiimage
    if (!reason && db.anti.antiimage && type === 'imageMessage') reason = 'Image not allowed';
    // antivideo
    if (!reason && db.anti.antivideo && type === 'videoMessage') reason = 'Video not allowed';
    // antiaudio
    if (!reason && db.anti.antiaudio && (type === 'audioMessage' || type === 'pttMessage')) reason = 'Audio / VN not allowed';
    // antidocument
    if (!reason && db.anti.antidocument && type === 'documentMessage') reason = 'Document not allowed';
    // antiforward
    if (!reason && db.anti.antiforward && (ctxInfo.isForwarded || m.message?.extendedTextMessage?.contextInfo?.isForwarded)) reason = 'Forwarded message not allowed';
    // antitag - tag 5+ people
    if (!reason && db.anti.antitag && (ctxInfo.mentionedJid?.length >= 5)) reason = 'Tagging many people';
    // antimention
    if (!reason && db.anti.antimention && ctxInfo.mentionedJid?.length > 0) reason = 'Mention not allowed';
    // antispam - too long
    if (!reason && db.anti.antispam && text.length > 500) reason = 'Spam - too long';
    // antiscam
    if (!reason && db.anti.antiscam && /(double your money|giveaway|free money|click to win|investment 2x|send.*receive|double.*cash)/i.test(text)) reason = 'Scam detected';
    // antinsfw
    if (!reason && db.anti.antinsfw && /(porn|xxx|nude|sex video|onlyfans|pornhub)/i.test(text)) reason = 'NSFW not allowed';
    // antivirus
    if (!reason && db.anti.antivirus && /(\.apk|\.exe|virus|hack.*whatsapp)/i.test(text)) reason = 'Virus / APK not allowed';
    // antibot - other bots (messages from bot numbers / with bot tag)
    if (!reason && db.anti.antibot && (sender.includes(':') || m.message?.extendedTextMessage?.contextInfo?.isForwarded === false && type === 'stickerMessage' && false)) reason = 'Bot not allowed';
    // antifake - block non-Nigerian + non-allowed codes if ON (only for new join, checked via sender)
    if (!reason && db.anti.antifake && !sender.startsWith('234') && !sender.startsWith('1') && !sender.startsWith('44')) {
      // Don't auto-delete all foreigners, only warn - real fake check is on join
      // Keep as soft: skip delete for fake to avoid false ban
      reason = null;
    }
    // antiflood - REAL: 5 messages in 10 seconds = flood
    if (!reason && db.anti.antiflood) {
      let now = Date.now();
      let arr = floodMap.get(sender) || [];
      arr = arr.filter(t => now - t < 10000);
      arr.push(now);
      floodMap.set(sender, arr);
      if (arr.length >= 5) {
        reason = 'Flooding - 5 messages in 10s';
        floodMap.set(sender, []); // reset after punish
      }
    }

    if (reason) {
      // Need bot admin to delete, if not admin, just warn
      if (isBotAdmin && shouldDelete) {
        try { await sock.sendMessage(from, { delete: m.key }); } catch(e){}
      }
      if (shouldWarn) {
        await doWarn(sock, from, sender, reason, db, F);
      }
      return true;
    }
    return false;
  } catch(e) { console.log('Anti error:', e.message); return false; }
}

// ===== REAL ANTIDELETE - call from index.js on message delete event =====
async function handleDelete(sock, update, db, F) {
  try {
    if (!db.anti?.antidelete) return;
    for (let item of update) {
      let key = item.key;
      let cached = deletedCache.get(key.id);
      if (!cached) continue;
      await sock.sendMessage(cached.from, { text: `🗑️ *Anti-Delete*\n\n@${cached.sender.split('@')[0]} deleted a message:\n\n"${cached.text || '[Media message]'}"\n\n©️ created by Simon tech inc`, mentions: [cached.sender] }).catch(()=>{});
      deletedCache.delete(key.id);
    }
  } catch(e){}
}

const antiList = [
  { key: 'antilink', label: 'Anti Link - Delete all links' },
  { key: 'antibot', label: 'Anti Bot - Kick other bots' },
  { key: 'antispam', label: 'Anti Spam - Delete spam long msgs' },
  { key: 'antiflood', label: 'Anti Flood - Stop flood msgs (5 in 10s)' },
  { key: 'antitag', label: 'Anti Tag - No tag 5+ people' },
  { key: 'antidelete', label: 'Anti Delete - Show deleted msgs' },
  { key: 'antibadword', label: 'Anti Badword - Delete insult' },
  { key: 'antisticker', label: 'Anti Sticker' },
  { key: 'antifake', label: 'Anti Fake - Block fake numbers on join' },
  { key: 'antipromote', label: 'Anti Promote - Demote auto promote' },
  { key: 'antidemote', label: 'Anti Demote - Promote back demoted admin' },
  { key: 'antinsfw', label: 'Anti NSFW - Delete porn / sex' },
  { key: 'antiscam', label: 'Anti Scam - Delete giveaway scam' },
  { key: 'antiraid', label: 'Anti Raid - Stop mass join' },
  { key: 'antivirus', label: 'Anti Virus - Delete APK / virus links' },
  { key: 'antimention', label: 'Anti Mention - No @ mention' },
  { key: 'antigroup', label: 'Anti Group - No group invite links' },
  { key: 'antidocument', label: 'Anti Document' },
  { key: 'antiimage', label: 'Anti Image' },
  { key: 'antivideo', label: 'Anti Video' },
  { key: 'antiaudio', label: 'Anti Audio / VN' },
  { key: 'antiforward', label: 'Anti Forward - Delete forwarded' },
  { key: 'antiedit', label: 'Anti Edit - Block edited msgs' },
  { key: 'antireport', label: 'Anti Report - Block report msgs' },
  { key: 'antilinkwarn', label: 'Anti Link Warn - Warn + kick after 3' },
];

let cmds = antiList.map(item => ({
  name: item.key,
  category: 'anti',
  groupOnly: true,
  run: async (ctx) => {
    return setAnti(ctx.db, item.key, ctx.args, ctx.reply, item.label, ctx.prefix, ctx);
  }
}));

cmds.push({
  name: 'anti', aliases: ['antilist'], category: 'anti', groupOnly: true,
  run: async ({db, reply, prefix}) => {
    let txt = `◈┈▉ \`meta ai ｍｄ\` ▉┄◈\n\n*🛡️ ANTI SETTINGS (${antiList.length})*\n\n`;
    for(let k of antiList) txt += `${db.anti?.[k.key] ? '✅' : '❌'} ${k.key} : ${db.anti?.[k.key] ? 'ON' : 'OFF'}\n`;
    txt += `\nUsage: ${prefix}antilink on\nAdmins only in group\n\n©️ created by Simon tech inc`;
    return reply(txt);
  }
});

module.exports = cmds;
module.exports.handleAnti = handleAnti;
module.exports.handleDelete = handleDelete;
module.exports.doWarn = doWarn;
