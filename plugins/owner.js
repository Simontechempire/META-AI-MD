// plugins/owner.js - OWNER MENU by Simon Tech
// Public First + mode actually changes mode now

function getRealMode(db, config){
  // DB must win - this is what the user changed with ,mode. Config is only default for first start.
  if (db?.settings?.mode) return db.settings.mode;
  if (db?.mode) return db.mode;
  if (config?.forceConfigMode && config?.mode) return config.mode;
  return config?.mode || 'public';
}
function getRealPrefix(db, config){
  // Same for prefix - DB first, so ,setprefix does not reset
  if (db?.settings?.prefix) return db.settings.prefix;
  if (config?.forceConfigPrefix && config?.prefix) return config.prefix;
  return config?.prefix || '.';
}
// Ban must store both LID + PN so it matches in DM and group
function getBanNums(ctx, target){
  let nums = [];
  let raw = String(target || '').split('@')[0].replace(/[^0-9]/g, '');
  if (raw) nums.push(raw);
  try {
    let ctxInfo = ctx.m?.message?.extendedTextMessage?.contextInfo || ctx.m?.message?.imageMessage?.contextInfo || ctx.m?.message?.videoMessage?.contextInfo || {};
    // Real PN is in participantPn, not mentionedJid (mentionedJid is often LID)
    let pn = String(ctxInfo.participantPn || '').split('@')[0].replace(/[^0-9]/g, '');
    if (pn && pn !== raw && !nums.includes(pn)) nums.push(pn);
    // Quoted message PN
    let qPn = String(ctxInfo.quotedMessage ? (ctx.m?.key?.participantPn || '') : '').split('@')[0].replace(/[^0-9]/g, '');
    if (qPn && qPn !== raw && !nums.includes(qPn)) nums.push(qPn);
    // Sender PN itself - for reply-to-self ban
    let senderPn = String(ctx.m?.key?.participantPn || ctx.m?.key?.remoteJidAlt || '').split('@')[0].replace(/[^0-9]/g, '');
    if (senderPn && senderPn !== raw && target && String(target).includes(senderPn)) nums.push(senderPn);
  } catch(e){}
  return nums;
}
function getTargetPn(m, target){
  // Return real PN for mentions, fallback to target
  let pn = m?.key?.participantPn || m?.key?.remoteJidAlt || '';
  if (pn && target && String(target).split('@')[0] !== String(pn).split('@')[0]) {
    // Target is LID, PN is different - prefer PN for display
    return pn;
  }
  return target;
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
  run: async ({ reply, sock, config }) => {
    let start = Date.now();
    await sock.sendPresenceUpdate('available').catch(()=>{});
    let ms = Date.now() - start;
    return reply(`🏓 *Pong!* ${ms}ms\n⚡ META AI MD - Fast\n🕒 ${new Date().toLocaleString('en-US',{timeZone: config?.timezone || 'Africa/Lagos'})}`);
  }
},
{
  name: 'alive', category: 'owner',
  run: async ({ reply, config, db, F }) => {
    let mode = getRealMode(db, config);
    let prefix = getRealPrefix(db, config);
    return reply(`◈┈▉ \`META AI MD\` ▉┄◈\n\n✅ *I AM ALIVE!*\n\n🤖 Bot: ${config.botName}\n👑 Owner: ${config.ownerAlias}\n⚡ Prefix: ${prefix}\n🌐 Mode: ${mode}\n⏱️ Runtime: ${F ? F.runtime() : 'unknown'}\n\n©️ Created by Simon Tech Inc`);
  }
},
{
  name: 'owner', category: 'owner',
  run: async ({ reply, sock, config, from }) => {
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
  run: async ({ reply, F }) => { return reply(`⏱️ *Runtime:* ${F.runtime()}\n\n©️ Created by Simon Tech Inc`); }
},
{
  name: 'botinfo', category: 'owner',
  run: async ({ reply, config, F, db }) => {
    let mode = getRealMode(db, config);
    let prefix = getRealPrefix(db, config);
    return reply(`◈┈▉ \`META AI MD\` ▉┄◈\n\n🤖 Bot: ${config.botName}\n👑 Owner: ${config.ownerAlias}\n📞 Owner: +${config.ownerNumber}\n⚡ Prefix: ${prefix}\n🌐 Mode: ${mode}\n🖥️ Hosting: ${config.hosting}\n⏱️ Runtime: ${F.runtime()}\n📦 Total Commands: 300\n🕒 Timezone: ${config.timezone || 'Africa/Lagos'}\n\n©️ Created by Simon Tech Inc`);
  }
},
{
  name: 'restart', category: 'owner', ownerOnly: true,
  run: async ({ reply }) => { await reply('🔄 Restarting META AI MD...'); setTimeout(()=> process.exit(0), 1500); }
},
{
  name: 'shutdown', category: 'owner', ownerOnly: true,
  run: async ({ reply }) => { await reply('🛑 Shutting down... Goodbye 👋'); setTimeout(()=> process.exit(0), 1000); }
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
        await sock.sendMessage(id, { text: `📢 *BROADCAST FROM META AI MD*\n\n${text}\n\n©️ Created by Simon Tech Inc` });
        sent++;
        await new Promise(r=>setTimeout(r, 1000));
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
    if (newPrefix.length > 2) return reply('❌ Prefix too long. Use 1 character like , ! . #');
    // Keep all old prefixes, put new one first - do not delete . , ! etc
    let oldList = Array.isArray(config.prefixes) ? config.prefixes : [config.prefix || '.'];
    let newList = [newPrefix, ...oldList.filter(p => p !== newPrefix)];
    config.prefix = newPrefix;
    config.prefixes = newList;
    config.forceConfigPrefix = false;
    if (!db.settings) db.settings = {};
    db.settings.prefix = newPrefix;
    db.settings.prefixes = newList;
    if (F) F.saveDB(db);
    return reply(`✅ Prefix changed to: ${newPrefix}\n\nNow use: ${newPrefix}menu\nAll old prefixes still work too.`);
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
    if (!buf) return reply(`Send / reply to an image first. ${prefix}setpp`);
    try { await sock.updateProfilePicture(sock.user.id, buf); return reply('✅ Profile picture changed!'); } catch(e){ return reply('Failed: '+e.message); }
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
    if (!isGroup) return reply('Use this command in a group.');
    await reply('👋 Leaving... Goodbye!');
    await sock.groupLeave(from).catch(()=>{});
  }
},
{
  name: 'block', category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, m, F, args, prefix }) => {
    let target = F.getTarget(m, args);
    if (!target) return reply(`Reply / tag / number. ${prefix}block @user`);
    await sock.updateBlockStatus(target, 'block').catch(()=>{});
    let pn = getTargetPn(m, target);
    return reply(`🚫 Blocked @${String(pn).split('@')[0]}`, { mentions: [pn] });
  }
},
{
  name: 'unblock', category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, m, F, args, prefix }) => {
    let target = F.getTarget(m, args);
    if (!target) return reply(`Reply / tag / number. ${prefix}unblock @user`);
    await sock.updateBlockStatus(target, 'unblock').catch(()=>{});
    let pn = getTargetPn(m, target);
    return reply(`✅ Unblocked @${String(pn).split('@')[0]}`, { mentions: [pn] });
  }
},
{
  name: 'ban', category: 'owner', ownerOnly: true,
  run: async (ctx) => {
    let { reply, m, F, args, prefix, db } = ctx;
    let target = F.getTarget(m, args);
    if (!target) return reply(`Usage: ${prefix}ban @user`);
    if (!db.banned) db.banned = [];
    let nums = getBanNums(ctx, target);
    for (let num of nums) if (!db.banned.includes(num)) db.banned.push(num);
    if (F) F.saveDB(db);
    let pn = getTargetPn(m, target);
    return reply(`🚫 Banned @${String(pn).split('@')[0]} - The bot will no longer reply to them.`, { mentions: [pn] });
  }
},
{
  name: 'unban', category: 'owner', ownerOnly: true,
  run: async (ctx) => {
    let { reply, m, F, args, db, prefix } = ctx;
    let target = F.getTarget(m, args);
    if (!target) return reply(`Usage: ${prefix}unban @user`);
    if (!db.banned) db.banned = [];
    let nums = getBanNums(ctx, target);
    db.banned = db.banned.filter(x=>!nums.includes(x));
    if (F) F.saveDB(db);
    let pn = getTargetPn(m, target);
    return reply(`✅ Unbanned @${String(pn).split('@')[0]}`, { mentions: [pn] });
  }
},
{
  name: 'clearsession', category: 'owner', ownerOnly: true,
  run: async ({ reply }) => {
    const fs = require('fs');
    try { fs.rmSync('./Meta', { recursive: true, force: true }); return reply('✅ Session cleared. Restart the bot and pair again.'); } catch(e){ return reply('Failed: '+e.message); }
  }
},
{
  name: 'getsession', category: 'owner', ownerOnly: true,
  run: async ({ reply }) => { return reply('📁 Session folder: ./Meta\nOn Render, go to Files > Meta to copy the session. Or re-pair with a new code.'); }
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
    if (!num) return reply(`Usage: ${prefix}delowner 2348102350169`);
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
    if (config) { config.mode = 'private'; config.forceConfigMode = false; }
    if (F && F.saveDB) F.saveDB(db);
    return reply(`🔒 Bot is now *PRIVATE* - Only the owner can use it.\n\nYour prefix is still: ${prefix}\nTry: ${prefix}menu`);
  }
},
{
  name: 'public', aliases: ['all'], category: 'owner', ownerOnly: true,
  run: async ({ reply, db, config, F, prefix }) => {
    db.settings = db.settings || {};
    db.settings.mode = 'public';
    db.mode = 'public';
    if (config) { config.mode = 'public'; config.forceConfigMode = false; }
    if (F && F.saveDB) F.saveDB(db);
    return reply(`🌍 Bot is now *PUBLIC* - Everyone can use it.\n\nYour prefix is still: ${prefix}\nTry: ${prefix}menu`);
  }
},
{
  name: 'mode', aliases: ['setmode'], category: 'owner', ownerOnly: true,
  run: async ({ reply, config, db, args, prefix, F }) => {
    let newMode = (args?.[0] || '').toLowerCase();
    if (newMode === 'public' || newMode === 'private') {
      db.settings = db.settings || {};
      db.settings.mode = newMode;
      db.mode = newMode;
      if (config) { config.mode = newMode; config.forceConfigMode = false; }
      if (F && F.saveDB) F.saveDB(db);
      return reply(`✅ Mode changed to *${newMode.toUpperCase()}*\n${newMode === 'private' ? '🔒 Only the owner can use the bot now.' : '🌍 Everyone can use the bot now.'}\n\nPrefix: ${prefix}\nCheck with: ${prefix}mode`);
    }
    if (newMode) return reply(`❌ Use: ${prefix}mode public OR ${prefix}mode private`);
    let mode = getRealMode(db, config);
    let pfx = getRealPrefix(db, config);
    return reply(`🌐 *Current Mode:* ${mode.toUpperCase()}\n\n🔒 ${pfx}private = Only you\n🌍 ${pfx}public = Everyone\n⚙️ Change: ${pfx}mode public OR ${pfx}mode private\n\nPrefix: ${pfx}`);
  }
},
{
  name: 'update', category: 'owner', ownerOnly: true,
  run: async ({ reply }) => { return reply('🔄 Update: Pull the latest version from GitHub and restart.\nOn Render: Manual Deploy > Deploy latest commit'); }
},
{
  name: 'repo', aliases: ['sc', 'script'], category: 'owner',
  run: async ({ reply }) => { return reply('📦 *META AI MD REPO*\n\nGitHub: https://github.com/Simontechempire/META-AI-MD\nOwner: Simon Tech\n\n⭐ Star the repo!'); }
},
];
