// plugins/anti.js - ANTI HANDLERS by Simon Tech
// Delete + Warn + Kick - Toggle wrapper for protection.js
// NOTE: protection.js is the main engine. This file syncs toggles to it to avoid double-warn.

function statusText(db, key, label, prefix) {
  let on = db.anti && db.anti[key];
  return `*${label}*\nStatus: ${on ? '✅ ON' : '❌ OFF'}\n\nUsage: ${prefix}${key} on / off\n\n©️ Created by Simon Tech Inc`;
}

function getRealPn(m, uid){
  let pn = m?.key?.participantPn || m?.key?.remoteJidAlt || '';
  if (pn && pn.endsWith('@s.whatsapp.net')) return pn;
  return uid || pn;
}
function getPnNumber(pn){
  return String(pn || '').split('@')[0].replace(/[^0-9]/g, '');
}
async function getGroupName(sock, gid, F){
  try {
    let meta = null;
    if (F?.getGroupMeta) meta = await F.getGroupMeta(sock, gid);
    else meta = await sock.groupMetadata(gid);
    if (meta?.subject) return meta.subject;
  } catch(e){}
  return gid;
}
async function getCachedMeta(sock, gid, F){
  try {
    if (F?.getGroupMeta) return await F.getGroupMeta(sock, gid);
    return await sock.groupMetadata(gid);
  } catch(e){ return null; }
}

async function setAnti(db, key, args, reply, label, prefix, ctx) {
  if (!ctx.isGroup) return reply('❌ Group only command.');
  let isAdmin = !!ctx.isAdmin;
  if (!isAdmin && !ctx.isOwner && ctx.sock && ctx.from) {
    try {
      let md = await getCachedMeta(ctx.sock, ctx.from, ctx.F);
      let senderId = ctx.sender || '';
      let senderPn = ctx.senderPn || '';
      let senderNum = String(ctx.senderNum || senderPn || senderId).replace(/[^0-9]/g, '');
      let p = (md?.participants || []).find(x => x.id === senderId || x.id === senderPn || x.phoneNumber === senderId || x.phoneNumber === senderPn || String(x.phoneNumber || '').split('@')[0] === senderNum || String(x.id || '').split('@')[0] === senderNum);
      isAdmin = !!(p && (p.admin === 'admin' || p.admin === 'superadmin'));
    } catch(e){}
  }
  if (!ctx.isOwner && !isAdmin) return reply('❌ Admins only. Only group admins can use anti commands.');
  if (!db.anti) db.anti = {};
  let v = (args[0] || '').toLowerCase();
  if (v === 'on' || v === 'off') {
    db.anti[key] = v === 'on';
    // Sync to protection.js so both engines see same state - prevents double-warn
    if (ctx.from?.endsWith('@g.us')) {
      if (!db.group) db.group = {};
      if (!db.group[ctx.from]) db.group[ctx.from] = {};
      if (!db.group[ctx.from].protection) db.group[ctx.from].protection = {};
      // Map anti.js keys to protection.js keys
      let map = { antilink: 'antilink', antibadword: 'antibadword', antitag: 'antitag', antidelete: 'antidelete', antisticker: 'antisticker', antiimage: 'antiimage', antivideo: 'antivideo', antiaudio: 'antiaudio', antidocument: 'antidocument', antiforward: 'antiforward', antispam: 'antispam', antifake: 'antifake', antibot: 'antibot', antinsfw: 'antinsfw', antiviewonce: 'antiviewonce', antimention: 'antimention', antiedit: 'antiedit', antilinkwarn: 'antilink' };
      let pKey = map[key] || key;
      db.group[ctx.from].protection[pKey] = v === 'on';
    }
    if (ctx.F) ctx.F.saveDB(db);
    // FIXED: Show group name + real PN, not JID + LID
    let realPn = ctx.senderPn || ctx.m?.key?.participantPn || ctx.sender;
    let realNum = getPnNumber(realPn);
    let groupName = await getGroupName(ctx.sock, ctx.from, ctx.F);
    return reply(`✅ *${label}* is now *${v.toUpperCase()}*\nGroup: ${groupName}\nBy: @${realNum}`, { mentions: [realPn] });
  }
  return reply(statusText(db, key, label, prefix));
}

// ===== FLOOD TRACKER + DELETE CACHE =====
const floodMap = new Map(); // sender -> [timestamps]
const deletedCache = new Map(); // msgId -> {text, sender, senderPn, from, time}

// Warn system - real kick after 3
async function doWarn(sock, m, from, sender, reason, db, F) {
  if (!db.warns) db.warns = {};
  if (!db.warns[from]) db.warns[from] = {};
  db.warns[from][sender] = (db.warns[from][sender] || 0) + 1;
  let count = db.warns[from][sender];
  let pn = getRealPn(m, sender);
  let pnNum = getPnNumber(pn);
  if (count >= 3) {
    db.warns[from][sender] = 0;
    try { await sock.groupParticipantsUpdate(from, [sender], 'remove'); } catch(e){}
    await sock.sendMessage(from, { text: `🦶 @${pnNum} kicked - 3/3 Violations\nReason: ${reason}`, mentions: [pn] }).catch(()=>{});
    if (F) F.saveDB(db);
    return true;
  } else {
    await sock.sendMessage(from, { text: `⚠️ Warning ${count}/3 - @${pnNum}\nReason: ${reason}\nMessage deleted.`, mentions: [pn] }).catch(()=>{});
    if (F) F.saveDB(db);
    return false;
  }
}

// ===== ANTI ENGINE - index.js calls this before commands =====
// If protection.js already handles this type, skip here to avoid double-warn
async function handleAnti(sock, m, db, F) {
  try {
    if (!db.anti) return false;
    // Fast exit - if no anti ON, skip
    if (!Object.values(db.anti).some(v => v === true)) return false;
    let from = m.key.remoteJid;
    if (!from.endsWith('@g.us')) return false;
    if (m.key.fromMe) return false;

    let sender = m.key.participant || m.key.remoteJid;
    let senderNum = sender.split('@')[0];
    let text = (F?.getText ? F.getText(m) : (m.message?.conversation || m.message?.extendedTextMessage?.text || '')).toLowerCase();
    let rawText = F?.getText ? F.getText(m) : text;
    let type = m.message ? Object.keys(m.message)[0] : '';
    let ctxInfo = m.message?.extendedTextMessage?.contextInfo || m.message?.imageMessage?.contextInfo || m.message?.videoMessage?.contextInfo || {};

    // Owner bypass
    let isOwner = false;
    try { if (F?.isOwner) isOwner = F.isOwner(sender, db); } catch(e){}
    if (!isOwner) {
      try { if (F?.isOwnerMessage) isOwner = F.isOwnerMessage(m, db); } catch(e){}
    }
    if (isOwner) return false;

    // Get group metadata ONCE - cached
    let metadata = await getCachedMeta(sock, from, F);
    if (!metadata) return false;
    let participants = metadata.participants || [];
    let myNum = String(sock.user?.id || '').split(':')[0].replace(/[^0-9]/g, '');
    let myPn = sock.user?.id || '';
    let myLid = String(sock.user?.lid || '').split('@')[0].replace(/[^0-9]/g, '');
    let me = participants.find(p => p.id === sock.user.id || p.phoneNumber === myPn || String(p.phoneNumber || '').split('@')[0] === myNum || String(p.id || '').split('@')[0] === myNum || (myLid && String(p.id || '').split('@')[0] === myLid));
    let isBotAdmin = !!(me && (me.admin === 'admin' || me.admin === 'superadmin'));
    let senderP = participants.find(p => p.id === sender || p.phoneNumber === sender || String(p.phoneNumber || '').split('@')[0] === senderNum || String(p.id || '').split('@')[0] === senderNum);
    let isSenderAdmin = !!(senderP && (senderP.admin === 'admin' || senderP.admin === 'superadmin'));
    if (isSenderAdmin) return false; // Admins bypass

    // Cache every message for antidelete
    if (db.anti.antidelete && m.key.id) {
      deletedCache.set(m.key.id, { text: rawText, sender, senderPn: getRealPn(m, sender), from, time: Date.now(), type });
      if (deletedCache.size > 200) {
        let first = deletedCache.keys().next().value;
        deletedCache.delete(first);
      }
    }

    // If protection.js already has this protection ON, let it handle it - avoid double-warn
    let prot = db.group?.[from]?.protection || {};
    let reason = null;

    // antilink
    if (!reason && db.anti.antilink && !prot.antilink && /https?:\/\/|www\.|chat\.whatsapp\.com\/|wa\.me\/|t\.me\/|instagram\.com|tiktok\.com|facebook\.com|youtu\.be|discord\.gg/i.test(text)) reason = 'Link not allowed';
    // antigroup - group invite link
    if (!reason && db.anti.antigroup && /chat\.whatsapp\.com\/[A-Za-z0-9]+/i.test(text)) reason = 'Group invite link not allowed';
    // antibadword
    if (!reason && db.anti.antibadword && !prot.antibadword && /(fuck|shit|bitch|bastard|dick|pussy|porn|fool|idiot|mumu|olosho|ashawo)/i.test(text)) reason = 'Bad word';
    // antisticker
    if (!reason && db.anti.antisticker && !prot.antisticker && type === 'stickerMessage') reason = 'Sticker not allowed';
    // antiimage
    if (!reason && db.anti.antiimage && !prot.antiimage && type === 'imageMessage') reason = 'Image not allowed';
    // antivideo
    if (!reason && db.anti.antivideo && !prot.antivideo && type === 'videoMessage') reason = 'Video not allowed';
    // antiaudio
    if (!reason && db.anti.antiaudio && !prot.antiaudio && (type === 'audioMessage' || type === 'pttMessage')) reason = 'Audio / Voice Note not allowed';
    // antidocument
    if (!reason && db.anti.antidocument && !prot.antidocument && type === 'documentMessage') reason = 'Document not allowed';
    // antiforward
    if (!reason && db.anti.antiforward && !prot.antiforward && ctxInfo.isForwarded) reason = 'Forwarded message not allowed';
    // antitag - tag 5+ people
    if (!reason && db.anti.antitag && !prot.antitag && (ctxInfo.mentionedJid?.length >= 5)) reason = 'Tagging many people';
    // antimention
    if (!reason && db.anti.antimention && !prot.antimention && ctxInfo.mentionedJid?.length > 0) reason = 'Mention not allowed';
    // antispam - too long
    if (!reason && db.anti.antispam && !prot.antispam && text.length > 500) reason = 'Spam - message too long';
    // antiscam
    if (!reason && db.anti.antiscam && /(double your money|giveaway|free money|click to win|investment 2x|send.*receive|double.*cash)/i.test(text)) reason = 'Scam detected';
    // antinsfw
    if (!reason && db.anti.antinsfw && !prot.antinsfw && /(porn|xxx|nude|sex video|onlyfans|pornhub)/i.test(text)) reason = 'NSFW not allowed';
    // antivirus
    if (!reason && db.anti.antivirus && /(\.apk|\.exe|virus|hack.*whatsapp)/i.test(text)) reason = 'Virus / APK not allowed';
    // antifake - FIXED: No country ban. Only obviously fake numbers (too short, all same digit)
    if (!reason && db.anti.antifake) {
      let numOnly = senderNum.replace(/[^0-9]/g, '');
      let isFake = numOnly.length < 7 || /^(\d)\1+$/.test(numOnly);
      if (isFake) reason = 'Fake number detected';
    }
    // antiflood - 5 messages in 10 seconds
    if (!reason && db.anti.antiflood) {
      let now = Date.now();
      let arr = floodMap.get(sender) || [];
      arr = arr.filter(t => now - t < 10000);
      arr.push(now);
      floodMap.set(sender, arr);
      if (arr.length >= 5) {
        reason = 'Flooding - 5 messages in 10s';
        floodMap.set(sender, []);
      }
    }

    if (reason) {
      if (isBotAdmin) {
        try { await sock.sendMessage(from, { delete: m.key }); } catch(e){}
      }
      await doWarn(sock, m, from, sender, reason, db, F);
      return true;
    }
    return false;
  } catch(e) { console.log('Anti error:', e.message); return false; }
}

// ===== ANTIDELETE - call from index.js on message delete event =====
async function handleDelete(sock, update, db, F) {
  try {
    if (!db.anti?.antidelete) return;
    for (let item of update) {
      let key = item.key;
      let cached = deletedCache.get(key.id);
      if (!cached) continue;
      let pn = cached.senderPn || cached.sender;
      let pnNum = getPnNumber(pn);
      await sock.sendMessage(cached.from, { text: `🗑️ *Anti Delete*\n\n@${pnNum} deleted a message:\n\n"${cached.text || '[Media message]'}"\n\n©️ Created by Simon Tech Inc`, mentions: [pn] }).catch(()=>{});
      deletedCache.delete(key.id);
    }
  } catch(e){}
}

const antiList = [
  { key: 'antilink', label: 'Anti Link - Delete all links' },
  { key: 'antibot', label: 'Anti Bot - Kick other bots' },
  { key: 'antispam', label: 'Anti Spam - Delete spam messages' },
  { key: 'antiflood', label: 'Anti Flood - Stop flood messages (5 in 10s)' },
  { key: 'antitag', label: 'Anti Tag - No tag 5+ people' },
  { key: 'antidelete', label: 'Anti Delete - Show deleted messages' },
  { key: 'antibadword', label: 'Anti Bad Word - Delete insults' },
  { key: 'antisticker', label: 'Anti Sticker' },
  { key: 'antifake', label: 'Anti Fake - Block fake numbers' },
  { key: 'antinsfw', label: 'Anti NSFW - Delete porn / explicit content' },
  { key: 'antiscam', label: 'Anti Scam - Delete giveaway scams' },
  { key: 'antivirus', label: 'Anti Virus - Delete APK / virus links' },
  { key: 'antimention', label: 'Anti Mention - No @ mention' },
  { key: 'antigroup', label: 'Anti Group - No group invite links' },
  { key: 'antidocument', label: 'Anti Document' },
  { key: 'antiimage', label: 'Anti Image' },
  { key: 'antivideo', label: 'Anti Video' },
  { key: 'antiaudio', label: 'Anti Audio / Voice Note' },
  { key: 'antiforward', label: 'Anti Forward - Delete forwarded messages' },
  { key: 'antiedit', label: 'Anti Edit - Block edited messages' },
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
    let txt = `◈┈▉ \`META AI MD\` ▉┄◈\n\n*🛡️ ANTI SETTINGS (${antiList.length})*\n\n`;
    for(let k of antiList) txt += `${db.anti?.[k.key] ? '✅' : '❌'} ${k.key} : ${db.anti?.[k.key] ? 'ON' : 'OFF'}\n`;
    txt += `\nUsage: ${prefix}antilink on\nAdmins only in group\n\n©️ Created by Simon Tech Inc`;
    return reply(txt);
  }
});

module.exports = cmds;
module.exports.handleAnti = handleAnti;
module.exports.handleDelete = handleDelete;
module.exports.doWarn = doWarn;
