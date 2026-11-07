// plugins/anti.js
// META AI MD — ANTI PROTECTION (REAL)
// © Simon Tech Inc

const floodMap = new Map();
const deletedCache = new Map();

const antiList = [
  { key: 'antilink', label: 'Anti Link' },
  { key: 'antigroup', label: 'Anti Group Invite' },
  { key: 'antibadword', label: 'Anti Bad Word' },
  { key: 'antitag', label: 'Anti Tag' },
  { key: 'antimention', label: 'Anti Mention' },
  { key: 'antidelete', label: 'Anti Delete' },
  { key: 'antisticker', label: 'Anti Sticker' },
  { key: 'antiimage', label: 'Anti Image' },
  { key: 'antivideo', label: 'Anti Video' },
  { key: 'antiaudio', label: 'Anti Audio' },
  { key: 'antidocument', label: 'Anti Document' },
  { key: 'antiforward', label: 'Anti Forward' },
  { key: 'antispam', label: 'Anti Long Messages' },
  { key: 'antiflood', label: 'Anti Flood' },
  { key: 'antiscam', label: 'Anti Scam' },
  { key: 'antinsfw', label: 'Anti Explicit Content' },
  { key: 'antilinkwarn', label: 'Anti Link Warning' }
];

function getGroupAnti(db, from) {
  if (db?.group?.[from]?.anti) return db.group[from].anti;
  return db?.anti || {};
}
function getNumber(jid) {
  return String(jid || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
}
function isAdmin(p) { return p?.admin === 'admin' || p?.admin === 'superadmin'; }
function findParticipant(meta, uid) {
  if (!meta || !uid) return null;
  const num = getNumber(uid);
  return (meta.participants || []).find(p =>
    p.id === uid || p.phoneNumber === uid ||
    getNumber(p.id) === num || getNumber(p.phoneNumber) === num
  );
}
async function getMetadata(sock, from, F) {
  try {
    if (F?.getGroupMeta) return await F.getGroupMeta(sock, from);
    return await sock.groupMetadata(from);
  } catch { return null; }
}
function isBotOwner(sender, senderPn, db, config) {
  const nums = [getNumber(sender), getNumber(senderPn)].filter(Boolean);
  const owners = [];
  if (config?.ownerNumber) owners.push(getNumber(config.ownerNumber));
  if (Array.isArray(config?.owners)) config.owners.forEach(o => owners.push(getNumber(o)));
  if (db?.owner) owners.push(getNumber(db.owner));
  if (Array.isArray(db?.owners)) db.owners.forEach(o => owners.push(getNumber(o)));
  if (db?.settings?.owner) owners.push(getNumber(db.settings.owner));
  return nums.some(n => n && owners.includes(n));
}

// Unwrap viewOnce / ephemeral / edited messages to real content
function unwrap(msg) {
  if (!msg) return {};
  if (msg.viewOnceMessage) return unwrap(msg.viewOnceMessage.message);
  if (msg.viewOnceMessageV2) return unwrap(msg.viewOnceMessageV2.message);
  if (msg.ephemeralMessage) return unwrap(msg.ephemeralMessage.message);
  if (msg.editedMessage) return unwrap(msg.editedMessage.message);
  return msg;
}
function getTextAndCtx(msg) {
  const m = unwrap(msg);
  const type = Object.keys(m)[0] || '';
  const body = m[type] || {};
  const text = m.conversation || body.text || body.caption || '';
  const ctx = body.contextInfo || {};
  return { type, text: String(text), ctx, raw: m };
}

async function deleteMsg(sock, from, m) {
  try { await sock.sendMessage(from, { delete: m.key }); return true; }
  catch { return false; }
}

async function doWarn(sock, m, from, sender, senderPn, reason, db, F, botIsAdmin) {
  db.warns = db.warns || {};
  db.warns[from] = db.warns[from] || {};
  const key = getNumber(senderPn || sender) || sender;
  db.warns[from][key] = (db.warns[from][key] || 0) + 1;
  const count = db.warns[from][key];
  if (typeof F?.saveDB === 'function') { try { await F.saveDB(db); } catch {} }

  // 3 warns = kick (real enforcement)
  if (count >= 3 && botIsAdmin) {
    db.warns[from][key] = 0;
    if (typeof F?.saveDB === 'function') { try { await F.saveDB(db); } catch {} }
    try { await sock.groupParticipantsUpdate(from, [senderPn || sender], 'remove'); } catch {}
    await sock.sendMessage(from, {
      text: `🚫 *REMOVED*\n\nMember: @${key}\nReason: ${reason}\nWarns: 3/3\n\n©️ Simon Tech Inc`,
      mentions: [senderPn || sender]
    }).catch(() => {});
    return count;
  }

  await sock.sendMessage(from, {
    text: `⚠️ *GROUP WARNING*\n\nMember: @${key}\nWarning: ${count}/3\nReason: ${reason}\n\n©️ Simon Tech Inc`,
    mentions: [senderPn || sender]
  }).catch(() => {});
  return count;
}

async function setAnti(ctx, item) {
  const { db, args, reply, prefix, from, isGroup, isAdmin: senderIsAdmin, isOwner, sock, sender, senderPn, F } = ctx;
  if (!isGroup) return reply('❌ This command only works in groups.');
  let admin = !!senderIsAdmin;
  if (!admin && !isOwner) {
    const meta = await getMetadata(sock, from, F);
    admin = isAdmin(findParticipant(meta, sender) || findParticipant(meta, senderPn));
  }
  if (!isOwner && !admin) return reply('❌ Only group admins can change anti settings.');
  const value = String(args?.[0] || '').toLowerCase();
  if (value !== 'on' && value !== 'off') {
    const enabled = !!getGroupAnti(db, from)[item.key];
    return reply(`🛡️ *${item.label}*\nStatus: ${enabled ? '✅ ON' : '❌ OFF'}\n\nUsage: ${prefix}${item.key} on / off`);
  }
  db.group = db.group || {};
  db.group[from] = db.group[from] || {};
  db.group[from].anti = db.group[from].anti || {};
  db.group[from].anti[item.key] = value === 'on';
  if (typeof F?.saveDB === 'function') { try { await F.saveDB(db); } catch {} }
  return reply(`🛡️ *${item.label}*\nStatus: ${value === 'on' ? '✅ ON' : '❌ OFF'}\nChanged by: @${getNumber(senderPn || sender)}`);
}

async function handleAnti(sock, m, db, F, config) {
  try {
    const from = m?.key?.remoteJid;
    if (!from?.endsWith('@g.us')) return false;
    if (m.key.fromMe || !m.message) return false;
    const sender = m.key.participant || m.key.remoteJid;
    if (!sender) return false;
    const settings = getGroupAnti(db, from);
    if (!Object.values(settings).some(Boolean)) return false;

    const senderPn = m.key.participantPn || m.key.remoteJidAlt || sender;
    if (isBotOwner(sender, senderPn, db, config)) return false;

    const metadata = await getMetadata(sock, from, F);
    if (!metadata) return false;
    if (isAdmin(findParticipant(metadata, sender) || findParticipant(metadata, senderPn))) return false;

    const botParticipant = findParticipant(metadata, sock.user?.id) || findParticipant(metadata, sock.user?.lid);
    const botIsAdmin = isAdmin(botParticipant);

    const { type, text, ctx } = getTextAndCtx(m.message);
    const lower = text.toLowerCase();

    // Cache for antidelete - MUST cache before any return, even if no rule matched
    if (settings.antidelete && m.key.id) {
      deletedCache.set(m.key.id, { from, sender, senderPn, text: text || `[${type}]`, time: Date.now() });
      if (deletedCache.size > 300) deletedCache.delete(deletedCache.keys().next().value);
    }

    const rules = [
      { key: 'antilink', reason: 'Links are not allowed', test: () => /https?:\/\/|www\.|chat\.whatsapp\.com\/|wa\.me\/|t\.me\/|instagram\.com|tiktok\.com|facebook\.com|youtu\.be|youtu\.com|discord\.gg/i.test(lower) },
      { key: 'antigroup', reason: 'Group invite links are not allowed', test: () => /chat\.whatsapp\.com\/[A-Za-z0-9]+/i.test(lower) },
      { key: 'antibadword', reason: 'Inappropriate language', test: () => /\b(fuck|shit|bitch|bastard|idiot|fucking|motherfucker|dick|pussy|asshole)\b/i.test(lower) },
      { key: 'antisticker', reason: 'Stickers are not allowed', test: () => type === 'stickerMessage' },
      { key: 'antiimage', reason: 'Images are not allowed', test: () => type === 'imageMessage' },
      { key: 'antivideo', reason: 'Videos are not allowed', test: () => type === 'videoMessage' },
      { key: 'antiaudio', reason: 'Audio messages are not allowed', test: () => ['audioMessage', 'pttMessage'].includes(type) },
      { key: 'antidocument', reason: 'Documents are not allowed', test: () => type === 'documentMessage' },
      { key: 'antiforward', reason: 'Forwarded messages are not allowed', test: () => !!ctx.isForwarded },
      { key: 'antitag', reason: 'Tagging 5+ people is not allowed', test: () => (ctx.mentionedJid || []).length >= 5 },
      { key: 'antimention', reason: 'Mentions are not allowed', test: () => (ctx.mentionedJid || []).length > 0 },
      { key: 'antispam', reason: 'Message is too long', test: () => lower.length > 500 },
      { key: 'antiscam', reason: 'Possible scam message', test: () => /(double your money|giveaway|free money|click to win|investment 2x|send.*receive.*double)/i.test(lower) },
      { key: 'antinsfw', reason: 'Explicit content is not allowed', test: () => /\b(porn|xxx|nude|sex video|onlyfans|pornhub)\b/i.test(lower) }
    ];

    let reason = null, matchedKey = null;
    for (const r of rules) {
      if (settings[r.key] && r.test()) { reason = r.reason; matchedKey = r.key; break; }
    }

    if (!reason && settings.antiflood) {
      const now = Date.now();
      const k = `${from}:${getNumber(senderPn || sender)}`;
      let arr = (floodMap.get(k) || []).filter(t => now - t < 10000);
      arr.push(now);
      floodMap.set(k, arr);
      if (arr.length >= 5) { reason = 'Flood detected (5 msgs / 10s)'; floodMap.set(k, []); }
    }
    if (!reason) return false;

    // antilinkwarn = warn only, don't delete
    const warnOnly = matchedKey === 'antilink' && settings.antilinkwarn;
    if (!warnOnly && botIsAdmin) await deleteMsg(sock, from, m);
    // If bot no be admin, still warn so user go know e try
    await doWarn(sock, m, from, sender, senderPn, reason + (botIsAdmin ? '' : ' (Bot no be admin, fit no delete)'), db, F, botIsAdmin);
    return true;
  } catch (e) { console.log('Anti error:', e.message); return false; }
}

async function handleDelete(sock, updates, db, F, config) {
  try {
    if (!Array.isArray(updates)) updates = [updates];
    for (const item of updates) {
      const key = item?.key || item;
      if (!key?.id) continue;
      // Only fire if antidelete is ON for that group
      const cached = deletedCache.get(key.id);
      if (!cached) continue;
      const settings = getGroupAnti(db, cached.from);
      if (!settings.antidelete) continue;
      await sock.sendMessage(cached.from, {
        text: `🗑️ *ANTI DELETE*\n\nMember: @${getNumber(cached.senderPn || cached.sender)}\nDeleted: ${cached.text}\n\n©️ Simon Tech Inc`,
        mentions: [cached.senderPn || cached.sender]
      }).catch(() => {});
      deletedCache.delete(key.id);
    }
  } catch (e) { console.log('Anti-delete error:', e.message); }
}

const cmds = antiList.map(item => ({
  name: item.key, category: 'anti', groupOnly: true,
  run: async ctx => setAnti(ctx, item)
}));
cmds.push({
  name: 'anti', aliases: ['antilist'], category: 'anti', groupOnly: true,
  run: async ({ db, reply, prefix, from }) => {
    const s = getGroupAnti(db, from);
    let out = `◈┈▉ \`META AI MD\` ▉┄◈\n\n🛡️ *ANTI SETTINGS*\n\n`;
    for (const i of antiList) out += `${s[i.key] ? '✅' : '❌'} ${i.key}: ${s[i.key] ? 'ON' : 'OFF'}\n`;
    out += `\nUsage: ${prefix}antilink on\nAdmins only\n\n©️ Simon Tech Inc`;
    return reply(out);
  }
});

module.exports = cmds;
module.exports.handleAnti = handleAnti;
module.exports.handleDelete = handleDelete;
module.exports.doWarn = doWarn;
