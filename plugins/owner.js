// commands/owner.js + plugins/owner.js - OWNER MENU REAL by Simon Tech
// REAL - No crash, No demo, Save DB, Real mode/prefix

function getRealMode(db, config){
  return db?.settings?.mode || db?.mode || config?.mode || 'private';
}
function getRealPrefix(db, config){
  return db?.settings?.prefix || config?.prefix || ',';
}

module.exports = [
{
  name: 'menu', aliases: ['help', 'allmenu'], category: 'owner',
  run: async ({ reply, prefix, config, db }) => {
    const { getMenu } = require('../lib/menu');
    let realPrefix = getRealPrefix(db, config);
    return reply(getMenu({ ownerName: config.ownerAlias, prefix: realPrefix, botUser: config.botName, hosting: config.hosting }));
  }
},
{
  name: 'ping', category: 'owner',
  run: async ({ reply, sock }) => {
    let start = Date.now();
    await sock.sendPresenceUpdate('available').catch(()=>{});
    let ms = Date.now() - start;
    return reply(`🏓 *Pong!* ${ms}ms\n⚡ META AI MD Fast ✅\n🕒 ${new Date().toLocaleString('en-NG',{timeZone:'Africa/Lagos'})}`);
  }
},
{
  name: 'alive', category: 'owner',
  run: async ({ reply, config, db, F }) => {
    let mode = getRealMode(db, config);
    let prefix = getRealPrefix(db, config);
    return reply(`◈┈▉ \`meta ai ｍｄ\` ▉┄◈\n\n✅ *I AM ALIVE!*\n\n🤖 Bot: ${config.botName}\n👑 Owner: ${config.ownerAlias}\n⚡ Prefix: ${prefix}\n🌐 Mode: ${mode}\n⏱️ Runtime: ${F ? F.runtime() : 'unknown'}\n🌍 Lagos, Nigeria\n\n©️ created by Simon tech inc`);
  }
},
{
  name: 'owner', category: 'owner',
  run: async ({ reply, sock, config, from }) => {
    // REAL: Send vCard to the person wey ask, no be arguments[0]
    let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${config.ownerAlias}\nORG:Simon Tech Inc;\nTEL;TYPE=CELL;TYPE=VOICE;waid=${config.ownerNumber}:${config.ownerNumber}\nEND:VCARD`;
    try {
      await sock.sendMessage(from, { contacts: { displayName: config.ownerAlias, contacts: [{ displayName: config.ownerAlias, vcard }] } });
    } catch(e){
      return reply(`👑 *OWNER*\nName: ${config.ownerAlias}\nNumber: +${config.ownerNumber}\nWA: https://wa.me/${config.ownerNumber}`);
    }
  }
},
{
  name: 'runtime', category: 'owner',
  run: async ({ reply, F }) => { return reply(`⏱️ *Runtime:* ${F.runtime()}\n\n©️ created by Simon tech inc`); }
},
{
  name: 'botinfo', category: 'owner',
  run: async ({ reply, config, F, db }) => {
    let mode = getRealMode(db, config);
    let prefix = getRealPrefix(db, config);
    return reply(`◈┈▉ \`meta ai ｍｄ\` ▉┄◈\n\n🤖 Bot: ${config.botName}\n👑 Owner: ${config.ownerAlias}\n📞 Owner: +${config.ownerNumber}\n⚡ Prefix: ${prefix}\n🌐 Mode: ${mode}\n🖥️ Hosting: ${config.hosting}\n⏱️ Runtime: ${F.runtime()}\n📦 Total Cmds: 300\n🕒 Timezone: Africa/Lagos\n\n©️ created by Simon tech inc`);
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
  run: async ({ reply, sock, text, prefix }) => {
    if (!text) return reply(`Usage: ${prefix}broadcast Hello everyone`);
    let chats = await sock.groupFetchAllParticipating().catch(()=>({}));
    let ids = Object.keys(chats);
    let sent = 0, failed = 0;
    for (let id of ids) {
      try {
        await sock.sendMessage(id, { text: `📢 *BROADCAST FROM META AI MD*\n\n${text}\n\n©️ created by Simon tech inc` });
        sent++;
        await new Promise(r=>setTimeout(r, 1000)); // REAL anti-ban delay 1s, no be 500ms spam
      } catch(e){ failed++; }
    }
    return reply(`✅ Broadcast done\nSent: ${sent} groups\nFailed: ${failed}`);
  }
},
{
  name: 'setprefix', category: 'owner', ownerOnly: true,
  run: async ({ reply, args, db, config, prefix, F }) => {
    if (!args[0]) return reply(`Usage: ${prefix}setprefix !`);
    const newPrefix = args[0];
    if (newPrefix.length > 2) return reply('❌ Prefix too long. Use 1 char like , ! . #');
    config.prefix = newPrefix;
    config.prefixes = [newPrefix];
    if (!db.settings) db.settings = {};
    db.settings.prefix = newPrefix;
    db.settings.prefixes = [newPrefix];
    if (F) F.saveDB(db); // REAL SAVE - no go reset after restart
    return reply(`✅ Prefix changed to: ${newPrefix}\n\nNow use: ${newPrefix}menu\nOld prefix ${prefix}menu no go work again.`);
  }
},
{
  name: 'setname', aliases: ['setbotname'], category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, text, prefix }) => {
    if (!text) return reply(`Usage: ${prefix}setname META AI MD`);
    await sock.updateProfileName(text).catch((e)=>{ return reply('Failed: '+e.message); });
    return reply(`✅ Bot name changed to: ${text}`);
  }
},
{
  name: 'setbio', aliases: ['setstatus', 'setautobio'], category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, text, prefix }) => {
    if (!text) return reply(`Usage: ${prefix}setbio I am META AI MD`);
    await sock.updateProfileStatus(text).catch((e)=>{ return reply('Bio failed: '+e.message); });
    return reply(`✅ Bio changed to: ${text}`);
  }
},
{
  name: 'setpp', category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, m, F, prefix }) => {
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
    if (!buf) return reply(`Send / reply to image first. ${prefix}setpp`);
    try { await sock.updateProfilePicture(sock.user.id, buf); return reply('✅ Profile pic changed!'); } catch(e){ return reply('Failed: '+e.message); }
  }
},
{
  name: 'join', category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, args, prefix }) => {
    if (!args[0]) return reply(`Usage: ${prefix}join https://chat.whatsapp.com/xxx`);
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
  run: async ({ reply, sock, m, F, args, prefix }) => {
    let target = F.getTarget(m, args);
    if (!target) return reply(`Reply / tag / number. ${prefix}block @user`);
    await sock.updateBlockStatus(target, 'block').catch(()=>{});
    return reply(`🚫 Blocked @${target.split('@')[0]}`);
  }
},
{
  name: 'unblock', category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, m, F, args, prefix }) => {
    let target = F.getTarget(m, args);
    if (!target) return reply(`Reply / tag / number. ${prefix}unblock @user`);
    await sock.updateBlockStatus(target, 'unblock').catch(()=>{});
    return reply(`✅ Unblocked @${target.split('@')[0]}`);
  }
},
{
  name: 'ban', category: 'owner', ownerOnly: true,
  run: async ({ reply, m, F, args, prefix, db }) => {
    let target = F.getTarget(m, args);
    if (!target) return reply(`Usage: ${prefix}ban @user`);
    if (!db.banned) db.banned = [];
    let num = target.split('@')[0].replace(/[^0-9]/g,'');
    if (!db.banned.includes(num)) db.banned.push(num);
    if (F) F.saveDB(db);
    return reply(`🚫 Banned @${num} - bot no go reply am again`);
  }
},
{
  name: 'unban', category: 'owner', ownerOnly: true,
  run: async ({ reply, m, F, args, db, prefix }) => {
    let target = F.getTarget(m, args);
    if (!target) return reply(`Usage: ${prefix}unban @user`);
    if (!db.banned) db.banned = [];
    let num = target.split('@')[0].replace(/[^0-9]/g,'');
    db.banned = db.banned.filter(x=>x!==num);
    if (F) F.saveDB(db);
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
  run: async ({ reply, args, db, F, prefix }) => {
    let num = F.cleanNumber(args[0]);
    if (!num) return reply(`Usage: ${prefix}setowner 2348102350169`);
    db.owners = [num];
    if (!db.settings) db.settings = {};
    db.settings.owner = num;
    if (F) F.saveDB(db);
    return reply(`✅ Main owner set to +${num}`);
  }
},
{
  name: 'addowner', category: 'owner', ownerOnly: true,
  run: async ({ reply, args, db, F, prefix }) => {
    let num = F.cleanNumber(args[0]);
    if (!num) return reply(`Usage: ${prefix}addowner 2348102350169`);
    if (!db.owners) db.owners = ['2348102350169'];
    if (!db.owners.includes(num)) db.owners.push(num);
    if (F) F.saveDB(db);
    return reply(`✅ Added owner +${num}`);
  }
},
{
  name: 'delowner', category: 'owner', ownerOnly: true,
  run: async ({ reply, args, db, F, prefix }) => {
    let num = F.cleanNumber(args[0]);
    if (!db.owners) db.owners = ['2348102350169'];
    db.owners = db.owners.filter(x=>x!==num);
    if (F) F.saveDB(db);
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
  name: 'private', aliases: ['self'], category: 'owner', ownerOnly: true,
  run: async ({ reply, db, config, F, prefix }) => {
    db.settings = db.settings || {};
    db.settings.mode = 'private';
    db.mode = 'private';
    config.mode = 'private';
    if (F && F.saveDB) F.saveDB(db);
    return reply(`🔒 Bot now *PRIVATE* - Only owner fit use am.\n\nYour prefix still be: ${prefix}\nTry: ${prefix}menu\n\nNote: To make am permanent after restart, change config.js mode to 'private' too.`);
  }
},
{
  name: 'public', aliases: ['all'], category: 'owner', ownerOnly: true,
  run: async ({ reply, db, config, F, prefix }) => {
    db.settings = db.settings || {};
    db.settings.mode = 'public';
    db.mode = 'public';
    config.mode = 'public';
    if (F && F.saveDB) F.saveDB(db);
    return reply(`🌍 Bot now *PUBLIC* - Everybody fit use am.\n\nYour prefix still be: ${prefix}\nTry: ${prefix}menu\n\nNote: To make am permanent after restart, change config.js mode to 'public' too.`);
  }
},
{
  name: 'mode', category: 'owner', ownerOnly: true,
  run: async ({ reply, config, db }) => {
    let mode = getRealMode(db, config);
    let prefix = getRealPrefix(db, config);
    return reply(`🌐 *Current Mode:* ${mode.toUpperCase()}\n\n🔒 ${prefix}private = Only you\n🌍 ${prefix}public = Everybody\n\nPrefix: ${prefix}`);
  }
},
{
  name: 'update', category: 'owner', ownerOnly: true,
  run: async ({ reply }) => { return reply('🔄 Update: Pull latest from GitHub and restart.\nOn Render: Manual Deploy > Deploy latest commit'); }
},
{
  name: 'repo', aliases: ['sc', 'script'], category: 'owner',
  run: async ({ reply }) => { return reply('📦 *META AI MD REPO*\n\nGitHub: https://github.com/SimonTech/META-AI-MD\nOwner: Simon Tech\n\n⭐ Star the repo!'); }
},
];
