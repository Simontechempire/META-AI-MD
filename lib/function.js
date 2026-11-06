// lib/function.js - META AI MD Helpers by Simon Tech - CONNECTED ALL
// This file na the bridge - config.js + index.js + all commands go use this one

const axios = require('axios');
const fs = require('fs');
const { downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys');

const OWNER = '2348102350169';
const FOOTER = '©️ created by Simon tech inc';

// ---------- DB - CONNECTED TO config.js ----------
function loadDB() {
  let defaultDB = {
    owners: [OWNER],
    owner: OWNER,
    settings: { prefix: ',', mode: 'private', botName: 'META AI MD' }, // FIXED: , + private, match config.js
    auto: {}, anti: {}, warns: {}, muted: {}, banned: [],
    group: {}, // FIXED: group settings live here - welcome/goodbye/rules/warns all inside group
    chat: {}
  };
  try {
    if (fs.existsSync('./database.json')) {
      let d = JSON.parse(fs.readFileSync('./database.json'));
      // Merge - no overwrite user settings
      d.owners = d.owners || [];
      if(!d.owners.includes(OWNER)) d.owners.push(OWNER);
      d.settings = d.settings || {};
      // Only fill if missing - NEVER force . / public over user choice
      if (!d.settings.prefix) d.settings.prefix = ',';
      if (!d.settings.mode) d.settings.mode = 'private';
      if (!d.settings.botName) d.settings.botName = 'META AI MD';
      d.auto = d.auto || {};
      d.anti = d.anti || {};
      d.warns = d.warns || {};
      d.muted = d.muted || {};
      d.banned = d.banned || [];
      d.group = d.group || {};
      d.chat = d.chat || {};
      // Migrate old keys: d.welcome/d.goodbye/d.rules -> d.group
      return d;
    }
  } catch(e){ console.log('loadDB fail, using default:', e.message); }
  return defaultDB;
}

function saveDB(db) {
  try{ fs.writeFileSync('./database.json', JSON.stringify(db, null, 2)); }catch(e){ console.log('saveDB fail:', e.message); }
}

// ---------- OWNER / JID ----------
function isOwner(jid, db) {
  let n = String(jid || '').split('@')[0].replace(/[^0-9]/g, '');
  if(n === OWNER) return true;
  if(db?.owners && db.owners.includes(n)) return true;
  if(db?.owner && String(db.owner).replace(/[^0-9]/g,'') === n) return true;
  return false;
}

function cleanNumber(text) {
  return (text || '').replace(/[^0-9]/g, '');
}

function getTarget(m, args) {
  // 1. Mentioned
  let ctx = m.message?.extendedTextMessage?.contextInfo || m.message?.imageMessage?.contextInfo || m.message?.videoMessage?.contextInfo || m.message?.stickerMessage?.contextInfo;
  if (ctx?.mentionedJid?.[0]) return ctx.mentionedJid[0];
  // 2. Quoted / Reply - REAL: participant is the person wey send the quoted msg
  if (ctx?.participant) return ctx.participant;
  if (ctx?.quotedMessage && ctx?.participant) return ctx.participant;
  // 3. Number from args
  if (args?.[0]) {
    let n = cleanNumber(args[0]);
    // Remove @ if user type @234...
    if (n.length >= 7) return n + '@s.whatsapp.net';
  }
  return null;
}

// ---------- TEXT - CONNECTED TO ALL MESSAGE TYPES ----------
function getText(m) {
  let msg = m.message;
  if (!msg) return '';
  return msg?.conversation
    || msg?.extendedTextMessage?.text
    || msg?.imageMessage?.caption
    || msg?.videoMessage?.caption
    || msg?.documentMessage?.caption
    || msg?.stickerMessage?.caption
    || msg?.viewOnceMessage?.message?.imageMessage?.caption
    || msg?.viewOnceMessageV2?.message?.imageMessage?.caption
    || msg?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation
    || '';
}

function getQuoted(m) {
  return m.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
}

function isGroup(jid) {
  return jid && jid.endsWith('@g.us');
}

// ---------- GROUP ----------
async function getAdmins(sock, jid) {
  try {
    let md = await sock.groupMetadata(jid);
    return {
      md,
      admins: md.participants.filter(p => p.admin).map(p => p.id),
      all: md.participants.map(p => p.id),
      isAdmin: (id) => !!md.participants.find(p => p.id === id)?.admin,
      isBotAdmin: () => {
        let myId = sock.user.id.split(':')[0];
        let me = md.participants.find(p => p.id.split('@')[0] === myId);
        return !!(me && me.admin);
      }
    };
  } catch {
    return { md: null, admins: [], all: [], isAdmin: () => false, isBotAdmin: () => false };
  }
}

// ---------- MEDIA / FETCH - FIXED FOR QUOTED + DIRECT ----------
async function downloadMedia(m) {
  try {
    let msg = m.message;
    // 1. Direct image/video/sticker/document/audio
    let type = null;
    try { type = getContentType(msg); } catch(e){}
    if (type && msg[type]) {
      let kind = type.replace('Message','');
      // viewOnce
      if (type === 'viewOnceMessage' || type === 'viewOnceMessageV2') {
        let inner = msg[type].message;
        let innerType = getContentType(inner);
        let stream = await downloadContentFromMessage(inner[innerType], innerType.replace('Message',''));
        let buf = [];
        for await (let c of stream) buf.push(c);
        return Buffer.concat(buf);
      }
      let stream = await downloadContentFromMessage(msg[type], kind);
      let buf = [];
      for await (let c of stream) buf.push(c);
      return Buffer.concat(buf);
    }
    // 2. Quoted image/video - for ,setpp when you reply to image
    let quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (quoted) {
      let qType = getContentType(quoted);
      if (quoted[qType]) {
        let stream = await downloadContentFromMessage(quoted[qType], qType.replace('Message',''));
        let buf = [];
        for await (let c of stream) buf.push(c);
        return Buffer.concat(buf);
      }
    }
    return null;
  } catch(e){ console.log('downloadMedia fail:', e.message); return null; }
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

// ---------- CONNECTED HELPERS - Used by index.js ----------
function getMode(db, config){
  return db?.settings?.mode || db?.mode || config?.mode || 'private';
}
function getPrefix(db, config){
  return db?.settings?.prefix || config?.prefix || ',';
}
function getWarn(db, gid, uid){
  return db?.warns?.[gid]?.[uid] || 0;
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
  makeReply,
  getMode,
  getPrefix,
  getWarn
};
