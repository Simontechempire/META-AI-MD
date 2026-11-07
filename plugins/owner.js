// plugins/owner.js
// META AI MD — OWNER MENU
// © Simon Tech Inc

function getRealMode(db, config) {
  return db?.settings?.mode || db?.mode || config?.mode || 'public';
}
function getRealPrefix(db, config) {
  return db?.settings?.prefix || config?.prefix || '.';
}
function cleanNumber(value) {
  return String(value || '').replace(/[^0-9]/g, '');
}
function getNum(jid){ return String(jid||'').split('@')[0].split(':')[0].replace(/[^0-9]/g,''); }
async function saveDB(F, db) { if (typeof F?.saveDB === 'function') await F.saveDB(db); }
function getBanNums(target) {
  const raw = String(target || '').split('@')[0].replace(/[^0-9]/g, '');
  return raw ? [raw] : [];
}
// FIXED: No longer depends on F.getTarget. Fallback: mentioned -> quoted -> args number
function getTarget(m, args, F) {
  if (typeof F?.getTarget === 'function') {
    try { let t = F.getTarget(m, args); if (t) return t; } catch {}
  }
  let ctxInfo = m?.message?.extendedTextMessage?.contextInfo || m?.message?.imageMessage?.contextInfo || m?.message?.videoMessage?.contextInfo || {};
  if (ctxInfo.mentionedJid?.length) return ctxInfo.mentionedJid[0];
  if (ctxInfo.participant) return ctxInfo.participant;
  let arg = String(args?.[0] || '').replace(/[^0-9]/g, '');
  if (arg.length >= 7) return `${arg}@s.whatsapp.net`;
  return null;
}
async function sendMention(sock, from, text, jid){
  return sock.sendMessage(from, { text, mentions: jid ? [jid] : [] });
}

module.exports = [
{
  name: 'menu', aliases: ['help', 'allmenu'], category: 'general',
  run: async ({ reply, prefix, config, db }) => {
    const { getMenu } = require('../lib/menu');
    return reply(getMenu({ ownerName: config.ownerAlias, prefix: getRealPrefix(db, config), botUser: config.botName, hosting: config.hosting }));
  }
},
{
  name: 'ping', category: 'general',
  run: async ({ reply, sock, config }) => {
    const start = Date.now();
    await sock.sendPresenceUpdate('available').catch(() => {});
    const ms = Date.now() - start;
    return reply(`🏓 *PONG!* ${ms}ms\n⚡ ${config.botName || 'META AI MD'}\n🕒 ${new Date().toLocaleString('en-US', { timeZone: config.timezone || 'Africa/Lagos' })}`);
  }
},
{
  name: 'alive', category: 'general',
  run: async ({ reply, config, db, F }) => {
    return reply(`◈┈▉ \`${config.botName || 'META AI MD'}\` ▉┄◈\n\n✅ *I AM ALIVE!*\n\n🤖 Bot: ${config.botName || 'META AI MD'}\n👑 Owner: ${config.ownerAlias || 'Simon'}\n⚡ Prefix: ${getRealPrefix(db, config)}\n🌐 Mode: ${getRealMode(db, config)}\n⏱️ Runtime: ${F?.runtime ? F.runtime() : 'Unknown'}\n\n©️ Simon Tech Inc`);
  }
},
{
  name: 'owner', category: 'general',
  run: async ({ reply, sock, config, from }) => {
    const number = cleanNumber(config.ownerNumber);
    if (!number) return reply('❌ Owner number is not configured.');
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${config.ownerAlias || 'Owner'}\nORG:Simon Tech Inc;\nTEL;TYPE=CELL;TYPE=VOICE;waid=${number}:+${number}\nEND:VCARD`;
    try {
      await sock.sendMessage(from, { contacts: { displayName: config.ownerAlias || 'Owner', contacts: [{ displayName: config.ownerAlias || 'Owner', vcard }] } });
    } catch (e) {
      return reply(`👑 *OWNER*\nName: ${config.ownerAlias || 'Owner'}\nNumber: +${number}\nWhatsApp: https://wa.me/${number}`);
    }
  }
},
{
  name: 'runtime', category: 'general',
  run: async ({ reply, F }) => { return reply(`⏱️ *Runtime:* ${F?.runtime ? F.runtime() : 'Unknown'}\n\n©️ Simon Tech Inc`); }
},
{
  name: 'botinfo', category: 'general',
  run: async ({ reply, config, F, db }) => {
    return reply(`◈┈▉ \`${config.botName || 'META AI MD'}\` ▉┄◈\n\n🤖 Bot: ${config.botName || 'META AI MD'}\n👑 Owner: ${config.ownerAlias || 'Simon'}\n📞 Owner: +${cleanNumber(config.ownerNumber)}\n⚡ Prefix: ${getRealPrefix(db, config)}\n🌐 Mode: ${getRealMode(db, config)}\n🖥️ Hosting: ${config.hosting || 'Unknown'}\n⏱️ Runtime: ${F?.runtime ? F.runtime() : 'Unknown'}\n🕒 Timezone: ${config.timezone || 'Africa/Lagos'}\n\n©️ Simon Tech Inc`);
  }
},
{
  name: 'restart', category: 'owner', ownerOnly: true,
  run: async ({ reply }) => { await reply('🔄 Restarting META AI MD...'); setTimeout(() => process.exit(0), 1500); }
},
{
  name: 'shutdown', category: 'owner', ownerOnly: true,
  run: async ({ reply }) => { await reply('🛑 Shutting down META AI MD...'); setTimeout(() => process.exit(0), 1000); }
},
{
  name: 'broadcast', aliases: ['bc'], category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, text, prefix }) => {
    if (!text) return reply(`Usage: ${prefix}broadcast Your message`);
    const chats = await sock.groupFetchAllParticipating().catch(() => ({}));
    const ids = Object.keys(chats);
    if (!ids.length) return reply('❌ No joined groups found.');
    let sent = 0, failed = 0;
    for (const id of ids) {
      try { await sock.sendMessage(id, { text: `📢 *BROADCAST FROM META AI MD*\n\n${text}\n\n©️ Simon Tech Inc` }); sent++; await new Promise(r => setTimeout(r, 1500)); }
      catch (e) { failed++; }
    }
    return reply(`📢 *BROADCAST REPORT*\n\n✅ Sent: ${sent}\n❌ Failed: ${failed}`);
  }
},
{
  name: 'setprefix', category: 'owner', ownerOnly: true,
  run: async ({ reply, args, db, config, prefix, F }) => {
    const newPrefix = args?.[0];
    if (!newPrefix) return reply(`Usage: ${prefix}setprefix !`);
    if (newPrefix.length > 2 || /\s/.test(newPrefix)) return reply('❌ Prefix must be 1–2 characters with no spaces.');
    db.settings = db.settings || {}; db.settings.prefix = newPrefix;
    if (config) config.prefix = newPrefix;
    try { await saveDB(F, db); return reply(`✅ Prefix changed to: ${newPrefix}\n\nUse: ${newPrefix}menu`); }
    catch (e) { return reply(`❌ Could not save prefix: ${e.message}`); }
  }
},
{
  name: 'setname', aliases: ['setbotname'], category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, text, prefix }) => {
    if (!text) return reply(`Usage: ${prefix}setname META AI MD`);
    try { await sock.updateProfileName(text); return reply(`✅ WhatsApp profile name changed to: ${text}`); }
    catch (e) { return reply(`❌ Name update failed: ${e.message}`); }
  }
},
{
  name: 'setbio', aliases: ['setstatus', 'setautobio'], category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, text, prefix }) => {
    if (!text) return reply(`Usage: ${prefix}setbio I am META AI MD`);
    try { await sock.updateProfileStatus(text); return reply(`✅ WhatsApp bio changed successfully.`); }
    catch (e) { return reply(`❌ Bio update failed: ${e.message}`); }
  }
},
{
  name: 'setpp', category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, m, F, prefix }) => {
    let buffer = null;
    try {
      if (F?.downloadMedia) buffer = await F.downloadMedia(m).catch(() => null);
      if (!buffer) {
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const msg = m.message?.imageMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
        if (msg) { const stream = await downloadContentFromMessage(msg, 'image'); const chunks = []; for await (const chunk of stream) chunks.push(chunk); buffer = Buffer.concat(chunks); }
      }
    } catch (e) {}
    if (!buffer) return reply(`❌ Send or reply to an image first.\nUsage: ${prefix}setpp`);
    try { await sock.updateProfilePicture(sock.user.id, buffer); return reply('✅ Profile picture updated!'); }
    catch (e) { return reply(`❌ Profile picture update failed: ${e.message}`); }
  }
},
{
  name: 'join', category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, args, prefix }) => {
    if (!args?.[0]) return reply(`Usage: ${prefix}join https://chat.whatsapp.com/INVITE`);
    const code = args[0].split('/').pop().split('?')[0];
    try { const result = await sock.groupAcceptInvite(code); return reply(`✅ Joined group: ${result}`); }
    catch (e) { return reply(`❌ Join failed: ${e.message}`); }
  }
},
{
  name: 'leave', category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, from, isGroup }) => {
    if (!isGroup) return reply('❌ Use this command inside a group.');
    await reply('👋 Leaving group...');
    try { await sock.groupLeave(from); } catch (e) { return reply(`❌ Leave failed: ${e.message}`); }
  }
},
{
  name: 'block', category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, m, F, args, prefix, from }) => {
    const target = getTarget(m, args, F);
    if (!target) return reply(`Reply, tag, or provide a number.\n${prefix}block @user`);
    try {
      // FIXED: updateBlockStatus needs PN JID. If target is LID, try F.resolve if available, else try PN JID from number
      let jid = target;
      if (jid.endsWith('@lid') && F?.lidToPn) { try { jid = await F.lidToPn(jid) || jid; } catch {} }
      await sock.updateBlockStatus(jid, 'block');
      // FIXED: Use sendMessage for mentions, not reply(text, {mentions})
      return sendMention(sock, from, `🚫 Blocked @${getNum(jid)}`, jid);
    } catch (e) { return reply(`❌ Block failed: ${e.message}`); }
  }
},
{
  name: 'unblock', category: 'owner', ownerOnly: true,
  run: async ({ reply, sock, m, F, args, prefix, from }) => {
    const target = getTarget(m, args, F);
    if (!target) return reply(`Reply, tag, or provide a number.\n${prefix}unblock @user`);
    try {
      let jid = target;
      if (jid.endsWith('@lid') && F?.lidToPn) { try { jid = await F.lidToPn(jid) || jid; } catch {} }
      await sock.updateBlockStatus(jid, 'unblock');
      return sendMention(sock, from, `✅ Unblocked @${getNum(jid)}`, jid);
    } catch (e) { return reply(`❌ Unblock failed: ${e.message}`); }
  }
},
{
  name: 'ban', category: 'owner', ownerOnly: true,
  run: async ctx => {
    const { reply, sock, m, F, args, prefix, db, from } = ctx;
    const target = getTarget(m, args, F);
    if (!target) return reply(`Usage: ${prefix}ban @user`);
    db.banned = db.banned || [];
    const nums = getBanNums(target);
    // FIXED: Also store PN if F can resolve LID -> PN, so index.js ban check (which checks PN) will match
    if (target.endsWith('@lid') && F?.lidToPn) {
      try { let pn = await F.lidToPn(target); if (pn) { let n = getNum(pn); if (n && !nums.includes(n)) nums.push(n); } } catch {}
    }
    if (!nums.length) return reply('❌ Could not identify that user.');
    for (const num of nums) if (!db.banned.includes(num)) db.banned.push(num);
    try { await saveDB(F, db); return sendMention(sock, from, `🚫 Banned @${getNum(target)}. The bot will now ignore this user.`, target); }
    catch (e) { return reply(`❌ Could not save ban: ${e.message}`); }
  }
},
{
  name: 'unban', category: 'owner', ownerOnly: true,
  run: async ctx => {
    const { reply, sock, m, F, args, prefix, db, from } = ctx;
    const target = getTarget(m, args, F);
    if (!target) return reply(`Usage: ${prefix}unban @user`);
    db.banned = db.banned || [];
    const nums = getBanNums(target);
    if (target.endsWith('@lid') && F?.lidToPn) {
      try { let pn = await F.lidToPn(target); if (pn) { let n = getNum(pn); if (n && !nums.includes(n)) nums.push(n); } } catch {}
    }
    db.banned = db.banned.filter(item => !nums.includes(item));
    try { await saveDB(F, db); return sendMention(sock, from, `✅ Unbanned @${getNum(target)}.`, target); }
    catch (e) { return reply(`❌ Could not save changes: ${e.message}`); }
  }
},
{
  name: 'clearsession', category: 'owner', ownerOnly: true,
  run: async ({ reply }) => { return reply('⚠️ Session deletion is disabled for safety.\n\nMETA AI MD supports multiple linked accounts. Deleting a shared session folder could disconnect other users.'); }
},
{
  name: 'getsession', category: 'owner', ownerOnly: true,
  run: async ({ reply, config }) => {
    const folder = config.sessionDir || 'sessions';
    return reply(`📁 *SESSION DIRECTORY*\n\nPath: ./${folder}\n\nEach linked device should have its own session folder.`);
  }
},
{
  name: 'setowner', category: 'owner', ownerOnly: true,
  run: async ({ reply, args, db, F, prefix }) => {
    const number = cleanNumber(args?.[0]);
    if (!number) return reply(`Usage: ${prefix}setowner 234XXXXXXXXX`);
    db.owners = [number]; db.settings = db.settings || {}; db.settings.owner = number;
    try { await saveDB(F, db); return reply(`✅ Main owner changed to +${number}`); }
    catch (e) { return reply(`❌ Could not save owner: ${e.message}`); }
  }
},
{
  name: 'addowner', category: 'owner', ownerOnly: true,
  run: async ({ reply, args, db, F, prefix }) => {
    const number = cleanNumber(args?.[0]);
    if (!number) return reply(`Usage: ${prefix}addowner 234XXXXXXXXX`);
    db.owners = db.owners || [];
    if (db.owners.includes(number)) return reply('⚠️ This number is already an owner.');
    db.owners.push(number);
    try { await saveDB(F, db); return reply(`✅ Added owner +${number}`); }
    catch (e) { return reply(`❌ Could not save owner: ${e.message}`); }
  }
},
{
  name: 'delowner', category: 'owner', ownerOnly: true,
  run: async ({ reply, args, db, F, prefix }) => {
    const number = cleanNumber(args?.[0]);
    if (!number) return reply(`Usage: ${prefix}delowner 234XXXXXXXXX`);
    db.owners = db.owners || [];
    if (!db.owners.includes(number)) return reply('❌ Number is not in the owners list.');
    if (db.owners.length <= 1) return reply('❌ You cannot remove the last owner.');
    db.owners = db.owners.filter(item => item !== number);
    try { await saveDB(F, db); return reply(`✅ Removed owner +${number}`); }
    catch (e) { return reply(`❌ Could not save changes: ${e.message}`); }
  }
},
{
  name: 'listowner', category: 'owner', ownerOnly: true,
  run: async ({ reply, db, config }) => {
    const owners = db.owners || [cleanNumber(config.ownerNumber)].filter(Boolean);
    if (!owners.length) return reply('No owners configured.');
    return reply(`👑 *OWNERS LIST*\n\n` + owners.map((n, i) => `${i + 1}. +${n}`).join('\n'));
  }
},
{
  name: 'private', aliases: ['self'], category: 'owner', ownerOnly: true,
  run: async ({ reply, db, config, F, prefix }) => {
    db.settings = db.settings || {}; db.settings.mode = 'private'; db.mode = 'private';
    if (config) config.mode = 'private';
    try { await saveDB(F, db); return reply(`🔒 Bot mode: *PRIVATE*\nOnly authorized owners should be able to use it.\n\nPrefix: ${prefix}`); }
    catch (e) { return reply(`❌ Could not save mode: ${e.message}`); }
  }
},
{
  name: 'public', aliases: ['all'], category: 'owner', ownerOnly: true,
  run: async ({ reply, db, config, F, prefix }) => {
    db.settings = db.settings || {}; db.settings.mode = 'public'; db.mode = 'public';
    if (config) config.mode = 'public';
    try { await saveDB(F, db); return reply(`🌍 Bot mode: *PUBLIC*\nEveryone can use the bot.\n\nPrefix: ${prefix}`); }
    catch (e) { return reply(`❌ Could not save mode: ${e.message}`); }
  }
},
{
  name: 'mode', aliases: ['setmode'], category: 'owner', ownerOnly: true,
  run: async ({ reply, config, db, args, prefix, F }) => {
    const newMode = (args?.[0] || '').toLowerCase();
    if (newMode === 'public' || newMode === 'private') {
      db.settings = db.settings || {}; db.settings.mode = newMode; db.mode = newMode;
      if (config) config.mode = newMode;
      try { await saveDB(F, db); return reply(`✅ Mode changed to *${newMode.toUpperCase()}*\n\n${newMode === 'private' ? '🔒 Only authorized owners should use the bot.' : '🌍 Everyone can use the bot.'}\n\nPrefix: ${getRealPrefix(db, config)}`); }
      catch (e) { return reply(`❌ Could not save mode: ${e.message}`); }
    }
    if (newMode) return reply(`Usage: ${prefix}mode public OR ${prefix}mode private`);
    return reply(`🌐 *CURRENT MODE:* ${getRealMode(db, config).toUpperCase()}\n\n🔒 ${getRealPrefix(db, config)}private\n🌍 ${getRealPrefix(db, config)}public\n⚙️ ${getRealPrefix(db, config)}mode public/private`);
  }
},
{
  name: 'update', category: 'owner', ownerOnly: true,
  run: async ({ reply }) => { return reply('🔄 *UPDATE META AI MD*\n\nOn Render: Manual Deploy → Deploy latest commit.'); }
},
{
  name: 'repo', aliases: ['sc', 'script'], category: 'general',
  run: async ({ reply }) => { return reply(`📦 *META AI MD REPOSITORY*\n\nGitHub: https://github.com/Simontechempire/META-AI-MD\nDeveloper: Simon Tech Inc`); }
}
];
