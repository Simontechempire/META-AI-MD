// plugins/protection.js - GROUP PROTECTION - BY SIMON TECH
// NOTE: antilink / antispam / antibadword / antitag / antidelete are OWNED by anti.js
// Do NOT add them here again or index.js will log Duplicate command and skip one file.
// This file owns ONLY: antibot, antiforeign, antiviewonce, antipromote, antidemote

function getNum(jid){ return String(jid||'').split('@')[0].split(':')[0].replace(/[^0-9]/g,''); }
function findMember(md, uid){
  if(!md || !uid) return null;
  let num = getNum(uid);
  return (md.participants||[]).find(p => p.id===uid || p.phoneNumber===uid || getNum(p.id)===num || getNum(p.phoneNumber)===num);
}
async function getMeta(sock, from, F){
  try { if(F?.getGroupMeta) return await F.getGroupMeta(sock, from); return await sock.groupMetadata(from); } catch { return null; }
}
function ensureGroup(db, from){
  db.group = db.group || {}; db.group[from] = db.group[from] || {}; db.group[from].anti = db.group[from].anti || {};
  return db.group[from];
}
async function needAdmin(ctx){
  if(ctx.isOwner || ctx.isAdmin) return true;
  let md = await getMeta(ctx.sock, ctx.from, ctx.F);
  let m = findMember(md, ctx.sender) || findMember(md, ctx.senderPn);
  if(m?.admin) return true;
  await ctx.reply('❌ Admins only.'); return false;
}
function setAnti(db, from, key, val){
  let g = ensureGroup(db, from);
  g.anti[key] = val;
  return val;
}
function makeToggle(key, label, extra=''){
  return {
    name: key, category: 'protection', groupOnly: true,
    run: async (ctx) => {
      const { reply, args, db, F, from } = ctx;
      if(!await needAdmin(ctx)) return;
      if(!args[0]) return reply(`Usage: ${ctx.prefix}${key} on / off${extra ? '\n'+extra : ''}`);
      let val = args[0].toLowerCase() !== 'off';
      // antiforeign extra arg: .antiforeign on 234
      if(key==='antiforeign' && args[1]) ensureGroup(db, from).allowedCode = String(args[1]).replace(/[^0-9]/g,'');
      setAnti(db, from, key, val);
      if(F?.saveDB) F.saveDB(db);
      let code = db.group[from].allowedCode || '234';
      return reply(`${label}: ${val ? 'ON' : 'OFF'}${key==='antiforeign' && val ? ' - Only +'+code+' allowed' : ''}${key==='antibot' && val ? ' - Other bots will be removed' : ''}${key==='antiviewonce' && val ? ' - View Once will be saved' : ''}`);
    }
  };
}

// Called by index.js for incoming group messages - ONLY handles protection-owned keys
async function handleProtection(sock, m, db, F, config){
  try{
    const from = m?.key?.remoteJid;
    if(!from?.endsWith('@g.us')) return false;
    if(m.key.fromMe || !m.message) return false;
    const sender = m.key.participant || m.key.remoteJid;
    if(!sender) return false;
    const anti = db.group?.[from]?.anti || {};
    // antibot + antiforeign are checked here. antilink etc are in anti.js handleAnti
    if(!anti.antibot && !anti.antiforeign && !anti.antiviewonce) return false;
    let owner = false;
    try{ owner = !!F?.isOwner?.(sender, db, config); if(!owner) owner = !!F?.isOwnerMessage?.(m, db, config); }catch{}
    if(owner) return false;
    const md = await getMeta(sock, from, F); if(!md) return false;
    const senderMember = findMember(md, sender) || findMember(md, m.key.participantPn);
    if(senderMember?.admin) return false; // admins bypass
    const botMember = findMember(md, sock.user?.id) || findMember(md, sock.user?.lid);
    const botIsAdmin = !!botMember?.admin;
    const senderPn = m.key.participantPn || sender;
    const senderNum = getNum(senderPn);
    const msg = m.message;
    const text = msg.conversation || msg.extendedTextMessage?.text || msg.imageMessage?.caption || msg.videoMessage?.caption || '';
    // --- ANTIBOT: message from another bot (starts with prefix + known bot cmd, or has bot JID pattern) ---
    // Simple rule: if sender's name / message looks like bot, OR sender is in db.bots list
    // We use: if message starts with . / ! / # and sender is NOT owner/admin, we do NOT kick - antibot needs explicit bot list.
    // Safer: antibot only kicks if sender is in db.group[from].bots list or message contains "bot" fingerprint.
    // For now: antibot checks if sender JID is in db.bots
    if(anti.antibot){
      let bots = db.bots || [];
      if(bots.includes(senderNum) || bots.includes(sender)){
        if(botIsAdmin) await sock.groupParticipantsUpdate(from, [sender], 'remove').catch(()=>{});
        await sock.sendMessage(from, { text: `🤖 *ANTI BOT*\n\nRemoved bot @${senderNum}`, mentions: [senderPn] }).catch(()=>{});
        return true;
      }
    }
    // --- ANTIFOREIGN ---
    if(anti.antiforeign){
      let allowed = String(db.group[from].allowedCode || '234');
      // senderNum starts with allowed code? If not, warn + remove if bot admin
      if(senderNum && !senderNum.startsWith(allowed)){
        if(botIsAdmin){
          await sock.sendMessage(from, { delete: m.key }).catch(()=>{});
          await sock.groupParticipantsUpdate(from, [sender], 'remove').catch(()=>{});
        }
        await sock.sendMessage(from, { text: `🌍 *ANTI FOREIGN*\n\nRemoved @${senderNum} - Only +${allowed} numbers allowed.`, mentions: [senderPn] }).catch(()=>{});
        return true;
      }
    }
    // --- ANTIVIEWONCE: save VV - handled by vv.js if present, here we just warn that VV is not allowed ---
    // We do NOT delete VV here - vv.js / anti.js handle it. Return false so other handlers run.
    return false;
  }catch(e){ console.log('Protection error:', e.message); return false; }
}

// Called by index.js on group-participants-update (promote/demote)
async function handleParticipantProtection(sock, update, db, F){
  try{
    const { id, participants, action, author } = update;
    if(!id?.endsWith('@g.us')) return;
    const anti = db.group?.[id]?.anti || {};
    if(!anti.antipromote && !anti.antidemote) return;
    if(!participants?.length) return;
    const md = await getMeta(sock, id, F); if(!md) return;
    const botMember = findMember(md, sock.user?.id) || findMember(md, sock.user?.lid);
    if(!botMember?.admin) return; // need bot admin to revert
    for(let user of participants){
      if(action==='promote' && anti.antipromote){
        await sock.groupParticipantsUpdate(id, [user], 'demote').catch(()=>{});
        await sock.sendMessage(id, { text: `🛡️ *ANTI PROMOTE*\n\nDemoted @${getNum(user)} back - Promotion is not allowed.`, mentions: [user] }).catch(()=>{});
      }
      if(action==='demote' && anti.antidemote){
        await sock.groupParticipantsUpdate(id, [user], 'promote').catch(()=>{});
        await sock.sendMessage(id, { text: `🛡️ *ANTI DEMOTE*\n\nPromoted @${getNum(user)} back - Demotion is not allowed.`, mentions: [user] }).catch(()=>{});
      }
    }
  }catch(e){ console.log('Protection participant error:', e.message); }
}

module.exports = [
  makeToggle('antibot', 'Antibot'),
  makeToggle('antiforeign', 'Antiforeign', 'Example: .antiforeign on 234\nThis will remove numbers not starting with 234'),
  makeToggle('antiviewonce', 'Antiviewonce'),
  makeToggle('antipromote', 'Antipromote'),
  makeToggle('antidemote', 'Antidemote'),
  {
    name: 'protection', category: 'protection', groupOnly: true,
    run: async ({ reply, db, from }) => {
      let g = db.group?.[from]?.anti || {};
      // Also show anti.js keys for one full view
      return reply(`🛡️ *PROTECTION SETTINGS FOR THIS GROUP*\n\nAntibot: ${g.antibot ? 'ON' : 'OFF'}\nAntiforeign: ${g.antiforeign ? 'ON' : 'OFF'}${g.antiforeign ? ' (Only +'+(db.group[from].allowedCode||'234')+')' : ''}\nAntiviewonce: ${g.antiviewonce ? 'ON' : 'OFF'}\nAntipromote: ${g.antipromote ? 'ON' : 'OFF'}\nAntidemote: ${g.antidemote ? 'ON' : 'OFF'}\n\n--- Anti (from anti.js) ---\nAntilink: ${g.antilink ? 'ON' : 'OFF'}\nAntibadword: ${g.antibadword ? 'ON' : 'OFF'}\nAntitag: ${g.antitag ? 'ON' : 'OFF'}\nAntidelete: ${g.antidelete ? 'ON' : 'OFF'}\nAntispam: ${g.antispam ? 'ON' : 'OFF'}\n\nUse .antilink on to turn on any protection.\n\n©️ Simon Tech Inc`);
    }
  },
  {
    name: 'protectall', category: 'protection', groupOnly: true,
    run: async (ctx) => {
      const { reply, db, F, from } = ctx;
      if(!await needAdmin(ctx)) return;
      let g = ensureGroup(db, from);
      // FIXED: Do NOT wipe db.group[from] - only set anti keys
      g.anti.antibot = true; g.anti.antiforeign = true; g.anti.antiviewonce = true;
      g.anti.antipromote = true; g.anti.antidemote = true;
      g.anti.antilink = true; g.anti.antibadword = true; g.anti.antitag = true; g.anti.antidelete = true; g.anti.antispam = true;
      if(F?.saveDB) F.saveDB(db);
      return reply('✅ All protections turned ON for this group.\nUse .protection to see settings.');
    }
  },
  {
    name: 'unprotect', category: 'protection', groupOnly: true,
    run: async (ctx) => {
      const { reply, db, F, from } = ctx;
      if(!await needAdmin(ctx)) return;
      let g = ensureGroup(db, from);
      // FIXED: Only clear anti keys, NOT rules / welcomeMsg / etc
      g.anti = {};
      if(F?.saveDB) F.saveDB(db);
      return reply('✅ All protections turned OFF for this group.\nRules / welcome message were kept.');
    }
  }
];
module.exports.handleProtection = handleProtection;
module.exports.handleParticipantProtection = handleParticipantProtection;
