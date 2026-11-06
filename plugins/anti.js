
// plugins/anti.js
// META AI V2 — ANTI PROTECTION
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
  return db?.group?.[from]?.anti || db?.anti || {};
}

function getNumber(jid) {
  return String(jid || '').split('@')[0].replace(/[^0-9]/g, '');
}

function isAdmin(participant) {
  return participant?.admin === 'admin' ||
         participant?.admin === 'superadmin';
}

async function getMetadata(sock, from, F) {
  try {
    if (F?.getGroupMeta) {
      return await F.getGroupMeta(sock, from);
    }
    return await sock.groupMetadata(from);
  } catch {
    return null;
  }
}

async function saveDB(F, db) {
  if (typeof F?.saveDB === 'function') {
    await F.saveDB(db);
  }
}

async function deleteMessage(sock, from, m) {
  try {
    await sock.sendMessage(from, { delete: m.key });
    return true;
  } catch {
    return false;
  }
}

// Warning only. No automatic member removal.
async function doWarn(sock, m, from, sender, reason, db, F) {
  db.warns = db.warns || {};
  db.warns[from] = db.warns[from] || {};

  db.warns[from][sender] = (db.warns[from][sender] || 0) + 1;

  const count = db.warns[from][sender];
  const pn = m?.key?.participantPn || sender;
  const number = getNumber(pn);

  await sock.sendMessage(from, {
    text:
      `⚠️ *GROUP WARNING*\n\n` +
      `Member: @${number}\n` +
      `Warning: ${count}\n` +
      `Reason: ${reason}\n\n` +
      `©️ Simon Tech Inc`,
    mentions: [pn]
  }).catch(() => {});

  await saveDB(F, db).catch(() => {});
  return count;
}

async function setAnti(ctx, item) {
  const {
    db, args, reply, prefix, from, isGroup,
    isAdmin: senderIsAdmin, isOwner, sock, sender, F
  } = ctx;

  if (!isGroup) return reply('❌ This command only works in groups.');

  let admin = !!senderIsAdmin;

  if (!admin && !isOwner) {
    const meta = await getMetadata(sock, from, F);
    const senderId = sender || '';
    const senderNum = getNumber(senderId);

    const participant = meta?.participants?.find(p =>
      p.id === senderId ||
      p.phoneNumber === senderId ||
      getNumber(p.id) === senderNum ||
      getNumber(p.phoneNumber) === senderNum
    );

    admin = isAdmin(participant);
  }

  if (!isOwner && !admin) {
    return reply('❌ Only group admins can change anti settings.');
  }

  const value = String(args?.[0] || '').toLowerCase();

  if (value !== 'on' && value !== 'off') {
    const enabled = !!getGroupAnti(db, from)[item.key];

    return reply(
      `🛡️ *${item.label}*\n` +
      `Status: ${enabled ? '✅ ON' : '❌ OFF'}\n\n` +
      `Usage: ${prefix}${item.key} on / off`
    );
  }

  db.group = db.group || {};
  db.group[from] = db.group[from] || {};
  db.group[from].anti = db.group[from].anti || {};
  db.group[from].protection = db.group[from].protection || {};

  const enabled = value === 'on';

  db.group[from].anti[item.key] = enabled;

  // Synchronize supported keys with protection.js.
  const protectionMap = {
    antilink: 'antilink',
    antibadword: 'antibadword',
    antitag: 'antitag',
    antidelete: 'antidelete',
    antisticker: 'antisticker',
    antiimage: 'antiimage',
    antivideo: 'antivideo',
    antiaudio: 'antiaudio',
    antidocument: 'antidocument',
    antiforward: 'antiforward',
    antispam: 'antispam',
    antimention: 'antimention',
    antigroup: 'antigroup',
    antiscam: 'antiscam',
    antinsfw: 'antinsfw',
    antiflood: 'antiflood',
    antilinkwarn: 'antilink'
  };

  const protectionKey = protectionMap[item.key];

  if (protectionKey) {
    db.group[from].protection[protectionKey] = enabled;
  }

  try {
    await saveDB(F, db);
  } catch (e) {
    return reply(`❌ Could not save setting: ${e.message}`);
  }

  return reply(
    `🛡️ *${item.label}*\n` +
    `Status: ${enabled ? '✅ ON' : '❌ OFF'}\n` +
    `Group: ${from}\n` +
    `Changed by: ${sender || 'Admin'}`
  );
}

// Called by index.js for incoming group messages.
async function handleAnti(sock, m, db, F) {
  try {
    const from = m?.key?.remoteJid;

    if (!from?.endsWith('@g.us')) return false;
    if (m.key.fromMe || !m.message) return false;

    const sender = m.key.participant;
    if (!sender) return false;

    const settings = getGroupAnti(db, from);

    if (!Object.values(settings).some(Boolean)) return false;

    // Owner bypass.
    let owner = false;

    try {
      owner = !!F?.isOwner?.(sender, db);
      if (!owner) owner = !!F?.isOwnerMessage?.(m, db);
    } catch {}

    if (owner) return false;

    const metadata = await getMetadata(sock, from, F);
    if (!metadata) return false;

    const participants = metadata.participants || [];

    const senderPn = m.key.participantPn || sender;
    const senderNum = getNumber(senderPn);

    const senderParticipant = participants.find(p =>
      p.id === sender ||
      p.phoneNumber === senderPn ||
      getNumber(p.id) === senderNum ||
      getNumber(p.phoneNumber) === senderNum
    );

    // Group admins bypass anti restrictions.
    if (isAdmin(senderParticipant)) return false;

    const botId = sock.user?.id || '';
    const botNum = getNumber(botId);

    const botParticipant = participants.find(p =>
      p.id === botId ||
      p.phoneNumber === botId ||
      getNumber(p.id) === botNum ||
      getNumber(p.phoneNumber) === botNum
    );

    const botIsAdmin = isAdmin(botParticipant);

    const message = m.message;
    const type = Object.keys(message)[0];

    const text =
      message.conversation ||
      message.extendedTextMessage?.text ||
      message.imageMessage?.caption ||
      message.videoMessage?.caption ||
      message.documentMessage?.caption ||
      '';

    const lowerText = String(text).toLowerCase();

    const contextInfo =
      message.extendedTextMessage?.contextInfo ||
      message.imageMessage?.contextInfo ||
      message.videoMessage?.contextInfo ||
      {};

    // Cache messages for anti-delete.
    if (settings.antidelete && m.key.id) {
      deletedCache.set(m.key.id, {
        from,
        sender,
        senderPn,
        text: text || '[Media message]',
        time: Date.now()
      });

      if (deletedCache.size > 200) {
        const oldest = deletedCache.keys().next().value;
        deletedCache.delete(oldest);
      }
    }

    // Avoid duplicate handling by protection.js.
    const protection = db.group?.[from]?.protection || {};

    const rules = [
      {
        key: 'antilink',
        protection: 'antilink',
        reason: 'Links are not allowed',
        test: () =>
          /https?:\/\/|www\.|chat\.whatsapp\.com\/|wa\.me\/|t\.me\/|instagram\.com|tiktok\.com|facebook\.com|youtu\.be|discord\.gg/i.test(lowerText)
      },
      {
        key: 'antigroup',
        protection: 'antigroup',
        reason: 'Group invite links are not allowed',
        test: () =>
          /chat\.whatsapp\.com\/[A-Za-z0-9]+/i.test(lowerText)
      },
      {
        key: 'antibadword',
        protection: 'antibadword',
        reason: 'Inappropriate language',
        test: () =>
          /\b(fuck|shit|bitch|bastard|idiot|mumu|ashawo)\b/i.test(lowerText)
      },
      {
        key: 'antisticker',
        protection: 'antisticker',
        reason: 'Stickers are not allowed',
        test: () => type === 'stickerMessage'
      },
      {
        key: 'antiimage',
        protection: 'antiimage',
        reason: 'Images are not allowed',
        test: () => type === 'imageMessage'
      },
      {
        key: 'antivideo',
        protection: 'antivideo',
        reason: 'Videos are not allowed',
        test: () => type === 'videoMessage'
      },
      {
        key: 'antiaudio',
        protection: 'antiaudio',
        reason: 'Audio messages are not allowed',
        test: () => ['audioMessage', 'pttMessage'].includes(type)
      },
      {
        key: 'antidocument',
        protection: 'antidocument',
        reason: 'Documents are not allowed',
        test: () => type === 'documentMessage'
      },
      {
        key: 'antiforward',
        protection: 'antiforward',
        reason: 'Forwarded messages are not allowed',
        test: () => !!contextInfo.isForwarded
      },
      {
        key: 'antitag',
        protection: 'antitag',
        reason: 'Tagging five or more people is not allowed',
        test: () => (contextInfo.mentionedJid || []).length >= 5
      },
      {
        key: 'antimention',
        protection: 'antimention',
        reason: 'Mentions are not allowed',
        test: () => (contextInfo.mentionedJid || []).length > 0
      },
      {
        key: 'antispam',
        protection: 'antispam',
        reason: 'Message is too long',
        test: () => lowerText.length > 500
      },
      {
        key: 'antiscam',
        protection: 'antiscam',
        reason: 'Possible scam message',
        test: () =>
          /(double your money|giveaway|free money|click to win|investment 2x)/i.test(lowerText)
      },
      {
        key: 'antinsfw',
        protection: 'antinsfw',
        reason: 'Explicit content is not allowed',
        test: () =>
          /\b(porn|xxx|nude|sex video|onlyfans|pornhub)\b/i.test(lowerText)
      }
    ];

    let reason = null;

    for (const rule of rules) {
      if (
        settings[rule.key] &&
        !protection[rule.protection] &&
        rule.test()
      ) {
        reason = rule.reason;
        break;
      }
    }

    // Flood protection: five messages within ten seconds.
    if (!reason && settings.antiflood && !protection.antiflood) {
      const now = Date.now();
      const floodKey = `${from}:${sender}`;

      let timestamps = floodMap.get(floodKey) || [];
      timestamps = timestamps.filter(time => now - time < 10000);
      timestamps.push(now);

      floodMap.set(floodKey, timestamps);

      if (timestamps.length >= 5) {
        reason = 'Flood detected';
        floodMap.set(floodKey, []);
      }
    }

    if (!reason) return false;

    // WhatsApp requires the bot to be an admin to delete messages.
    if (botIsAdmin) {
      await deleteMessage(sock, from, m);
    }

    await doWarn(sock, m, from, sender, reason, db, F);
    return true;

  } catch (e) {
    console.log('Anti error:', e.message);
    return false;
  }
}

// Called from the WhatsApp message-revoke event.
async function handleDelete(sock, updates, db) {
  try {
    if (!Array.isArray(updates)) updates = [updates];

    for (const item of updates) {
      const key = item?.key;
      if (!key?.id) continue;

      const cached = deletedCache.get(key.id);
      if (!cached) continue;

      const number = getNumber(cached.senderPn || cached.sender);

      await sock.sendMessage(cached.from, {
        text:
          `🗑️ *ANTI DELETE*\n\n` +
          `Member: @${number}\n` +
          `Message: ${cached.text}\n\n` +
          `©️ Simon Tech Inc`,
        mentions: [cached.senderPn || cached.sender]
      }).catch(() => {});

      deletedCache.delete(key.id);
    }
  } catch (e) {
    console.log('Anti-delete error:', e.message);
  }
}

const cmds = antiList.map(item => ({
  name: item.key,
  category: 'anti',
  groupOnly: true,
  run: async ctx => setAnti(ctx, item)
}));

cmds.push({
  name: 'anti',
  aliases: ['antilist'],
  category: 'anti',
  groupOnly: true,

  run: async ({ db, reply, prefix, from }) => {
    const settings = getGroupAnti(db, from);

    let output =
      `◈┈▉ \`META AI V2\` ▉┄◈\n\n` +
      `🛡️ *ANTI SETTINGS*\n\n`;

    for (const item of antiList) {
      output +=
        `${settings[item.key] ? '✅' : '❌'} ` +
        `${item.key}: ${settings[item.key] ? 'ON' : 'OFF'}\n`;
    }

    output +=
      `\nUsage: ${prefix}antilink on\n` +
      `Admins only\n\n©️ Simon Tech Inc`;

    return reply(output);
  }
});

module.exports = cmds;
module.exports.handleAnti = handleAnti;
module.exports.handleDelete = handleDelete;
module.exports.doWarn = doWarn;
      
