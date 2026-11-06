// META AI V2 - GROUP PLUGIN
// Developer: Simon Tech Inc

function needGroup(isGroup, reply) {
  if (!isGroup) {
    reply('❌ This command only works in groups.');
    return false;
  }
  return true;
}

function displayId(p) {
  if (!p) return '';
  const id = typeof p === 'string' ? p : (p.phoneNumber || p.id || '');
  return String(id).split('@')[0].replace(/[^0-9]/g, '');
}

async function getMeta(ctx, from) {
  try {
    if (ctx.F?.getGroupMeta) {
      return await ctx.F.getGroupMeta(ctx.sock, from);
    }
    return await ctx.sock.groupMetadata(from);
  } catch {
    return null;
  }
}

async function needAdmin(ctx) {
  if (ctx.isOwner || ctx.isAdmin) return true;

  const md = await getMeta(ctx, ctx.from);
  const sender = ctx.sender || '';
  const senderPn = ctx.senderPn || '';
  const senderNum = String(ctx.senderNum || senderPn || sender)
    .split('@')[0]
    .replace(/[^0-9]/g, '');

  const member = md?.participants?.find(p =>
    p.id === sender ||
    p.id === senderPn ||
    p.phoneNumber === sender ||
    p.phoneNumber === senderPn ||
    displayId(p) === senderNum
  );

  if (member?.admin) return true;

  await ctx.reply('❌ Admins only.');
  return false;
}

async function needBotAdmin(ctx, from) {
  if (ctx.isBotAdmin) return true;

  const md = await getMeta(ctx, from);
  const botId = ctx.sock.user?.id || '';
  const botNum = botId.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');

  const bot = md?.participants?.find(p =>
    p.id === botId ||
    p.phoneNumber === botId ||
    displayId(p) === botNum
  );

  if (bot?.admin) return true;

  await ctx.reply('❌ The bot must be an admin.');
  return false;
}

function resolveTarget(md, target) {
  if (!target) return null;

  const num = String(target)
    .split('@')[0]
    .replace(/[^0-9]/g, '');

  const member = md?.participants?.find(p =>
    p.id === target ||
    p.phoneNumber === target ||
    displayId(p) === num
  );

  return member?.id || null;
}

function getTarget(ctx) {
  if (typeof ctx.F?.getTarget !== 'function') return null;
  return ctx.F.getTarget(ctx.m, ctx.args);
}

function save(db, F) {
  if (F?.saveDB) F.saveDB(db);
}

function mentionReply(ctx, message, jid) {
  return ctx.sock.sendMessage(ctx.from, {
    text: message,
    mentions: jid ? [jid] : []
  });
}

module.exports = [

{
  name: 'groupinfo',
  aliases: ['gcinfo'],
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;

    const md = await getMeta(ctx, ctx.from);
    if (!md) return ctx.reply('❌ Cannot get group information.');

    return ctx.reply(
      `◈┈▉ META AI V2 ▉┄◈

🏠 *GROUP INFO*

📌 Name: ${md.subject}
🆔 ID: ${md.id}
👥 Members: ${md.participants.length}
👑 Admins: ${md.participants.filter(p => p.admin).length}
📝 Description: ${md.desc || 'None'}
🔒 Group: ${md.announce ? 'Closed' : 'Open'}

© Simon Tech Inc`
    );
  }
},

{
  name: 'grouplink',
  aliases: ['link', 'invitelink'],
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;

    try {
      const code = await ctx.sock.groupInviteCode(ctx.from);
      return ctx.reply(`🔗 *GROUP LINK*\nhttps://chat.whatsapp.com/${code}`);
    } catch (e) {
      return ctx.reply('❌ Failed: ' + e.message);
    }
  }
},

{
  name: 'setgroupname',
  aliases: ['setgname'],
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, ctx.from)) return;
    if (!ctx.text) return ctx.reply(`Usage: ${ctx.prefix}setgroupname New Name`);

    try {
      await ctx.sock.groupUpdateSubject(ctx.from, ctx.text);
      return ctx.reply('✅ Group name updated.');
    } catch (e) {
      return ctx.reply('Failed: ' + e.message);
    }
  }
},

{
  name: 'setdesc',
  aliases: ['setgroupdesc'],
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, ctx.from)) return;
    if (!ctx.text) return ctx.reply(`Usage: ${ctx.prefix}setdesc New description`);

    try {
      await ctx.sock.groupUpdateDescription(ctx.from, ctx.text);
      return ctx.reply('✅ Group description updated.');
    } catch (e) {
      return ctx.reply('Failed: ' + e.message);
    }
  }
},

{
  name: 'open',
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, ctx.from)) return;

    try {
      await ctx.sock.groupSettingUpdate(ctx.from, 'not_announcement');
      return ctx.reply('🔓 Everyone can now chat.');
    } catch (e) {
      return ctx.reply('Failed: ' + e.message);
    }
  }
},

{
  name: 'close',
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, ctx.from)) return;

    try {
      await ctx.sock.groupSettingUpdate(ctx.from, 'announcement');
      return ctx.reply('🔒 Only admins can now chat.');
    } catch (e) {
      return ctx.reply('Failed: ' + e.message);
    }
  }
},

{
  name: 'tagall',
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;
    if (!await needAdmin(ctx)) return;

    const md = await getMeta(ctx, ctx.from);
    if (!md) return ctx.reply('❌ Cannot get members.');

    const members = md.participants.slice(0, 50);
    const mentions = members.map(p => p.id);

    const message = `📢 *GROUP ANNOUNCEMENT*

${ctx.text || 'Hello everyone!'}

${members.map(p => `@${displayId(p)}`).join(' ')}`;

    return ctx.sock.sendMessage(ctx.from, {
      text: message,
      mentions
    });
  }
},

{
  name: 'hidetag',
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;
    if (!await needAdmin(ctx)) return;

    const md = await getMeta(ctx, ctx.from);
    if (!md) return ctx.reply('❌ Cannot get members.');

    const members = md.participants.slice(0, 50);

    return ctx.sock.sendMessage(ctx.from, {
      text: ctx.text || '👋 Hello everyone!',
      mentions: members.map(p => p.id)
    });
  }
},

{
  name: 'kick',
  aliases: ['remove'],
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, ctx.from)) return;

    const target = getTarget(ctx);
    if (!target) return ctx.reply(`Usage: ${ctx.prefix}kick @user`);

    const md = await getMeta(ctx, ctx.from);
    const jid = resolveTarget(md, target);
    if (!jid) return ctx.reply('❌ Member not found.');

    const member = md.participants.find(p => p.id === jid);
    if (member?.admin) return ctx.reply('❌ Demote the admin first.');

    try {
      await ctx.sock.groupParticipantsUpdate(ctx.from, [jid], 'remove');
      return ctx.reply('✅ Member removed.');
    } catch (e) {
      return ctx.reply('Kick failed: ' + e.message);
    }
  }
},

{
  name: 'promote',
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, ctx.from)) return;

    const target = getTarget(ctx);
    if (!target) return ctx.reply(`Usage: ${ctx.prefix}promote @user`);

    const jid = resolveTarget(await getMeta(ctx, ctx.from), target);
    if (!jid) return ctx.reply('❌ Member not found.');

    try {
      await ctx.sock.groupParticipantsUpdate(ctx.from, [jid], 'promote');
      return ctx.reply('👑 Member promoted.');
    } catch (e) {
      return ctx.reply('Failed: ' + e.message);
    }
  }
},

{
  name: 'demote',
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, ctx.from)) return;

    const target = getTarget(ctx);
    if (!target) return ctx.reply(`Usage: ${ctx.prefix}demote @user`);

    const jid = resolveTarget(await getMeta(ctx, ctx.from), target);
    if (!jid) return ctx.reply('❌ Member not found.');

    try {
      await ctx.sock.groupParticipantsUpdate(ctx.from, [jid], 'demote');
      return ctx.reply('⬇️ Member demoted.');
    } catch (e) {
      return ctx.reply('Failed: ' + e.message);
    }
  }
},

{
  name: 'mute',
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, ctx.from)) return;

    try {
      await ctx.sock.groupSettingUpdate(ctx.from, 'announcement');
      return ctx.reply('🔇 Group muted.');
    } catch (e) {
      return ctx.reply('Failed: ' + e.message);
    }
  }
},

{
  name: 'unmute',
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, ctx.from)) return;

    try {
      await ctx.sock.groupSettingUpdate(ctx.from, 'not_announcement');
      return ctx.reply('🔊 Group unmuted.');
    } catch (e) {
      return ctx.reply('Failed: ' + e.message);
    }
  }
},

{
  name: 'listmembers',
  aliases: ['members'],
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;

    const md = await getMeta(ctx, ctx.from);
    if (!md) return ctx.reply('❌ Cannot get members.');

    const members = md.participants.slice(0, 50);
    const message = `👥 *MEMBERS (${md.participants.length})*

${members.map((p, i) => `${i + 1}. @${displayId(p)} ${p.admin ? '👑' : ''}`).join('\n')}`;

    return ctx.sock.sendMessage(ctx.from, {
      text: message,
      mentions: members.map(p => p.id)
    });
  }
},

{
  name: 'admins',
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;

    const md = await getMeta(ctx, ctx.from);
    if (!md) return ctx.reply('❌ Cannot get admins.');

    const admins = md.participants.filter(p => p.admin);
    return ctx.sock.sendMessage(ctx.from, {
      text: `👑 *ADMINS (${admins.length})*\n\n${admins.map(p => `@${displayId(p)}`).join('\n')}`,
      mentions: admins.map(p => p.id)
    });
  }
},

{
  name: 'getpic',
  aliases: ['grouppic'],
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;

    try {
      const url = await ctx.sock.profilePictureUrl(ctx.from, 'image');
      return ctx.sock.sendMessage(ctx.from, {
        image: { url },
        caption: '🏠 Group Picture'
      }, { quoted: ctx.m });
    } catch {
      return ctx.reply('❌ No group picture available.');
    }
  }
},

{
  name: 'resetlink',
  aliases: ['revoke'],
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!await needBotAdmin(ctx, ctx.from)) return;

    try {
      const code = await ctx.sock.groupRevokeInvite(ctx.from);
      return ctx.reply(`✅ Link reset.\nhttps://chat.whatsapp.com/${code}`);
    } catch (e) {
      return ctx.reply('Failed: ' + e.message);
    }
  }
},

{
  name: 'welcome',
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;
    if (!await needAdmin(ctx)) return;

    ctx.db.group ||= {};
    ctx.db.group[ctx.from] ||= {};

    const value = String(ctx.args[0] || '').toLowerCase();
    if (value !== 'on' && value !== 'off') {
      return ctx.reply(`Usage: ${ctx.prefix}welcome on/off`);
    }

    ctx.db.group[ctx.from].welcome = value === 'on';
    save(ctx.db, ctx.F);

    return ctx.reply(`👋 Welcome: ${value.toUpperCase()}`);
  }
},

{
  name: 'goodbye',
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;
    if (!await needAdmin(ctx)) return;

    ctx.db.group ||= {};
    ctx.db.group[ctx.from] ||= {};

    const value = String(ctx.args[0] || '').toLowerCase();
    if (value !== 'on' && value !== 'off') {
      return ctx.reply(`Usage: ${ctx.prefix}goodbye on/off`);
    }

    ctx.db.group[ctx.from].goodbye = value === 'on';
    save(ctx.db, ctx.F);

    return ctx.reply(`👋 Goodbye: ${value.toUpperCase()}`);
  }
},

{
  name: 'setwelcome',
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!ctx.text) return ctx.reply(`Usage: ${ctx.prefix}setwelcome Welcome @user`);

    ctx.db.group ||= {};
    ctx.db.group[ctx.from] ||= {};
    ctx.db.group[ctx.from].welcomeMsg = ctx.text;
    save(ctx.db, ctx.F);

    return ctx.reply('✅ Welcome message saved.');
  }
},

{
  name: 'setgoodbye',
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!ctx.text) return ctx.reply(`Usage: ${ctx.prefix}setgoodbye Goodbye @user`);

    ctx.db.group ||= {};
    ctx.db.group[ctx.from] ||= {};
    ctx.db.group[ctx.from].goodbyeMsg = ctx.text;
    save(ctx.db, ctx.F);

    return ctx.reply('✅ Goodbye message saved.');
  }
},

{
  name: 'groupid',
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;
    return ctx.reply(`🆔 Group ID:\n${ctx.from}`);
  }
},

{
  name: 'setrules',
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;
    if (!await needAdmin(ctx)) return;
    if (!ctx.text) return ctx.reply(`Usage: ${ctx.prefix}setrules Group rules`);

    ctx.db.group ||= {};
    ctx.db.group[ctx.from] ||= {};
    ctx.db.group[ctx.from].rules = ctx.text;
    save(ctx.db, ctx.F);

    return ctx.reply('✅ Group rules saved.');
  }
},

{
  name: 'rules',
  aliases: ['getrules'],
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;

    const rules = ctx.db.group?.[ctx.from]?.rules;
    return ctx.reply(
      rules ? `📜 *GROUP RULES*\n\n${rules}` : 'No group rules have been set.'
    );
  }
},

{
  name: 'warn',
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;
    if (!await needAdmin(ctx)) return;

    const target = getTarget(ctx);
    if (!target) return ctx.reply(`Usage: ${ctx.prefix}warn @user`);

    const md = await getMeta(ctx, ctx.from);
    const jid = resolveTarget(md, target);
    if (!jid) return ctx.reply('❌ Member not found.');

    ctx.db.warns ||= {};
    ctx.db.warns[ctx.from] ||= {};
    ctx.db.warns[ctx.from][jid] =
      (ctx.db.warns[ctx.from][jid] || 0) + 1;

    save(ctx.db, ctx.F);

    return mentionReply(
      ctx,
      `⚠️ Warning issued: ${ctx.db.warns[ctx.from][jid]}/3`,
      jid
    );
  }
},

{
  name: 'unwarn',
  category: 'group',
  groupOnly: true,
  run: async ctx => {
    if (!needGroup(ctx.isGroup, ctx.reply)) return;
    if (!await needAdmin(ctx)) return;

    const target = getTarget(ctx);
    if (!target) return ctx.reply(`Usage: ${ctx.prefix}unwarn @user`);

    const md = await getMeta(ctx, ctx.from);
    const jid = resolveTarget(md, target);
    if (!jid) return ctx.reply('❌ Member not found.');

    if (ctx.db.warns?.[ctx.from]) {
      ctx.db.warns[ctx.from][jid] = 0;
    }

    save(ctx.db, ctx.F);

    return mentionReply(ctx, '✅ Warnings cleared.', jid);
  }
}

];
