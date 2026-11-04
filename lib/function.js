// lib/function.js - META AI MD Helpers by Simon Tech
const axios = require('axios');
const fs = require('fs');
const { downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys');

const OWNER = '2348102350169';
const FOOTER = '©️ created by Simon tech inc';

// ---------- DB ----------
function loadDB() {
  try {
    if (fs.existsSync('./database.json')) return JSON.parse(fs.readFileSync('./database.json'));
  } catch {}
  return {
    owners: [OWNER],
    settings: { prefix: '.', mode: 'public', botName: 'META AI MD' },
    auto: {}, anti: {}, warns: {}, welcome: {}, goodbye: {}, rules: {}, chat: {}
  };
}

function saveDB(db) {
  fs.writeFileSync('./database.json', JSON.stringify(db, null, 2));
}

// ---------- OWNER / JID ----------
function isOwner(jid, db) {
  let n = (jid || '').split('@')[0].replace(/[^0-9]/g, '');
  return (db?.owners || [OWNER]).includes(n) || n === OWNER;
}

function cleanNumber(text) {
  return (text || '').replace(/[^0-9]/g, '');
}

function getTarget(m, args) {
  let ctx = m.message?.extendedTextMessage?.contextInfo;
  if (ctx?.mentionedJid?.[0]) return ctx.mentionedJid[0];
  if (ctx?.participant) return ctx.participant;
  if (args?.[0]) {
    let n = cleanNumber(args[0]);
    if (n.length >= 7) return n + '@s.whatsapp.net';
  }
  return null;
}

// ---------- TEXT ----------
function getText(m) {
  let msg = m.message;
  return msg?.conversation || msg?.extendedTextMessage?.text || msg?.imageMessage?.caption || msg?.videoMessage?.caption || msg?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation || '';
}

function getQuoted(m) {
  return m.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
}

function isGroup(jid) {
  return jid.endsWith('@g.us');
}

// ---------- GROUP ----------
async function getAdmins(sock, jid) {
  try {
    let md = await sock.groupMetadata(jid);
    return {
      md,
      admins: md.participants.filter(p => p.admin).map(p => p.id),
      all: md.participants.map(p => p.id),
      isAdmin: (id) => !!md.participants.find(p => p.id === id)?.admin
    };
  } catch {
    return { md: null, admins: [], all: [], isAdmin: () => false };
  }
}

// ---------- MEDIA / FETCH ----------
async function downloadMedia(m) {
  try {
    let msg = m.message;
    let type = getContentType(msg);
    let stream = await downloadContentFromMessage(msg[type], type.replace('Message', ''));
    let buf = [];
    for await (let c of stream) buf.push(c);
    return Buffer.concat(buf);
  } catch {
    return null;
  }
}

async function getBuffer(url, opts = {}) {
  let res = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000, ...opts });
  return Buffer.from(res.data);
}

async function fetchJson(url, opts = {}) {
  let res = await axios.get(url, { timeout: 20000, ...opts });
  return res.data;
}

async function fetchText(url) {
  let res = await axios.get(url, { timeout: 20000 });
  return res.data;
}

// ---------- TIME / FORMAT ----------
function runtime() {
  let s = Math.floor(process.uptime());
  let h = Math.floor(s / 3600);
  let m = Math.floor((s % 3600) / 60);
  let sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

function formatNumber(n) {
  return Number(n).toLocaleString('en-US');
}

// ---------- REPLY ----------
function makeReply(sock) {
  return async (m, text, opts = {}) => {
    return sock.sendMessage(m.key.remoteJid, { text: text + '\n\n' + FOOTER, ...opts }, { quoted: m });
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
