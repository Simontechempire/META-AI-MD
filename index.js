// index.js - META AI MD - FULL REPLACEMENT - ALL PLUGINS CONNECTED
// BY SIMON TECH - FANCY BOLD + REACTION ⏳✅💀 + ULTRA FAST + 24/7 NO OFFLINE
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const express = require('express');
const path = require('path');
const fs = require('fs');
const pino = require('pino');
const config = require('./config');

// ===== ALL PLUGINS - YOUR FULL LIST =====
const metaPlugin = require('./plugins/meta');
const stickerPlugin = require('./plugins/sticker');
const funPlugin = require('./plugins/fun');
const aiPlugin = require('./plugins/ai');
const gamePlugin = require('./plugins/game');
const downloaderPlugin = require('./plugins/downloader');
const textPlugin = require('./plugins/text');
const protection = require('./plugins/protection');
const vvPlugin = require('./plugins/vv');
const autoPlugin = require('./plugins/auto');
const antiPlugin = require('./plugins/anti');
const moderatorPlugin = require('./plugins/moderator');
const ownerPlugin = require('./plugins/owner');
const missingPlugin = require('./plugins/missing');
const groupPlugin = require('./plugins/group');

// ===== FANCY BOLD KEYBOARD STYLE - EVERY REPLY =====
const FANCY_MAP = {a:'𝐚',b:'𝐛',c:'𝐜',d:'𝐝',e:'𝐞',f:'𝐟',g:'𝐠',h:'𝐡',i:'𝐢',j:'𝐣',k:'𝐤',l:'𝐥',m:'𝐦',n:'𝐧',o:'𝐨',p:'𝐩',q:'𝐪',r:'𝐫',s:'𝐬',t:'𝐭',u:'𝐮',v:'𝐯',w:'𝐰',x:'𝐱',y:'𝐲',z:'𝐳',A:'𝐀',B:'𝐁',C:'𝐂',D:'𝐃',E:'𝐄',F:'𝐅',G:'𝐆',H:'𝐇',I:'𝐈',J:'𝐉',K:'𝐊',L:'𝐋',M:'𝐌',N:'𝐍',O:'𝐎',P:'𝐏',Q:'𝐐',R:'𝐑',S:'𝐒',T:'𝐓',U:'𝐔',V:'𝐕',W:'𝐖',X:'𝐗',Y:'𝐘',Z:'𝐙',0:'𝟎',1:'𝟏',2:'𝟐',3:'𝟑',4:'𝟒',5:'𝟓',6:'𝟔',7:'𝟕',8:'𝟖',9:'𝟗'};
function fancy(text){
  if(!text) return text;
  return String(text).split('').map(c => FANCY_MAP[c] || c).join('');
}
function fancySafe(text){
  if(!text) return text;
  return String(text).split(/(https?:\/\/[^\s]+)/g).map(part => {
    if(part.startsWith('http')) return part;
    return fancy(part);
  }).join('');
}

// ===== HELPERS =====
function getText(m){
  return m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || '';
}
function isGroup(jid){ return jid?.endsWith('@g.us'); }
function isOwner(sender){
  let num = sender.split('@')[0].split(':')[0];
  return config.owners.includes(num) || num === config.ownerNumber;
}

// ===== DB =====
let db = { banned: [], muted: {}, settings: { mode: config.mode }, auto: config.auto, anti: config.anti, group: {}, warns: {} };
try{ if(fs.existsSync('./db.json')) db = JSON.parse(fs.readFileSync('./db.json','utf8')); }catch{}
function saveDB(){ try{ fs.writeFileSync('./db.json', JSON.stringify(db,null,2)); }catch{} }

// ===== EXPRESS + KEEPALIVE 24/7 =====
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
const PORT = config.port || 10000;
let sock = null;
let isStarting = false;
let reconnectTimer = null;

app.get('/status', (req,res)=> res.json({ connected: !!sock?.user, user: sock?.user?.id || '', bot: config.botName, uptime: Math.floor(process.uptime()) }));
app.get('/ping', (req,res)=> res.send('pong'));
app.get('/pair', async (req,res)=>{
  try{
    let number = String(req.query.number||'').replace(/[^0-9]/g,'');
    if(!number || number.length < 9) return res.json({ error: 'Invalid number' });
    if(!sock) return res.json({ error: 'Bot starting, wait 5s and try again' });
    if(sock.user) return res.json({ error: 'Already connected' });
    let code = await sock.requestPairingCode(number);
    return res.json({ code });
  }catch(e){ return res.json({ error: 'Try again - '+e.message }); }
});
app.get('/', (req,res)=> {
  if(fs.existsSync(path.join(__dirname,'public','index.html'))) return res.sendFile(path.join(__dirname,'public','index.html'));
  return res.send('META AI MD ONLINE ✅');
});
app.listen(PORT, ()=> console.log('Server on '+PORT));

setInterval(async () => {
  try{
    let url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    await fetch(`${url}/ping`).catch(()=>{});
    console.log('💓 KeepAlive - META AI MD still alive');
  }catch(e){}
}, 3 * 60 * 1000);
setInterval(()=>{ if(sock?.user) sock.sendPresenceUpdate('available').catch(()=>{}); }, 10000);

async function start(){
  if(isStarting) return;
  isStarting = true;
  if(reconnectTimer) clearTimeout(reconnectTimer);
  try{
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionFolder || './Meta');
    const { version } = await fetchLatestBaileysVersion();
    sock = makeWASocket({
      version,
      logger: pino({ level: 'error' }),
      printQRInTerminal: false,
      browser: Browsers.macOS('Safari'),
      auth: state,
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: false,
      connectTimeoutMs: 30000,
      keepAliveIntervalMs: 10000,
      syncFullHistory: false,
      shouldSyncHistoryMessage: () => false,
      msgRetryCounterCache: new Map(),
      getMessage: async () => undefined,
      retryRequestDelayMs: 500,
      maxMsgRetryCount: 5,
    });
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (u) => {
      const { connection, lastDisconnect } = u;
      if(!connection) return;
      console.log('Connection:', connection);
      if(connection === 'close'){
        isStarting = false;
        let code = lastDisconnect?.error?.output?.statusCode;
        let reason = lastDisconnect?.error?.output?.payload?.message || lastDisconnect?.error?.message || '';
        console.log('Closed:', code, reason);
        if(reason.includes('Bad MAC') || reason.includes('bad mac')){
          console.log('⚠️ Bad MAC - clearing session...');
          try{ fs.rmSync(config.sessionFolder || './Meta', { recursive: true, force: true }); }catch{}
        }
        if(code === DisconnectReason.loggedOut){
          console.log('Logged out - delete Meta folder and pair again');
          return;
        }
        if(!reconnectTimer){
          console.log('Reconnecting in 2s...');
          reconnectTimer = setTimeout(()=>{ reconnectTimer = null; start(); }, 2000);
        }
      }
      if(connection === 'open'){
        isStarting = false;
        console.log('✅ META AI MD CONNECTED - ULTRA FAST');
        try{ if(autoPlugin?.startAutoBio) autoPlugin.startAutoBio(sock, db); }catch(e){}
        try{ await sock.sendMessage(`${config.ownerNumber}@s.whatsapp.net`, { text: fancySafe(`META AI MD Connected ✅\nBot is Online 24/7\nType .menu for commands`) }); }catch{}
      }
    });

    // Status - Auto + VV
    sock.ev.on('messages.upsert', async ({ messages }) => {
      try{
        for(let s of messages){
          if(s.key.remoteJid === 'status@broadcast'){
            if(autoPlugin?.handleStatus) await autoPlugin.handleStatus(sock, s, db);
            if(vvPlugin?.handleStatus) await vvPlugin.handleStatus(sock, s, db);
          }
        }
      }catch(e){}
    });

    // Group participants - welcome / goodbye / anti-promote / anti-demote
    sock.ev.on('group-participants.update', async (u) => {
      try{
        let from = u.id;
        let g = db.group?.[from];
        for(let p of u.participants){
          if(u.action === 'add' && (g?.welcome || db.auto?.autowelcome)){
            let msg = (g?.welcomeMsg || '👋 Welcome @user to group!\nType .menu').replace(/@user/g, `@${p.split('@')[0]}`);
            await sock.sendMessage(from, { text: fancySafe(msg), mentions: [p] }).catch(()=>{});
          }
          if(u.action === 'remove' && (g?.goodbye || db.auto?.autogoodbye)){
            let msg = (g?.goodbyeMsg || '👋 Bye @user').replace(/@user/g, `@${p.split('@')[0]}`);
            await sock.sendMessage(from, { text: fancySafe(msg), mentions: [p] }).catch(()=>{});
          }
          if(u.action === 'promote' && db.anti?.antipromote){
            await sock.groupParticipantsUpdate(from, [p], 'demote').catch(()=>{});
            await sock.sendMessage(from, { text: fancySafe(`🚫 Anti-Promote: @${p.split('@')[0]} demoted back`), mentions: [p] }).catch(()=>{});
          }
          if(u.action === 'demote' && db.anti?.antidemote){
            await sock.groupParticipantsUpdate(from, [p], 'promote').catch(()=>{});
            await sock.sendMessage(from, { text: fancySafe(`✅ Anti-Demote: @${p.split('@')[0]} promoted back`), mentions: [p] }).catch(()=>{});
          }
        }
      }catch(e){}
    });

    // Anti-Delete
    sock.ev.on('messages.update', async (updates) => {
      try{
        for(let u of updates){
          if(u.update.message === null){
            if(protection.handleAntiDelete) await protection.handleAntiDelete(sock, u, u.key.remoteJid);
            if(antiPlugin?.handleAntiDelete) await antiPlugin.handleAntiDelete(sock, u, u.key.remoteJid);
          }
        }
      }catch(e){}
    });

    // ===== MAIN MESSAGE HANDLER =====
    sock.ev.on('messages.upsert', async ({ messages }) => {
      for(let m of messages){
        if(!m?.message) continue;
        if(m.key.remoteJid === 'status@broadcast') continue;

        let from = m.key.remoteJid;
        let sender = m.key.participant || m.key.remoteJid;
        let senderNum = sender.split('@')[0].split(':')[0];
        let pushname = m.pushName || 'User';
        let body = getText(m);

        // VV - if message is view once and user replied with .vv, let command handle it
        // But also auto-handle VV if quoted view once
        let isViewOnce = !!m.message?.viewOnceMessage || !!m.message?.viewOnceMessageV2 || !!m.message?.imageMessage?.viewOnce || !!m.message?.videoMessage?.viewOnce;

        if(!body && !isViewOnce) continue;
        if(!body) body = '';

        console.log(`📩 [${m.key.fromMe ? 'ME' : 'OTHER'}] ${senderNum}: ${body.slice(0,80)}`);

        let group = isGroup(from);
        let owner = isOwner(sender);
        let isSelf = false;
        if(m.key.fromMe){
          let hasPrefix = config.prefixes.some(p => body.startsWith(p));
          if(!hasPrefix) continue;
          isSelf = true;
          owner = true;
        }

        if(db.banned?.includes(senderNum) && !owner) continue;
        if(group && db.muted?.[from]?.includes(sender) && !owner){
          try{ await sock.sendMessage(from, { delete: m.key }); }catch{}
          continue;
        }

        // ===== AUTO - typing / online / read =====
        try{
          if(db.auto?.autotyping && !isSelf) await sock.sendPresenceUpdate('composing', from).catch(()=>{});
          if(db.auto?.autoonline) await sock.sendPresenceUpdate('available').catch(()=>{});
          if(db.auto?.autoread) await sock.readMessages([m.key]).catch(()=>{});
          if(db.auto?.autorecording && !isSelf) await sock.sendPresenceUpdate('recording', from).catch(()=>{});
        }catch{}

        // ===== PROTECTION + ANTI FIRST - BEFORE COMMAND =====
        if(group && !isSelf){
          try{
            if(antiPlugin?.handleAnti){
              let blocked = await antiPlugin.handleAnti(sock, m, db, { fancy });
              if(blocked){ saveDB(); continue; }
            }
            let protBlocked = await protection.handleProtection(sock, m, { reply: async (t) => sock.sendMessage(from, { text: fancySafe(t) }, { quoted: m }) });
            if(protBlocked){ saveDB(); continue; }
            if(autoPlugin?.handleAuto) await autoPlugin.handleAuto(sock, m, db);
          }catch(e){ console.log('Protection err:', e.message); }
        }

        // ===== VV AUTO - if reply to view once with no command, open it =====
        if(isViewOnce && !body.startsWith(config.prefix)){
          // Let VV plugin handle view once silently if needed
          try{ if(vvPlugin?.handleViewOnce) await vvPlugin.handleViewOnce(sock, m, { from, sender, reply: async (t) => sock.sendMessage(from, { text: fancySafe(t) }, { quoted: m }) }); }catch{}
        }

        let usedPrefix = config.prefixes.find(p => body.startsWith(p));
        if(!usedPrefix) continue;
        let args = body.slice(usedPrefix.length).trim().split(/ +/);
        let cmdName = (args.shift()||'').toLowerCase();
        let q = args.join(' ');
        let text = q;

        if(db.settings?.mode === 'private' && !owner) continue;

        // ===== REACTION + FANCY REPLY =====
        const react = async (emoji) => {
          try{ await sock.sendMessage(from, { react: { text: emoji, key: m.key } }); }catch{}
        };
        const reply = async (t, opts={}) => {
          if(typeof t === 'string') t = fancySafe(t);
          return await sock.sendMessage(from, { text: t }, { quoted: m, ...opts });
        };
        const replyWith = async (content, opts={}) => {
          if(content.text) content.text = fancySafe(content.text);
          return await sock.sendMessage(from, content, { quoted: m, ...opts });
        };

        await react('⏳'); // Proceedings ⏳

        const ctx = { prefix: usedPrefix, cmdName, args, q, text, reply, replyWith, from, sender, senderNum, pushname, isOwner: owner, isGroup: group, db, config, F: { fancy, fancySafe }, fancy, fancyReply: reply, m, sock };

        try{
          let handled = false;

          // 1. PROTECTION COMMANDS - .antigroupstatus, .protection, .warn etc
          handled = await protection.handleCommands(sock, m, ctx);
          if(handled){ await react('✅'); saveDB(); continue; }

          // 2. OWNER - .broadcast, .restart, .block, .owner etc - owner only
          handled = await ownerPlugin(sock, m, ctx);
          if(handled){ await react('✅'); saveDB(); continue; }

          // 3. MODERATOR - .kick, .mute, .promote, .demote, .warn etc
          handled = await moderatorPlugin(sock, m, ctx);
          if(handled){ await react('✅'); saveDB(); continue; }

          // 4. GROUP - .groupinfo, .tagall, .link, .close, .open etc
          handled = await groupPlugin(sock, m, ctx);
          if(handled){ await react('✅'); saveDB(); continue; }

          // 5. ANTI - .antilink, .antibadword etc
          handled = await antiPlugin(sock, m, ctx);
          if(handled){ await react('✅'); saveDB(); continue; }

          // 6. AUTO - .autoread, .autotyping etc
          handled = await autoPlugin(sock, m, ctx);
          if(handled){ await react('✅'); saveDB(); continue; }

          // 7. VV - .vv, .viewonce
          handled = await vvPlugin(sock, m, ctx);
          if(handled){ await react('✅'); saveDB(); continue; }

          // 8. DOWNLOADER - .play, .video, .tiktok etc
          handled = await downloaderPlugin(sock, m, ctx);
          if(handled){ await react('✅'); saveDB(); continue; }

          // 9. STICKER
          handled = await stickerPlugin(sock, m, ctx);
          if(handled){ await react('✅'); saveDB(); continue; }

          // 10. FUN
          handled = await funPlugin(sock, m, ctx);
          if(handled){ await react('✅'); saveDB(); continue; }

          // 11. AI
          handled = await aiPlugin(sock, m, ctx);
          if(handled){ await react('✅'); saveDB(); continue; }

          // 12. GAME
          handled = await gamePlugin(sock, m, ctx);
          if(handled){ await react('✅'); saveDB(); continue; }

          // 13. TEXT
          handled = await textPlugin(sock, m, ctx);
          if(handled){ await react('✅'); saveDB(); continue; }

          // 14. META - menu, ping, alive, tools, settings, etc - fallback for everything
          handled = await metaPlugin(sock, m, ctx);
          if(handled){ await react('✅'); saveDB(); continue; }

          // 15. MISSING - handles missing / unknown commands, suggests correct one
          handled = await missingPlugin(sock, m, ctx);
          if(handled){ await react('✅'); saveDB(); continue; }

          // UNKNOWN - Complete 💀
          await react('💀');
          await reply(`❌ Unknown command: .${cmdName}\nType .menu for commands\n\n${config.footer}`);

        }catch(e){
          console.log('CMD ERR', cmdName, e.message);
          await react('💀');
          await reply(`${config.messages.error}\n${e.message}\n\n${config.footer}`);
        }
        saveDB();
      }
    });

  }catch(e){
    console.log('Start failed', e.message);
    isStarting = false;
    reconnectTimer = setTimeout(()=>{ reconnectTimer=null; start(); }, 2000);
  }
}
start();

process.on('uncaughtException', e=>console.log('Uncaught:', e.message));
process.on('unhandledRejection', e=>console.log('Rejection:', e.message));
setInterval(()=>{ console.log('💓 META AI MD Alive - Uptime:', Math.floor(process.uptime()/60), 'mins'); }, 10*60*1000);
