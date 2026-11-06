// lib/function.js - META AI MD Helpers by Simon Tech - CONNECTED ALL + LID FIX
// FIXED - Public First + Owner fit change to Private with ,mode private

const axios = require('axios');
const fs = require('fs');
const { downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys');

const OWNER = '2348102350169'; // Person wey pair the bot = MAIN OWNER
const OWNER_LID = '23223458631686'; // LID of owner - for LID match ONLY, no be phone number
const OWNER2 = OWNER_LID; // Keep for backward compat - old code dey use OWNER2
const FOOTER = '©️ created by Simon tech inc';

// ---------- FANCY BOLD FONT - Same as index.js ----------
function fancy(text){
  const map = {a:'𝐚',b:'𝐛',c:'𝐜',d:'𝐝',e:'𝐞',f:'𝐟',g:'𝐠',h:'𝐡',i:'𝐢',j:'𝐣',k:'𝐤',l:'𝐥',m:'𝐦',n:'𝐧',o:'𝐨',p:'𝐩',q:'𝐪',r:'𝐫',s:'𝐬',t:'𝐭',u:'𝐮',v:'𝐯',w:'𝐰',x:'𝐱',y:'𝐲',z:'𝐳',A:'𝐀',B:'𝐁',C:'𝐂',D:'𝐃',E:'𝐄',F:'𝐅',G:'𝐆',H:'𝐇',I:'𝐈',J:'𝐉',K:'𝐊',L:'𝐋',M:'𝐌',N:'𝐍',O:'𝐎',P:'𝐏',Q:'𝐐',R:'𝐑',S:'𝐒',T:'𝐓',U:'𝐔',V:'𝐕',W:'𝐖',X:'𝐗',Y:'𝐘',Z:'𝐙',0:'𝟎',1:'𝟏',2:'𝟐',3:'𝟑',4:'𝟒',5:'𝟓',6:'𝟔',7:'𝟕',8:'𝟖',9:'𝟗'};
  return String(text).split('').map(c=>map[c]||c).join('');
}

// ---------- REACTION: Await ⏳ / Complete 💀 ----------
async function reactAwait(sock, m){
  try { await sock.sendMessage(m.key.remoteJid, { react: { text: '⏳', key: m.key } }); } catch(e){}
}
async function reactDone(sock, m){
  try { await sock.sendMessage(m.key.remoteJid, { react: { text: '💀', key: m.key } }); } catch(e){}
}

// ---------- CACHED GROUP META - Bot fast, no slow double call ----------
let metaCache = new Map();
async function getGroupMeta(sock, gid){
  if (!gid || !gid.endsWith('@g.us')) return null;
  let cached = metaCache.get(gid);
  if (cached && Date.now() - cached.time < 30000) return cached.meta;
  try {
    let meta = await sock.groupMetadata(gid);
    metaCache.set(gid, { meta, time: Date.now() });
    return meta;
  } catch(e){ return cached?.meta || null; }
}
function findParticipant(meta, uid){
  if (!meta || !uid) return null;
  let num = String(uid).split('@')[0].replace(/[^0-9]/g, '');
  return (meta.participants || []).find(x => x.id === uid || x.phoneNumber === uid || String(x.phoneNumber || '').split('@')[0] === num || String(x.id || '').split('@')[0] === num);
}

// ---------- DB - CONNECTED TO config.js + forceConfig ----------
function loadDB(config) {
  let defaultDB = {
    owners: [OWNER],
    owner: OWNER,
    ownerLids: [OWNER_LID],
    settings: { prefix: config?.prefix || ',', mode: config?.mode || 'public', botName: 'META AI MD' },
    auto: {}, anti: {}, warns: {}, muted: {}, banned: [],
    group: {},
    chat: {}
  };
  try {
    if (fs.existsSync('./database.json')) {
      let d = JSON.parse(fs.readFileSync('./database.json'));
      d.owners = d.owners || [];
      if(!d.owners.includes(OWNER)) d.owners.push(OWNER);
      // FIXED: No push LID inside owners phone list - LID na for ownerLids only
      if(!d.ownerLids) d.ownerLids = [];
      if(!d.ownerLids.includes(OWNER_LID)) d.ownerLids.push(OWNER_LID);
      if (config?.owners) for(let o of config.owners) if(!d.owners.includes(String(o))) d.owners.push(String(o));
      d.settings = d.settings || {};
      // FIXED: DB FIRST - no overwrite saved prefix/mode with config. Config na only default when DB never get am.
      if (!d.settings.prefix) d.settings.prefix = config?.prefix || ',';
      if (!d.settings.mode) d.settings.mode = config?.mode || 'public';
      if (!d.settings.botName) d.settings.botName = 'META AI MD';
      d.auto = d.auto || {};
      d.anti = d.anti || {};
      d.warns = d.warns || {};
      d.muted = d.muted || {};
      d.banned = d.banned || [];
      d.group = d.group || {};
      d.chat = d.chat || {};
      return d;
    }
  } catch(e){ console.log('loadDB fail, using default:', e.message); }
  return defaultDB;
}

function saveDB(db) {
  try{ fs.writeFileSync('./database.json', JSON.stringify(db, null, 2)); }catch(e){ console.log('saveDB fail:', e.message); }
}

// ---------- OWNER / JID - LID FIX ----------
function cleanNumber(text) {
  return (text || '').replace(/[^0-9]/g, '');
}

function getSenderNumber(m) {
  let pn = m?.key?.participantPn || m?.key?.remoteJidAlt || null;
  if (pn && pn.includes('@s.whatsapp.net')) return pn.split('@')[0];
  let raw = m?.key?.participant || m?.key?.remoteJid || '';
  return String(raw).split('@')[0].replace(/[^0-9]/g,'');
}
function getSenderJid(m) {
  return m?.key?.participant || m?.key?.remoteJid || '';
}
function getSenderPn(m) {
  return m?.key?.participantPn || m?.key?.remoteJidAlt || getSenderJid(m);
}

// FIXED: Owner = person wey pair bot - check PN + LID + participantPn
function isOwner(jid, db, config) {
  let n = String(jid || '').split('@')[0].replace(/[^0-9]/g, '');
  if(n === OWNER) return true;
  if(n === OWNER_LID) return true;
  if(db?.owners && db.owners.includes(n)) return true;
  if(db?.owner && String(db.owner).replace(/[^0-9]/g,'') === n) return true;
  if(config?.owners && config.owners.includes(n)) return true;
  if(config?.ownerNumber && String(config.ownerNumber).replace(/[^0-9]/g,'') === n) return true;
  let full = String(jid || '');
  if(config?.ownerLids && config.ownerLids.includes(full)) return true;
  if(config?.ownerLids && config.ownerLids.includes(n)) return true;
  if(db?.ownerLids && db.ownerLids.includes(full)) return true;
  if(db?.ownerLids && db.ownerLids.includes(n)) return true;
  return false;
}
function isOwnerMessage(m, db, config) {
  let jid = getSenderJid(m);
  let pn = getSenderPn(m);
  if (isOwner(jid, db, config)) return true;
  if (isOwner(pn, db, config)) return true;
  let num = getSenderNumber(m);
  if (isOwner(num, db, config)) return true;
  return false;
}

function getTarget(m, args) {
  let ctx = m.message?.extendedTextMessage?.contextInfo || m.message?.imageMessage?.contextInfo || m.message?.videoMessage?.contextInfo || m.message?.stickerMessage?.contextInfo || m.message?.ephemeralMessage?.message?.extendedTextMessage?.contextInfo;
  if (ctx?.mentionedJid?.[0]) return ctx.mentionedJid[0];
  if (ctx?.participantPn) return ctx.participantPn;
  if (ctx?.participant) return ctx.participant;
  if (args?.[0]) {
    let n = cleanNumber(args[0]);
    if (n.length >= 7) return n + '@s.whatsapp.net';
  }
  return null;
}

// ---------- TEXT - FIXED FOR EPHEMERAL + VIEWONCE + LID ----------
function getText(m) {
  let msg = m.message;
  if (!msg) return '';
  if (msg.ephemeralMessage) msg = msg.ephemeralMessage.message || msg;
  if (msg.viewOnceMessage) msg = msg.viewOnceMessage.message || msg;
  if (msg.viewOnceMessageV2) msg = msg.viewOnceMessageV2.message || msg;
  if (msg.editedMessage) msg = msg.editedMessage.message || msg;
  if (msg.documentWithCaptionMessage) msg = msg.documentWithCaptionMessage.message || msg;

  return msg?.conversation
    || msg?.extendedTextMessage?.text
    || msg?.imageMessage?.caption
    || msg?.videoMessage?.caption
    || msg?.documentMessage?.caption
    || msg?.stickerMessage?.caption
    || msg?.pollCreationMessage?.name
    || msg?.contactMessage?.displayName
    || msg?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation
    || '';
}

function getQuoted(m) {
  let msg = m.message?.ephemeralMessage?.message || m.message;
  return msg?.extendedTextMessage?.contextInfo?.quotedMessage || null;
}

function isGroup(jid) {
  return jid && jid.endsWith('@g.us');
}

// ---------- GROUP ----------
async function getAdmins(sock, jid) {
  try {
    let md = await getGroupMeta(sock, jid);
    if (!md) return { md: null, admins: [], all: [], isAdmin: () => false, isBotAdmin: () => false };
    return {
      md,
      admins: md.participants.filter(p => p.admin).map(p => p.id),
      all: md.participants.map(p => p.id),
      isAdmin: (id) => {
        let p = findParticipant(md, id);
        return !!(p && p.admin);
      },
      isBotAdmin: () => {
        // FIXED: LID fix - check PN + LID + phoneNumber, no be PN only
        let myNum = String(sock.user?.id || '').split(':')[0].replace(/[^0-9]/g, '');
        let myPn = sock.user?.id || '';
        let myLid = String(sock.user?.lid || '').split('@')[0].replace(/[^0-9]/g, '');
        let me = (md.participants || []).find(p => p.id === myPn || p.phoneNumber === myPn || String(p.phoneNumber || '').split('@')[0] === myNum || String(p.id || '').split('@')[0] === myNum || (myLid && String(p.id || '').split('@')[0] === myLid));
        return !!(me && me.admin);
      }
    };
  } catch {
    return { md: null, admins: [], all: [], isAdmin: () => false, isBotAdmin: () => false };
  }
}

// ---------- MEDIA / FETCH ----------
async function downloadMedia(m) {
  try {
    let msg = m.message;
    if (msg?.ephemeralMessage) msg = msg.ephemeralMessage.message || msg;
    if (msg?.viewOnceMessage) msg = msg.viewOnceMessage.message || msg;
    if (msg?.viewOnceMessageV2) msg = msg.viewOnceMessageV2.message || msg;
    let type = null;
    try { type = getContentType(msg); } catch(e){}
    if (type && msg[type]) {
      let kind = type.replace('Message','');
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
    let quoted = msg?.extendedTextMessage?.contextInfo?.quotedMessage;
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

// ---------- CONNECTED HELPERS - PUBLIC FIRST - DB FIRST ----------
function getMode(db, config){
  // FIXED: DB FIRST - same as index.js. Config force must NOT overwrite ,mode private
  if (db?.settings?.mode) return db.settings.mode;
  if (db?.mode) return db.mode;
  if (config?.forceConfigMode && config?.mode) return config.mode;
  return config?.mode || 'public';
}
function getPrefix(db, config){
  // FIXED: DB FIRST
  if (db?.settings?.prefix) return db.settings.prefix;
  if (config?.forceConfigPrefix && config?.prefix) return config.prefix;
  return config?.prefix || ',';
}
function getWarn(db, gid, uid){
  return db?.warns?.[gid]?.[uid] || 0;
}

module.exports = {
  OWNER,
  OWNER2,
  OWNER_LID,
  FOOTER,
  fancy,
  bold: fancy,
  reactAwait,
  reactDone,
  getGroupMeta,
  findParticipant,
  loadDB,
  saveDB,
  isOwner,
  isOwnerMessage,
  getSenderNumber,
  getSenderJid,
  getSenderPn,
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
