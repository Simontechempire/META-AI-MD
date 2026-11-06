// plugins/moderator.js - MODERATOR MENU by Simon Tech
// UNIQUE commands only - kick / promote / demote / warn / mute / delete / approve
// already live in group.js. Do NOT duplicate them here - index.js keeps first wins.
// Save DB, Admin + BotAdmin check

function save(db, F){ if (F) F.saveDB(db); }

function findParticipant(md, uid){
  if (!uid) return null;
  let num = String(uid).split('@')[0].replace(/[^0-9]/g, '');
  return (md.participants || []).find(x => x.id === uid || x.phoneNumber === uid || String(x.phoneNumber || '').split('@')[0] === num || String(x.id || '').split('@')[0] === num);
}
function resolveTarget(md, target){
  let p = findParticipant(md, target);
  return p ? p.id : target;
}
// Display real PN, not LID
function displayNum(md, uid){
  if (!uid) return '';
  let p = md ? findParticipant(md, uid) : null;
  if (p?.phoneNumber) return String(p.phoneNumber).split('@')[0].replace(/[^0-9]/g, '');
  return String(uid).split('@')[0].replace(/[^0-9]/g, '');
}
async function getMeta(ctx){
  try {
    if (ctx.F?.getGroupMeta) return await ctx.F.getGroupMeta(ctx.sock, ctx.from);
    return await ctx.sock.groupMetadata(ctx.from);
  } catch(e){ return null; }
}

async function checkAdmin(ctx){
  if (ctx.isOwner) return true;
  if (ctx.isAdmin) return true;
  try {
    let md = await getMeta(ctx);
    let p = findParticipant(md, ctx.sender);
    if (!p && ctx.senderNum) p = findParticipant(md, ctx.senderNum);
    if (!p && ctx.senderPn) p = findParticipant(md, ctx.senderPn);
    if (p && p.admin) return true;
  } catch(e){}
  await ctx.reply('❌ Only admins can use this command.');
  return false;
}
async function checkBotAdmin(ctx){
  if (ctx.isBotAdmin) return true;
  try {
    let md = await getMeta(ctx);
    let sock = ctx.sock;
    let myNum = String(sock.user?.id || '').split(':')[0].replace(/[^0-9]/g, '');
    let myPn = sock.user?.id || '';
    let myLid = String(sock.user?.lid || '').split('@')[0].replace(/[^0-9]/g, '');
    let me = (md?.participants || []).find(p => p.id === myPn || p.phoneNumber === myPn || String(p.phoneNumber || '').split('@')[0] === myNum || String(p.id || '').split('@')[0] === myNum || (myLid && String(p.id || '').split('@')[0] === myLid));
    if (me && me.admin) return true;
    await ctx.reply('❌ The bot must be admin to do this. Make the bot admin first.');
    return false;
  } catch(e){ await ctx.reply('Failed: '+e.message); return false; }
}
function needGroup(ctx){
  if (!ctx.isGroup) { ctx.reply('❌ Group only. Use this command inside a group.'); return false; }
  return true;
}
async function getTargetResolved(ctx){
  let target = ctx.F.getTarget(ctx.m, ctx.args);
  if (!target) return null;
  let md = await getMeta(ctx);
  return { target: resolveTarget(md, target), md };
}

module.exports = [
{
  name: 'add', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    if (!await checkBotAdmin(ctx)) return;
    let num = ctx.F.cleanNumber(ctx.args[0]);
    if (!num) return ctx.reply(`Usage: ${ctx.prefix}add 234XXXXXXXXXX`);
    try { await ctx.sock.groupParticipantsUpdate(ctx.from, [`${num}@s.whatsapp.net`], 'add'); return ctx.reply(`✅ Added +${num}`); } catch(e){ return ctx.reply(`Add failed - user may need to send a request or the bot is not admin.\nSend link: ${ctx.prefix}grouplink`); }
  }
},
{
  name: 'purge', aliases: ['clear'], category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    return ctx.reply(`🧹 Purge: WhatsApp does not allow bulk delete.\nUse ${ctx.prefix}delete to delete messages one by one.`);
  }
},
{
  name: 'tagadmin', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    let md = await getMeta(ctx);
    let adm = (md?.participants || []).filter(p=>p.admin);
    return ctx.sock.sendMessage(ctx.from, { text: `👑 *TAG ADMIN*\n\n${ctx.text||'Admins needed!'}\n\n`+adm.map(a=>`@${displayNum(md, a.id)}`).join(' '), mentions: adm.map(a=>a.id) });
  }
},
{
  name: 'groupmute', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    if (!await checkBotAdmin(ctx)) return;
    try { await ctx.sock.groupSettingUpdate(ctx.from, 'announcement'); return ctx.reply('🔒 Group muted - Only admins can chat.'); } catch(e){ return ctx.reply('Failed: '+e.message); }
  }
},
{
  name: 'groupunmute', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    if (!await checkBotAdmin(ctx)) return;
    try { await ctx.sock.groupSettingUpdate(ctx.from, 'not_announcement'); return ctx.reply('🔊 Group unmuted - Everyone can chat.'); } catch(e){ return ctx.reply('Failed: '+e.message); }
  }
},
{
  name: 'lock', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    if (!await checkBotAdmin(ctx)) return;
    try { await ctx.sock.groupSettingUpdate(ctx.from, 'locked'); return ctx.reply('🔒 Group settings LOCKED - Only admins can change group info.'); } catch(e){ return ctx.reply('Failed: '+e.message); }
  }
},
{
  name: 'unlock', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    if (!await checkBotAdmin(ctx)) return;
    try { await ctx.sock.groupSettingUpdate(ctx.from, 'unlocked'); return ctx.reply('🔓 Group settings UNLOCKED.'); } catch(e){ return ctx.reply('Failed: '+e.message); }
  }
},
{
  name: 'restrict', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    let r = await getTargetResolved(ctx);
    if (!r?.target) return ctx.reply(`Usage: ${ctx.prefix}restrict @user`);
    let target = r.target;
    if(!ctx.db.muted) ctx.db.muted={};
    if(!ctx.db.muted[ctx.from]) ctx.db.muted[ctx.from]=[];
    if(!ctx.db.muted[ctx.from].includes(target)) ctx.db.muted[ctx.from].push(target);
    save(ctx.db, ctx.F);
    return ctx.reply(`🚫 Restricted @${displayNum(r.md, target)} - The bot will delete their messages.`, { mentions: [target] });
  }
},
{
  name: 'unrestrict', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    let r = await getTargetResolved(ctx);
    if (!r?.target) return ctx.reply(`Usage: ${ctx.prefix}unrestrict @user`);
    let target = r.target;
    if(ctx.db.muted?.[ctx.from]) ctx.db.muted[ctx.from]=ctx.db.muted[ctx.from].filter(x=>x!==target);
    save(ctx.db, ctx.F);
    return ctx.reply(`✅ Unrestricted @${displayNum(r.md, target)}`, { mentions: [target] });
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
    return ctx.reply(`✅ Max warnings set to ${n} - After ${n} warnings, auto-kick.`);
  }
},
{
  name: 'resetmember', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    let r = await getTargetResolved(ctx);
    if (!r?.target) return ctx.reply(`Usage: ${ctx.prefix}resetmember @user`);
    let target = r.target;
    if(ctx.db.warns?.[ctx.from]) ctx.db.warns[ctx.from][target]=0;
    if(ctx.db.muted?.[ctx.from]) ctx.db.muted[ctx.from]=ctx.db.muted[ctx.from].filter(x=>x!==target);
    save(ctx.db, ctx.F);
    return ctx.reply(`✅ Reset @${displayNum(r.md, target)} - Warnings + mute cleared.`, { mentions: [target] });
  }
},
{
  name: 'removeall', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    // ONLY OWNER can use this dangerous command, not just admin
    if (!ctx.isOwner) return ctx.reply('❌ Only the OWNER can use removeall. Too dangerous.');
    if (!await checkBotAdmin(ctx)) return;
    if (ctx.args[0] !== 'confirm') return ctx.reply(`⚠️ DANGER! This will remove ALL members.\nType: ${ctx.prefix}removeall confirm`);
    let md = await getMeta(ctx);
    let others = (md?.participants || []).filter(p=>!p.admin).map(p=>p.id);
    let removed = 0;
    for(let id of others){ try{ await ctx.sock.groupParticipantsUpdate(ctx.from, [id], 'remove'); removed++; await new Promise(r=>setTimeout(r,1000)); }catch(e){} }
    return ctx.reply(`✅ Removed ${removed} members.`);
  }
},
{
  name: 'getadmin', aliases: ['staff'], category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    let md = await getMeta(ctx);
    let adm = (md?.participants || []).filter(p=>p.admin);
    return ctx.sock.sendMessage(ctx.from, { text: `👑 *STAFF (${adm.length})*\n\n`+adm.map((p,i)=>`${i+1}. @${displayNum(md, p.id)}`).join('\n'), mentions: adm.map(p=>p.id) });
  }
},
{
  name: 'resetgroup', category: 'moderator', groupOnly: true,
  run: async (ctx) => {
    if (!needGroup(ctx)) return;
    if (!await checkAdmin(ctx)) return;
    if (ctx.args[0] !== 'confirm') return ctx.reply(`Type: ${ctx.prefix}resetgroup confirm to clear warnings + mutes + rules`);
    if(ctx.db.warns) ctx.db.warns[ctx.from]={};
    if(ctx.db.muted) ctx.db.muted[ctx.from]=[];
    if(ctx.db.group?.[ctx.from]) { ctx.db.group[ctx.from].rules=''; ctx.db.group[ctx.from].welcomeMsg=''; }
    save(ctx.db, ctx.F);
    return ctx.reply('✅ Group reset - Warnings, mutes, rules cleared.');
  }
},
];
