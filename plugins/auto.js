// plugins/auto.js - FIXED - LID mention + no double welcome
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const autoList = [
    ['autoread', 'Auto Read'], ['autotyping', 'Auto Typing'], ['autoonline', 'Auto Online'],
    ['autorecording', 'Auto Recording'], ['autoreact', 'Auto React'], ['autolikemsg', 'Auto Like Message'],
    ['autoreply', 'Auto Reply'], ['autorespond', 'Auto Respond To Mentions'], ['autosticker', 'Auto Sticker'],
    ['autoview', 'Auto View Status'], ['autolikestatus', 'Auto Like Status'], ['autobio', 'Auto Bio'],
    ['autowelcome', 'Auto Welcome'], ['autogoodbye', 'Auto Goodbye'], ['autogreet', 'Auto Greet']
];
function saveDB(ctx) { if (typeof ctx.F?.saveDB === 'function') ctx.F.saveDB(ctx.db); }
function getNumber(jid){ return String(jid || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, ''); }
function getText(m, F) {
    if (typeof F?.getText === 'function') { try { return F.getText(m) || ''; } catch {} }
    let msg = m.message?.ephemeralMessage?.message || m.message || {};
    return msg.conversation || msg.extendedTextMessage?.text || msg.imageMessage?.caption || msg.videoMessage?.caption || '';
}
function getBotIds(sock) {
    const ids = [];
    const raw = String(sock.user?.id || '');
    const number = raw.split(':')[0].split('@')[0].replace(/\D/g, '');
    if (number) ids.push(number);
    const lid = String(sock.user?.lid || '').split('@')[0].replace(/\D/g, '');
    if (lid) ids.push(lid);
    if (sock.user?.pn) ids.push(getNumber(sock.user.pn));
    // also full JIDs for exact match
    if (sock.user?.id) ids.push(sock.user.id);
    if (sock.user?.lid) ids.push(sock.user.lid);
    return ids;
}
function isBotMentioned(m, sock) {
    const context = m.message?.extendedTextMessage?.contextInfo || m.message?.imageMessage?.contextInfo || m.message?.videoMessage?.contextInfo || {};
    const ids = getBotIds(sock);
    return (context.mentionedJid || []).some(jid => ids.some(id => String(jid) === id || String(jid).includes(id) || String(id).includes(String(jid).split('@')[0])));
}
function setAuto(db, key, value) { if (!db.auto) db.auto = {}; db.auto[key] = value; }
function statusText(db, key, label, prefix) {
    const enabled = db.auto?.[key] === true;
    return `*${label}*\n\nStatus: ${enabled ? '✅ ON' : '❌ OFF'}\n\nUsage:\n${prefix}${key} on\n${prefix}${key} off\n\n©️ Simon Tech Inc`;
}
async function handleAuto(sock, m, db, F, config) {
    try {
        if (!m?.key || m.key.fromMe) return;
        if (m.key.remoteJid === 'status@broadcast') return;
        const auto = db.auto || {};
        if (!Object.values(auto).some(v => v === true)) return;
        const from = m.key.remoteJid;
        const prefix = db.settings?.prefix || config?.prefix || '.';
        if (auto.autoread) await sock.readMessages([m.key]).catch(() => {});
        if (auto.autoonline) await sock.sendPresenceUpdate('available').catch(() => {});
        if (auto.autotyping) await sock.sendPresenceUpdate('composing', from).catch(() => {});
        if (auto.autorecording) await sock.sendPresenceUpdate('recording', from).catch(() => {});
        if (auto.autoreact) await sock.sendMessage(from, { react: { text: '❤️', key: m.key } }).catch(() => {});
        if (auto.autolikemsg) await sock.sendMessage(from, { react: { text: '👍', key: m.key } }).catch(() => {});
        const text = getText(m, F).trim();
        const lower = text.toLowerCase();
        if (auto.autoreply && ['hi', 'hello', 'hey', 'hii', 'hiii'].includes(lower)) {
            await sock.sendMessage(from, { text: `Hello 👋\nI am META AI MD.\nType ${prefix}menu to see my commands.` }, { quoted: m }).catch(()=>{});
        }
        if (auto.autorespond && text && isBotMentioned(m, sock)) {
            await sock.sendMessage(from, { text: `Yes? 👋 You mentioned me.\nType ${prefix}menu to see what I can do.` }, { quoted: m }).catch(()=>{});
        }
        if (auto.autosticker && m.message?.imageMessage) {
            try {
                const stream = await downloadContentFromMessage(m.message.imageMessage, 'image');
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                const buffer = Buffer.concat(chunks);
                if (buffer.length) await sock.sendMessage(from, { sticker: buffer }, { quoted: m }).catch(()=>{});
            } catch {}
        }
    } catch (error) { console.error('[AUTO MESSAGE]', error.message); }
}
async function handleStatus(sock, status, db, F, config) {
    try {
        if (!status?.key || !db.auto) return;
        if (db.auto.autoview) await sock.readMessages([status.key]).catch(() => {});
        if (db.auto.autolikestatus) {
            await sock.sendMessage('status@broadcast', { react: { text: '❤️', key: status.key } }).catch(() => {});
        }
    } catch (error) { console.error('[AUTO STATUS]', error.message); }
}
async function handleParticipants(sock, update, db, F, config) {
    try {
        if (!db.auto) return;
        const { id, participants, action } = update;
        if (!id || !participants?.length) return;
        // FIXED: If db.group welcome already ON, let index handle it - avoid double welcome
        if (db.group?.[id]?.welcome && action === 'add') return;
        if (db.group?.[id]?.goodbye && action === 'remove') return;
        let meta = null;
        try { if (F?.getGroupMeta) meta = await F.getGroupMeta(sock, id); } catch {}
        const display = (uid) => {
            if (meta && F?.findParticipant) {
                let p = F.findParticipant(meta, uid);
                if (p?.phoneNumber) return getNumber(p.phoneNumber);
                if (p?.lid) return getNumber(p.lid);
            }
            return getNumber(uid);
        };
        for (const user of participants) {
            const pnNum = display(user);
            if (action === 'add' && db.auto.autowelcome) {
                await sock.sendMessage(id, { text: `👋 Welcome @${pnNum}!\nWelcome to the group.\nType .menu for commands.`, mentions: [user] }).catch(() => {});
            }
            if (action === 'add' && db.auto.autogreet && !db.auto.autowelcome) {
                await sock.sendMessage(id, { text: `👋 Hello @${pnNum}, welcome!`, mentions: [user] }).catch(() => {});
            }
            if (action === 'remove' && db.auto.autogoodbye) {
                await sock.sendMessage(id, { text: `👋 Goodbye @${pnNum}. We will miss you.`, mentions: [user] }).catch(() => {});
            }
        }
    } catch (error) { console.error('[AUTO GROUP]', error.message); }
}
const bioTimers = new WeakMap();
function startAutoBio(sock, db, config = {}) {
    const previous = bioTimers.get(sock);
    if (previous) clearInterval(previous);
    const timer = setInterval(async () => {
        if (db.auto?.autobio) {
            try {
                const time = new Date().toLocaleTimeString('en-US', { timeZone: config.timezone || 'UTC' });
                await sock.updateProfileStatus(`🤖 META AI MD | ${time} | Simon Tech`);
            } catch (error) { console.error('[AUTO BIO]', error.message); }
        }
        if (db.auto?.autoonline) await sock.sendPresenceUpdate('available').catch(() => {});
    }, 60000);
    bioTimers.set(sock, timer);
}
const cmds = autoList.map(([key, label]) => ({
    name: key, category: 'auto', ownerOnly: true,
    run: async ctx => {
        const value = String(ctx.args?.[0] || '').toLowerCase();
        if (value !== 'on' && value !== 'off') return ctx.reply(statusText(ctx.db, key, label, ctx.prefix));
        setAuto(ctx.db, key, value === 'on');
        saveDB(ctx);
        return ctx.reply(`✅ *${label}* is now *${value.toUpperCase()}*.`);
    }
}));
cmds.push({ name: 'auto', aliases: ['autolist'], category: 'auto', ownerOnly: true, run: async ({ db, reply, prefix }) => {
    let output = `◈┈▉ META AI MD ▉┄◈\n\n⚙️ *AUTO SETTINGS*\n\n`;
    for (const [key, label] of autoList) output += `${db.auto?.[key] ? '✅' : '❌'} ${label} (${prefix}${key})\n`;
    output += `\nUsage: ${prefix}autoread on\n\n©️ Simon Tech Inc`;
    return reply(output);
}});
module.exports = cmds;
module.exports.handleAuto = handleAuto;
module.exports.handleStatus = handleStatus;
module.exports.handleParticipants = handleParticipants;
module.exports.startAutoBio = startAutoBio;
