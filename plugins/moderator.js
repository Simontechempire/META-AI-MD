// commands/moderator.js - MODERATOR MENU 81-110 by Simon Tech

async function isAdmin(sock, from, sender) {
  try { let md = await sock.groupMetadata(from); let p = md.participants.find(x=>x.id===sender); return p && p.admin; } catch(e){ return false; }
}
async function isBotAdmin(sock, from) {
  try { let md = await sock.groupMetadata(from); let me = sock.user.id.split(':')[0]+'@s.whatsapp.net'; let p = md.participants.find(x=>x.id===me || x.id.includes(me.split('@')[0])); return p && p.admin; } catch(e){ return false; }
}

module.exports = [
{
  name: 'kick', category: 'moderator',
  run: async ({ reply, sock, from, isGroup, m, F, args, sender }) => {
    if (!isGroup) return reply('Use in group');
    if (!await isAdmin(sock, from, sender)) return reply('Only admin fit use');
    let target = F.getTarget(m, args); if (!target) return reply('Reply / tag user to kick');
    try { await sock.groupParticipantsUpdate(from, [target], 'remove'); return reply(`🚫 Kicked @${target.split('@')[0]}`); } catch(e){ return reply('Bot must be admin'); }
  }
},
{
  name: 'add', category: 'moderator',
  run: async ({ reply, sock, from, isGroup, args, F, sender }) => {
    if (!isGroup) return reply('Use in group');
    if (!await isAdmin(sock, from, sender)) return reply('Only admin');
    let num = F.cleanNumber(args[0]); if (!num) return reply('Usage: .add 2348102350169');
    try { await sock.groupParticipantsUpdate(from, [`${num}@s.whatsapp.net`], 'add'); return reply(`✅ Added +${num}`); } catch(e){ return reply('Add failed - user must send request or bot no be admin. Send link: .grouplink'); }
  }
},
{
  name: 'promote', category: 'moderator',
  run: async ({ reply, sock, from, isGroup, m, F, args, sender }) => {
    if (!isGroup) return reply('Use in group');
    if (!await isAdmin(sock, from, sender)) return reply('Only admin');
    let target = F.getTarget(m, args); if (!target) return reply('Tag user to promote');
    await sock.groupParticipantsUpdate(from, [target], 'promote').catch(()=>{ return reply('Bot must be admin'); });
    return reply(`👑 Promoted @${target.split('@')[0]} to admin`);
  }
},
{
  name: 'demote', category: 'moderator',
  run: async ({ reply, sock, from, isGroup, m, F, args, sender }) => {
    if (!isGroup) return reply('Use in group');
    if (!await isAdmin(sock, from, sender)) return reply('Only admin');
    let target = F.getTarget(m, args); if (!target) return reply('Tag user to demote');
    await sock.groupParticipantsUpdate(from, [target], 'demote').catch(()=>{ return reply('Bot must be admin'); });
    return reply(`⬇️ Demoted @${target.split('@')[0]}`);
  }
},
{
  name: 'warn', category: 'moderator',
  run: async ({ reply, from, isGroup, m, F, args, db, sender, sock }) => {
    if (!isGroup) return reply('Use in group');
    if (!await isAdmin(sock, from, sender)) return reply('Only admin');
    let target = F.getTarget(m, args); if (!target) return reply('Usage: .warn @user');
    if (!db.warns) db.warns = {}; if (!db.warns[from]) db.warns[from]={};
    db.warns[from][target] = (db.warns[from][target]||0)+1;
    let count = db.warns[from][target];
    let max = db.group?.[from]?.maxWarn || 3;
    if (count >= max) { await sock.groupParticipantsUpdate(from, [target], 'remove').catch(()=>{}); db.warns[from][target]=0; return reply(`🚫 @${target.split('@')[0]} kicked - reached ${max} warnings`); }
    return reply(`⚠️ Warned @${target.split('@')[0]}\nWarnings: ${count}/${max}`);
  }
},
{
  name: 'warnings', aliases: ['listwarn'], category: 'moderator',
  run: async ({ reply, from, isGroup, db, m, F, args }) => {
    if (!isGroup) return reply('Use in group');
    let target = F.getTarget(m, args);
    if (target) { let c = db.warns?.[from]?.[target]||0; return reply(`⚠️ @${target.split('@')[0]} has ${c} warnings`); }
    let all = db.warns?.[from]||{};
    let list = Object.entries(all).filter(([k,v])=>v>0);
    if (!list.length) return reply('No warnings yet ✅');
    return reply(`⚠️ *WARNINGS*\n\n`+list.map(([k,v],i)=>`${i+1}. @${k.split('@')[0]} - ${v}`).join('\n'));
  }
},
{
  name: 'resetwarn', category: 'moderator',
  run: async ({ reply, from, isGroup, m, F, args, db, sender, sock }) => {
    if (!isGroup) return reply('Use in group');
    if (!await isAdmin(sock, from, sender)) return reply('Only admin');
    let target = F.getTarget(m, args); if (!target) return reply('Usage: .resetwarn @user');
    if (db.warns?.[from]) db.warns[from][target]=0;
    return reply(`✅ Reset warnings for @${target.split('@')[0]}`);
  }
},
{
  name: 'mute', category: 'moderator',
  run: async ({ reply, from, isGroup, m, F, args, db, sender, sock }) => {
    if (!isGroup) return reply('Use in group');
    if (!await isAdmin(sock, from, sender)) return reply('Only admin');
    let target = F.getTarget(m, args); if (!target) return reply('Usage: .mute @user');
    if (!db.muted) db.muted={}; if(!db.muted[from]) db.muted[from]=[];
    if (!db.muted[from].includes(target)) db.muted[from].push(target);
    return reply(`🔇 Muted @${target.split('@')[0]} - bot go delete him msgs`);
  }
},
{
  name: 'unmute', category: 'moderator',
  run: async ({ reply, from, isGroup, m, F, args, db }) => {
    if (!isGroup) return reply('Use in group');
    let target = F.getTarget(m, args); if (!target) return reply('Usage: .unmute @user');
    if (db.muted?.[from]) db.muted[from]=db.muted[from].filter(x=>x!==target);
    return reply(`🔊 Unmuted @${target.split('@')[0]}`);
  }
},
{
  name: 'delete', aliases: ['del'], category: 'moderator',
  run: async ({ reply, sock, from, isGroup, m }) => {
    if (!isGroup) return reply('Use in group');
    let quoted = m.message?.extendedTextMessage?.contextInfo;
    if (!quoted?.stanzaId) return reply('Reply to message to delete');
    try { await sock.sendMessage(from, { delete: { remoteJid: from, fromMe: false, id: quoted.stanzaId, participant: quoted.participant } }); return reply('🗑️ Deleted'); } catch(e){ return reply('Delete failed - bot must be admin'); }
  }
},
{
  name: 'purge', aliases: ['clear'], category: 'moderator',
  run: async ({ reply, from, isGroup, sender, sock }) => {
    if (!isGroup) return reply('Use in group');
    if (!await isAdmin(sock, from, sender)) return reply('Only admin');
    return reply('🧹 Purge: WhatsApp no allow bulk delete. Use .delete to delete one by one. Or use .removeall to remove all members (danger)');
  }
},
{
  name: 'tagadmin', category: 'moderator',
  run: async ({ reply, sock, from, isGroup, text }) => {
    if (!isGroup) return reply('Use in group');
    let md = await sock.groupMetadata(from);
    let adm = md.participants.filter(p=>p.admin).map(p=>p.id);
    return sock.sendMessage(from, { text: `👑 *TAG ADMIN*\n\n${text||'Admins needed!'}\n\n`+adm.map(a=>`@${a.split('@')[0]}`).join(' '), mentions: adm });
  }
},
{
  name: 'hidetag', category: 'moderator',
  run: async ({ reply, sock, from, isGroup, text }) => {
    if (!isGroup) return reply('Use in group');
    let md = await sock.groupMetadata(from);
    let mem = md.participants.map(p=>p.id);
    return sock.sendMessage(from, { text: text||'👋', mentions: mem });
  }
},
{
  name: 'groupmute', category: 'moderator',
  run: async ({ reply, sock, from, isGroup, sender }) => {
    if (!isGroup) return reply('Use in group');
    if (!await isAdmin(sock, from, sender)) return reply('Only admin');
    try { await sock.groupSettingUpdate(from, 'announcement'); return reply('🔒 Group muted - only admins fit chat'); } catch(e){ return reply('Bot must be admin'); }
  }
},
{
  name: 'groupunmute', category: 'moderator',
  run: async ({ reply, sock, from, isGroup, sender }) => {
    if (!isGroup) return reply('Use in group');
    if (!await isAdmin(sock, from, sender)) return reply('Only admin');
    try { await sock.groupSettingUpdate(from, 'not_announcement'); return reply('🔊 Group unmuted'); } catch(e){ return reply('Bot must be admin'); }
  }
},
{
  name: 'lock', category: 'moderator',
  run: async ({ reply, sock, from, isGroup, sender }) => {
    if (!isGroup) return reply('Use in group');
    if (!await isAdmin(sock, from, sender)) return reply('Only admin');
    try { await sock.groupSettingUpdate(from, 'locked'); return reply('🔒 Group settings LOCKED - only admins fit change info'); } catch(e){ return reply('Bot must be admin'); }
  }
},
{
  name: 'unlock', category: 'moderator',
  run: async ({ reply, sock, from, isGroup, sender }) => {
    if (!isGroup) return reply('Use in group');
    if (!await isAdmin(sock, from, sender)) return reply('Only admin');
    try { await sock.groupSettingUpdate(from, 'unlocked'); return reply('🔓 Group settings UNLOCKED'); } catch(e){ return reply('Bot must be admin'); }
  }
},
{
  name: 'approve', category: 'moderator',
  run: async ({ reply, sock, from, isGroup, sender }) => {
    if (!isGroup) return reply('Use in group');
    if (!await isAdmin(sock, from, sender)) return reply('Only admin');
    try { let req = await sock.groupRequestParticipantsList(from); if(!req.length) return reply('No pending'); for(let r of req) await sock.groupRequestParticipantsUpdate(from, [r.jid], 'approve'); return reply(`✅ Approved ${req.length}`); } catch(e){ return reply('Bot must be admin'); }
  }
},
{
  name: 'disapprove', category: 'moderator',
  run: async ({ reply, sock, from, isGroup, sender }) => {
    if (!isGroup) return reply('Use in group');
    if (!await isAdmin(sock, from, sender)) return reply('Only admin');
    try { let req = await sock.groupRequestParticipantsList(from); if(!req.length) return reply('No pending'); for(let r of req) await sock.groupRequestParticipantsUpdate(from, [r.jid], 'reject'); return reply(`🚫 Rejected ${req.length}`); } catch(e){ return reply('Bot must be admin'); }
  }
},
{
  name: 'restrict', category: 'moderator',
  run: async ({ reply, from, isGroup, m, F, args, db, sender, sock }) => {
    if (!isGroup) return reply('Use in group');
    if (!await isAdmin(sock, from, sender)) return reply('Only admin');
    let target = F.getTarget(m, args); if (!target) return reply('Usage: .restrict @user');
    if(!db.muted) db.muted={}; if(!db.muted[from]) db.muted[from]=[];
    if(!db.muted[from].includes(target)) db.muted[from].push(target);
    return reply(`🚫 Restricted @${target.split('@')[0]}`);
  }
},
{
  name: 'unrestrict', category: 'moderator',
  run: async ({ reply, from, isGroup, m, F, args, db }) => {
    if (!isGroup) return reply('Use in group');
    let target = F.getTarget(m, args); if (!target) return reply('Usage: .unrestrict @user');
    if(db.muted?.[from]) db.muted[from]=db.muted[from].filter(x=>x!==target);
    return reply(`✅ Unrestricted @${target.split('@')[0]}`);
  }
},
{
  name: 'setwarn', category: 'moderator',
  run: async ({ reply, from, isGroup, args, db, sender, sock }) => {
    if (!isGroup) return reply('Use in group');
    if (!await isAdmin(sock, from, sender)) return reply('Only admin');
    let n = parseInt(args[0]); if(!n) return reply('Usage: .setwarn 3');
    if(!db.group) db.group={}; if(!db.group[from]) db.group[from]={};
    db.group[from].maxWarn = n;
    return reply(`✅ Max warn set to ${n} - after ${n} warns, auto kick`);
  }
},
{
  name: 'resetmember', category: 'moderator',
  run: async ({ reply, from, isGroup, m, F, args, db }) => {
    if (!isGroup) return reply('Use in group');
    let target = F.getTarget(m, args); if (!target) return reply('Usage: .resetmember @user');
    if(db.warns?.[from]) db.warns[from][target]=0;
    if(db.muted?.[from]) db.muted[from]=db.muted[from].filter(x=>x!==target);
    return reply(`✅ Reset @${target.split('@')[0]} - warns + mute cleared`);
  }
},
{
  name: 'removeall', category: 'moderator',
  run: async ({ reply, sock, from, isGroup, sender, args }) => {
    if (!isGroup) return reply('Use in group');
    if (!await isAdmin(sock, from, sender)) return reply('Only admin');
    if (args[0] !== 'confirm') return reply('⚠️ DANGER! This go remove ALL members.\nType: .removeall confirm');
    let md = await sock.groupMetadata(from);
    let others = md.participants.filter(p=>!p.admin).map(p=>p.id);
    for(let id of others){ try{ await sock.groupParticipantsUpdate(from, [id], 'remove'); await new Promise(r=>setTimeout(r,500)); }catch(e){} }
    return reply(`✅ Removed ${others.length} members`);
  }
},
{
  name: 'getadmin', aliases: ['staff'], category: 'moderator',
  run: async ({ reply, sock, from, isGroup }) => {
    if (!isGroup) return reply('Use in group');
    let md = await sock.groupMetadata(from);
    let adm = md.participants.filter(p=>p.admin);
    return sock.sendMessage(from, { text: `👑 *STAFF (${adm.length})*\n\n`+adm.map((p,i)=>`${i+1}. @${p.id.split('@')[0]}`).join('\n'), mentions: adm.map(p=>p.id) });
  }
},
{
  name: 'setrules', category: 'moderator',
  run: async ({ reply, from, isGroup, text, db, sender, sock }) => {
    if (!isGroup) return reply('Use in group');
    if (!await isAdmin(sock, from, sender)) return reply('Only admin');
    if (!text) return reply('Usage: .setrules 1. No spam');
    if(!db.group) db.group={}; if(!db.group[from]) db.group[from]={};
    db.group[from].rules = text;
    return reply('✅ Rules set!');
  }
},
{
  name: 'resetgroup', category: 'moderator',
  run: async ({ reply, from, isGroup, db, sender, sock, args }) => {
    if (!isGroup) return reply('Use in group');
    if (!await isAdmin(sock, from, sender)) return reply('Only admin');
    if (args[0] !== 'confirm') return reply('Type: .resetgroup confirm to clear warns + mutes + rules');
    if(db.warns) db.warns[from]={};
    if(db.muted) db.muted[from]=[];
    if(db.group?.[from]) { db.group[from].rules=''; db.group[from].welcomeMsg=''; }
    return reply('✅ Group reset - warns, mutes, rules cleared');
  }
},
];
