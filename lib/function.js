
// META AI MD - Helper Functions
// Developer: SIMON TECH INC

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const {
    downloadContentFromMessage,
    getContentType
} = require('@whiskeysockets/baileys');

const OWNER = '2348102350169';
const FOOTER = '©️ Created by Simon Tech Inc';
const DB_FILE = path.join(__dirname, '../database.json');

// ---------- DATABASE ----------
function loadDB() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

            db.owners = Array.isArray(db.owners) ? db.owners : [];
            if (!db.owners.includes(OWNER)) db.owners.push(OWNER);

            db.settings = {
                prefix: '.',
                mode: 'public',
                botName: 'META AI MD',
                ...(db.settings || {})
            };

            for (const key of [
                'auto', 'anti', 'warns',
                'welcome', 'goodbye', 'rules', 'chat'
            ]) {
                db[key] = db[key] || {};
            }

            return db;
        }
    } catch (error) {
        console.error('Database load error:', error.message);
    }

    return {
        owners: [OWNER],
        owner: OWNER,
        settings: {
            prefix: '.',
            mode: 'public',
            botName: 'META AI MD'
        },
        auto: {},
        anti: {},
        warns: {},
        welcome: {},
        goodbye: {},
        rules: {},
        chat: {}
    };
}

function saveDB(db) {
    try {
        fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
        return true;
    } catch (error) {
        console.error('Database save error:', error.message);
        return false;
    }
}

// ---------- OWNER ----------
function cleanNumber(text) {
    return String(text || '').replace(/[^0-9]/g, '');
}

function isOwner(jid, db) {
    const number = cleanNumber(String(jid || '').split('@')[0]);

    // Only the configured main owner is trusted here.
    return number === OWNER;
}

// ---------- TARGET ----------
function getTarget(m, args = []) {
    const context = m.message?.extendedTextMessage?.contextInfo;

    if (context?.mentionedJid?.length) {
        return context.mentionedJid[0];
    }

    if (args[0]) {
        const number = cleanNumber(args[0]);

        if (number.length >= 7) {
            return number + '@s.whatsapp.net';
        }
    }

    return null;
}

// ---------- TEXT ----------
function getText(m) {
    const msg = m.message || {};

    return (
        msg.conversation ||
        msg.extendedTextMessage?.text ||
        msg.imageMessage?.caption ||
        msg.videoMessage?.caption ||
        msg.documentMessage?.caption ||
        ''
    );
}

function getQuoted(m) {
    return m.message?.extendedTextMessage
        ?.contextInfo?.quotedMessage || null;
}

function isGroup(jid) {
    return String(jid || '').endsWith('@g.us');
}

// ---------- GROUP ----------
async function getAdmins(sock, jid) {
    try {
        const md = await sock.groupMetadata(jid);
        const participants = md.participants || [];

        return {
            md,
            admins: participants
                .filter(p => p.admin)
                .map(p => p.id),
            all: participants.map(p => p.id),
            isAdmin: id =>
                !!participants.find(p => p.id === id)?.admin
        };
    } catch {
        return {
            md: null,
            admins: [],
            all: [],
            isAdmin: () => false
        };
    }
}

// ---------- MEDIA ----------
async function downloadMedia(m) {
    try {
        const msg = m.message || {};
        const type = getContentType(msg);

        if (!type || !type.endsWith('Message')) return null;

        const stream = await downloadContentFromMessage(
            msg[type],
            type.replace('Message', '').toLowerCase()
        );

        const chunks = [];

        for await (const chunk of stream) {
            chunks.push(chunk);
        }

        return Buffer.concat(chunks);
    } catch (error) {
        console.error('Media download error:', error.message);
        return null;
    }
}

// ---------- HTTP ----------
async function getBuffer(url, opts = {}) {
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        ...opts
    });

    return Buffer.from(response.data);
}

async function fetchJson(url, opts = {}) {
    const response = await axios.get(url, {
        timeout: 20000,
        ...opts
    });

    return response.data;
}

async function fetchText(url) {
    const response = await axios.get(url, {
        timeout: 20000
    });

    return response.data;
}

// ---------- TIME ----------
function runtime() {
    const seconds = Math.floor(process.uptime());
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours}h ${minutes}m ${secs}s`;
}

function formatNumber(number) {
    return Number(number).toLocaleString('en-US');
}

// ---------- REPLY ----------
function makeReply(sock) {
    return async (m, text, opts = {}) => {
        return sock.sendMessage(
            m.key.remoteJid,
            {
                text: String(text) + '\n\n' + FOOTER,
                ...opts
            },
            { quoted: m }
        );
    };
}

module.exports = {
    OWNER,
    FOOTER,
    loadDB,
    saveDB,
    isOwner,
    cleanNumber,
    getTarget,
    getText,
    getQuoted,
    isGroup,
    getAdmins,
    downloadMedia,
    getBuffer,
    fetchJson,
    fetchText,
    runtime,
    formatNumber,
    makeReply
};
      
