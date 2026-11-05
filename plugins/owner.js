// commands/owner.js - OWNER MENU 1-30 by Simon Tech

module.exports = [
{
  name: 'menu', aliases: ['help', 'allmenu'], category: 'owner',
  run: async ({ reply, prefix, config }) => {
    const { getMenu } = require('../lib/menu');
    return reply(getMenu({ ownerName: config.ownerAlias, prefix, botUser: config.botName, hosting: config.hosting }));
  }
},
{
  name: 'ping', category: 'owner',
  run: async ({ reply }) => {
    let start = Date.now();
    await reply('🏓 Pong...');
    let ms = Date.now() - start;
    return reply(`🏓 *Pong!* ${ms}ms\n⚡ META AI MD Fast ✅`);
  }
},
{
  name: 'alive', category: 'owner',
  run: async ({ reply, config }) => {
    return reply(`◈┈▉ \`meta ai ｍｄ\` ▉┄◈\n\n✅ *I AM ALIVE!*\n\n🤖 Bot: ${config.botName}\n👑 Owner: ${config.ownerAlias}\n⚡ Prefix: ${config.prefix}\n🌍 Lagos, Nigeria\n\n©️ created by Simon tech inc`);
  }
},
{
  name: 'owner', category: 'owner',
  run: async ({ reply, sock, config }) => {
    return sock.sendMessage(''+arguments[0], { contacts: { displayName: config.ownerAlias, contacts: [{ displayName: config.ownerAlias, vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${config.ownerAlias}\nORG:Simon Tech Inc;\nTEL;TYPE=CELL;TYPE=VOICE;waid=${config.ownerNumber}:${config.ownerNumber}\nEND:VCARD` }] } }).catch(async()=>{
      return reply(`👑 *OWNER*\nName: ${config.ownerAlias}\nNumber: +${config.ownerNumber}\nWA: https://wa.me/${config.ownerNumber}`);
    });
  }
},
{
  name: 'runtime', category: 'owner',
  run: async ({ reply, F }) => { return reply(`⏱️ *Runtime:* ${F.runtime()}\n\n©️ created by Simon tech inc`); }
},
{
  name: 'botinfo', category: 'owner',
  run: async ({ reply, sock, config, F }) => {
    return reply(`◈┈▉ \`meta ai ｍｄ\` ▉┄◈\n\n🤖 Bot: ${config.botName}\n👑 Owner: ${config.ownerAlias}\n📞 Owner: +${config.ownerNumber}\n⚡ Prefix: ${config.prefix}\n🌐 Mode: ${config.mode}\n🖥️ Hosting: ${config.hosting}\n⏱️ Runtime: ${F.runtime()}\n📦 Total Cmds: 300\n🕒 Timezone: Africa/Lagos\n\n©️ created by Simon tech inc`);
  }
},
{
  name: 'restart', category: 'owner', ownerOnly: true,
  run: async ({ reply }) => { await reply('🔄 Restarting META AI MD...'); setTimeout(()=> process.exit(0), 1500); }
},
{
  name: 'shutdown', category: 'owner', ownerOnly: true,
  run: async ({ reply }) => { await reply('🛑 Shutting down... Bye 👋'); setTimeout(()=> process.exit(0), 1000); }
},
{
  name: 'broadcast', aliases: ['bc'], category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, text, args }) => {
    if (!text) return reply('Usage: .broadcast Hello everyone');
    let chats = await sock.groupFetchAllParticipating().catch(()=>({}));
    let ids = Object.keys(chats);
    let sent = 0;
    for (let id of ids) { try { await sock.sendMessage(id, { text: `📢 *BROADCAST FROM META AI MD*\n\n${text}\n\n©️ created by Simon tech inc` }); sent++; await new Promise(r=>setTimeout(r, 500)); } catch(e){} }
    return reply(`✅ Broadcast sent to ${sent} groups`);
  }
},
{
  name: 'setprefix', category: 'owner', ownerOnly: true,
  run: async ({ reply, args, db }) => {
    if (!args[0]) return reply('Usage: .setprefix !');
    if (!db.settings) db.settings = {};
    db.settings.prefix = args[0];
    return reply(`✅ Prefix changed to: ${args[0]}`);
  }
},
{
  name: 'setname', aliases: ['setbotname'], category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, text }) => {
    if (!text) return reply('Usage: .setname META AI MD');
    await sock.updateProfileName(text).catch(()=>{});
    return reply(`✅ Bot name changed to: ${text}`);
  }
},
{
  name: 'setbio', aliases: ['setstatus', 'setautobio'], category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, text }) => {
    if (!text) return reply('Usage: .setbio I am META AI MD');
    await sock.updateProfileStatus(text).catch((e)=>{ return reply('Bio failed: '+e.message); });
    return reply(`✅ Bio changed to: ${text}`);
  }
},
{
  name: 'setpp', category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, m, F }) => {
    let buf = await F.downloadMedia(m).catch(()=>null);
    if (!buf) return reply('Send / reply to image first. .setpp');
    try { await sock.updateProfilePicture(sock.user.id, buf); return reply('✅ Profile pic changed!'); } catch(e){ return reply('Failed: '+e.message); }
  }
},
{
  name: 'join', category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, args }) => {
    if (!args[0]) return reply('Usage: .join https://chat.whatsapp.com/xxx');
    let link = args[0].split('/').pop();
    try { let r = await sock.groupAcceptInvite(link); return reply(`✅ Joined group: ${r}`); } catch(e){ return reply('Join failed: '+e.message); }
  }
},
{
  name: 'leave', category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, from, isGroup }) => {
    if (!isGroup) return reply('Use in group');
    await reply('👋 Leaving... Bye!');
    await sock.groupLeave(from).catch(()=>{});
  }
},
{
  name: 'block', category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, m, F, args }) => {
    let target = F.getTarget(m, args);
    if (!target) return reply('Reply / tag / number. .block @user');
    await sock.updateBlockStatus(target, 'block').catch(()=>{});
    return reply(`🚫 Blocked @${target.split('@')[0]}`);
  }
},
{
  name: 'unblock', category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, m, F, args }) => {
    let target = F.getTarget(m, args);
    if (!target) return reply('Reply / tag / number. .unblock @user');
    await sock.updateBlockStatus(target, 'unblock').catch(()=>{});
    return reply(`✅ Unblocked @${target.split('@')[0]}`);
  }
},
{
  name: 'ban', category: 'owner', ownerOnly: true,
  run: async ({ reply, m, F, args, db }) => {
    let target = F.getTarget(m, args);
    if (!target) return reply('Usage: .ban @user');
    if (!db.banned) db.banned = [];
    let num = target.split('@')[0];
    if (!db.banned.includes(num)) db.banned.push(num);
    return reply(`🚫 Banned @${num} - bot no go reply am again`);
  }
},
{
  name: 'unban', category: 'owner', ownerOnly: true,
  run: async ({ reply, m, F, args, db }) => {
    let target = F.getTarget(m, args);
    if (!target) return reply('Usage: .unban @user');
    if (!db.banned) db.banned = [];
    let num = target.split('@')[0];
    db.banned = db.banned.filter(x=>x!==num);
    return reply(`✅ Unbanned @${num}`);
  }
},
{
  name: 'clearsession', category: 'owner', ownerOnly: true,
  run: async ({ reply }) => {
    const fs = require('fs');
    try { fs.rmSync('./Meta', { recursive: true, force: true }); return reply('✅ Session cleared. Restart bot and pair again.'); } catch(e){ return reply('Failed: '+e.message); }
  }
},
{
  name: 'getsession', category: 'owner', ownerOnly: true,
  run: async ({ reply }) => { return reply('📁 Session folder: ./Meta\nOn Render, go to Files > Meta to copy session. Or re-pair with new code.'); }
},
{
  name: 'setowner', category: 'owner', ownerOnly: true,
  run: async ({ reply, args, db, F }) => {
    let num = F.cleanNumber(args[0]);
    if (!num) return reply('Usage: .setowner 2348102350169');
    db.owners = [num];
    return reply(`✅ Main owner set to +${num}`);
  }
},
{
  name: 'addowner', category: 'owner', ownerOnly: true,
  run: async ({ reply, args, db, F }) => {
    let num = F.cleanNumber(args[0]);
    if (!num) return reply('Usage: .addowner 2348102350169');
    if (!db.owners) db.owners = ['2348102350169'];
    if (!db.owners.includes(num)) db.owners.push(num);
    return reply(`✅ Added owner +${num}`);
  }
},
{
  name: 'delowner', category: 'owner', ownerOnly: true,
  run: async ({ reply, args, db, F }) => {
    let num = F.cleanNumber(args[0]);
    if (!db.owners) db.owners = ['2348102350169'];
    db.owners = db.owners.filter(x=>x!==num);
    return reply(`✅ Removed owner +${num}`);
  }
},
{
  name: 'listowner', category: 'owner', ownerOnly: true,
  run: async ({ reply, db }) => {
    let owners = db.owners || ['2348102350169'];
    return reply(`👑 *OWNERS LIST*\n\n${owners.map((o,i)=>`${i+1}. +${o}`).join('\n')}`);
  }
},
{
  if(cmdName === 'private' || cmdName === 'self'){
  db.settings = db.settings || {};
  db.settings.mode = 'private';
  db.mode = 'private';
  config.mode = 'private'; // update live config too
  if(F) F.saveDB(db);
  return await reply('Bot now PRIVATE - Only owner fit use am.\nNote: To make am permanent after restart, change config.js mode to private too.');
}
if(cmdName === 'public'){
  db.settings = db.settings || {};
  db.settings.mode = 'public';
  db.mode = 'public';
  config.mode = 'public';
  if(F) F.saveDB(db);
  return await reply('Bot now PUBLIC - Everybody fit use am.');
  }
  name: 'update', category: 'owner', ownerOnly: true,
  run: async ({ reply }) => { return reply('🔄 Update: Pull latest from GitHub and restart.\nOn Render: Manual Deploy > Deploy latest commit'); }
},
{
  name: 'repo', aliases: ['sc', 'script'], category: 'owner',
  run: async ({ reply }) => { return reply('📦 *META AI MD REPO*\n\nGitHub: https://github.com/SimonTech/META-AI-MD\nOwner: Simon Tech\n\n⭐ Star the repo!'); }
},
];
