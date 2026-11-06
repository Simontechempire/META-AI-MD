// plugins/auto.js
// META AI V2 - Auto Plugin
// Developer: Simon Tech Inc

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const autoList = [
    ['autoread', 'Auto Read'],
    ['autotyping', 'Auto Typing'],
    ['autoonline', 'Auto Online'],
    ['autorecording', 'Auto Recording'],
    ['autoreact', 'Auto React'],
    ['autolikemsg', 'Auto Like Message'],
    ['autoreply', 'Auto Reply'],
    ['autosticker', 'Auto Sticker'],
    ['autoview', 'Auto View Status'],
    ['autolikestatus', 'Auto Like Status'],
    ['autobio', 'Auto Bio'],
    ['autogreet', 'Auto Greet']
];

function saveDB(ctx) {
    if (typeof ctx.F?.saveDB === 'function') {
        ctx.F.saveDB(ctx.db);
    }
}

function getText(m, F) {
    if (typeof F?.getText === 'function') {
        try {
            return F.getText(m) || '';
        } catch {}
    }

    let msg = m.message?.ephemeralMessage?.message || m.message || {};

    return (
        msg.conversation ||
        msg.extendedTextMessage?.text ||
        msg.imageMessage?.caption ||
        msg.videoMessage?.caption ||
        ''
    );
}

function getBotIds(sock) {
    const ids = [];

    const raw = String(sock.user?.id || '');
    const number = raw.split(':')[0].split('@')[0].replace(/\D/g, '');

    if (number) ids.push(number);

    const lid = String(sock.user?.lid || '')
        .split('@')[0]
        .replace(/\D/g, '');

    if (lid) ids.push(lid);

    return ids;
}

function isBotMentioned(m, sock) {
    const context =
        m.message?.extendedTextMessage?.contextInfo ||
        m.message?.imageMessage?.contextInfo ||
        m.message?.videoMessage?.contextInfo ||
        {};

    const ids = getBotIds(sock);

    return (context.mentionedJid || []).some(jid =>
        ids.some(id => String(jid).includes(id))
    );
}

function setAuto(db, key, value) {
    if (!db.auto) db.auto = {};
    db.auto[key] = value;
}

function statusText(db, key, label, prefix) {
    const enabled = db.auto?.[key] === true;

    return `*${label}*

Status: ${enabled ? '✅ ON' : '❌ OFF'}

Usage:
${prefix}${key} on
${prefix}${key} off

©️ Simon Tech Inc`;
}

// ======================================
// AUTO MESSAGE HANDLER
// ======================================

async function handleAuto(sock, m, db, F, config) {
    try {
        if (!m?.key || m.key.fromMe) return;
        if (m.key.remoteJid === 'status@broadcast') return;

        const auto = db.auto || {};
        if (!Object.values(auto).some(v => v === true)) return;

        const from = m.key.remoteJid;
        const prefix = db.settings?.prefix || config?.PREFIX || '.';

        if (auto.autoread) {
            await sock.readMessages([m.key]).catch(() => {});
        }

        if (auto.autoonline) {
            await sock.sendPresenceUpdate('available').catch(() => {});
        }

        if (auto.autotyping) {
            await sock.sendPresenceUpdate('composing', from).catch(() => {});
        }

        if (auto.autorecording) {
            await sock.sendPresenceUpdate('recording', from).catch(() => {});
        }

        if (auto.autoreact) {
            await sock.sendMessage(from, {
                react: { text: '❤️', key: m.key }
            }).catch(() => {});
        } else if (auto.autolikemsg) {
            await sock.sendMessage(from, {
                react: { text: '👍', key: m.key }
            }).catch(() => {});
        }

        const text = getText(m, F).trim();
        const lower = text.toLowerCase();

        if (
            auto.autoreply &&
            ['hi', 'hello', 'hey', 'hii', 'hiii'].includes(lower)
        ) {
            await sock.sendMessage(
                from,
                {
                    text: `Hello 👋\nI am META AI V2.\nType ${prefix}menu to see my commands.`
                },
                { quoted: m }
            );
        }

        if (auto.autorespond && text && isBotMentioned(m, sock)) {
            // AI response will be connected to your chosen AI provider later.
            // No fake AI response is sent here.
        }

        if (auto.autosticker && m.message?.imageMessage) {
            const stream = await downloadContentFromMessage(
                m.message.imageMessage,
                'image'
            );

            const chunks = [];

            for await (const chunk of stream) {
                chunks.push(chunk);
            }

            const buffer = Buffer.concat(chunks);

            if (buffer.length) {
                await sock.sendMessage(
                    from,
                    { sticker: buffer },
                    { quoted: m }
                );
            }
        }

    } catch (error) {
        console.error('[AUTO MESSAGE]', error.message);
    }
}

// ======================================
// STATUS HANDLER
// ======================================

async function handleStatus(sock, status, db) {
    try {
        if (!status?.key || !db.auto) return;

        if (db.auto.autoview) {
            await sock.readMessages([status.key]).catch(() => {});
        }

        if (db.auto.autolikestatus) {
            await sock.sendMessage(status.key.remoteJid, {
                react: {
                    text: '❤️',
                    key: status.key
                }
            }).catch(() => {});
        }

    } catch (error) {
        console.error('[AUTO STATUS]', error.message);
    }
}

// ======================================
// GROUP PARTICIPANT HANDLER
// ======================================

async function handleParticipants(sock, update, db) {
    try {
        if (!db.auto) return;

        const { id, participants, action } = update;

        if (!id || !participants?.length) return;

        for (const user of participants) {
            if (action === 'add' && db.auto.autowelcome) {
                await sock.sendMessage(id, {
                    text: `👋 Welcome @${user.split('@')[0]}!\nWelcome to the group.`,
                    mentions: [user]
                }).catch(() => {});
            }

            if (action === 'remove' && db.auto.autogoodbye) {
                await sock.sendMessage(id, {
                    text: `👋 Goodbye @${user.split('@')[0]}.`,
                    mentions: [user]
                }).catch(() => {});
            }
        }

    } catch (error) {
        console.error('[AUTO GROUP]', error.message);
    }
}

// ======================================
// AUTO BIO HANDLER
// ======================================

const bioTimers = new WeakMap();

function startAutoBio(sock, db, config = {}) {
    const previous = bioTimers.get(sock);

    if (previous) clearInterval(previous);

    const timer = setInterval(async () => {
        if (db.auto?.autobio) {
            try {
                const time = new Date().toLocaleTimeString('en-US', {
                    timeZone: config.timezone || 'Africa/Lagos'
                });

                await sock.updateProfileStatus(
                    `🤖 META AI V2 | ${time} | Simon Tech`
                );
            } catch (error) {
                console.error('[AUTO BIO]', error.message);
            }
        }

        if (db.auto?.autoonline) {
            await sock.sendPresenceUpdate('available').catch(() => {});
        }

    }, 60000);

    bioTimers.set(sock, timer);
}

// ======================================
// COMMANDS
// ======================================

const cmds = autoList.map(([key, label]) => ({
    name: key,
    category: 'auto',
    ownerOnly: true,

    run: async ctx => {
        const value = String(ctx.args?.[0] || '').toLowerCase();

        if (value !== 'on' && value !== 'off') {
            return ctx.reply(
                statusText(ctx.db, key, label, ctx.prefix)
            );
        }

        setAuto(ctx.db, key, value === 'on');
        saveDB(ctx);

        return ctx.reply(
            `✅ *${label}* is now *${value.toUpperCase()}*.`
        );
    }
}));

cmds.push({
    name: 'auto',
    aliases: ['autolist'],
    category: 'auto',
    ownerOnly: true,

    run: async ({ db, reply, prefix }) => {
        let output = `◈┈▉ META AI V2 ▉┄◈\n\n`;
        output += `⚙️ *AUTO SETTINGS*\n\n`;

        for (const [key, label] of autoList) {
            output += `${db.auto?.[key] ? '✅' : '❌'} ${label}\n`;
        }

        output += `\nUsage: ${prefix}autoread on`;

        return reply(output);
    }
});

module.exports = cmds;
module.exports.handleAuto = handleAuto;
module.exports.handleStatus = handleStatus;
module.exports.handleParticipants = handleParticipants;
module.exports.startAutoBio = startAutoBio;
