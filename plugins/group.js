// commands/group.js + plugins/group.js - GROUP MENU REAL by Simon Tech
// REAL - Admin check + Bot admin check + Save DB + Kick/Promote/Demote/Mute

function needGroup(isGroup, reply){
  if (!isGroup) { reply('❌ Group only. Use this command inside a group.'); return false; }
  return true;
}
// FIXED ERROR 1: index.js no dey send ctx.isAdmin, so check am here with groupMetadata
async function needAdmin(ctx){
  if (ctx.isOwner) return true;
  if (ctx.isAdmin) return true;
  try {
    let md = await ctx.sock.groupMetadata(ctx.from);
    let senderId = ctx.sender || '';
    let senderNum = String(ctx.senderNum || senderId).replace(/[^0-9]/g, '');
    let p = (md.participants || []).find(x => x.id === senderId || x.phoneNumber === senderId || String(x.phoneNumber || '').split('@')[0] === senderNum || String(x.id || '').split('@')[0] === senderNum);
    if (p && (p.admin === 'admin' || p.admin === 'superadmin')) return true;
  } catch(e){}
  ctx.reply('❌ Admins only. Only group admin fit use this.');
  return false;
}
// FIXED ERROR 2: LID fix - check id OR phoneNumber OR participantPn for bot
async function needBotAdmin(sock, from, reply){
  try {
    let md = await sock.groupMetadata(from);
    let myNum = String(sock.user?.id || '').split(':')[0].replace(/[^0-9]/g, '');
    let myPn = sock.user?.id || '';
    let me = md.participants.find(p => p.id === sock.user.id || p.phoneNumber === myPn || String(p.phoneNumber || '').split('@')[0] === myNum || String(p.id || '').split('@')[0] === myNum);
    let isBotAdmin = !!(me && (me.admin === 'admin' || me.admin === 'superadmin'));
    if (!isBotAdmin) { await reply('❌ Bot must be admin to do this. Make bot admin first.'); return false; }
    return true;
  } catch(e){ await reply('Failed: '+e.message); return false; }
}
// FIXED: Resolve PN target to real LID participant id before kick/promote/demote
function resolveTarget(md, target){
  if (!target) return null;
  let num = String(target).split('@')[0].replace(/[^0-9]/g, '');
  let p = (md.participants || []).find(x => x.id === target || x.phoneNumber === target || String(x.phoneNumber || '').split('@')[0] === num || String(x.id || '').split('@')[0] === num);
  return p ? p.id : target;
}
function save(db, F){ if (F) F.saveDB(db); }

module.exports = [
{
  name: 'groupinfo', aliases: ['gcinfo'], category: 'group', groupOnly: true,
  run: async ({ reply, sock, from, isGroup }) => {
    if (!needGroup(isGroup, reply)) return;
    let md = await sock.groupMetadata(from);
    return reply(`◈┈▉ \`meta ai ｍｄ\` ▉┄◈\n\n*🏠 GROUP INFO*\n\n📌 Name: ${md.subject}\n🆔 ID: ${md.id}\n👥 Members: ${md.participants.length}\n👑 Admins: ${md.participants.filter(p=>p.admin).length}\n📝 Desc: ${md.desc || 'No desc'}\n📅 Created: ${new Date(md.creation*1000).toLocaleDateString('en-NG')}\n🔒 Announce: ${md.announce ? 'Closed' : 'Open'}\n\n©️ created by Simon tech inc`);
  }
},
{
  name: 'grouplink', aliases: ['link', 'invitelink'], category: 'group', groupOnly: true,
  run: async ({ reply, sock, from, isGroup }) => {
    if (!needGroup(isGroup, reply)) return;
    try { let code = await sock.groupInviteCode(from); return reply(`🔗 *GROUP LINK*\nhttps://chat.whatsapp.com/${code}`); } catch(e){ return reply('❌ Bot must be admin to get link'); }
  }
},
{
  name: 'setgroupname', aliases: ['setgname'], category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup, text, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(sock, from, reply)) return;
    if (!text) return reply(`Usage: ${prefix}setgroupname New Name`);
    try { await sock.groupUpdateSubject(from, text); return reply(`✅ Group name changed to: ${text}`); } catch(e){ return reply('Failed: '+e.message); }
  }
},
{
  name: 'setdesc', aliases: ['setgroupdesc'], category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup, text, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(sock, from, reply)) return;
    if (!text) return reply(`Usage: ${prefix}setdesc New description`);
    try { await sock.groupUpdateDescription(from, text); return reply(`✅ Desc changed`); } catch(e){ return reply('Failed: '+e.message); }
  }
},
{
  name: 'open', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(sock, from, reply)) return;
    try { await sock.groupSettingUpdate(from, 'not_announcement'); return reply('✅ Group OPEN - everybody fit chat'); } catch(e){ return reply('Failed: '+e.message); }
  }
},
{
  name: 'close', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(sock, from, reply)) return;
    try { await sock.groupSettingUpdate(from, 'announcement'); return reply('🔒 Group CLOSED - only admins fit chat'); } catch(e){ return reply('Failed: '+e.message); }
  }
},
{
  name: 'tagall', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup, text } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    let md = await sock.groupMetadata(from);
    let mem = md.participants.map(p=>p.id);
    // REAL: Split into batches of 50 to avoid WhatsApp limit crash
    let txt = `📢 *TAGALL*\n\n${text || 'Hello everyone!'}\n\n`;
    for (let i=0; i<mem.length; i+=50) {
      let batch = mem.slice(i, i+50);
      let batchTxt = i===0 ? txt + batch.map(m=>`@${m.split('@')[0]}`).join(' ') : batch.map(m=>`@${m.split('@')[0]}`).join(' ');
      await sock.sendMessage(from, { text: batchTxt, mentions: batch }).catch(()=>{});
    }
  }
},
{
  name: 'hidetag', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { sock, from, isGroup, text, reply } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    let md = await sock.groupMetadata(from);
    let mem = md.participants.map(p=>p.id);
    for (let i=0; i<mem.length; i+=50) {
      let batch = mem.slice(i, i+50);
      await sock.sendMessage(from, { text: text || '👋 Hello', mentions: batch }).catch(()=>{});
    }
  }
},
// ===== REAL MISSING COMMANDS - Kick / Promote / Demote / Remove =====
{
  name: 'kick', aliases: ['remove', 'kickout'], category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup, m, F, args, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(sock, from, reply)) return;
    let target = F.getTarget(m, args);
    if (!target) return reply(`Reply / tag / number. ${prefix}kick @user`);
    // No kick admin / owner
    let md = await sock.groupMetadata(from);
    let realTarget = resolveTarget(md, target);
    let tp = md.participants.find(p=>p.id===realTarget);
    if (tp?.admin) return reply('❌ Cannot kick admin. Demote first.');
    try { await sock.groupParticipantsUpdate(from, [realTarget], 'remove'); return reply(`🦶 Kicked @${realTarget.split('@')[0]}`, { mentions: [realTarget] }); } catch(e){ return reply('Kick failed: '+e.message); }
  }
},
{
  name: 'promote', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup, m, F, args, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(sock, from, reply)) return;
    let target = F.getTarget(m, args);
    if (!target) return reply(`Usage: ${prefix}promote @user`);
    let md = await sock.groupMetadata(from);
    let realTarget = resolveTarget(md, target);
    try { await sock.groupParticipantsUpdate(from, [realTarget], 'promote'); return reply(`👑 Promoted @${realTarget.split('@')[0]} to admin`); } catch(e){ return reply('Promote failed: '+e.message); }
  }
},
{
  name: 'demote', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup, m, F, args, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(sock, from, reply)) return;
    let target = F.getTarget(m, args);
    if (!target) return reply(`Usage: ${prefix}demote @user`);
    let md = await sock.groupMetadata(from);
    let realTarget = resolveTarget(md, target);
    try { await sock.groupParticipantsUpdate(from, [realTarget], 'demote'); return reply(`⬇️ Demoted @${realTarget.split('@')[0]}`); } catch(e){ return reply('Demote failed: '+e.message); }
  }
},
{
  name: 'mute', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup, db, F } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(sock, from, reply)) return;
    if (!db.muted) db.muted = {};
    db.muted[from] = db.muted[from] || [];
    // Mute = close group
    await sock.groupSettingUpdate(from, 'announcement').catch(()=>{});
    save(db, F);
    return reply('🔇 Group MUTED - only admins fit chat');
  }
},
{
  name: 'unmute', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(sock, from, reply)) return;
    await sock.groupSettingUpdate(from, 'not_announcement').catch(()=>{});
    return reply('🔊 Group UNMUTED - everybody fit chat');
  }
},
{
  name: 'listmembers', aliases: ['members', 'groupmembers'], category: 'group', groupOnly: true,
  run: async ({ reply, sock, from, isGroup }) => {
    if (!needGroup(isGroup, reply)) return;
    let md = await sock.groupMetadata(from);
    let txt = `👥 *MEMBERS (${md.participants.length})*\n\n` + md.participants.map((p,i)=>`${i+1}. @${p.id.split('@')[0]} ${p.admin ? '👑' : ''}`).join('\n');
    return sock.sendMessage(from, { text: txt, mentions: md.participants.map(p=>p.id) });
  }
},
{
  name: 'admins', category: 'group', groupOnly: true,
  run: async ({ reply, sock, from, isGroup }) => {
    if (!needGroup(isGroup, reply)) return;
    let md = await sock.groupMetadata(from);
    let adm = md.participants.filter(p=>p.admin);
    let txt = `👑 *ADMINS (${adm.length})*\n\n` + adm.map((p,i)=>`${i+1}. @${p.id.split('@')[0]}`).join('\n');
    return sock.sendMessage(from, { text: txt, mentions: adm.map(p=>p.id) });
  }
},
{
  name: 'getpic', aliases: ['grouppic'], category: 'group', groupOnly: true,
  run: async ({ reply, sock, from, isGroup, m }) => {
    if (!needGroup(isGroup, reply)) return;
    try { let url = await sock.profilePictureUrl(from, 'image'); return sock.sendMessage(from, { image: { url }, caption: '🏠 Group Pic' }, { quoted: m }); } catch(e){ return reply('No group pic or failed'); }
  }
},
{
  name: 'setgroup', category: 'group', groupOnly: true,
  run: async ({ reply, prefix }) => { return reply(`Usage: ${prefix}setgroupname / ${prefix}setdesc / ${prefix}setwelcome\n\nExample: ${prefix}setgroupname META FANS`); }
},
{
  name: 'resetlink', aliases: ['revoke'], category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(sock, from, reply)) return;
    try { let code = await sock.groupRevokeInvite(from); return reply(`✅ Link revoked!\nNew link: https://chat.whatsapp.com/${code}`); } catch(e){ return reply('Failed: '+e.message); }
  }
},
{
  name: 'invite', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup, m, F, args, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(sock, from, reply)) return;
    let target = F.getTarget(m, args);
    if (!target) return reply(`Usage: ${prefix}invite 2348102350169`);
    let md = await sock.groupMetadata(from);
    let realTarget = resolveTarget(md, target);
    try { await sock.groupAdd(from, [realTarget]); return reply(`✅ Invited @${realTarget.split('@')[0]}`); } catch(e){ return reply('Invite failed: '+e.message+'\nTry .grouplink and send link'); }
  }
},
{
  name: 'accept', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(sock, from, reply)) return;
    try { let req = await sock.groupRequestParticipantsList(from); if(!req.length) return reply('No pending requests'); for(let r of req) await sock.groupRequestParticipantsUpdate(from, [r.jid], 'approve'); return reply(`✅ Approved ${req.length} requests`); } catch(e){ return reply('Failed: '+e.message); }
  }
},
{
  name: 'reject', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(sock, from, reply)) return;
    try { let req = await sock.groupRequestParticipantsList(from); if(!req.length) return reply('No pending requests'); for(let r of req) await sock.groupRequestParticipantsUpdate(from, [r.jid], 'reject'); return reply(`🚫 Rejected ${req.length} requests`); } catch(e){ return reply('Failed: '+e.message); }
  }
},
{
  name: 'welcome', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, from, isGroup, args, db, F, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if(!db.group) db.group = {}; if(!db.group[from]) db.group[from]={};
    let v = (args[0]||'').toLowerCase(); if(v==='on'||v==='off') db.group[from].welcome = v==='on';
    save(db, F);
    return reply(`👋 Welcome is ${db.group[from].welcome ? 'ON ✅' : 'OFF ❌'}\nUsage: ${prefix}welcome on / off`);
  }
},
{
  name: 'goodbye', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, from, isGroup, args, db, F, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if(!db.group) db.group = {}; if(!db.group[from]) db.group[from]={};
    let v = (args[0]||'').toLowerCase(); if(v==='on'||v==='off') db.group[from].goodbye = v==='on';
    save(db, F);
    return reply(`👋 Goodbye is ${db.group[from].goodbye ? 'ON ✅' : 'OFF ❌'}\nUsage: ${prefix}goodbye on / off`);
  }
},
{
  name: 'setwelcome', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, from, isGroup, text, db, F, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!text) return reply(`Usage: ${prefix}setwelcome Welcome @user to group!`);
    if(!db.group) db.group={}; if(!db.group[from]) db.group[from]={};
    db.group[from].welcomeMsg = text;
    save(db, F);
    return reply(`✅ Welcome msg set:\n${text}`);
  }
},
{
  name: 'setgoodbye', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, from, isGroup, text, db, F, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!text) return reply(`Usage: ${prefix}setgoodbye Bye @user 😢`);
    if(!db.group) db.group={}; if(!db.group[from]) db.group[from]={};
    db.group[from].goodbyeMsg = text;
    save(db, F);
    return reply(`✅ Goodbye msg set:\n${text}`);
  }
},
{
  name: 'poll', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup, text, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!text) return reply(`Usage: ${prefix}poll Question | Option1 | Option2`);
    let parts = text.split('|').map(s=>s.trim()).filter(Boolean);
    if (parts.length < 3) return reply(`Usage: ${prefix}poll Best player? | Messi | Ronaldo`);
    try { await sock.sendMessage(from, { poll: { name: parts[0], values: parts.slice(1), selectableCount: 1 } }); } catch(e){ return reply('Poll failed: '+e.message); }
  }
},
{
  name: 'vote', category: 'group', groupOnly: true,
  run: async ({ reply, prefix }) => { return reply(`🗳️ To vote, tap option for poll above.\nCreate poll: ${prefix}poll Question | Yes | No`); }
},
{
  name: 'endpoll', category: 'group', groupOnly: true,
  run: async ({ reply }) => { return reply('Poll go end by itself. Or delete poll message.'); }
},
{
  name: 'groupid', category: 'group', groupOnly: true,
  run: async ({ reply, from, isGroup }) => {
    if (!needGroup(isGroup, reply)) return;
    return reply(`🆔 Group ID:\n${from}`);
  }
},
{
  name: 'setrules', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, from, isGroup, text, db, F, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!text) return reply(`Usage: ${prefix}setrules 1. No spam 2. Respect all`);
    if(!db.group) db.group={}; if(!db.group[from]) db.group[from]={};
    db.group[from].rules = text;
    save(db, F);
    return reply(`✅ Rules set!`);
  }
},
{
  name: 'rules', aliases: ['getrules'], category: 'group', groupOnly: true,
  run: async ({ reply, from, isGroup, db }) => {
    if (!needGroup(isGroup, reply)) return;
    let r = db.group?.[from]?.rules;
    return reply(r ? `📜 *GROUP RULES*\n\n${r}` : 'No rules set. Admin use .setrules');
  }
},
{
  name: 'warn', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup, m, F, args, db, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    let target = F.getTarget(m, args);
    if (!target) return reply(`Usage: ${prefix}warn @user`);
    let md = await sock.groupMetadata(from);
    let realTarget = resolveTarget(md, target);
    if (!db.warns) db.warns = {};
    if (!db.warns[from]) db.warns[from] = {};
    db.warns[from][realTarget] = (db.warns[from][realTarget] || 0) + 1;
    let count = db.warns[from][realTarget];
    save(db, F);
    if (count >= 3) {
      db.warns[from][realTarget] = 0; save(db, F);
      await sock.groupParticipantsUpdate(from, [realTarget], 'remove').catch(()=>{});
      return reply(`🦶 @${realTarget.split('@')[0]} kicked - 3/3 warnings`);
    }
    return reply(`⚠️ Warned @${realTarget.split('@')[0]} - ${count}/3`);
  }
},
{
  name: 'unwarn', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, from, isGroup, m, F, args, db, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    let target = F.getTarget(m, args);
    if (!target) return reply(`Usage: ${prefix}unwarn @user`);
    let md = await sock.groupMetadata(from);
    let realTarget = resolveTarget(md, target);
    if (db.warns?.[from]) db.warns[from][realTarget] = 0;
    save(db, F);
    return reply(`✅ Unwarned @${realTarget.split('@')[0]}`);
  }
},
];
