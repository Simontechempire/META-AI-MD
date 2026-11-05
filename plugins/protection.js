// plugins/protection.js - META AI MD PROTECTION BY SIMON TECH
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../protection.json');
let db = {};
try{ if(fs.existsSync(DB_FILE)) db = JSON.parse(fs.readFileSync(DB_FILE,'utf8')); }catch{ db = {}; }
if(!db.groups) db.groups = {};
if(!db.warns) db.warns = {}; // warns[groupId][userId] = count

function save(){ try{ fs.writeFileSync(DB_FILE, JSON.stringify(db,null,2)); }catch{} }
function getGroup(jid){
  if(!db.groups[jid]) db.groups[jid] = {
    antigroupstatus: false, // anti mention / tag in group status? - delete if person mention group in status
    antigcstatus: false,    // anti GC status - delete status from group if not admin
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
  return db.groups[jid];
}
function getWarn(gid, uid){
  if(!db.warns[gid]) db.warns[gid] = {};
  return db.warns[gid][uid] || 0;
}
function addWarn(gid, uid){
  if(!db.warns[gid]) db.warns[gid] = {};
  db.warns[gid][uid] = (db.warns[gid][uid]||0)+1;
  save();
  return db.warns[gid][uid];
}
function clearWarn(gid, uid){
  if(db.warns[gid]) delete db.warns[gid][uid];
  save();
}

const BADWORDS = ['fuck','shit','bitch','bastard','idiot','mumu','olosho','ashawo','dick','pussy','sex','porn','penis','vagina','fuck you','motherfucker','bitch ass','asshole'];
const SPAM_TRACK = {}; // user -> { count, lastTime }

// Check if user is admin
async function isAdmin(sock, gid, uid){
  try{
    let meta = await sock.groupMetadata(gid);
    let p = meta.participants.find(x => x.id === uid);
    return p?.admin === 'admin' || p?.admin === 'superadmin';
  }catch{ return false; }
}
async function isBotAdmin(sock, gid){
  try{
    let meta = await sock.groupMetadata(gid);
    let me = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    let p = meta.participants.find(x => x.id === me || x.id.includes(sock.user.id.split(':')[0]));
    return p?.admin === 'admin' || p?.admin === 'superadmin';
  }catch{ return false; }
}

async function punish(sock, m, gid, uid, reason, reply){
  let warns = addWarn(gid, uid);
  let name = m.pushName || uid.split('@')[0];
  if(warns >= 3){
    clearWarn(gid, uid);
    // Try kick
    try{
      let botAdmin = await isBotAdmin(sock, gid);
      if(botAdmin){
        await sock.groupParticipantsUpdate(gid, [uid], 'remove');
        await sock.sendMessage(gid,{text:`> 🛡️ 𝙿𝚁𝙾𝚃𝙴𝙲𝚃𝙸𝙾𝙽 𝙺𝙸𝙲𝙺\n\n> 👤 @${uid.split('@')[0]} 𝙳𝙾𝙽 𝙶𝙴𝚃 𝙺𝙸𝙲𝙺𝙴𝙳\n> 📛 𝚁𝙴𝙰𝚂𝙾𝙽 : ${reason}\n> ⚠️ 𝚅𝙸𝙾𝙻𝙰𝚃𝙸𝙾𝙽 : 3/3\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳 𝙿𝚁𝙾𝚃𝙴𝙲𝚃𝙸𝙾𝙽`, mentions:[uid]},{quoted:m});
        return 'kicked';
      } else {
        await sock.sendMessage(gid,{text:`> ⚠️ @${uid.split('@')[0]} don reach 3 violations but bot no be admin, make me admin to kick!`, mentions:[uid]});
        return 'warned';
      }
    }catch(e){
      await sock.sendMessage(gid,{text:`> ❌ 𝙵𝙰𝙸𝙻 𝚃𝙾 𝙺𝙸𝙲𝙺 @${uid.split('@')[0]} - Bot need admin`, mentions:[uid]});
      return 'warned';
    }
  } else {
    await sock.sendMessage(gid,{text:`> ⚠️ 𝚆𝙰𝚁𝙽𝙸𝙽𝙶 ${warns}/3\n\n> 👤 @${uid.split('@')[0]}\n> 📛 𝚁𝙴𝙰𝚂𝙾𝙽 : ${reason}\n> 🗑️ 𝙼𝙴𝚂𝚂𝙰𝙶𝙴 𝙳𝙴𝙻𝙴𝚃𝙴𝙳\n> ⚠️ 𝙾𝙽𝙴 𝙼𝙾𝚁𝙴 = 𝙺𝙸𝙲𝙺 𝙰𝚃 3/3\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳 𝙿𝚁𝙾𝚃𝙴𝙲𝚃𝙸𝙾𝙽`, mentions:[uid]},{quoted:m});
    return 'warned';
  }
}

async function deleteMsg(sock, m, gid){
  try{
    await sock.sendMessage(gid,{delete: m.key});
  }catch{}
}

// ============ MAIN PROTECTION - CALL THIS FOR EVERY MESSAGE ============
async function handleProtection(sock, m, ctx = {}){
  try{
    if(!m.key.remoteJid?.endsWith('@g.us')) return false; // only groups
    let gid = m.key.remoteJid;
    let uid = m.key.participant || m.sender;
    if(!uid || uid.includes(sock.user.id.split(':')[0])) return false;
    let settings = getGroup(gid);
    let isAdminUser = await isAdmin(sock, gid, uid);
    if(isAdminUser) return false; // Admins free

    let text = (m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || '')?.toLowerCase() || '';
    let fullText = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
    let msgType = Object.keys(m.message || {})[0] || '';
    let mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let isForwarded = m.message?.extendedTextMessage?.contextInfo?.isForwarded || m.message?.imageMessage?.contextInfo?.isForwarded || false;
    let isViewOnce = msgType.includes('viewOnce') || m.message?.viewOnceMessage || m.message?.viewOnceMessageV2;

    // ---------- 1. ANTI GROUP STATUS MENTION ----------
    // If person mention / tag group / post group link for status, delete + warn
    // Detects: @group, group link, "status", tag all, mention group
    if(settings.antigroupstatus){
      let isGroupStatusMention = mentions.length > 5 // tag many people for status
        || text.includes('status') && (text.includes('@') || mentions.length > 0)
        || text.includes('view my status') || text.includes('check my status') || text.includes('my status')
        || text.includes('status pls') || text.includes('status please')
        || (text.includes('@') && text.includes('status'))
        || mentions.length > 0 && text.includes('status');
      if(isGroupStatusMention){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'AntiGroupStatus - Mention / Tag for Status', ctx.reply);
        return true;
      }
    }

    // ---------- 2. ANTI GC STATUS ----------
    // Delete status shared from group if not admin - detects status messages forwarded from group / status link
    if(settings.antigcstatus){
      let isGCStatus = isForwarded && (text.includes('status') || msgType.includes('image') || msgType.includes('video'))
        || text.includes('group status') || text.includes('gc status') || text.includes('from group status')
        || (isForwarded && text.includes('whatsapp.com/channel'))
        || m.message?.extendedTextMessage?.contextInfo?.forwardingScore > 5;
      // Also: if person send status screenshot / status video from group
      if(isGCStatus){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'AntiGCStatus - Sharing Group Status (Not Admin)', ctx.reply);
        return true;
      }
      // If message is a status reply / status forward
      if(m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessage){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'AntiGCStatus - Status Forward', ctx.reply);
        return true;
      }
    }

    // ---------- 3. ANTI LINK ----------
    if(settings.antilink){
      let linkRegex = /(https?:\/\/|www\.|whatsapp\.com|t\.me|telegram|instagram\.com|facebook\.com|youtube\.com|youtu\.be|tiktok\.com)/i;
      if(linkRegex.test(fullText)){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'AntiLink - Link Not Allowed', ctx.reply);
        return true;
      }
    }

    // ---------- 4. ANTI BADWORD ----------
    if(settings.antibadword){
      if(BADWORDS.some(w => text.includes(w))){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'AntiBadWord - Bad Word', ctx.reply);
        return true;
      }
    }

    // ---------- 5. ANTI TAG / MENTION ALL ----------
    if(settings.antitag || settings.antimention){
      if(mentions.length >= 5){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'AntiTag - Tagging Many People', ctx.reply);
        return true;
      }
      if(text.includes('@all') || text.includes('@everyone')){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'AntiTag - @all / @everyone', ctx.reply);
        return true;
      }
    }

    // ---------- 6. ANTI STICKER ----------
    if(settings.antisticker && msgType.includes('sticker')){
      await deleteMsg(sock, m, gid);
      await punish(sock, m, gid, uid, 'AntiSticker - Sticker Not Allowed', ctx.reply);
      return true;
    }

    // ---------- 7. ANTI IMAGE ----------
    if(settings.antiimage && msgType.includes('image')){
      await deleteMsg(sock, m, gid);
      await punish(sock, m, gid, uid, 'AntiImage - Image Not Allowed', ctx.reply);
      return true;
    }

    // ---------- 8. ANTI VIDEO ----------
    if(settings.antivideo && msgType.includes('video')){
      await deleteMsg(sock, m, gid);
      await punish(sock, m, gid, uid, 'AntiVideo - Video Not Allowed', ctx.reply);
      return true;
    }

    // ---------- 9. ANTI AUDIO ----------
    if(settings.antiaudio && (msgType.includes('audio') || msgType.includes('voice'))){
      await deleteMsg(sock, m, gid);
      await punish(sock, m, gid, uid, 'AntiAudio - Audio Not Allowed', ctx.reply);
      return true;
    }

    // ---------- 10. ANTI DOCUMENT ----------
    if(settings.antidocument && msgType.includes('document')){
      await deleteMsg(sock, m, gid);
      await punish(sock, m, gid, uid, 'AntiDocument - Document Not Allowed', ctx.reply);
      return true;
    }

    // ---------- 11. ANTI FORWARD ----------
    if(settings.antiforward && isForwarded){
      await deleteMsg(sock, m, gid);
      await punish(sock, m, gid, uid, 'AntiForward - Forwarded Message', ctx.reply);
      return true;
    }

    // ---------- 12. ANTI VIEW ONCE ----------
    if(settings.antiviewonce && isViewOnce){
      await deleteMsg(sock, m, gid);
      await punish(sock, m, gid, uid, 'AntiViewOnce - View Once Not Allowed', ctx.reply);
      return true;
    }

    // ---------- 13. ANTI SPAM / FLOOD ----------
    if(settings.antispam){
      let now = Date.now();
      if(!SPAM_TRACK[uid]) SPAM_TRACK[uid] = { count: 0, last: now };
      if(now - SPAM_TRACK[uid].last < 3000) SPAM_TRACK[uid].count++;
      else SPAM_TRACK[uid].count = 1;
      SPAM_TRACK[uid].last = now;
      if(SPAM_TRACK[uid].count >= 5){
        SPAM_TRACK[uid].count = 0;
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'AntiSpam - Flooding / Spam', ctx.reply);
        return true;
      }
    }

    // ---------- 14. ANTI FAKE NUMBER ----------
    if(settings.antifake){
      // Fake numbers: +1, +91, +92 etc if group is Nigeria group - customise
      let fakePrefixes = ['+1', '+91', '+92', '+44', '+1-'];
      if(fakePrefixes.some(pre => uid.startsWith(pre.replace('+','')))){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'AntiFake - Fake Number', ctx.reply);
        return true;
      }
    }

    // ---------- 15. ANTI NSFW ----------
    if(settings.antinsfw){
      let nsfwWords = ['porn','sex','nude','xxx','pussy','dick','boobs','onlyfans'];
      if(nsfwWords.some(w => text.includes(w))){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'AntiNSFW - NSFW Content', ctx.reply);
        return true;
      }
    }

    // ---------- 16. ANTI BOT ----------
    if(settings.antibot){
      // If message from another bot (starts with . or ! and looks like bot)
      if(fullText.startsWith('.') || fullText.startsWith('!') || fullText.startsWith('#')){
        await deleteMsg(sock, m, gid);
        await punish(sock, m, gid, uid, 'AntiBot - Bot Command', ctx.reply);
        return true;
      }
    }

    return false;
  }catch(e){ console.log('Protection error:', e.message); return false; }
}

// ============ ANTI DELETE - CALL ON message-delete event ============
async function handleAntiDelete(sock, m, gid){
  try{
    let settings = getGroup(gid);
    if(!settings.antidelete) return;
    // Resend deleted message info
    await sock.sendMessage(gid,{text:`> 🛡️ 𝙰𝙽𝚃𝙸𝙳𝙴𝙻𝙴𝚃𝙴\n\n> 👤 @${m.key.participant?.split('@')[0]} try delete message!\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳 𝙲𝙰𝚄𝙶𝙷𝚃 𝙰𝙼 😂\n> 𝙼𝙴𝚂𝚂𝙰𝙶𝙴 𝙳𝙾𝙽 𝙳𝙴𝙻𝙴𝚃𝙴 𝙱𝚄𝚃 𝙱𝙾𝚃 𝚂𝙴𝙴 𝙰𝙼`, mentions:[m.key.participant]});
  }catch{}
}

// ============ COMMANDS - ON / OFF ============
async function handleCommands(sock, m, ctx){
  const { prefix, cmdName, args, q, reply, from } = ctx;
  const p = prefix;
  let gid = from;
  if(!gid.endsWith('@g.us')){
    if(cmdName.startsWith('anti') || cmdName.startsWith('antig')){
      return await reply(`> ❌ 𝚄𝚂𝙴 𝙰𝙼 𝙵𝙾𝚁 𝙶𝚁𝙾𝚄𝙿 𝙾𝙽𝙻𝚈`);
    }
    return false;
  }

  // List all protection commands
  if(cmdName === 'protection' || cmdName === 'protect' || cmdName === 'antimenu'){
    let s = getGroup(gid);
    let onoff = (v) => v ? '✅ ON' : '❌ OFF';
    return await reply(`◈┈▉ \`ᴍᴇᴛᴀ ᴀɪ ᴍᴅ\` ▉┄◈\n\n> 🛡️ 𝙿𝚁𝙾𝚃𝙴𝙲𝚃𝙸𝙾𝙽 𝙼𝙴𝙽𝚄\n\n> ✦ ${p}antigroupstatus on/off - Anti Group Status Mention\n> ✦ ${p}antigcstatus on/off - Anti GC Status\n> ✦ ${p}antilink on/off\n> ✦ ${p}antibadword on/off\n> ✦ ${p}antitag on/off\n> ✦ ${p}antidelete on/off\n> ✦ ${p}antisticker on/off\n> ✦ ${p}antiimage on/off\n> ✦ ${p}antivideo on/off\n> ✦ ${p}antiaudio on/off\n> ✦ ${p}antidocument on/off\n> ✦ ${p}antiforward on/off\n> ✦ ${p}antispam on/off\n> ✦ ${p}antifake on/off\n> ✦ ${p}antibot on/off\n> ✦ ${p}antinsfw on/off\n> ✦ ${p}antiviewonce on/off\n> ✦ ${p}antimention on/off\n> ✦ ${p}protectionall on - Turn ALL ON\n> ✦ ${p}protectionall off - Turn ALL OFF\n> ✦ ${p}warn @user - Warn user\n> ✦ ${p}warnings - Check warnings\n> ✦ ${p}resetwarn @user - Clear warn\n\n> 📊 𝙲𝚄𝚁𝚁𝙴𝙽𝚃 𝚂𝚃𝙰𝚃𝚄𝚂 :\n> 𝙰𝚗𝚝𝚒𝙶𝚛𝚘𝚞𝚙𝚂𝚝𝚊𝚝𝚞𝚜 : ${onoff(s.antigroupstatus)}\n> 𝙰𝚗𝚝𝚒𝙶𝙲𝚂𝚝𝚊𝚝𝚞𝚜 : ${onoff(s.antigcstatus)}\n> 𝙰𝚗𝚝𝚒𝙻𝚒𝚗𝚔 : ${onoff(s.antilink)}\n> 𝙰𝚗𝚝𝚒𝙱𝚊𝚍𝚆𝚘𝚛𝚍 : ${onoff(s.antibadword)}\n> 𝙰𝚗𝚝𝚒𝚃𝚊𝚐 : ${onoff(s.antitag)}\n> 𝙰𝚗𝚝𝚒𝙳𝚎𝚕𝚎𝚝𝚎 : ${onoff(s.antidelete)}\n\n> ⚠️ 𝚁𝚄𝙻𝙴 : 1 Warn -> 2 Warn -> 3 Warn = 𝙺𝙸𝙲𝙺\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳 𝙱𝚈 𝚂𝙸𝙼𝙾𝙽 𝚃𝙴𝙲𝙷`);
  }

  // Toggle commands
  const toggles = {
    antigroupstatus: 'antigroupstatus',
    antigcstatus: 'antigcstatus',
    antilink: 'antilink',
    antibadword: 'antibadword',
    antitag: 'antitag',
    antidelete: 'antidelete',
    antisticker: 'antisticker',
    antiimage: 'antiimage',
    antivideo: 'antivideo',
    antiaudio: 'antiaudio',
    antidocument: 'antidocument',
    antiforward: 'antiforward',
    antispam: 'antispam',
    antifake: 'antifake',
    antibot: 'antibot',
    antinsfw: 'antinsfw',
    antiviewonce: 'antiviewonce',
    antimention: 'antimention',
    antiedit: 'antiedit',
  };

  if(toggles[cmdName]){
    // Check admin
    let admin = await isAdmin(sock, gid, m.sender);
    if(!admin) return await reply(`> ❌ 𝙾𝙽𝙻𝚈 𝙰𝙳𝙼𝙸𝙽 𝙵𝙸𝚃 𝚄𝚂𝙴 𝙰𝙼`);
    let key = toggles[cmdName];
    let val = q.toLowerCase().trim();
    if(val !== 'on' && val !== 'off') return await reply(`> 𝚄𝚂𝙰𝙶𝙴 : ${p}${cmdName} on/off\n> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}${cmdName} on`);
    let s = getGroup(gid);
    s[key] = val === 'on';
    save();
    return await reply(`> 🛡️ 𝙿𝚁𝙾𝚃𝙴𝙲𝚃𝙸𝙾𝙽\n\n> ${cmdName.toUpperCase()} : ${val === 'on' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵'}\n> ⚠️ 𝚁𝚄𝙻𝙴 : 𝙳𝙴𝙻𝙴𝚃𝙴 + 𝚆𝙰𝚁𝙽\n> 3 𝚅𝙸𝙾𝙻𝙰𝚃𝙸𝙾𝙽𝚂 = 𝙺𝙸𝙲𝙺 🦶\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }

  if(cmdName === 'protectionall'){
    let admin = await isAdmin(sock, gid, m.sender);
    if(!admin) return await reply(`> ❌ 𝙾𝙽𝙻𝚈 𝙰𝙳𝙼𝙸𝙽`);
    let val = q.toLowerCase().trim() === 'on';
    let s = getGroup(gid);
    for(let k in s) s[k] = val;
    save();
    return await reply(`> 🛡️ 𝙰𝙻𝙻 𝙿𝚁𝙾𝚃𝙴𝙲𝚃𝙸𝙾𝙽 : ${val ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵'}\n> 𝙰𝙻𝙻 𝙰𝙽𝚃𝙸 𝙳𝙾𝙽 ${val ? '𝙰𝙲𝚃𝙸𝚅𝙰𝚃𝙴' : '𝙳𝙴𝙰𝙲𝚃𝙸𝚅𝙰𝚃𝙴'}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }

  // Warn system
  if(cmdName === 'warn'){
    let admin = await isAdmin(sock, gid, m.sender);
    if(!admin) return await reply(`> ❌ 𝙾𝙽𝙻𝚈 𝙰𝙳𝙼𝙸𝙽`);
    let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if(!target) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}warn @user`);
    let warns = addWarn(gid, target);
    if(warns >= 3){
      clearWarn(gid, target);
      try{ await sock.groupParticipantsUpdate(gid,[target],'remove'); return await reply(`> 🦶 @${target.split('@')[0]} 𝙳𝙾𝙽 𝙶𝙴𝚃 𝙺𝙸𝙲𝙺𝙴𝙳 - 3/3 𝚆𝙰𝚁𝙽𝚂`,{mentions:[target]}); }catch{ return await reply(`> ❌ 𝙵𝙰𝙸𝙻 𝚃𝙾 𝙺𝙸𝙲𝙺`); }
    }
    return await reply(`> ⚠️ 𝚆𝙰𝚁𝙽𝙴𝙳 @${target.split('@')[0]}\n> 𝚆𝙰𝚁𝙽𝙸𝙽𝙶 : ${warns}/3\n> 𝚁𝙴𝙰𝚂𝙾𝙽 : ${q || 'Breaking rules'}`,{mentions:[target]});
  }
  if(cmdName === 'warnings' || cmdName === 'warns'){
    let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.sender;
    let w = getWarn(gid, target);
    return await reply(`> ⚠️ 𝚆𝙰𝚁𝙽𝙸𝙽𝙶𝚂\n\n> 👤 @${target.split('@')[0]}\n> ⚠️ ${w}/3\n> ${w>=3?'𝙽𝙴𝚇𝚃 = 𝙺𝙸𝙲𝙺':w===0?'𝙲𝙻𝙴𝙰𝙽 ✅':'𝙱𝙴 𝙲𝙰𝚁𝙴𝙵𝚄𝙻'}`,{mentions:[target]});
  }
  if(cmdName === 'resetwarn' || cmdName === 'unwarn'){
    let admin = await isAdmin(sock, gid, m.sender);
    if(!admin) return await reply(`> ❌ 𝙾𝙽𝙻𝚈 𝙰𝙳𝙼𝙸𝙽`);
    let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if(!target) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}resetwarn @user`);
    clearWarn(gid, target);
    return await reply(`> ✅ 𝚆𝙰𝚁𝙽 𝙲𝙻𝙴𝙰𝚁𝙴𝙳 𝙵𝙾𝚁 @${target.split('@')[0]}`,{mentions:[target]});
  }

  return false;
}

module.exports = handleProtection;
module.exports.handleProtection = handleProtection;
module.exports.handleCommands = handleCommands;
module.exports.handleAntiDelete = handleAntiDelete;
module.exports.getGroup = getGroup;
module.exports.addWarn = addWarn;
module.exports.getWarn = getWarn;
