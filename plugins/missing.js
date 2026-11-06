const getTarget = (m, args = []) => {
    const ctx = m.message?.extendedTextMessage?.contextInfo;
    const mentioned = ctx?.mentionedJid?.[0];

    if (mentioned) return mentioned;

    const quoted = ctx?.participant;
    if (quoted) return quoted;

    const number = args[0]?.replace(/[^0-9]/g, '');
    return number ? `${number}@s.whatsapp.net` : null;
};

const safe = async (reply, action, success) => {
    try {
        const result = await action();
        return reply(success(result));
    } catch (error) {
        console.error('[META AI CMD]', error);
        return reply(`❌ Failed: ${error.message}`);
    }
};

const setStatus = async (reply, db, F, category, name, args) => {
    db[category] = db[category] || {};

    const value = args[0]?.toLowerCase();

    if (!['on', 'off'].includes(value)) {
        return reply(`Usage: .${name} on/off`);
    }

    db[category][name] = value === 'on';

    await F.saveDB(db);

    return reply(`✅ ${name}: ${value.toUpperCase()}`);
};

module.exports = [

    // ================= OWNER =================

    {
        name: 'alive',
        run: async ({ reply, config }) =>
            reply(`✅ *${config.botName} IS ONLINE*`)
    },

    {
        name: 'setprefix',
        ownerOnly: true,
        run: async ({ reply, args, db, F }) => {
            if (!args[0]) return reply('Usage: .setprefix <prefix>');

            db.settings = db.settings || {};
            db.settings.prefix = args[0];

            await F.saveDB(db);

            return reply(`✅ Prefix saved: ${args[0]}`);
        }
    },

    {
        name: 'join',
        ownerOnly: true,
        run: async ({ reply, args, sock }) => {
            if (!args[0]) return reply('Usage: .join <group link>');

            const match = args[0].match(
                /chat\.whatsapp\.com\/([A-Za-z0-9]+)/
            );

            if (!match) return reply('❌ Invalid group link.');

            return safe(
                reply,
                () => sock.groupAcceptInvite(match[1]),
                () => '✅ Successfully joined group.'
            );
        }
    },

    {
        name: 'leave',
        ownerOnly: true,
        run: async ({ reply, sock, from, isGroup }) => {
            if (!isGroup) return reply('Group only.');

            await reply('👋 Leaving group.');

            return safe(
                reply,
                () => sock.groupLeave(from),
                () => '✅ Left group.'
            );
        }
    },

    {
        name: 'block',
        ownerOnly: true,
        run: async ({ reply, args, sock }) => {
            const jid = getTarget({ message: {} }, args);

            if (!jid) return reply('Usage: .block <number>');

            return safe(
                reply,
                () => sock.updateBlockStatus(jid, 'block'),
                () => `✅ Blocked ${jid.split('@')[0]}`
            );
        }
    },

    {
        name: 'unblock',
        ownerOnly: true,
        run: async ({ reply, args, sock }) => {
            const jid = getTarget({ message: {} }, args);

            if (!jid) return reply('Usage: .unblock <number>');

            return safe(
                reply,
                () => sock.updateBlockStatus(jid, 'unblock'),
                () => `✅ Unblocked ${jid.split('@')[0]}`
            );
        }
    },

    {
        name: 'addowner',
        ownerOnly: true,
        run: async ({ reply, args, db, F }) => {
            const number = args[0]?.replace(/[^0-9]/g, '');

            if (!number) return reply('Usage: .addowner <number>');

            db.owners = db.owners || [];

            if (db.owners.includes(number)) {
                return reply('Already an owner.');
            }

            db.owners.push(number);
            await F.saveDB(db);

            return reply(`✅ Owner added: ${number}`);
        }
    },

    {
        name: 'delowner',
        ownerOnly: true,
        run: async ({ reply, args, db, F }) => {
            const number = args[0]?.replace(/[^0-9]/g, '');

            if (!number) return reply('Usage: .delowner <number>');

            db.owners = (db.owners || []).filter(
                owner => owner !== number
            );

            await F.saveDB(db);

            return reply(`✅ Owner removed: ${number}`);
        }
    },

    {
        name: 'listowner',
        run: async ({ reply, db, config }) => {
            return reply(
                `👑 OWNER LIST\n\n` +
                `Main: ${config.ownerNumber}\n` +
                `Extra: ${(db.owners || []).join(', ') || 'None'}`
            );
        }
    },

    // ================= INFORMATION =================

    {
        name: 'uptime',
        run: async ({ reply }) => {
            const seconds = Math.floor(process.uptime());

            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = seconds % 60;

            return reply(`⏱️ UPTIME\n${h}h ${m}m ${s}s`);
        }
    },

    {
        name: 'runtime',
        run: async ({ reply }) => {
            const seconds = Math.floor(process.uptime());

            return reply(
                `⏱️ Runtime: ${Math.floor(seconds / 3600)}h ` +
                `${Math.floor((seconds % 3600) / 60)}m ` +
                `${seconds % 60}s`
            );
        }
    },

    {
        name: 'speed',
        run: async ({ reply, sock }) => {
            const start = Date.now();

            await sock.sendPresenceUpdate('available');

            return reply(`⚡ Response time: ${Date.now() - start}ms`);
        }
    },

    // ================= AUTO SETTINGS =================
    // These save settings. Your message handler must implement
    // the corresponding automation before these features take effect.

    ...[
        'autoread',
        'autotyping',
        'autoonline',
        'autoview',
        'autosticker',
        'autolikestatus',
        'autodownload',
        'autolikemsg',
        'autotranslate',
        'autotag',
        'autoblock',
        'autofollow',
        'autocorrect',
        'autogreet',
        'autopresence',
        'autostatus',
        'autorespond',
        'autoclean'
    ].map(name => ({
        name,
        run: async ({ reply, args, db, F }) =>
            setStatus(reply, db, F, 'auto', name, args)
    })),

    // ================= ANTI SETTINGS =================

    ...[
        'antiflood',
        'antifake',
        'antiscam',
        'antiraid',
        'antivirus',
        'antimention',
        'antigroup',
        'antidocument',
        'antiimage',
        'antiaudio',
        'antiforward',
        'antiedit',
        'antireport',
        'antilinkwarn'
    ].map(name => ({
        name,
        groupOnly: true,
        run: async ({ reply, args, db, F, isGroup, from }) => {
            if (!isGroup) return reply('Group only.');

            db.anti = db.anti || {};
            db.anti[from] = db.anti[from] || {};

            const value = args[0]?.toLowerCase();

            if (!['on', 'off'].includes(value)) {
                return reply(`Usage: .${name} on/off`);
            }

            db.anti[from][name] = value === 'on';

            await F.saveDB(db);

            return reply(`✅ ${name}: ${value.toUpperCase()}`);
        }
    })),

    // ================= MODERATION =================

    {
        name: 'warn',
        groupOnly: true,
        run: async ({ reply, args, m, db, F, isGroup, from }) => {
            if (!isGroup) return reply('Group only.');

            const target = getTarget(m, args);

            if (!target) return reply('Tag a member.');

            db.warns = db.warns || {};
            db.warns[from] = db.warns[from] || {};

            const count = (db.warns[from][target] || 0) + 1;

            db.warns[from][target] = count;

            await F.saveDB(db);

            return reply(
                `⚠️ @${target.split('@')[0]}\nWarnings: ${count}/${db.maxWarn || 3}`,
                { mentions: [target] }
            );
        }
    },

    {
        name: 'warnings',
        groupOnly: true,
        run: async ({ reply, args, m, db, from, isGroup }) => {
            if (!isGroup) return reply('Group only.');

            const target = getTarget(m, args);

            if (!target) return reply('Tag a member.');

            const count = db.warns?.[from]?.[target] || 0;

            return reply(
                `⚠️ @${target.split('@')[0]} has ${count} warnings.`,
                { mentions: [target] }
            );
        }
    },

    {
        name: 'resetwarn',
        groupOnly: true,
        run: async ({ reply, args, m, db, F, from, isGroup }) => {
            if (!isGroup) return reply('Group only.');

            const target = getTarget(m, args);

            if (!target) return reply('Tag a member.');

            db.warns = db.warns || {};
            db.warns[from] = db.warns[from] || {};
            db.warns[from][target] = 0;

            await F.saveDB(db);

            return reply('✅ Warnings reset.');
        }
    },

    {
        name: 'listwarn',
        groupOnly: true,
        run: async ({ reply, db, from, isGroup }) => {
            if (!isGroup) return reply('Group only.');

            const list = Object.entries(db.warns?.[from] || {})
                .filter(([, count]) => count > 0);

            if (!list.length) return reply('No warnings found.');

            const mentions = list.map(([jid]) => jid);

            return reply(
                `⚠️ WARNING LIST\n\n` +
                list.map(([jid, count]) =>
                    `@${jid.split('@')[0]}: ${count}`
                ).join('\n'),
                { mentions }
            );
        }
    },

    {
        name: 'setwarn',
        ownerOnly: true,
        run: async ({ reply, args, db, F }) => {
            const limit = Number(args[0]);

            if (!Number.isInteger(limit) || limit < 1 || limit > 10) {
                return reply('Usage: .setwarn <1-10>');
            }

            db.maxWarn = limit;
            await F.saveDB(db);

            return reply(`✅ Maximum warnings: ${limit}`);
        }
    },

    {
        name: 'delete',
        aliases: ['del'],
        groupOnly: true,
        run: async ({ reply, m, sock, from, isGroup }) => {
            if (!isGroup) return reply('Group only.');

            const ctx = m.message?.extendedTextMessage?.contextInfo;

            if (!ctx?.stanzaId) {
                return reply('Reply to a message.');
            }

            const key = {
                remoteJid: from,
                id: ctx.stanzaId,
                fromMe: ctx.participant === sock.user.id
            };

            if (ctx.participant) key.participant = ctx.participant;

            return safe(
                reply,
                () => sock.sendMessage(from, { delete: key }),
                () => '✅ Message deleted.'
            );
        }
    },

    // ================= GROUP MANAGEMENT =================

    {
        name: 'groupinfo',
        groupOnly: true,
        run: async ({ reply, sock, from, isGroup }) => {
            if (!isGroup) return reply('Group only.');

            return safe(
                reply,
                () => sock.groupMetadata(from),
                md =>
                    `📋 GROUP INFORMATION\n\n` +
                    `Name: ${md.subject}\n` +
                    `Members: ${md.participants.length}\n` +
                    `Owner: ${md.owner || 'Unavailable'}`
            );
        }
    },

    {
        name: 'grouplink',
        groupOnly: true,
        run: async ({ reply, sock, from, isGroup }) => {
            if (!isGroup) return reply('Group only.');

            return safe(
                reply,
                () => sock.groupInviteCode(from),
                code => `🔗 https://chat.whatsapp.com/${code}`
            );
        }
    },

    {
        name: 'resetlink',
        groupOnly: true,
        run: async ({ reply, sock, from, isGroup }) => {
            if (!isGroup) return reply('Group only.');

            return safe(
                reply,
                async () => {
                    await sock.groupRevokeInvite(from);
                    return sock.groupInviteCode(from);
                },
                code => `✅ New group link:\nhttps://chat.whatsapp.com/${code}`
            );
        }
    },

    {
        name: 'groupmute',
        groupOnly: true,
        run: async ({ reply, sock, from, isGroup }) => {
            if (!isGroup) return reply('Group only.');

            return safe(
                reply,
                () => sock.groupSettingUpdate(from, 'announcement'),
                () => '🔇 Group muted.'
            );
        }
    },

    {
        name: 'groupunmute',
        groupOnly: true,
        run: async ({ reply, sock, from, isGroup }) => {
            if (!isGroup) return reply('Group only.');

            return safe(
                reply,
                () => sock.groupSettingUpdate(from, 'not_announcement'),
                () => '🔊 Group unmuted.'
            );
        }
    },

    {
        name: 'lock',
        groupOnly: true,
        run: async ({ reply, sock, from, isGroup }) => {
            if (!isGroup) return reply('Group only.');

            return safe(
                reply,
                () => sock.groupSettingUpdate(from, 'locked'),
                () => '🔒 Group information locked.'
            );
        }
    },

    {
        name: 'unlock',
        groupOnly: true,
        run: async ({ reply, sock, from, isGroup }) => {
            if (!isGroup) return reply('Group only.');

            return safe(
                reply,
                () => sock.groupSettingUpdate(from, 'unlocked'),
                () => '🔓 Group information unlocked.'
            );
        }
    },

    {
        name: 'admins',
        groupOnly: true,
        run: async ({ reply, sock, from, isGroup }) => {
            if (!isGroup) return reply('Group only.');

            return safe(
                reply,
                () => sock.groupMetadata(from),
                md => {
                    const admins = md.participants.filter(p => p.admin);

                    return `👑 GROUP ADMINS\n\n` +
                        admins.map(p => `@${p.id.split('@')[0]}`).join('\n');
                }
            );
        }
    },

    {
        name: 'members',
        groupOnly: true,
        run: async ({ reply, sock, from, isGroup }) => {
            if (!isGroup) return reply('Group only.');

            return safe(
                reply,
                () => sock.groupMetadata(from),
                md => `👥 Total members: ${md.participants.length}`
            );
        }
    },

    {
        name: 'listmembers',
        groupOnly: true,
        run: async ({ reply, sock, from, isGroup }) => {
            if (!isGroup) return reply('Group only.');

            return safe(
                reply,
                () => sock.groupMetadata(from),
                md => {
                    const members = md.participants;

                    return `👥 MEMBERS (${members.length})\n\n` +
                        members.map((p, i) =>
                            `${i + 1}. @${p.id.split('@')[0]}`
                        ).join('\n');
                }
            );
        }
    },

    {
        name: 'getpic',
        run: async ({ reply, sock, from, m, args }) => {
            const target = getTarget(m, args) || from;

            return safe(
                reply,
                () => sock.profilePictureUrl(target, 'image'),
                url => `🖼️ Profile picture:\n${url}`
            );
        }
    },

    {
        name: 'setrules',
        groupOnly: true,
        run: async ({ reply, args, db, F, from, isGroup }) => {
            if (!isGroup) return reply('Group only.');

            if (!args.length) {
                return reply('Usage: .setrules <rules>');
            }

            db.group = db.group || {};
            db.group[from] = db.group[from] || {};
            db.group[from].rules = args.join(' ');

            await F.saveDB(db);

            return reply('✅ Group rules saved.');
        }
    },

    {
        name: 'rules',
        groupOnly: true,
        run: async ({ reply, db, from, isGroup }) => {
            if (!isGroup) return reply('Group only.');

            const rules = db.group?.[from]?.rules;

            return reply(rules || 'No group rules have been configured.');
        }
    }

];
