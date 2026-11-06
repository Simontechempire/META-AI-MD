// plugins/protection.js - META AI MD PROTECTION BY SIMON TECH
// Uses MAIN db (no separate protection.json), No triple-warn, Real antidelete
// This file is the ONLY anti engine. Delete anti.js handleAnti if you use this one.

const BADWORDS = ['fuck','shit','bitch','bastard','idiot','mumu','olosho','ashawo','dick','pussy','sex','porn','penis','vagina','fuck you','motherfucker','asshole'];
const SPAM_TRACK = {}; // user -> { count, lastTime }
const deletedCache = new Map(); // msgId -> {text, sender, senderPn, from, time}

// ===== Helpers - PN + Group Name (Fixes LID display bug) =====
function getRealPn(m, uid){
  // uid may be LID - return real PN if available
  let pn = m?.key?.participantPn || m?.key?.remoteJidAlt || '';
  if (pn && pn.endsWith('@s.whatsapp.net')) return pn;
  // If uid is already a PN, use it
  if (uid && String(uid).endsWith('@s.whatsapp.net') && !String(uid).startsWith('232')) return uid;
  return uid || pn;
}
function getPnNumber(pn){
  return String(pn || '').split('@')[0].replace(/[^0-9]/g, '');
}
async function getGroupName(sock, gid){
  try {
    if (sock && gid?.endsWith('@g.us')) {
      let meta = null;
      // Use cached meta from index.js / function.js if available
      if (sock && typeof sock.groupMetadata === 'function') {
        try { meta = await sock.groupMetadata(gid); } catch(e){}
      }
      if (meta?.subject) return meta.subject;
    }
  } catch(e){}
  return gid;
}
async function getCachedMeta(sock, gid, F){
  try {
    if (F?.getGroupMeta) return await F.getGroupMeta(sock, gid);
    return await sock.groupMetadata(gid);
  } catch(e){ return null; }
}

// ===== Use MAIN db, no separate file =====
function getGroup(db, jid){
  if(!db.group) db.group = {};
  if(!db.group[jid]) db.group[jid] = {};
  if(!db.group[jid].protection) db.group[jid].protection = {
    antigroupstatus: false,
    antigcstatus: false,
    antilink: false,
    antibadword: false,
    antitag: false,
    antidelete: false,
    antisticker: false,
    antiimage: false,
    antivideo: false,
    antiaudio: false,
    antidocument: false,
    antiforward: false,
    antispam: false,
    antifake: false,
    antibot: false,
    antinsfw: false,
    antiviewonce: false,
    antimention: false,
    antiedit: false,
  };
  return db.group[jid].protection;
}
function getWarn(db, gid, uid){
  if(!db.warns) db.warns = {};
  if(!db.warns[gid]) db.warns[gid] = {};
  return db.warns[gid][uid] || 0;
}
function addWarn(db, gid, uid, F){
  if(!db.warns) db.warns = {};
  if(!db.warns[gid]) db.warns[gid] = {};
  db.warns[gid][uid] = (db.warns[gid][uid]||0)+1;
  if (F) F.saveDB(db);
  return db.warns[gid][uid];
}
function clearWarn(db, gid, uid, F){
  if(db.warns?.[gid]) delete db.warns[gid][uid];
  if (F) F.saveDB(db);
}

// Admin check - uses cached meta, checks id OR phoneNumber
async function isAdmin(sock, gid, uid, F){
  try{
    let meta = await getCachedMeta(sock, gid, F);
    if (!meta) return false;
    let num = String(uid || '').split('@')[0].replace(/[^0-9]/g, '');
    let p = (meta.participants || []).find(x => x.id === uid || x.phoneNumber === uid || String(x.phoneNumber || '').split('@')[0] === num || String(x.id || '').split('@')[0] === num);
    return p?.admin === 'admin' || p?.admin === 'superadmin';
  }catch{ return false; }
}
async function isBotAdmin(sock, gid, F){
  try{
    let meta = await getCachedMeta(sock, gid, F);
    if (!meta) return false;
    let myNum = String(sock.user?.id || '').split(':')[0].replace(/[^0-9]/g, '');
    let myPn = sock.user?.id || '';
    let myLid = String(sock.user?.lid || '').split('@')[0].replace(/[^0-9]/g, '');
    let p = (meta.participants || []).find(x => x.id === myPn || x.phoneNumber === myPn || String(x.phoneNumber || '').split('@')[0] === myNum || String(x.id || '').split('@')[0] === myNum || (myLid && String(x.id || '').split('@')[0] === myLid));
    return p?.admin === 'admin' || p?.admin === 'superadmin';
  }catch{ return false; }
}
// Self-check admin for commands - index.js sends ctx.isAdmin, use it first
async function isAdminForCommand(sock, ctx){
  if (ctx.isOwner) return true;
  if (ctx.isAdmin) return true;
  try {
    let meta = await getCachedMeta(sock, ctx.from, ctx.F);
    if (!meta) return false;
    let senderId = ctx.sender || '';
    let senderPn = ctx.senderPn || '';
    let senderNum = String(ctx.senderNum || senderPn || senderId).replace(/[^0-9]/g, '');
    let p = (meta.participants || []).find(x => x.id === senderId || x.id === senderPn || x.phoneNumber === senderId || x.phoneNumber === senderPn || String(x.phoneNumber || '').split('@')[0] === senderNum || String(x.id || '').split('@')[0] === senderNum);
    return !!(p && (p.admin === 'admin' || p.admin === 'superadmin'));
  } catch(e){ return false; }
}

async function punish(sock, m, gid, uid, reason, db, F){
  let warns = addWarn(db, gid, uid, F);
  let pn = getRealPn(m, uid);
  let pnNum = getPnNumber(pn);
  if(warns >= 3){
    clearWarn(db, gid, uid, F);
    let botAdmin = await isBotAdmin(sock, gid, F);
    if(botAdmin){
      await sock.groupParticipantsUpdate(gid, [uid], 'remove').catch(()=>{});
      // Use PN for mention so tag works, but remove by LID/UID
      await sock.sendMessage(gid,{text:`🛡️ PROTECTION KICK\n\n👤 @${pnNum} has been kicked\n📛 Reason: ${reason}\n⚠️ Violations: 3/3\nMETA AI MD PROTECTION`, mentions:[pn]},{quoted:m}).catch(()=>{});
      return 'kicked';
    } else {
      await sock.sendMessage(gid,{text:`⚠️ @${pnNum} has reached 3 violations, but the bot is not admin. Make the bot admin to enable kicks.`, mentions:[pn]}).catch(()=>{});
      return 'warned';
    }
  } else {
    await sock.sendMessage(gid,{text:`⚠️ WARNING ${warns}/3\n\n👤 @${pnNum}\n📛 Reason: ${reason}\n🗑️ Message deleted\n⚠️ One more violation = Kick at 3/3\nMETA AI MD PROTECTION`, mentions:[pn]},{quoted:m}).catch(()=>{});
    return 'warned';
  }
}

async function deleteMsg(sock, m, gid){
  try{ await sock.sendMessage(gid,{delete: m.key}); }catch{}
}

// ============ MAIN PROTECTION - CALL THIS FOR EVERY MESSAGE ============
// index.js calls: await protection.handleProtection(sock, m, db, F, config)
async function handleProtection(sock, m, db, F, config){
  try{
    if(!m.key.remoteJid?.endsWith('@g.us')) return false;
    let gid = m.key.remoteJid;
    let uid = m.key.participant || m.key.remoteJid;
    if(!uid || uid.includes(sock.user.id.split(':')[0])) return false;
    if(m.key.fromMe) return false;

    let settings = getGroup(db, gid);
    // If nothing ON, skip fast - no waste
    let anyOn = Object.values(settings).some(v=>v===true) || db.anti?.antilink || db.anti?.antibadword;
    if(!anyOn && !settings.antidelete) return false;

    let isAdminUser = await isAdmin(sock, gid, uid, F);
    if(isAdminUser) return false;

    // Owner bypass
    let isOwner = false;
    try { if (F?.isOwner) isOwner = F.isOwner(uid, db); } catch(e){}
    if (!isOwner) { try { if (F?.isOwnerMessage) isOwner = F.isOwnerMessage(m, db); } catch(e){} }
    if (isOwner) return false;

    let text = '';
    try { text = F?.getText ? F.getText(m).toLowerCase() : (m.message?.conversation || m.message?.extendedTextMessage?.text || ''); } catch(e){}
    let fullText = F?.getText ? F.getText(m) : text;
    let msgType = Object.keys(m.message || {})[0] || '';
    let mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let ctxInfo = m.message?.extendedTextMessage?.contextInfo || m.message?.imageMessage?.contextInfo || {};
    let isForwarded = ctxInfo.isForwarded || false;
    let isViewOnce = !!(m.message?.viewOnceMessage || m.message?.viewOnceMessageV2 || m.message?.viewOnceMessageV2Extension);

    // Cache for REAL antidelete - save before delete
    if (settings.antidelete && m.key.id) {
      deletedCache.set(m.key.id, { text: fullText, sender: uid, senderPn: getRealPn(m, uid), from: gid, type: msgType });
      if (deletedCache.size > 200) deletedCache.delete(deletedCache.keys().next().value);
    }

    // ---------- 1. ANTI GROUP STATUS MENTION ----------
    if(settings.antigroupstatus){
      let isGroupStatusMention = mentions.length > 5
        || /view my status|check my status|status pls|status please|view.*status.*now/i.test(text)
        || (text.includes('status') && mentions.length >= 3);
      if(isGroupStatusMention){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'Anti Group Status - Mention / Tag for Status', db, F);
        return true;
      }
    }

    // ---------- 2. ANTI GC STATUS ----------
    if(settings.antigcstatus){
      let isGCStatus = (isForwarded && (ctxInfo.forwardingScore > 5))
        || text.includes('group status') || text.includes('gc status');
      if(isGCStatus){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'Anti GC Status - Sharing Group Status', db, F);
        return true;
      }
    }

    // ---------- 3. ANTI LINK ----------
    if(settings.antilink || db.anti?.antilink){
      let linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com|wa\.me|t\.me|instagram\.com|facebook\.com|youtube\.com|youtu\.be|tiktok\.com|discord\.gg)/i;
      if(linkRegex.test(fullText)){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'Anti Link - Link Not Allowed', db, F);
        return true;
      }
    }

    // ---------- 4. ANTI BADWORD ----------
    if(settings.antibadword || db.anti?.antibadword){
      if(BADWORDS.some(w => text.includes(w))){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'Anti Bad Word - Bad Word', db, F);
        return true;
      }
    }

    // ---------- 5. ANTI TAG ----------
    if(settings.antitag || settings.antimention || db.anti?.antitag){
      if(mentions.length >= 5 || text.includes('@all') || text.includes('@everyone')){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'Anti Tag - Tagging Many People', db, F);
        return true;
      }
    }

    // ---------- 6-10. MEDIA ----------
    if(settings.antisticker && msgType === 'stickerMessage'){ await deleteMsg(sock, m, gid); await punish(sock, m, gid, uid, 'Anti Sticker', db, F); return true; }
    if(settings.antiimage && msgType === 'imageMessage'){ await deleteMsg(sock, m, gid); await punish(sock, m, gid, uid, 'Anti Image', db, F); return true; }
    if(settings.antivideo && msgType === 'videoMessage'){ await deleteMsg(sock, m, gid); await punish(sock, m, gid, uid, 'Anti Video', db, F); return true; }
    if(settings.antiaudio && (msgType === 'audioMessage' || msgType === 'pttMessage')){ await deleteMsg(sock, m, gid); await punish(sock, m, gid, uid, 'Anti Audio', db, F); return true; }
    if(settings.antidocument && msgType === 'documentMessage'){ await deleteMsg(sock, m, gid); await punish(sock, m, gid, uid, 'Anti Document', db, F); return true; }

    // ---------- 11. ANTI FORWARD ----------
    if(settings.antiforward && isForwarded){
      await deleteMsg(sock, m, gid);
      await punish(sock, m, gid, uid, 'Anti Forward - Forwarded Message', db, F);
      return true;
    }

    // ---------- 12. ANTI VIEW ONCE ----------
    if(settings.antiviewonce && isViewOnce){
      await deleteMsg(sock, m, gid);
      await punish(sock, m, gid, uid, 'Anti View Once - View Once Not Allowed', db, F);
      return true;
    }

    // ---------- 13. ANTI SPAM / FLOOD - 5 in 3s ----------
    if(settings.antispam || db.anti?.antispam){
      let now = Date.now();
      if(!SPAM_TRACK[uid]) SPAM_TRACK[uid] = { count: 0, last: now };
      if(now - SPAM_TRACK[uid].last < 3000) SPAM_TRACK[uid].count++;
      else SPAM_TRACK[uid].count = 1;
      SPAM_TRACK[uid].last = now;
      if(SPAM_TRACK[uid].count >= 5){
        SPAM_TRACK[uid].count = 0;
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'Anti Spam - Flooding / Spam', db, F);
        return true;
      }
    }

    // ---------- 14. ANTI NSFW ----------
    if(settings.antinsfw){
      let nsfwWords = ['porn','sex video','nude','xxx','onlyfans','pornhub'];
      if(nsfwWords.some(w => text.includes(w))){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'Anti NSFW - NSFW Content', db, F);
        return true;
      }
    }

    // ---------- 15. ANTI BOT ----------
    if(settings.antibot){
      // Bot detection via LID is unreliable, leave to anti.js antibot
    }

    return false;
  }catch(e){ console.log('Protection error:', e.message); return false; }
}

// ============ ANTI DELETE REAL - Resend deleted message content ============
async function handleAntiDelete(sock, updates, db, F){
  try{
    for (let item of updates) {
      let key = item.key;
      let cached = deletedCache.get(key.id);
      if (!cached) continue;
      let gid = key.remoteJid;
      let settings = getGroup(db, gid);
      if (!settings.antidelete) continue;
      let pn = cached.senderPn || cached.sender;
      let pnNum = getPnNumber(pn);
      await sock.sendMessage(gid,{text:`🛡️ ANTI DELETE\n\n👤 @${pnNum} tried to delete a message!\n\n"${cached.text || '[Media message - image / video / sticker]'}"\n\nMETA AI MD Protection`, mentions:[pn]}).catch(()=>{});
      deletedCache.delete(key.id);
    }
  }catch{}
}

// ============ COMMANDS - ON / OFF - Uses ctx from index.js ============
async function handleCommands(sock, m, ctx){
  const { prefix, cmdName, args, reply, from, sender, senderPn, isOwner, isAdmin, db, F } = ctx;
  let gid = from;
  if(!gid.endsWith('@g.us')){
    if(cmdName.startsWith('anti') || cmdName.startsWith('antig') || cmdName === 'protection'){
      return await reply(`❌ This command works in groups only.`);
    }
    return false;
  }

  // FIXED: antilinkwarn = alias for antilink (your screenshot command)
  let realCmd = cmdName;
  if (realCmd === 'antilinkwarn') realCmd = 'antilink';

  if(cmdName === 'protection' || cmdName === 'protect' || cmdName === 'antimenu'){
    let s = getGroup(db, gid);
    let onoff = (v) => v ? '✅ ON' : '❌ OFF';
    return await reply(`◈┈▉ \`META AI MD\` ▉┄◈\n\n🛡️ PROTECTION MENU\n\n✦ ${prefix}antigroupstatus on/off - Anti Group Status Mention\n✦ ${prefix}antigcstatus on/off - Anti Group Status\n✦ ${prefix}antilink on/off - Anti Link (also: antilinkwarn)\n✦ ${prefix}antibadword on/off\n✦ ${prefix}antitag on/off\n✦ ${prefix}antidelete on/off\n✦ ${prefix}antisticker on/off\n✦ ${prefix}antiimage on/off\n✦ ${prefix}antivideo on/off\n✦ ${prefix}antiaudio on/off\n✦ ${prefix}antidocument on/off\n✦ ${prefix}antiforward on/off\n✦ ${prefix}antispam on/off\n✦ ${prefix}antifake on/off\n✦ ${prefix}antibot on/off\n✦ ${prefix}antinsfw on/off\n✦ ${prefix}antiviewonce on/off\n✦ ${prefix}antimention on/off\n✦ ${prefix}protectionall on - Turn ALL ON\n✦ ${prefix}protectionall off - Turn ALL OFF\n\n📊 CURRENT:\nAnti Group Status: ${onoff(s.antigroupstatus)}\nAnti GC Status: ${onoff(s.antigcstatus)}\nAnti Link: ${onoff(s.antilink)}\nAnti Bad Word: ${onoff(s.antibadword)}\nAnti Tag: ${onoff(s.antitag)}\nAnti Delete: ${onoff(s.antidelete)}\n\n⚠️ Rule: 1 Warn -> 2 Warn -> 3 Warn = Kick\nMETA AI MD BY SIMON TECH`);
  }

  const toggles = ['antigroupstatus','antigcstatus','antilink','antibadword','antitag','antidelete','antisticker','antiimage','antivideo','antiaudio','antidocument','antiforward','antispam','antifake','antibot','antinsfw','antiviewonce','antimention','antiedit'];

  if(toggles.includes(realCmd)){
    if (!await isAdminForCommand(sock, ctx)) return await reply(`❌ Only admins can use this command.`);
    let val = (args[0] || '').toLowerCase();
    if(val !== 'on' && val !== 'off') return await reply(`Usage: ${prefix}${cmdName} on/off\nExample: ${prefix}${cmdName} on`);
    let s = getGroup(db, gid);
    s[realCmd] = val === 'on';
    // Sync with db.anti too so anti.js and protection.js do not conflict
    if (!db.anti) db.anti = {};
    db.anti[realCmd] = val === 'on';
    if (F) F.saveDB(db);
    // FIXED: Show real PN + group name, not LID + JID
    let realPn = senderPn || m?.key?.participantPn || sender;
    let realNum = getPnNumber(realPn);
    let groupName = await getGroupName(sock, gid);
    let label = realCmd === 'antilink' && cmdName === 'antilinkwarn' ? 'Anti Link Warn - Warn + kick after 3' : realCmd.toUpperCase();
    return await reply(`✅ ${label} is now ${val === 'on' ? 'ON' : 'OFF'}\nGroup: ${groupName}\nBy: @${realNum}`, { mentions: [realPn] });
  }

  if(cmdName === 'protectionall'){
    if (!await isAdminForCommand(sock, ctx)) return await reply(`❌ Only admins can use this command.`);
    let val = (args[0] || '').toLowerCase() === 'on';
    let s = getGroup(db, gid);
    for(let k in s) s[k] = val;
    if (!db.anti) db.anti = {};
    for(let k of toggles) db.anti[k] = val;
    if (F) F.saveDB(db);
    return await reply(`🛡️ All Protection: ${val ? '✅ ON' : '❌ OFF'}\nAll protection has been ${val ? 'enabled' : 'disabled'}.\nMETA AI MD`);
  }

  return false; // Let moderator.js handle warn/warnings/resetwarn - no duplicate
}

module.exports = handleProtection;
module.exports.handleProtection = handleProtection;
module.exports.handleCommands = handleCommands;
module.exports.handleAntiDelete = handleAntiDelete;
module.exports.getGroup = getGroup;
module.exports.addWarn = addWarn;
module.exports.getWarn = getWarn;
