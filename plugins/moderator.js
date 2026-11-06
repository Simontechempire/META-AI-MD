// commands/moderator.js + plugins/moderator.js - MODERATOR MENU REAL by Simon Tech
// REAL - No fake success, Save DB, Admin + BotAdmin check, No duplicate crash

function save(db, F){ if (F) F.saveDB(db); }

async function checkAdmin(ctx){
  // Use ctx.isAdmin from index.js first (fast), fallback to metadata
  if (ctx.isOwner) return true;
  if (ctx.isAdmin) return true;
  try {
    let md = await ctx.sock.groupMetadata(ctx.from);
    let p = md.participants.find(x=>x.id===ctx.sender);
    if (p && p.admin) return true;
  } catch(e){}
  await ctx.reply('❌ Only admin fit use this.');
  return false;
}
async function checkBotAdmin(sock, from, reply){
  try {
    let md = await sock.groupMetadata(from);
    let myId = sock.user.id.split(':')[0];
    let me = md.participants.find(p => p.id.split('@')[0] === myId || p.id === sock.user.id);
    if (me && me.admin) return true;
    await reply('❌ Bot must be admin to do this. Make bot admin first.');
    return false;
  } catch(e){ await reply('Failed: '+e.message); return false; }
}
function needGroup(ctx){
  if (!ctx.isGroup) { ctx.reply('❌ Group only. Use inside group.'); return false; }
  return true;
}

module.exports = [
{
  name: 'kick', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    if (!await checkBotAdmin(ctx.sock, ctx.from, ctx.reply)) return;
    let target = ctx.F.getTarget(ctx.m, ctx.args);
    if (!target) return ctx.reply(`Reply / tag user to kick.\nUsage: ${ctx.prefix}kick @user`);
    // No kick admin / owner
    try {
      let md = await ctx.sock.groupMetadata(ctx.from);
      let tp = md.participants.find(p=>p.id===target);
      if (tp?.admin) return ctx.reply('❌ Cannot kick admin. Demote first.');
      if (target === ctx.sender) return ctx.reply('❌ You no fit kick yourself.');
    } catch(e){}
    try { await ctx.sock.groupParticipantsUpdate(ctx.from, [target], 'remove'); return ctx.reply(`🚫 Kicked @${target.split('@')[0]}`); } catch(e){ return ctx.reply('Kick failed: '+e.message); }
  }
},
{
  name: 'add', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    if (!await checkBotAdmin(ctx.sock, ctx.from, ctx.reply)) return;
    let num = ctx.F.cleanNumber(ctx.args[0]);
    if (!num) return ctx.reply(`Usage: ${ctx.prefix}add 2348102350169`);
    try { await ctx.sock.groupParticipantsUpdate(ctx.from, [`${num}@s.whatsapp.net`], 'add'); return ctx.reply(`✅ Added +${num}`); } catch(e){ return ctx.reply(`Add failed - user must send request or bot no be admin.\nSend link: ${ctx.prefix}grouplink`); }
  }
},
{
  name: 'promote', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    if (!await checkBotAdmin(ctx.sock, ctx.from, ctx.reply)) return;
    let target = ctx.F.getTarget(ctx.m, ctx.args);
    if (!target) return ctx.reply(`Tag user to promote.\nUsage: ${ctx.prefix}promote @user`);
    try { await ctx.sock.groupParticipantsUpdate(ctx.from, [target], 'promote'); return ctx.reply(`👑 Promoted @${target.split('@')[0]} to admin`); } catch(e){ return ctx.reply('Promote failed: '+e.message+'\nBot must be admin.'); }
  }
},
{
  name: 'demote', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    if (!await checkBotAdmin(ctx.sock, ctx.from, ctx.reply)) return;
    let target = ctx.F.getTarget(ctx.m, ctx.args);
    if (!target) return ctx.reply(`Tag user to demote.\nUsage: ${ctx.prefix}demote @user`);
    try { await ctx.sock.groupParticipantsUpdate(ctx.from, [target], 'demote'); return ctx.reply(`⬇️ Demoted @${target.split('@')[0]}`); } catch(e){ return ctx.reply('Demote failed: '+e.message); }
  }
},
{
  name: 'warn', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    let target = ctx.F.getTarget(ctx.m, ctx.args);
    if (!target) return ctx.reply(`Usage: ${ctx.prefix}warn @user`);
    if (!ctx.db.warns) ctx.db.warns = {};
    if (!ctx.db.warns[ctx.from]) ctx.db.warns[ctx.from]={};
    ctx.db.warns[ctx.from][target] = (ctx.db.warns[ctx.from][target]||0)+1;
    let count = ctx.db.warns[ctx.from][target];
    let max = ctx.db.group?.[ctx.from]?.maxWarn || 3;
    save(ctx.db, ctx.F);
    if (count >= max) {
      ctx.db.warns[ctx.from][target]=0; save(ctx.db, ctx.F);
      if (await checkBotAdmin(ctx.sock, ctx.from, ctx.reply)) {
        await ctx.sock.groupParticipantsUpdate(ctx.from, [target], 'remove').catch(()=>{});
      }
      return ctx.reply(`🚫 @${target.split('@')[0]} kicked - reached ${max} warnings`);
    }
    return ctx.reply(`⚠️ Warned @${target.split('@')[0]}\nWarnings: ${count}/${max}`);
  }
},
{
  name: 'warnings', aliases: ['listwarn'], category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    let target = ctx.F.getTarget(ctx.m, ctx.args);
    if (target) { let c = ctx.db.warns?.[ctx.from]?.[target]||0; return ctx.reply(`⚠️ @${target.split('@')[0]} has ${c} warnings`); }
    let all = ctx.db.warns?.[ctx.from]||{};
    let list = Object.entries(all).filter(([k,v])=>v>0);
    if (!list.length) return ctx.reply('No warnings yet ✅');
    return ctx.reply(`⚠️ *WARNINGS*\n\n`+list.map(([k,v],i)=>`${i+1}. @${k.split('@')[0]} - ${v}`).join('\n'));
  }
},
{
  name: 'resetwarn', aliases: ['unwarn'], category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    let target = ctx.F.getTarget(ctx.m, ctx.args);
    if (!target) return ctx.reply(`Usage: ${ctx.prefix}resetwarn @user`);
    if (ctx.db.warns?.[ctx.from]) ctx.db.warns[ctx.from][target]=0;
    save(ctx.db, ctx.F);
    return ctx.reply(`✅ Reset warnings for @${target.split('@')[0]}`);
  }
},
{
  name: 'mute', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    let target = ctx.F.getTarget(ctx.m, ctx.args);
    if (!target) return ctx.reply(`Usage: ${ctx.prefix}mute @user`);
    if (!ctx.db.muted) ctx.db.muted={};
    if(!ctx.db.muted[ctx.from]) ctx.db.muted[ctx.from]=[];
    if (!ctx.db.muted[ctx.from].includes(target)) ctx.db.muted[ctx.from].push(target);
    save(ctx.db, ctx.F);
    return ctx.reply(`🔇 Muted @${target.split('@')[0]} - bot go delete him msgs`);
  }
},
{
  name: 'unmute', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    let target = ctx.F.getTarget(ctx.m, ctx.args);
    if (!target) return ctx.reply(`Usage: ${ctx.prefix}unmute @user`);
    if (ctx.db.muted?.[ctx.from]) ctx.db.muted[ctx.from]=ctx.db.muted[ctx.from].filter(x=>x!==target);
    save(ctx.db, ctx.F);
    return ctx.reply(`🔊 Unmuted @${target.split('@')[0]}`);
  }
},
{
  name: 'delete', aliases: ['del'], category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    if (!await checkBotAdmin(ctx.sock, ctx.from, ctx.reply)) return;
    let quoted = ctx.m.message?.extendedTextMessage?.contextInfo;
    if (!quoted?.stanzaId) return ctx.reply(`Reply to message to delete.\nUsage: Reply + ${ctx.prefix}delete`);
    try { await ctx.sock.sendMessage(ctx.from, { delete: { remoteJid: ctx.from, fromMe: false, id: quoted.stanzaId, participant: quoted.participant } }); return ctx.reply('🗑️ Deleted'); } catch(e){ return ctx.reply('Delete failed - bot must be admin or message too old'); }
  }
},
{
  name: 'purge', aliases: ['clear'], category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    return ctx.reply(`🧹 Purge: WhatsApp no allow bulk delete.\nUse ${ctx.prefix}delete to delete one by one.`);
  }
},
{
  name: 'tagadmin', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    let md = await ctx.sock.groupMetadata(ctx.from);
    let adm = md.participants.filter(p=>p.admin).map(p=>p.id);
    return ctx.sock.sendMessage(ctx.from, { text: `👑 *TAG ADMIN*\n\n${ctx.text||'Admins needed!'}\n\n`+adm.map(a=>`@${a.split('@')[0]}`).join(' '), mentions: adm });
  }
},
{
  name: 'groupmute', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    if (!await checkBotAdmin(ctx.sock, ctx.from, ctx.reply)) return;
    try { await ctx.sock.groupSettingUpdate(ctx.from, 'announcement'); return ctx.reply('🔒 Group muted - only admins fit chat'); } catch(e){ return ctx.reply('Failed: '+e.message); }
  }
},
{
  name: 'groupunmute', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    if (!await checkBotAdmin(ctx.sock, ctx.from, ctx.reply)) return;
    try { await ctx.sock.groupSettingUpdate(ctx.from, 'not_announcement'); return ctx.reply('🔊 Group unmuted'); } catch(e){ return ctx.reply('Failed: '+e.message); }
  }
},
{
  name: 'lock', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    if (!await checkBotAdmin(ctx.sock, ctx.from, ctx.reply)) return;
    try { await ctx.sock.groupSettingUpdate(ctx.from, 'locked'); return ctx.reply('🔒 Group settings LOCKED - only admins fit change info'); } catch(e){ return ctx.reply('Failed: '+e.message); }
  }
},
{
  name: 'unlock', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    if (!await checkBotAdmin(ctx.sock, ctx.from, ctx.reply)) return;
    try { await ctx.sock.groupSettingUpdate(ctx.from, 'unlocked'); return ctx.reply('🔓 Group settings UNLOCKED'); } catch(e){ return ctx.reply('Failed: '+e.message); }
  }
},
{
  name: 'approve', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    if (!await checkBotAdmin(ctx.sock, ctx.from, ctx.reply)) return;
    try { let req = await ctx.sock.groupRequestParticipantsList(ctx.from); if(!req.length) return ctx.reply('No pending'); for(let r of req) await ctx.sock.groupRequestParticipantsUpdate(ctx.from, [r.jid], 'approve'); return ctx.reply(`✅ Approved ${req.length}`); } catch(e){ return ctx.reply('Failed: '+e.message); }
  }
},
{
  name: 'disapprove', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    if (!await checkBotAdmin(ctx.sock, ctx.from, ctx.reply)) return;
    try { let req = await ctx.sock.groupRequestParticipantsList(ctx.from); if(!req.length) return ctx.reply('No pending'); for(let r of req) await ctx.sock.groupRequestParticipantsUpdate(ctx.from, [r.jid], 'reject'); return ctx.reply(`🚫 Rejected ${req.length}`); } catch(e){ return ctx.reply('Failed: '+e.message); }
  }
},
{
  name: 'restrict', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    let target = ctx.F.getTarget(ctx.m, ctx.args);
    if (!target) return ctx.reply(`Usage: ${ctx.prefix}restrict @user`);
    if(!ctx.db.muted) ctx.db.muted={};
    if(!ctx.db.muted[ctx.from]) ctx.db.muted[ctx.from]=[];
    if(!ctx.db.muted[ctx.from].includes(target)) ctx.db.muted[ctx.from].push(target);
    save(ctx.db, ctx.F);
    return ctx.reply(`🚫 Restricted @${target.split('@')[0]}`);
  }
},
{
  name: 'unrestrict', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    let target = ctx.F.getTarget(ctx.m, ctx.args);
    if (!target) return ctx.reply(`Usage: ${ctx.prefix}unrestrict @user`);
    if(ctx.db.muted?.[ctx.from]) ctx.db.muted[ctx.from]=ctx.db.muted[ctx.from].filter(x=>x!==target);
    save(ctx.db, ctx.F);
    return ctx.reply(`✅ Unrestricted @${target.split('@')[0]}`);
  }
},
{
  name: 'setwarn', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    let n = parseInt(ctx.args[0]);
    if(!n || n < 1 || n > 10) return ctx.reply(`Usage: ${ctx.prefix}setwarn 3`);
    if(!ctx.db.group) ctx.db.group={};
    if(!ctx.db.group[ctx.from]) ctx.db.group[ctx.from]={};
    ctx.db.group[ctx.from].maxWarn = n;
    save(ctx.db, ctx.F);
    return ctx.reply(`✅ Max warn set to ${n} - after ${n} warns, auto kick`);
  }
},
{
  name: 'resetmember', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    let target = ctx.F.getTarget(ctx.m, ctx.args);
    if (!target) return ctx.reply(`Usage: ${ctx.prefix}resetmember @user`);
    if(ctx.db.warns?.[ctx.from]) ctx.db.warns[ctx.from][target]=0;
    if(ctx.db.muted?.[ctx.from]) ctx.db.muted[ctx.from]=ctx.db.muted[ctx.from].filter(x=>x!==target);
    save(ctx.db, ctx.F);
    return ctx.reply(`✅ Reset @${target.split('@')[0]} - warns + mute cleared`);
  }
},
{
  name: 'removeall', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    // ONLY OWNER fit use this dangerous command, no be just admin
    if (!ctx.isOwner) return ctx.reply('❌ Only OWNER fit use removeall. Too dangerous.');
    if (!await checkBotAdmin(ctx.sock, ctx.from, ctx.reply)) return;
    if (ctx.args[0] !== 'confirm') return ctx.reply(`⚠️ DANGER! This go remove ALL members.\nType: ${ctx.prefix}removeall confirm`);
    let md = await ctx.sock.groupMetadata(ctx.from);
    let others = md.participants.filter(p=>!p.admin).map(p=>p.id);
    let removed = 0;
    for(let id of others){ try{ await ctx.sock.groupParticipantsUpdate(ctx.from, [id], 'remove'); removed++; await new Promise(r=>setTimeout(r,1000)); }catch(e){} }
    return ctx.reply(`✅ Removed ${removed} members`);
  }
},
{
  name: 'getadmin', aliases: ['staff'], category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    let md = await ctx.sock.groupMetadata(ctx.from);
    let adm = md.participants.filter(p=>p.admin);
    return ctx.sock.sendMessage(ctx.from, { text: `👑 *STAFF (${adm.length})*\n\n`+adm.map((p,i)=>`${i+1}. @${p.id.split('@')[0]}`).join('\n'), mentions: adm.map(p=>p.id) });
  }
},
{
  name: 'resetgroup', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    if (ctx.args[0] !== 'confirm') return ctx.reply(`Type: ${ctx.prefix}resetgroup confirm to clear warns + mutes + rules`);
    if(ctx.db.warns) ctx.db.warns[ctx.from]={};
    if(ctx.db.muted) ctx.db.muted[ctx.from]=[];
    if(ctx.db.group?.[ctx.from]) { ctx.db.group[ctx.from].rules=''; ctx.db.group[ctx.from].welcomeMsg=''; }
    save(ctx.db, ctx.F);
    return ctx.reply('✅ Group reset - warns, mutes, rules cleared');
  }
},
];
