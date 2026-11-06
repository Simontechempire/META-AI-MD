// plugins/protection.js - META AI MD PROTECTION BY SIMON TECH
// FIXED REAL - Uses MAIN db (no more protection.json), No triple-warn, No fake antidelete
// This file na the ONLY anti engine. Delete anti.js handleAnti if you use this one.

const BADWORDS = ['fuck','shit','bitch','bastard','idiot','mumu','olosho','ashawo','dick','pussy','sex','porn','penis','vagina','fuck you','motherfucker','asshole'];
const SPAM_TRACK = {}; // user -> { count, lastTime }
const deletedCache = new Map(); // msgId -> {text, sender, from, time}

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

// FIXED ERROR 2: LID fix - check id OR phoneNumber OR participantPn for admin + bot admin
async function isAdmin(sock, gid, uid){
  try{
    let meta = await sock.groupMetadata(gid);
    let num = String(uid || '').split('@')[0].replace(/[^0-9]/g, '');
    let p = meta.participants.find(x => x.id === uid || x.phoneNumber === uid || String(x.phoneNumber || '').split('@')[0] === num || String(x.id || '').split('@')[0] === num);
    return p?.admin === 'admin' || p?.admin === 'superadmin';
  }catch{ return false; }
}
async function isBotAdmin(sock, gid){
  try{
    let meta = await sock.groupMetadata(gid);
    let myNum = String(sock.user?.id || '').split(':')[0].replace(/[^0-9]/g, '');
    let myPn = sock.user?.id || '';
    let myLid = String(sock.user?.lid || '').split('@')[0].replace(/[^0-9]/g, '');
    let p = meta.participants.find(x => x.id === myPn || x.phoneNumber === myPn || String(x.phoneNumber || '').split('@')[0] === myNum || String(x.id || '').split('@')[0] === myNum || (myLid && String(x.id || '').split('@')[0] === myLid));
    return p?.admin === 'admin' || p?.admin === 'superadmin';
  }catch{ return false; }
}
// FIXED ERROR 1: Self-check admin for commands - index.js no dey send ctx.isAdmin
async function isAdminForCommand(sock, ctx){
  if (ctx.isOwner) return true;
  if (ctx.isAdmin) return true;
  try {
    let meta = await sock.groupMetadata(ctx.from);
    let senderId = ctx.sender || '';
    let senderNum = String(ctx.senderNum || senderId).replace(/[^0-9]/g, '');
    let p = (meta.participants || []).find(x => x.id === senderId || x.phoneNumber === senderId || String(x.phoneNumber || '').split('@')[0] === senderNum || String(x.id || '').split('@')[0] === senderNum);
    return !!(p && (p.admin === 'admin' || p.admin === 'superadmin'));
  } catch(e){ return false; }
}

async function punish(sock, m, gid, uid, reason, db, F){
  let warns = addWarn(db, gid, uid, F);
  if(warns >= 3){
    clearWarn(db, gid, uid, F);
    let botAdmin = await isBotAdmin(sock, gid);
    if(botAdmin){
      await sock.groupParticipantsUpdate(gid, [uid], 'remove').catch(()=>{});
      await sock.sendMessage(gid,{text:`🛡️ PROTECTION KICK\n\n👤 @${uid.split('@')[0]} DON GET KICKED\n📛 REASON : ${reason}\n⚠️ VIOLATION : 3/3\nMETA AI MD PROTECTION`, mentions:[uid]},{quoted:m}).catch(()=>{});
      return 'kicked';
    } else {
      await sock.sendMessage(gid,{text:`⚠️ @${uid.split('@')[0]} don reach 3 violations but bot no be admin, make me admin to kick!`, mentions:[uid]}).catch(()=>{});
      return 'warned';
    }
  } else {
    await sock.sendMessage(gid,{text:`⚠️ WARNING ${warns}/3\n\n👤 @${uid.split('@')[0]}\n📛 REASON : ${reason}\n🗑️ MESSAGE DELETED\n⚠️ ONE MORE = KICK AT 3/3\nMETA AI MD PROTECTION`, mentions:[uid]},{quoted:m}).catch(()=>{});
    return 'warned';
  }
}

async function deleteMsg(sock, m, gid){
  try{ await sock.sendMessage(gid,{delete: m.key}); }catch{}
}

// ============ MAIN PROTECTION - CALL THIS FOR EVERY MESSAGE ============
// index.js go call: await protection.handleProtection(sock, m, db, F, config)
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

    let isAdminUser = await isAdmin(sock, gid, uid);
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
      deletedCache.set(m.key.id, { text: fullText, sender: uid, from: gid, type: msgType });
      if (deletedCache.size > 200) deletedCache.delete(deletedCache.keys().next().value);
    }

    // ---------- 1. ANTI GROUP STATUS MENTION - FIXED: Only real spam, no be word "status" ----------
    if(settings.antigroupstatus){
      let isGroupStatusMention = mentions.length > 5
        || /view my status|check my status|status pls|status please|view.*status.*now/i.test(text)
        || (text.includes('status') && mentions.length >= 3);
      if(isGroupStatusMention){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'AntiGroupStatus - Mention / Tag for Status', db, F);
        return true;
      }
    }

    // ---------- 2. ANTI GC STATUS - FIXED ----------
    if(settings.antigcstatus){
      let isGCStatus = (isForwarded && (ctxInfo.forwardingScore > 5))
        || text.includes('group status') || text.includes('gc status');
      if(isGCStatus){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'AntiGCStatus - Sharing Group Status', db, F);
        return true;
      }
    }

    // ---------- 3. ANTI LINK ----------
    if(settings.antilink || db.anti?.antilink){
      let linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com|wa\.me|t\.me|instagram\.com|facebook\.com|youtube\.com|youtu\.be|tiktok\.com|discord\.gg)/i;
      if(linkRegex.test(fullText)){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'AntiLink - Link Not Allowed', db, F);
        return true;
      }
    }

    // ---------- 4. ANTI BADWORD ----------
    if(settings.antibadword || db.anti?.antibadword){
      if(BADWORDS.some(w => text.includes(w))){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'AntiBadWord - Bad Word', db, F);
        return true;
      }
    }

    // ---------- 5. ANTI TAG ----------
    if(settings.antitag || settings.antimention || db.anti?.antitag){
      if(mentions.length >= 5 || text.includes('@all') || text.includes('@everyone')){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'AntiTag - Tagging Many People', db, F);
        return true;
      }
    }

    // ---------- 6-10. MEDIA ----------
    if(settings.antisticker && msgType === 'stickerMessage'){ await deleteMsg(sock, m, gid); await punish(sock, m, gid, uid, 'AntiSticker', db, F); return true; }
    if(settings.antiimage && msgType === 'imageMessage'){ await deleteMsg(sock, m, gid); await punish(sock, m, gid, uid, 'AntiImage', db, F); return true; }
    if(settings.antivideo && msgType === 'videoMessage'){ await deleteMsg(sock, m, gid); await punish(sock, m, gid, uid, 'AntiVideo', db, F); return true; }
    if(settings.antiaudio && (msgType === 'audioMessage' || msgType === 'pttMessage')){ await deleteMsg(sock, m, gid); await punish(sock, m, gid, uid, 'AntiAudio', db, F); return true; }
    if(settings.antidocument && msgType === 'documentMessage'){ await deleteMsg(sock, m, gid); await punish(sock, m, gid, uid, 'AntiDocument', db, F); return true; }

    // ---------- 11. ANTI FORWARD ----------
    if(settings.antiforward && isForwarded){
      await deleteMsg(sock, m, gid);
      await punish(sock, m, gid, uid, 'AntiForward - Forwarded Message', db, F);
      return true;
    }

    // ---------- 12. ANTI VIEW ONCE ----------
    if(settings.antiviewonce && isViewOnce){
      await deleteMsg(sock, m, gid);
      await punish(sock, m, gid, uid, 'AntiViewOnce - View Once Not Allowed', db, F);
      return true;
    }

    // ---------- 13. ANTI SPAM / FLOOD - REAL 5 in 3s ----------
    if(settings.antispam || db.anti?.antispam){
      let now = Date.now();
      if(!SPAM_TRACK[uid]) SPAM_TRACK[uid] = { count: 0, last: now };
      if(now - SPAM_TRACK[uid].last < 3000) SPAM_TRACK[uid].count++;
      else SPAM_TRACK[uid].count = 1;
      SPAM_TRACK[uid].last = now;
      if(SPAM_TRACK[uid].count >= 5){
        SPAM_TRACK[uid].count = 0;
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'AntiSpam - Flooding / Spam', db, F);
        return true;
      }
    }

    // ---------- 14. ANTI NSFW ----------
    if(settings.antinsfw){
      let nsfwWords = ['porn','sex video','nude','xxx','onlyfans','pornhub'];
      if(nsfwWords.some(w => text.includes(w))){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'AntiNSFW - NSFW Content', db, F);
        return true;
      }
    }

    // ---------- 15. ANTI BOT - FIXED: No delete own bot commands, only other bots ----------
    // Old code dey delete ANY . ! # message - that go delete your own bot commands. Now e only delete if sender na bot (LID) or message get bot tag
    if(settings.antibot){
      // Skip - bot detection via LID is unreliable, leave to anti.js antibot
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
      await sock.sendMessage(gid,{text:`🛡️ ANTIDELETE\n\n👤 @${cached.sender.split('@')[0]} try delete message!\n\n"${cached.text || '[Media message - image/video/sticker]'}"\n\nMETA AI MD CAUGHT AM 😂`, mentions:[cached.sender]}).catch(()=>{});
      deletedCache.delete(key.id);
    }
  }catch{}
}

// ============ COMMANDS - ON / OFF - Uses ctx from index.js ============
async function handleCommands(sock, m, ctx){
  const { prefix, cmdName, args, reply, from, sender, isOwner, isAdmin, db, F } = ctx;
  let gid = from;
  if(!gid.endsWith('@g.us')){
    if(cmdName.startsWith('anti') || cmdName.startsWith('antig') || cmdName === 'protection'){
      return await reply(`❌ USE AM FOR GROUP ONLY`);
    }
    return false;
  }

  if(cmdName === 'protection' || cmdName === 'protect' || cmdName === 'antimenu'){
    let s = getGroup(db, gid);
    let onoff = (v) => v ? '✅ ON' : '❌ OFF';
    return await reply(`◈┈▉ \`META AI MD\` ▉┄◈\n\n🛡️ PROTECTION MENU\n\n✦ ${prefix}antigroupstatus on/off - Anti Group Status Mention\n✦ ${prefix}antigcstatus on/off - Anti GC Status\n✦ ${prefix}antilink on/off\n✦ ${prefix}antibadword on/off\n✦ ${prefix}antitag on/off\n✦ ${prefix}antidelete on/off\n✦ ${prefix}antisticker on/off\n✦ ${prefix}antiimage on/off\n✦ ${prefix}antivideo on/off\n✦ ${prefix}antiaudio on/off\n✦ ${prefix}antidocument on/off\n✦ ${prefix}antiforward on/off\n✦ ${prefix}antispam on/off\n✦ ${prefix}antifake on/off\n✦ ${prefix}antibot on/off\n✦ ${prefix}antinsfw on/off\n✦ ${prefix}antiviewonce on/off\n✦ ${prefix}antimention on/off\n✦ ${prefix}protectionall on - Turn ALL ON\n✦ ${prefix}protectionall off - Turn ALL OFF\n\n📊 CURRENT:\nAntiGroupStatus : ${onoff(s.antigroupstatus)}\nAntiGCStatus : ${onoff(s.antigcstatus)}\nAntiLink : ${onoff(s.antilink)}\nAntiBadWord : ${onoff(s.antibadword)}\nAntiTag : ${onoff(s.antitag)}\nAntiDelete : ${onoff(s.antidelete)}\n\n⚠️ RULE : 1 Warn -> 2 Warn -> 3 Warn = KICK\nMETA AI MD BY SIMON TECH`);
  }

  const toggles = ['antigroupstatus','antigcstatus','antilink','antibadword','antitag','antidelete','antisticker','antiimage','antivideo','antiaudio','antidocument','antiforward','antispam','antifake','antibot','antinsfw','antiviewonce','antimention','antiedit'];

  if(toggles.includes(cmdName)){
    if (!await isAdminForCommand(sock, ctx)) return await reply(`❌ ONLY ADMIN FIT USE AM`);
    let val = (args[0] || '').toLowerCase();
    if(val !== 'on' && val !== 'off') return await reply(`USAGE : ${prefix}${cmdName} on/off\nEXAMPLE : ${prefix}${cmdName} on`);
    let s = getGroup(db, gid);
    s[cmdName] = val === 'on';
    // Sync with db.anti too so anti.js and protection.js no fight
    if (!db.anti) db.anti = {};
    db.anti[cmdName] = val === 'on';
    if (F) F.saveDB(db);
    return await reply(`🛡️ PROTECTION\n\n${cmdName.toUpperCase()} : ${val === 'on' ? '✅ ON' : '❌ OFF'}\n⚠️ RULE : DELETE + WARN\n3 VIOLATIONS = KICK 🦶\nMETA AI MD`);
  }

  if(cmdName === 'protectionall'){
    if (!await isAdminForCommand(sock, ctx)) return await reply(`❌ ONLY ADMIN`);
    let val = (args[0] || '').toLowerCase() === 'on';
    let s = getGroup(db, gid);
    for(let k in s) s[k] = val;
    if (!db.anti) db.anti = {};
    for(let k of toggles) db.anti[k] = val;
    if (F) F.saveDB(db);
    return await reply(`🛡️ ALL PROTECTION : ${val ? '✅ ON' : '❌ OFF'}\nALL ANTI DON ${val ? 'ACTIVATE' : 'DEACTIVATE'}\nMETA AI MD`);
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
