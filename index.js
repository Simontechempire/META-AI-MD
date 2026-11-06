// index.js - META AI MD - FIXED PRIVATE MODE - BY SIMON TECH
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const express = require('express');
const path = require('path');
const fs = require('fs');
const pino = require('pino');
const config = require('./config');
const F = require('./lib/function');
const { getMenu, MENU_PFP } = require('./lib/menu');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
const PORT = config.port || 10000;
let sock = null;
let db = F.loadDB(config);
let isStarting = false;
let reconnectTimer = null;

// ===== FIXED: Cached groupMetadata - Bot fast, no double groupMetadata call =====
let metaCache = new Map(); // gid -> { meta, time }
async function getGroupMeta(gid){
  if (!gid || !gid.endsWith('@g.us')) return null;
  let cached = metaCache.get(gid);
  if (cached && Date.now() - cached.time < 30000) return cached.meta;
  try {
    let meta = await sock.groupMetadata(gid);
    metaCache.set(gid, { meta, time: Date.now() });
    return meta;
  } catch(e){ return cached?.meta || null; }
}
function clearMetaCache(gid){ if (gid) metaCache.delete(gid); else metaCache.clear(); }
// FIXED: Find participant by LID OR PN - shared helper for all plugins
function findParticipant(meta, uid){
  if (!meta || !uid) return null;
  let num = String(uid).split('@')[0].replace(/[^0-9]/g, '');
  return (meta.participants || []).find(x => x.id === uid || x.phoneNumber === uid || String(x.phoneNumber || '').split('@')[0] === num || String(x.id || '').split('@')[0] === num);
}

// ===== HELPER: STRONG OWNER CHECK - Owner = person wey pair the bot =====
// Ignore F.isOwner as main - check PN + LID against config.ownerNumber + db.owners
function isOwnerCheck(sender, senderPn, db){
  let nums = [];
  if (sender) nums.push(String(sender).split('@')[0].replace(/[^0-9]/g, ''));
  if (senderPn) nums.push(String(senderPn).split('@')[0].replace(/[^0-9]/g, ''));
  // Also check sock.user LID/PN? No - owner na NOT bot itself, na person wey pair am
  let owners = [];
  if(config.ownerNumber) owners.push(String(config.ownerNumber).replace(/[^0-9]/g, ''));
  if(db.owner) owners.push(String(db.owner).replace(/[^0-9]/g, ''));
  if(db.settings?.owner) owners.push(String(db.settings.owner).replace(/[^0-9]/g, ''));
  if(Array.isArray(db.owners)) db.owners.forEach(o => owners.push(String(o).replace(/[^0-9]/g, '')));
  if(Array.isArray(config.owners)) config.owners.forEach(o => owners.push(String(o).replace(/[^0-9]/g, '')));
  return nums.some(n => n && owners.includes(n));
}
// FIXED: Admin check - uses cached meta, no slow double call
async function isAdminCheck(from, sender, senderPn){
  try {
    let meta = await getGroupMeta(from);
    if (!meta) return false;
    let p = findParticipant(meta, sender) || (senderPn ? findParticipant(meta, senderPn) : null);
    return !!(p && (p.admin === 'admin' || p.admin === 'superadmin'));
  } catch(e){ return false; }
}
async function isBotAdminCheck(from){
  try {
    let meta = await getGroupMeta(from);
    if (!meta || !sock?.user?.id) return false;
    let myNum = String(sock.user.id).split(':')[0].replace(/[^0-9]/g, '');
    let myPn = sock.user.id;
    let myLid = String(sock.user.lid || '').split('@')[0].replace(/[^0-9]/g, '');
    let me = (meta.participants || []).find(x => x.id === myPn || x.phoneNumber === myPn || String(x.phoneNumber || '').split('@')[0] === myNum || String(x.id || '').split('@')[0] === myNum || (myLid && String(x.id || '').split('@')[0] === myLid));
    return !!(me && (me.admin === 'admin' || me.admin === 'superadmin'));
  } catch(e){ return false; }
}
function getMode(db){
  // FIXED: DB FIRST - ,mode private/public for DB must win. Config na only default for first start.
  if(db.settings?.mode) return db.settings.mode;
  if(db.mode) return db.mode;
  if(db.settings?.self) return 'private';
  if(config?.forceConfigMode && config?.mode) return config.mode;
  return config?.mode || 'public';
}
function getPrefix(db){
  if(db.settings?.prefix) return db.settings.prefix;
  if(config?.forceConfigPrefix && config?.prefix) return config.prefix;
  return config?.prefix || ',';
}

// ===== FANCY BOLD FONT =====
function fancy(text){
  const map = {a:'𝐚',b:'𝐛',c:'𝐜',d:'𝐝',e:'𝐞',f:'𝐟',g:'𝐠',h:'𝐡',i:'𝐢',j:'𝐣',k:'𝐤',l:'𝐥',m:'𝐦',n:'𝐧',o:'𝐨',p:'𝐩',q:'𝐪',r:'𝐫',s:'𝐬',t:'𝐭',u:'𝐮',v:'𝐯',w:'𝐰',x:'𝐱',y:'𝐲',z:'𝐳',A:'𝐀',B:'𝐁',C:'𝐂',D:'𝐃',E:'𝐄',F:'𝐅',G:'𝐆',H:'𝐇',I:'𝐈',J:'𝐉',K:'𝐊',L:'𝐋',M:'𝐌',N:'𝐍',O:'𝐎',P:'𝐏',Q:'𝐐',R:'𝐑',S:'𝐒',T:'𝐓',U:'𝐔',V:'𝐕',W:'𝐖',X:'𝐗',Y:'𝐘',Z:'𝐙',0:'𝟎',1:'𝟏',2:'𝟐',3:'𝟑',4:'𝟒',5:'𝟓',6:'𝟔',7:'𝟕',8:'𝟖',9:'𝟗'};
  return String(text).split('').map(c=>map[c]||c).join('');
}
F.fancy = fancy;
F.bold = fancy;
F.getGroupMeta = getGroupMeta;
F.findParticipant = findParticipant;
F.isAdminCheck = isAdminCheck;
F.isBotAdminCheck = isBotAdminCheck;
F.getMode = getMode;
F.getPrefix = getPrefix;

// ===== REACTION: Await ⏳ / Complete 💀 =====
async function reactAwait(m){
  try { await sock.sendMessage(m.key.remoteJid, { react: { text: '⏳', key: m.key } }); } catch(e){}
}
async function reactDone(m){
  try { await sock.sendMessage(m.key.remoteJid, { react: { text: '💀', key: m.key } }); } catch(e){}
}
F.reactAwait = reactAwait;
F.reactDone = reactDone;

// ===== LOAD PLUGINS - SUPPORTS ARRAY + FUNCTION =====
let antiMod = null, autoMod = null, protectionMod = null;
try{ antiMod = require('./plugins/anti.js'); }catch(e){}
try{ autoMod = require('./plugins/auto.js'); }catch(e){}
try{ protectionMod = require('./plugins/protection.js'); }catch(e){}

let commands = new Map();
let functionPlugins = [];

function loadPlugins(){
  commands.clear();
  functionPlugins = [];
  let dir = path.join(__dirname, 'plugins');
  if(!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'test.js'), `module.exports = [{ name: 'testping', run: async ({reply}) => reply('✅ Loader dey work!') }];`);
  }
  let files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  console.log('📁 Found files in plugins/:', files);
  for(let file of files){
    try{
      let full = path.join(dir, file);
      delete require.cache[require.resolve(full)];
      let plugin = require(full);
      if(typeof plugin === 'function'){
        functionPlugins.push({ file, fn: plugin });
        console.log(`✅ Loaded FUNCTION ${file}`);
        continue;
      }
      if(plugin && typeof plugin.handler === 'function'){
        functionPlugins.push({ file, fn: plugin.handler });
        console.log(`✅ Loaded HANDLER ${file}`);
        continue;
      }
      let list = [];
      if(Array.isArray(plugin)) list = plugin;
      else if(plugin && Array.isArray(plugin.plugins)) list = plugin.plugins;
      else if(plugin && plugin.name) list = [plugin];
      else {
        console.log(`⚠️ Skipped ${file} - unknown export type: ${typeof plugin}`);
        continue;
      }
      for(let p of list){
        if(!p || !p.name || typeof p.run !== 'function') continue;
        // FIXED: No overwrite silently - first wins, log duplicate so you know group.js vs moderator.js fight
        if (commands.has(p.name.toLowerCase())) console.log(`⚠️ Duplicate command ${p.name} in ${file} - keeping first, skipping this one`);
        else {
          commands.set(p.name.toLowerCase(), p);
          if(p.aliases) for(let a of p.aliases) if(!commands.has(a.toLowerCase())) commands.set(a.toLowerCase(), p);
        }
      }
      console.log(`✅ Loaded ${file} - ${list.length} cmds`);
    }catch(e){ console.log('❌ Plugin failed:', file, e.message); }
  }
  console.log(`Total array commands: ${commands.size} | Function plugins: ${functionPlugins.length}`);
  try{ antiMod = require('./plugins/anti.js'); }catch(e){}
  try{ autoMod = require('./plugins/auto.js'); }catch(e){}
  try{ protectionMod = require('./plugins/protection.js'); }catch(e){}
}
loadPlugins();

// ===== EXPRESS + KEEPALIVE =====
app.get('/status', (req,res)=> res.json({ connected: !!sock?.user, user: sock?.user?.id || '', totalCmds: commands.size, functionPlugins: functionPlugins.length, mode: getMode(db) }));
app.get('/ping', (req,res)=> res.send('pong'));
app.get('/pair', async (req,res)=>{
  try{
    let number = String(req.query.number||'').replace(/[^0-9]/g,'');
    if(!number || number.length < 9) return res.json({ error: 'Invalid number' });
    if(!sock) return res.json({ error: 'Bot starting, wait 5s and try again' });
    if(sock.user) return res.json({ error: 'Already connected' });
    try {
      let code = await sock.requestPairingCode(number);
      return res.json({ code });
    } catch(e){
      console.log('Pair retry in 2s:', e.message);
      await new Promise(r=>setTimeout(r, 2000));
      let code = await sock.requestPairingCode(number);
      return res.json({ code });
    }
  }catch(e){ return res.json({ error: 'Try again - '+e.message }); }
});
app.get('/', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, ()=> console.log('Server on '+PORT));

setInterval(async () => {
  try{
    let url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    await fetch(`${url}/ping`).catch(()=>{});
    console.log('💓 KeepAlive - bot still alive');
  }catch(e){}
}, 4 * 60 * 1000);

async function start(){
  if(isStarting) { console.log('Already starting, skip duplicate'); return; }
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
    });
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (u) => {
      const { connection, lastDisconnect, qr } = u;
      if(!connection) {
        if(qr) console.log('QR received - use pairing code instead');
        return;
      }
      console.log('Connection:', connection);
      if(connection === 'close'){
        isStarting = false;
        let code = lastDisconnect?.error?.output?.statusCode;
        let reason = lastDisconnect?.error?.output?.payload?.message || lastDisconnect?.error?.message || '';
        console.log('Closed:', code, reason);
        if(code === DisconnectReason.loggedOut){
          console.log('Logged out - delete Meta folder and pair again');
          return;
        }
        if(!reconnectTimer){
          console.log('Reconnecting in 3s...');
          reconnectTimer = setTimeout(()=>{ reconnectTimer = null; start(); }, 3000);
        }
      }
      if(connection === 'open'){
        isStarting = false;
        console.log('META AI MD CONNECTED ✅');
        try{ if(autoMod?.startAutoBio) autoMod.startAutoBio(sock, db, config); }catch(e){}
      }
    });

    // ===== STATUS - BLOCKED IN PRIVATE =====
    sock.ev.on('messages.upsert', async ({ messages }) => {
      try {
        if (messages[0]?.key?.remoteJid === 'status@broadcast') {
          if(getMode(db) === 'private') return;
          if (autoMod?.handleStatus) for (let s of messages) await autoMod.handleStatus(sock, s, db, F, config);
        }
      } catch(e){}
    });

    // ===== GROUP JOIN/LEAVE - BLOCKED IN PRIVATE =====
    sock.ev.on('group-participants.update', async (u) => {
      try {
        if(getMode(db) === 'private') return;
        clearMetaCache(u.id);
        let from = u.id;
        let g = db.group?.[from];
        if (!g) return;
        for (let p of u.participants) {
          if (u.action === 'add' && (g.welcome || db.auto?.autowelcome)) {
            let msg = (g.welcomeMsg || '👋 Welcome @user to *{group}*!\n\nType .menu').replace(/@user/g, `@${p.split('@')[0]}`).replace(/\{group\}/g, u.subject || 'group');
            await sock.sendMessage(from, { text: msg, mentions: [p] }).catch(()=>{});
          }
          if (u.action === 'remove' && (g.goodbye || db.auto?.autogoodbye)) {
            let msg = (g.goodbyeMsg || '👋 Bye @user, we go miss you 😢').replace(/@user/g, `@${p.split('@')[0]}`);
            await sock.sendMessage(from, { text: msg, mentions: [p] }).catch(()=>{});
          }
          if (u.action === 'promote' && db.anti?.antipromote) {
            await sock.groupParticipantsUpdate(from, [p], 'demote').catch(()=>{});
            await sock.sendMessage(from, { text: `🚫 Anti-Promote: @${p.split('@')[0]} demoted back`, mentions: [p] }).catch(()=>{});
          }
          if (u.action === 'demote' && db.anti?.antidemote) {
            await sock.groupParticipantsUpdate(from, [p], 'promote').catch(()=>{});
            await sock.sendMessage(from, { text: `✅ Anti-Demote: @${p.split('@')[0]} promoted back`, mentions: [p] }).catch(()=>{});
          }
        }
      } catch(e){}
    });

    // ===== ANTI DELETE - via protection.js =====
    sock.ev.on('messages.update', async (updates) => {
      try {
        if (getMode(db) === 'private') return;
        if (protectionMod?.handleAntiDelete) await protectionMod.handleAntiDelete(sock, updates, db, F);
      } catch(e){}
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
      for(let m of messages){
        if(!m?.message) continue;
        if (m.key.remoteJid === 'status@broadcast') continue;
        let from = m.key.remoteJid;
        let sender = m.key.participant || m.key.remoteJid;
        let senderPn = m.key.participantPn || m.key.remoteJidAlt || '';
        let senderNum = (senderPn || sender).split('@')[0];
        let pushname = m.pushName || 'User';
        let body = F.getText(m);
        if(!body) continue;
        console.log(`📩 [${m.key.fromMe ? 'FROM-ME' : 'FROM-OTHER'}] ${senderNum}: ${body.slice(0,80)}`);
        let isGroup = F.isGroup(from);

        // ===== FIX 1: STRONG OWNER CHECK - BEFORE EVERYTHING =====
        // Owner = person wey pair the bot (config.ownerNumber / db.owners) - check PN + LID
        let isOwner = isOwnerCheck(sender, senderPn, db);
        let isSelfCommand = false;
        if(m.key.fromMe){
          let hasPrefix = (config.prefixes || [getPrefix(db)]).some(p => body.startsWith(p));
          if(!hasPrefix) continue;
          isSelfCommand = true;
          isOwner = true;
          console.log('✅ Self-command detected, treating as owner');
        }

        // ===== FIX 2: PRIVATE MODE - BLOCK EVERYTHING FIRST =====
        // Private: Owner ✅ = reply, isOwner ❌ = IGNORE silent - NO reply, NO reaction
        // Public: Everybody = reply
        let mode = getMode(db);
        if(mode === 'private' && !isOwner){
          console.log(`🔒 PRIVATE MODE - Ignored ${senderNum}: ${body.slice(0,30)}`);
          continue;
        }

        if (db.banned?.includes(senderNum) && !isOwner) continue;
        // Also check banned by LID/PN both forms
        if (db.banned?.includes(sender.split('@')[0]) && !isOwner) continue;
        if (isGroup && db.muted?.[from]?.includes(sender) && !isOwner) {
          try { await sock.sendMessage(from, { delete: m.key }); } catch(e){}
          continue;
        }
        if(!isSelfCommand){
          // FIXED: Connect protection.js FIRST, then anti.js - but no double warn: protection returns true = blocked
          try { if (protectionMod?.handleProtection) { let blocked = await protectionMod.handleProtection(sock, m, db, F, config); if (blocked) { F.saveDB(db); continue; } } } catch(e){ console.log('Protection err:', e.message); }
          try { if (antiMod?.handleAnti) { let blocked = await antiMod.handleAnti(sock, m, db, F, config); if (blocked) { F.saveDB(db); continue; } } } catch(e){}
          try { if (autoMod?.handleAuto) await autoMod.handleAuto(sock, m, db, F, config); } catch(e){}
          if (db.auto?.autoforward && !isOwner) {
            try { await sock.sendMessage(`${config.ownerNumber}@s.whatsapp.net`, { text: `📩 Forward from @${senderNum} in ${isGroup ? from : 'DM'}:\n${body}`, mentions: [sender] }); } catch(e){}
          }
        }
        let usedPrefix = (config.prefixes || [getPrefix(db)]).find(p => body.startsWith(p));
        if(!usedPrefix) continue;
        let args = body.slice(usedPrefix.length).trim().split(/ +/);
        let cmdName = (args.shift()||'').toLowerCase();
        let text = args.join(' ');
        // FIXED: Compute isAdmin ONCE with cached meta - pass to all plugins, no slow double call
        let isAdmin = false;
        let isBotAdmin = false;
        if (isGroup) {
          isAdmin = await isAdminCheck(from, sender, senderPn);
          isBotAdmin = await isBotAdminCheck(from);
        }
        const reply = async (t, opts={}) => sock.sendMessage(from, { text: t }, { quoted: m, ...opts });
        const fancyReply = async (t, opts={}) => sock.sendMessage(from, { text: fancy(t) }, { quoted: m, ...opts });
        if(cmdName === 'menu' || cmdName === 'help' || cmdName === 'allmenu'){
          await reactAwait(m);
          try{
            let menuText = getMenu({ ownerName: config.ownerAlias, prefix: usedPrefix, botUser: config.botName, hosting: config.hosting });
            await sock.sendMessage(from, { image: { url: MENU_PFP }, caption: menuText }, { quoted: m });
            await reactDone(m);
            return;
          }catch(e){ await reactDone(m); return await reply('Menu error: '+e.message); }
        }
        if(cmdName === 'reload' && isOwner){ await reactAwait(m); loadPlugins(); await reactDone(m); return await reply(`✅ ${fancy('Reloaded!')} Total: ${commands.size} commands`); }

        let ctx = { sock, m, from, sender, senderNum, senderPn, pushname, args, text, q: text, cmd: cmdName, cmdName, prefix: usedPrefix, isOwner, isAdmin, isBotAdmin, isGroup, db, config, F, reply, fancy, fancyReply, reactAwait, reactDone, getGroupMeta, findParticipant };
        // FIXED: Protection commands (antilink on/off etc) - handle BEFORE functionPlugins
        try {
          if (protectionMod?.handleCommands) {
            let handledProt = await protectionMod.handleCommands(sock, m, ctx);
            if (handledProt) { F.saveDB(db); continue; }
          }
        } catch(e){ console.log('Protection cmd err:', e.message); }
        let handled = false;
        for(let fp of functionPlugins){
          try{
            await reactAwait(m);
            let r = await Promise.race([
              fp.fn(sock, m, ctx),
              new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')), 10000))
            ]);
            if(r){ handled = true; await reactDone(m); F.saveDB(db); break; }
          }catch(e){
            if(e.message !== 'timeout') console.log('FUNC PLUGIN ERR', fp.file, cmdName, e.message);
          }
        }
        if(handled) continue;

        let plugin = commands.get(cmdName);
        if(!plugin) return await reply(`❌ ${fancy('Unknown command:')} .${cmdName}\n${fancy('Type')} .menu\n\n${config.footer}`);
        if(plugin.ownerOnly && !isOwner) return await reply(config.messages.ownerOnly);
        if(plugin.groupOnly && !isGroup) return await reply(config.messages.groupOnly);
               // FIXED: Reaction Await ⏳ -> Complete 💀 for every command
        await reactAwait(m);
        try{
          await Promise.race([
            plugin.run({ sock, m, from, sender, senderNum, senderPn, pushname, args, text, cmd: cmdName, prefix: usedPrefix, isOwner, isAdmin, isBotAdmin, isGroup, db, config, F, reply, fancy, fancyReply, reactAwait, reactDone, getGroupMeta, findParticipant }),
            new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')), 10000))
          ]);
          await reactDone(m);
          F.saveDB(db);
        }catch(e){ console.log('CMD ERR', cmdName, e.message); await reactDone(m); await reply(`${config.messages.error}\n${e.message}\n\n${config.footer}`); }
      }
    });
  }catch(e){ console.log('Start failed', e.message); isStarting = false; reconnectTimer = setTimeout(()=>{ reconnectTimer=null; start(); }, 3000); }
}
start();

process.on('uncaughtException', e=>console.log('Uncaught:', e.message));
process.on('unhandledRejection', e=>console.log('Rejection:', e.message));
