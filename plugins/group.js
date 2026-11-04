// commands/group.js - GROUP MENU 111-140 by Simon Tech

module.exports = [
{
  name: 'groupinfo', aliases: ['gcinfo'], category: 'group',
  run: async ({ reply, sock, from, isGroup }) => {
    if (!isGroup) return reply('Use in group');
    let md = await sock.groupMetadata(from);
    return reply(`◈┈▉ \`meta ai ｍｄ\` ▉┄◈\n\n*🏠 GROUP INFO*\n\n📌 Name: ${md.subject}\n🆔 ID: ${md.id}\n👥 Members: ${md.participants.length}\n👑 Admins: ${md.participants.filter(p=>p.admin).length}\n📝 Desc: ${md.desc || 'No desc'}\n📅 Created: ${new Date(md.creation*1000).toLocaleDateString('en-NG')}\n\n©️ created by Simon tech inc`);
  }
},
{
  name: 'grouplink', aliases: ['link', 'invite link'], category: 'group',
  run: async ({ reply, sock, from, isGroup }) => {
    if (!isGroup) return reply('Use in group');
    try { let code = await sock.groupInviteCode(from); return reply(`🔗 *GROUP LINK*\nhttps://chat.whatsapp.com/${code}`); } catch(e){ return reply('Bot must be admin'); }
  }
},
{
  name: 'setgroupname', aliases: ['setgname'], category: 'group',
  run: async ({ reply, sock, from, isGroup, text }) => {
    if (!isGroup) return reply('Use in group');
    if (!text) return reply('Usage: .setgroupname New Name');
    try { await sock.groupUpdateSubject(from, text); return reply(`✅ Group name changed to: ${text}`); } catch(e){ return reply('Bot must be admin'); }
  }
},
{
  name: 'setdesc', aliases: ['setgroupdesc'], category: 'group',
  run: async ({ reply, sock, from, isGroup, text }) => {
    if (!isGroup) return reply('Use in group');
    if (!text) return reply('Usage: .setdesc New description');
    try { await sock.groupUpdateDescription(from, text); return reply(`✅ Desc changed`); } catch(e){ return reply('Bot must be admin'); }
  }
},
{
  name: 'open', category: 'group',
  run: async ({ reply, sock, from, isGroup }) => {
    if (!isGroup) return reply('Use in group');
    try { await sock.groupSettingUpdate(from, 'not_announcement'); return reply('✅ Group OPEN - everybody fit chat'); } catch(e){ return reply('Bot must be admin'); }
  }
},
{
  name: 'close', category: 'group',
  run: async ({ reply, sock, from, isGroup }) => {
    if (!isGroup) return reply('Use in group');
    try { await sock.groupSettingUpdate(from, 'announcement'); return reply('🔒 Group CLOSED - only admins fit chat'); } catch(e){ return reply('Bot must be admin'); }
  }
},
{
  name: 'tagall', category: 'group',
  run: async ({ reply, sock, from, isGroup, text }) => {
    if (!isGroup) return reply('Use in group');
    let md = await sock.groupMetadata(from);
    let mem = md.participants.map(p=>p.id);
    let txt = `📢 *TAGALL*\n\n${text || 'Hello everyone!'}\n\n` + mem.map(m=>`@${m.split('@')[0]}`).join(' ');
    return sock.sendMessage(from, { text: txt, mentions: mem });
  }
},
{
  name: 'hidetag', category: 'group',
  run: async ({ reply, sock, from, isGroup, text }) => {
    if (!isGroup) return reply('Use in group');
    let md = await sock.groupMetadata(from);
    let mem = md.participants.map(p=>p.id);
    return sock.sendMessage(from, { text: text || '👋 Hello', mentions: mem });
  }
},
{
  name: 'listmembers', aliases: ['members', 'groupmembers'], category: 'group',
  run: async ({ reply, sock, from, isGroup }) => {
    if (!isGroup) return reply('Use in group');
    let md = await sock.groupMetadata(from);
    let txt = `👥 *MEMBERS (${md.participants.length})*\n\n` + md.participants.map((p,i)=>`${i+1}. @${p.id.split('@')[0]} ${p.admin ? '👑' : ''}`).join('\n');
    return sock.sendMessage(from, { text: txt, mentions: md.participants.map(p=>p.id) });
  }
},
{
  name: 'admins', category: 'group',
  run: async ({ reply, sock, from, isGroup }) => {
    if (!isGroup) return reply('Use in group');
    let md = await sock.groupMetadata(from);
    let adm = md.participants.filter(p=>p.admin);
    let txt = `👑 *ADMINS (${adm.length})*\n\n` + adm.map((p,i)=>`${i+1}. @${p.id.split('@')[0]}`).join('\n');
    return sock.sendMessage(from, { text: txt, mentions: adm.map(p=>p.id) });
  }
},
{
  name: 'getpic', aliases: ['grouppic'], category: 'group',
  run: async ({ reply, sock, from, isGroup, m, F, args }) => {
    if (!isGroup) return reply('Use in group');
    try { let url = await sock.profilePictureUrl(from, 'image'); return sock.sendMessage(from, { image: { url }, caption: '🏠 Group Pic' }, { quoted: m }); } catch(e){ return reply('No group pic or failed'); }
  }
},
{
  name: 'setgroup', category: 'group',
  run: async ({ reply }) => { return reply('Usage: .setgroupname / .setdesc / .setwelcome\n\nExample: .setgroupname META FANS'); }
},
{
  name: 'resetlink', aliases: ['revoke'], category: 'group',
  run: async ({ reply, sock, from, isGroup }) => {
    if (!isGroup) return reply('Use in group');
    try { let code = await sock.groupRevokeInvite(from); return reply(`✅ Link revoked!\nNew link: https://chat.whatsapp.com/${code}`); } catch(e){ return reply('Bot must be admin'); }
  }
},
{
  name: 'invite', category: 'group',
  run: async ({ reply, sock, from, isGroup, m, F, args }) => {
    if (!isGroup) return reply('Use in group');
    let target = F.getTarget(m, args);
    if (!target) return reply('Usage: .invite 2348102350169');
    try { await sock.groupAdd(from, [target]); return reply(`✅ Invited @${target.split('@')[0]}`); } catch(e){ return reply('Invite failed: '+e.message+'\nTry .grouplink and send link'); }
  }
},
{
  name: 'accept', category: 'group',
  run: async ({ reply, sock, from, isGroup }) => {
    if (!isGroup) return reply('Use in group');
    try { let req = await sock.groupRequestParticipantsList(from); if(!req.length) return reply('No pending requests'); for(let r of req) await sock.groupRequestParticipantsUpdate(from, [r.jid], 'approve'); return reply(`✅ Approved ${req.length} requests`); } catch(e){ return reply('Bot must be admin'); }
  }
},
{
  name: 'reject', category: 'group',
  run: async ({ reply, sock, from, isGroup }) => {
    if (!isGroup) return reply('Use in group');
    try { let req = await sock.groupRequestParticipantsList(from); if(!req.length) return reply('No pending requests'); for(let r of req) await sock.groupRequestParticipantsUpdate(from, [r.jid], 'reject'); return reply(`🚫 Rejected ${req.length} requests`); } catch(e){ return reply('Bot must be admin'); }
  }
},
{
  name: 'welcome', category: 'group',
  run: async ({ reply, sock, from, isGroup, args, db }) => {
    if (!isGroup) return reply('Use in group');
    if(!db.group) db.group = {}; if(!db.group[from]) db.group[from]={};
    let v = (args[0]||'').toLowerCase(); if(v==='on'||v==='off') db.group[from].welcome = v==='on';
    return reply(`👋 Welcome is ${db.group[from].welcome ? 'ON ✅' : 'OFF ❌'}\nUsage: .welcome on / off`);
  }
},
{
  name: 'goodbye', category: 'group',
  run: async ({ reply, from, isGroup, args, db }) => {
    if (!isGroup) return reply('Use in group');
    if(!db.group) db.group = {}; if(!db.group[from]) db.group[from]={};
    let v = (args[0]||'').toLowerCase(); if(v==='on'||v==='off') db.group[from].goodbye = v==='on';
    return reply(`👋 Goodbye is ${db.group[from].goodbye ? 'ON ✅' : 'OFF ❌'}\nUsage: .goodbye on / off`);
  }
},
{
  name: 'setwelcome', category: 'group',
  run: async ({ reply, from, isGroup, text, db }) => {
    if (!isGroup) return reply('Use in group');
    if (!text) return reply('Usage: .setwelcome Welcome @user to group!');
    if(!db.group) db.group={}; if(!db.group[from]) db.group[from]={};
    db.group[from].welcomeMsg = text;
    return reply(`✅ Welcome msg set:\n${text}`);
  }
},
{
  name: 'setgoodbye', category: 'group',
  run: async ({ reply, from, isGroup, text, db }) => {
    if (!isGroup) return reply('Use in group');
    if (!text) return reply('Usage: .setgoodbye Bye @user 😢');
    if(!db.group) db.group={}; if(!db.group[from]) db.group[from]={};
    db.group[from].goodbyeMsg = text;
    return reply(`✅ Goodbye msg set:\n${text}`);
  }
},
{
  name: 'poll', category: 'group',
  run: async ({ reply, sock, from, isGroup, text }) => {
    if (!isGroup) return reply('Use in group');
    if (!text) return reply('Usage: .poll Question | Option1 | Option2');
    let parts = text.split('|').map(s=>s.trim()).filter(Boolean);
    if (parts.length < 3) return reply('Usage: .poll Best player? | Messi | Ronaldo');
    try { await sock.sendMessage(from, { poll: { name: parts[0], values: parts.slice(1), selectableCount: 1 } }); } catch(e){ return reply('Poll failed: '+e.message); }
  }
},
{
  name: 'vote', category: 'group',
  run: async ({ reply }) => { return reply('🗳️ To vote, tap option for poll above.\nCreate poll: .poll Question | Yes | No'); }
},
{
  name: 'endpoll', category: 'group',
  run: async ({ reply }) => { return reply('Poll go end by itself. Or delete poll message.'); }
},
{
  name: 'groupid', category: 'group',
  run: async ({ reply, from, isGroup }) => {
    if (!isGroup) return reply('Use in group');
    return reply(`🆔 Group ID:\n${from}`);
  }
},
{
  name: 'setrules', category: 'group',
  run: async ({ reply, from, isGroup, text, db }) => {
    if (!isGroup) return reply('Use in group');
    if (!text) return reply('Usage: .setrules 1. No spam 2. Respect all');
    if(!db.group) db.group={}; if(!db.group[from]) db.group[from]={};
    db.group[from].rules = text;
    return reply(`✅ Rules set!`);
  }
},
{
  name: 'rules', aliases: ['getrules'], category: 'group',
  run: async ({ reply, from, isGroup, db }) => {
    if (!isGroup) return reply('Use in group');
    let r = db.group?.[from]?.rules;
    return reply(r ? `📜 *GROUP RULES*\n\n${r}` : 'No rules set. Admin use .setrules');
  }
},
];
