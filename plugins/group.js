// plugins/group.js - GROUP MENU by Simon Tech
// Admin check + Bot admin check + Save DB + Kick / Promote / Demote / Mute

function needGroup(isGroup, reply){
  if (!isGroup) { reply('❌ Group only. Use this command inside a group.'); return false; }
  return true;
}
// Display real PN, not LID - for @mentions in text
function displayId(p){
  if (!p) return '';
  if (typeof p === 'string') return String(p).split('@')[0];
  return String(p.phoneNumber || p.id || '').split('@')[0].replace(/[^0-9]/g, '');
}
function mentionId(p){
  // For mentions array, use real participant id (LID works for tag)
  if (!p) return '';
  if (typeof p === 'string') return p;
  return p.id || p.phoneNumber || '';
}
async function getMeta(ctx, from){
  try {
    if (ctx.F?.getGroupMeta) return await ctx.F.getGroupMeta(ctx.sock, from);
    return await ctx.sock.groupMetadata(from);
  } catch(e){ return null; }
}
// index.js sends ctx.isAdmin, use it first - no extra groupMetadata call
async function needAdmin(ctx){
  if (ctx.isOwner) return true;
  if (ctx.isAdmin) return true;
  try {
    let md = await getMeta(ctx, ctx.from);
    if (!md) return false;
    let senderId = ctx.sender || '';
    let senderPn = ctx.senderPn || '';
    let senderNum = String(ctx.senderNum || senderPn || senderId).replace(/[^0-9]/g, '');
    let p = (md.participants || []).find(x => x.id === senderId || x.id === senderPn || x.phoneNumber === senderId || x.phoneNumber === senderPn || String(x.phoneNumber || '').split('@')[0] === senderNum || String(x.id || '').split('@')[0] === senderNum);
    if (p && (p.admin === 'admin' || p.admin === 'superadmin')) return true;
  } catch(e){}
  ctx.reply('❌ Admins only. Only group admins can use this command.');
  return false;
}
// Bot admin check - uses ctx.isBotAdmin first
async function needBotAdmin(ctx, from, reply){
  if (ctx.isBotAdmin) return true;
  try {
    let md = await getMeta(ctx, from);
    if (!md) return false;
    let sock = ctx.sock;
    let myNum = String(sock.user?.id || '').split(':')[0].replace(/[^0-9]/g, '');
    let myPn = sock.user?.id || '';
    let myLid = String(sock.user?.lid || '').split('@')[0].replace(/[^0-9]/g, '');
    let me = (md.participants || []).find(p => p.id === sock.user.id || p.id === myPn || p.phoneNumber === myPn || String(p.phoneNumber || '').split('@')[0] === myNum || String(p.id || '').split('@')[0] === myNum || (myLid && String(p.id || '').split('@')[0] === myLid));
    let isBotAdmin = !!(me && (me.admin === 'admin' || me.admin === 'superadmin'));
    if (!isBotAdmin) { await reply('❌ The bot must be admin to do this. Make the bot admin first.'); return false; }
    return true;
  } catch(e){ await reply('Failed: '+e.message); return false; }
}
// Resolve PN target to real participant id before kick/promote/demote
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
  run: async ({ reply, sock, from, isGroup, config }) => {
    if (!needGroup(isGroup, reply)) return;
    let md = await sock.groupMetadata(from);
    return reply(`◈┈▉ \`META AI MD\` ▉┄◈\n\n*🏠 GROUP INFO*\n\n📌 Name: ${md.subject}\n🆔 ID: ${md.id}\n👥 Members: ${md.participants.length}\n👑 Admins: ${md.participants.filter(p=>p.admin).length}\n📝 Description: ${md.desc || 'No description'}\n📅 Created: ${new Date(md.creation*1000).toLocaleDateString('en-US')}\n🔒 Announce: ${md.announce ? 'Closed' : 'Open'}\n\n©️ Created by Simon Tech Inc`);
  }
},
{
  name: 'grouplink', aliases: ['link', 'invitelink'], category: 'group', groupOnly: true,
  run: async ({ reply, sock, from, isGroup }) => {
    if (!needGroup(isGroup, reply)) return;
    try { let code = await sock.groupInviteCode(from); return reply(`🔗 *GROUP LINK*\nhttps://chat.whatsapp.com/${code}`); } catch(e){ return reply('❌ The bot must be admin to get the link.'); }
  }
},
{
  name: 'setgroupname', aliases: ['setgname'], category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup, text, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, from, reply)) return;
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
    if (!await needBotAdmin(ctx, from, reply)) return;
    if (!text) return reply(`Usage: ${prefix}setdesc New description`);
    try { await sock.groupUpdateDescription(from, text); return reply(`✅ Description changed.`); } catch(e){ return reply('Failed: '+e.message); }
  }
},
{
  name: 'open', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, from, reply)) return;
    try { await sock.groupSettingUpdate(from, 'not_announcement'); return reply('✅ Group OPEN - Everyone can chat.'); } catch(e){ return reply('Failed: '+e.message); }
  }
},
{
  name: 'close', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, from, reply)) return;
    try { await sock.groupSettingUpdate(from, 'announcement'); return reply('🔒 Group CLOSED - Only admins can chat.'); } catch(e){ return reply('Failed: '+e.message); }
  }
},
{
  name: 'tagall', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { sock, from, isGroup, text, reply } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    let md = await getMeta(ctx, from);
    let mem = (md?.participants || []).map(p=>p.id);
    let txt = `📢 *TAG ALL*\n\n${text || 'Hello everyone!'}\n\n`;
    for (let i=0; i<mem.length; i+=50) {
      let batch = mem.slice(i, i+50);
      let batchTxt = i===0 ? txt + batch.map(m=>`@${displayId(m)}`).join(' ') : batch.map(m=>`@${displayId(m)}`).join(' ');
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
    let md = await getMeta(ctx, from);
    let mem = (md?.participants || []).map(p=>p.id);
    for (let i=0; i<mem.length; i+=50) {
      let batch = mem.slice(i, i+50);
      await sock.sendMessage(from, { text: text || '👋 Hello', mentions: batch }).catch(()=>{});
    }
  }
},
{
  name: 'kick', aliases: ['remove', 'kickout'], category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup, m, F, args, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, from, reply)) return;
    let target = F.getTarget(m, args);
    if (!target) return reply(`Reply / tag / number. ${prefix}kick @user`);
    let md = await getMeta(ctx, from);
    let realTarget = resolveTarget(md, target);
    let tp = (md?.participants || []).find(p=>p.id===realTarget);
    if (tp?.admin) return reply('❌ Cannot kick an admin. Demote them first.');
    try { await sock.groupParticipantsUpdate(from, [realTarget], 'remove'); return reply(`🦶 Kicked @${displayId(realTarget)}`, { mentions: [realTarget] }); } catch(e){ return reply('Kick failed: '+e.message); }
  }
},
{
  name: 'promote', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup, m, F, args, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, from, reply)) return;
    let target = F.getTarget(m, args);
    if (!target) return reply(`Usage: ${prefix}promote @user`);
    let md = await getMeta(ctx, from);
    let realTarget = resolveTarget(md, target);
    try { await sock.groupParticipantsUpdate(from, [realTarget], 'promote'); return reply(`👑 Promoted @${displayId(realTarget)} to admin`, { mentions: [realTarget] }); } catch(e){ return reply('Promote failed: '+e.message); }
  }
},
{
  name: 'demote', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup, m, F, args, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, from, reply)) return;
    let target = F.getTarget(m, args);
    if (!target) return reply(`Usage: ${prefix}demote @user`);
    let md = await getMeta(ctx, from);
    let realTarget = resolveTarget(md, target);
    try { await sock.groupParticipantsUpdate(from, [realTarget], 'demote'); return reply(`⬇️ Demoted @${displayId(realTarget)}`, { mentions: [realTarget] }); } catch(e){ return reply('Demote failed: '+e.message); }
  }
},
{
  name: 'mute', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup, db, F } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, from, reply)) return;
    if (!db.muted) db.muted = {};
    db.muted[from] = db.muted[from] || [];
    await sock.groupSettingUpdate(from, 'announcement').catch(()=>{});
    save(db, F);
    return reply('🔇 Group MUTED - Only admins can chat.');
  }
},
{
  name: 'unmute', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, from, reply)) return;
    await sock.groupSettingUpdate(from, 'not_announcement').catch(()=>{});
    return reply('🔊 Group UNMUTED - Everyone can chat.');
  }
},
{
  name: 'listmembers', aliases: ['members', 'groupmembers'], category: 'group', groupOnly: true,
  run: async ({ reply, sock, from, isGroup, F }) => {
    if (!needGroup(isGroup, reply)) return;
    let md = await sock.groupMetadata(from);
    let txt = `👥 *MEMBERS (${md.participants.length})*\n\n` + md.participants.map((p,i)=>`${i+1}. @${displayId(p)} ${p.admin ? '👑' : ''}`).join('\n');
    return sock.sendMessage(from, { text: txt, mentions: md.participants.map(p=>p.id) });
  }
},
{
  name: 'admins', category: 'group', groupOnly: true,
  run: async ({ reply, sock, from, isGroup }) => {
    if (!needGroup(isGroup, reply)) return;
    let md = await sock.groupMetadata(from);
    let adm = md.participants.filter(p=>p.admin);
    let txt = `👑 *ADMINS (${adm.length})*\n\n` + adm.map((p,i)=>`${i+1}. @${displayId(p)}`).join('\n');
    return sock.sendMessage(from, { text: txt, mentions: adm.map(p=>p.id) });
  }
},
{
  name: 'getpic', aliases: ['grouppic'], category: 'group', groupOnly: true,
  run: async ({ reply, sock, from, isGroup, m }) => {
    if (!needGroup(isGroup, reply)) return;
    try { let url = await sock.profilePictureUrl(from, 'image'); return sock.sendMessage(from, { image: { url }, caption: '🏠 Group Picture' }, { quoted: m }); } catch(e){ return reply('No group picture or failed to load it.'); }
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
    if (!await needBotAdmin(ctx, from, reply)) return;
    try { let code = await sock.groupRevokeInvite(from); return reply(`✅ Link revoked!\nNew link: https://chat.whatsapp.com/${code}`); } catch(e){ return reply('Failed: '+e.message); }
  }
},
{
  name: 'invite', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup, m, F, args, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, from, reply)) return;
    let target = F.getTarget(m, args);
    if (!target) return reply(`Usage: ${prefix}invite 2348102350169`);
    let md = await getMeta(ctx, from);
    let realTarget = resolveTarget(md, target);
    try { await sock.groupAdd(from, [realTarget]); return reply(`✅ Invited @${displayId(realTarget)}`, { mentions: [realTarget] }); } catch(e){ return reply('Invite failed: '+e.message+'\nTry .grouplink and send the link.'); }
  }
},
{
  name: 'accept', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, from, reply)) return;
    try { let req = await sock.groupRequestParticipantsList(from); if(!req.length) return reply('No pending requests.'); for(let r of req) await sock.groupRequestParticipantsUpdate(from, [r.jid], 'approve'); return reply(`✅ Approved ${req.length} requests.`); } catch(e){ return reply('Failed: '+e.message); }
  }
},
{
  name: 'reject', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, from, reply)) return;
    try { let req = await sock.groupRequestParticipantsList(from); if(!req.length) return reply('No pending requests.'); for(let r of req) await sock.groupRequestParticipantsUpdate(from, [r.jid], 'reject'); return reply(`🚫 Rejected ${req.length} requests.`); } catch(e){ return reply('Failed: '+e.message); }
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
    if (!text) return reply(`Usage: ${prefix}setwelcome Welcome @user to the group!`);
    if(!db.group) db.group={}; if(!db.group[from]) db.group[from]={};
    db.group[from].welcomeMsg = text;
    save(db, F);
    return reply(`✅ Welcome message set:\n${text}`);
  }
},
{
  name: 'setgoodbye', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, from, isGroup, text, db, F, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!text) return reply(`Usage: ${prefix}setgoodbye Goodbye @user`);
    if(!db.group) db.group={}; if(!db.group[from]) db.group[from]={};
    db.group[from].goodbyeMsg = text;
    save(db, F);
    return reply(`✅ Goodbye message set:\n${text}`);
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
  run: async ({ reply, prefix }) => { return reply(`🗳️ To vote, tap an option in the poll above.\nCreate a poll: ${prefix}poll Question | Yes | No`); }
},
{
  name: 'endpoll', category: 'group', groupOnly: true,
  run: async ({ reply }) => { return reply('Polls end automatically. Or delete the poll message.'); }
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
    if (!text) return reply(`Usage: ${prefix}setrules 1. No spam 2. Respect everyone`);
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
    return reply(r ? `📜 *GROUP RULES*\n\n${r}` : 'No rules set. Admins can use .setrules');
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
    let md = await getMeta(ctx, from);
    let realTarget = resolveTarget(md, target);
    if (!db.warns) db.warns = {};
    if (!db.warns[from]) db.warns[from] = {};
    db.warns[from][realTarget] = (db.warns[from][realTarget] || 0) + 1;
    let count = db.warns[from][realTarget];
    save(db, F);
    if (count >= 3) {
      db.warns[from][realTarget] = 0; save(db, F);
      await sock.groupParticipantsUpdate(from, [realTarget], 'remove').catch(()=>{});
      return reply(`🦶 @${displayId(realTarget)} kicked - 3/3 warnings`, { mentions: [realTarget] });
    }
    return reply(`⚠️ Warned @${displayId(realTarget)} - ${count}/3`, { mentions: [realTarget] });
  }
},
{
{
  name: 'unwarn', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, from, isGroup, m, F, args, db, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    let target = F.getTarget(m, args);
    if (!target) return reply(`Usage: ${prefix}unwarn @user`);
    let md = await getMeta(ctx, from);
    let realTarget = resolveTarget(md, target);
    if (db.warns?.[from]) db.warns[from][realTarget] = 0;
    save(db, F);
    return reply(`✅ Unwarned @${displayId(realTarget)}`, { mentions: [realTarget] });
  }
},

// ===== REMAINING ONES - AFTER UNWARN =====
{
  name: 'warnings', aliases: ['warns', 'checkwarn', 'mywarn'], category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, from, isGroup, m, F, args, db, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    let target = F.getTarget(m, args);
    if (!target) {
      // Show all warnings in group
      let all = db.warns?.[from] || {};
      let entries = Object.entries(all).filter(([_, v]) => v > 0);
      if (!entries.length) return reply(`✅ No warnings in this group.`);
      let txt = `⚠️ *WARNINGS (${entries.length})*\n\n` + entries.map(([uid, count], i) => `${i+1}. @${displayId(uid)} - ${count}/3`).join('\n');
      return reply(txt, { mentions: entries.map(([uid]) => uid) });
    }
    let md = await getMeta(ctx, from);
    let realTarget = resolveTarget(md, target);
    let count = db.warns?.[from]?.[realTarget] || 0;
    return reply(`⚠️ @${displayId(realTarget)} has ${count}/3 warnings.`, { mentions: [realTarget] });
  }
},
{
  name: 'resetwarn', aliases: ['resetwarns', 'clearwarns'], category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, from, isGroup, db, F } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (db.warns) db.warns[from] = {};
    save(db, F);
    return reply(`✅ All warnings cleared in this group.`);
  }
},
{
  name: 'delwarn', aliases: ['removewarn'], category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, from, isGroup, m, F, args, db, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    let target = F.getTarget(m, args);
    if (!target) return reply(`Usage: ${prefix}delwarn @user`);
    let md = await getMeta(ctx, from);
    let realTarget = resolveTarget(md, target);
    if (db.warns?.[from]?.[realTarget]) {
      db.warns[from][realTarget] = Math.max(0, db.warns[from][realTarget] - 1);
      save(db, F);
    }
    let count = db.warns?.[from]?.[realTarget] || 0;
    return reply(`✅ Removed 1 warning from @${displayId(realTarget)} - Now ${count}/3`, { mentions: [realTarget] });
  }
},
{
  name: 'setppgroup', aliases: ['setgpp', 'setgrouppp'], category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup, m, F, prefix } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, from, reply)) return;
    let buf = null;
    try {
      if (F?.downloadMedia) buf = await F.downloadMedia(m).catch(()=>null);
      if (!buf) {
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        let msg = m.message?.imageMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
        if (msg) {
          let stream = await downloadContentFromMessage(msg, 'image');
          let chunks = [];
          for await (let c of stream) chunks.push(c);
          buf = Buffer.concat(chunks);
        }
      }
    } catch(e){}
    if (!buf) return reply(`Send / reply to an image first. ${prefix}setppgroup`);
    try { await sock.updateProfilePicture(from, buf); return reply('✅ Group picture changed!'); } catch(e){ return reply('Failed: '+e.message); }
  }
},
{
  name: 'delppgroup', aliases: ['delgpp'], category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, from, reply)) return;
    try { await sock.removeProfilePicture(from); return reply('✅ Group picture removed.'); } catch(e){ return reply('Failed: '+e.message); }
  }
},
{
  name: 'groupsettings', aliases: ['gcsettings', 'settings'], category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup, db } = ctx;
    if (!needGroup(isGroup, reply)) return;
    let md = await getMeta(ctx, from);
    let g = db.group?.[from] || {};
    let p = db.group?.[from]?.protection || {};
    let onoff = (v) => v ? '✅ ON' : '❌ OFF';
    return reply(`◈┈▉ \`META AI MD\` ▉┄◈\n\n*⚙️ GROUP SETTINGS*\n\n📌 Name: ${md?.subject || 'Unknown'}\n👥 Members: ${md?.participants?.length || 0}\n🔒 Announce: ${md?.announce ? 'Closed' : 'Open'}\n\n👋 Welcome: ${onoff(g.welcome)}\n👋 Goodbye: ${onoff(g.goodbye)}\n🛡️ Anti Link: ${onoff(p.antilink)}\n🛡️ Anti Bad Word: ${onoff(p.antibadword)}\n🛡️ Anti Tag: ${onoff(p.antitag)}\n🛡️ Anti Delete: ${onoff(p.antidelete)}\n\n©️ Created by Simon Tech Inc`);
  }
},
{
  name: 'antilink', aliases: ['antilinkwarn'], category: 'group', groupOnly: true,
  run: async (ctx) => {
    // Redirect to protection.js - avoid duplicate logic
    let protection = null;
    try { protection = require('./protection'); } catch(e){}
    if (protection?.handleCommands) {
      let r = await protection.handleCommands(ctx.sock, ctx.m, ctx);
      if (r) return r;
    }
    return ctx.reply(`Use: ${ctx.prefix}antilink on / off`);
  }
},
{
  name: 'delete', aliases: ['del'], category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup, m } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    let quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    let quotedId = m.message?.extendedTextMessage?.contextInfo?.stanzaId;
    let quotedParticipant = m.message?.extendedTextMessage?.contextInfo?.participant;
    if (!quotedId) return reply(`Reply to a message to delete it.`);
    try {
      await sock.sendMessage(from, { delete: { remoteJid: from, fromMe: false, id: quotedId, participant: quotedParticipant } });
    } catch(e){ return reply('Delete failed: '+e.message); }
  }
},
{
  name: 'pin', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup, m } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    let quotedId = m.message?.extendedTextMessage?.contextInfo?.stanzaId;
    if (!quotedId) return reply(`Reply to a message to pin it.`);
    try { await sock.sendMessage(from, { pin: { key: { remoteJid: from, id: quotedId }, type: 1, time: 86400 } }); return reply('📌 Message pinned for 24 hours.'); } catch(e){ return reply('Pin failed: '+e.message); }
  }
},
{
  name: 'unpin', category: 'group', groupOnly: true,
  run: async (ctx) => {
    let { reply, sock, from, isGroup, m } = ctx;
    if (!needGroup(isGroup, reply)) return;
    if (!await needAdmin(ctx)) return;
    let quotedId = m.message?.extendedTextMessage?.contextInfo?.stanzaId;
    if (!quotedId) return reply(`Reply to a message to unpin it.`);
    try { await sock.sendMessage(from, { pin: { key: { remoteJid: from, id: quotedId }, type: 0 } }); return reply('📌 Message unpinned.'); } catch(e){ return reply('Unpin failed: '+e.message); }
  }
},
];
