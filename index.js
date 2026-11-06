// index.js - META AI MD - ALL CONNECTED - BY SIMON TECH
// CONNECTED: config.js + lib/function.js + owner + group + moderator + anti + auto + protection
// ONE FLOW: Private -> Ban/Mute -> Protection -> Auto -> Protection Commands -> Plugins -> Commands

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
let db = F.loadDB();
let isStarting = false;
let reconnectTimer = null;

// ===== CONNECTED HELPERS - Use F.getMode / F.getPrefix from lib/function.js (single source) =====
function getMode(){ return F.getMode ? F.getMode(db, config) : (db.settings?.mode || config.mode || 'private'); }
function getPrefix(){ return F.getPrefix ? F.getPrefix(db, config) : (db.settings?.prefix || config.prefix || ','); }

function isOwnerCheck(sender, db){
  let num = String(sender || '').replace(/[^0-9]/g, '');
  let owners = [];
  if(config.ownerNumber) owners.push(String(config.ownerNumber).replace(/[^0-9]/g, ''));
  if(db.owner) owners.push(String(db.owner).replace(/[^0-9]/g, ''));
  if(Array.isArray(db.owners)) db.owners.forEach(o => owners.push(String(o).replace(/[^0-9]/g, '')));
  if(Array.isArray(config.owners)) config.owners.forEach(o => owners.push(String(o).replace(/[^0-9]/g, '')));
  try{ if(F.isOwner && F.isOwner(sender, db)) return true; }catch(e){}
  return owners.includes(num);
}

// ===== FANCY BOLD FONT =====
function fancy(text){
  const map = {a:'𝐚',b:'𝐛',c:'𝐜',d:'𝐝',e:'𝐞',f:'𝐟',g:'𝐠',h:'𝐡',i:'𝐢',j:'𝐣',k:'𝐤',l:'𝐥',m:'𝐦',n:'𝐧',o:'𝐨',p:'𝐩',q:'𝐪',r:'𝐫',s:'𝐬',t:'𝐭',u:'𝐮',v:'𝐯',w:'𝐰',x:'𝐱',y:'𝐲',z:'𝐳',A:'𝐀',B:'𝐁',C:'𝐂',D:'𝐃',E:'𝐄',F:'𝐅',G:'𝐆',H:'𝐇',I:'𝐈',J:'𝐉',K:'𝐊',L:'𝐋',M:'𝐌',N:'𝐍',O:'𝐎',P:'𝐏',Q:'𝐐',R:'𝐑',S:'𝐒',T:'𝐓',U:'𝐔',V:'𝐕',W:'𝐖',X:'𝐗',Y:'𝐘',Z:'𝐙',0:'𝟎',1:'𝟏',2:'𝟐',3:'𝟑',4:'𝟒',5:'𝟓',6:'𝟔',7:'𝟕',8:'𝟖',9:'𝟗'};
  return String(text).split('').map(c=>map[c]||c).join('');
}
F.fancy = fancy;
F.bold = fancy;

// ===== LOAD ENGINES - protection + auto + anti (single instances) =====
let protectionMod = null, autoMod = null, antiMod = null;
function loadEngines(){
  try{ protectionMod = require('./plugins/protection.js'); }catch(e){ try{ protectionMod = require('./commands/protection.js'); }catch(_){ protectionMod = null; } }
  try{ autoMod = require('./plugins/auto.js'); }catch(e){ try{ autoMod = require('./commands/auto.js'); }catch(_){ autoMod = null; } }
  try{ antiMod = require('./plugins/anti.js'); }catch(e){ try{ antiMod = require('./commands/anti.js'); }catch(_){ antiMod = null; } }
}
loadEngines();

// ===== LOAD COMMANDS - CONNECTED: commands/ + plugins/ BOTH, moderator wins for duplicates =====
let commands = new Map();
let functionPlugins = [];

function loadPlugins(){
  commands.clear();
  functionPlugins = [];
  loadEngines();

  // Load order matters: commands/ first, then plugins/ - plugins/ go overwrite duplicates
  // But for moderator vs group duplicates (kick/promote/demote/mute), moderator must win.
  // So we load group first, moderator last.
  const loadDir = (dirName, priority) => {
    let dir = path.join(__dirname, dirName);
    if(!fs.existsSync(dir)) return;
    let files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
    // Sort: group.js first, moderator.js last, so moderator overwrites group duplicates
    files.sort((a,b)=>{
      if(a.includes('moderator')) return 1;
      if(b.includes('moderator')) return -1;
      if(a.includes('protection')) return 1; // protection is function, not array - skip as command
      if(b.includes('protection')) return -1;
      return a.localeCompare(b);
    });
    console.log(`📁 Found files in ${dirName}/:`, files);
    for(let file of files){
      // Skip protection.js as array command - e na engine, not command list
      if(file === 'protection.js') continue;
      try{
        let full = path.join(dir, file);
        delete require.cache[require.resolve(full)];
        let plugin = require(full);
        if(typeof plugin === 'function'){
          functionPlugins.push({ file: `${dirName}/${file}`, fn: plugin });
          console.log(`✅ Loaded FUNCTION ${dirName}/${file}`);
          continue;
        }
        if(plugin && typeof plugin.handler === 'function'){
          functionPlugins.push({ file: `${dirName}/${file}`, fn: plugin.handler });
          console.log(`✅ Loaded HANDLER ${dirName}/${file}`);
          continue;
        }
        let list = [];
        if(Array.isArray(plugin)) list = plugin;
        else if(plugin && Array.isArray(plugin.plugins)) list = plugin.plugins;
        else if(plugin && plugin.name) list = [plugin];
        else {
          console.log(`⚠️ Skipped ${dirName}/${file} - unknown export`);
          continue;
        }
        for(let p of list){
          if(!p || !p.name || typeof p.run !== 'function') continue;
          // If duplicate exists and current file is NOT moderator, keep existing (moderator wins later)
          // If current is moderator, always overwrite
          let isModerator = file.includes('moderator');
          let exists = commands.has(p.name.toLowerCase());
          if(exists && !isModerator && priority === 'plugins'){
            // plugins/ group.js should NOT overwrite commands/ moderator.js
            // Check if existing came from moderator - we track via _source
            if(commands.get(p.name.toLowerCase())._source?.includes('moderator')) continue;
          }
          p._source = `${dirName}/${file}`;
          commands.set(p.name.toLowerCase(), p);
          if(p.aliases) for(let a of p.aliases){ let ap = {...p, _source: `${dirName}/${file}`}; commands.set(a.toLowerCase(), ap); }
        }
        console.log(`✅ Loaded ${dirName}/${file} - ${list.length} cmds`);
      }catch(e){ console.log('❌ Plugin failed:', dirName, file, e.message); }
    }
  };

  loadDir('commands', 'commands');
  loadDir('plugins', 'plugins');
  console.log(`Total commands: ${commands.size} | Function plugins: ${functionPlugins.length}`);
  loadEngines();
}
loadPlugins();

// ===== EXPRESS + KEEPALIVE =====
app.get('/status', (req,res)=> res.json({ connected: !!sock?.user, user: sock?.user?.id || '', totalCmds: commands.size, functionPlugins: functionPlugins.length, mode: getMode(), prefix: getPrefix() }));
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
        console.log(`Mode: ${getMode()} | Prefix: ${getPrefix()} | Cmds: ${commands.size}`);
        try{ if(autoMod?.startAutoBio) autoMod.startAutoBio(sock, db, config); }catch(e){}
      }
    });

    // ===== STATUS - BLOCKED IN PRIVATE + CONNECTED AUTO =====
    sock.ev.on('messages.upsert', async ({ messages }) => {
      try {
        if (messages[0]?.key?.remoteJid === 'status@broadcast') {
          if(getMode() === 'private') return;
          if (autoMod?.handleStatus) for (let s of messages) await autoMod.handleStatus(sock, s, db, F, config);
        }
      } catch(e){}
    });

    // ===== ANTIDELETE REAL - messages.update =====
    sock.ev.on('messages.update', async (updates) => {
      try {
        if (protectionMod?.handleAntiDelete) await protectionMod.handleAntiDelete(sock, updates, db, F);
        else if (antiMod?.handleDelete) await antiMod.handleDelete(sock, updates, db, F);
      } catch(e){}
    });

    // ===== GROUP JOIN/LEAVE - BLOCKED IN PRIVATE + CONNECTED PROTECTION SETTINGS =====
    sock.ev.on('group-participants.update', async (u) => {
      try {
        if(getMode() === 'private') return;
        let from = u.id;
        let g = db.group?.[from];
        if (!g) return;
        // Anti-fake on join - if antifake ON and number no be 234, kick
        let protectionSettings = g.protection || {};
        for (let p of u.participants) {
          if (u.action === 'add' && (protectionSettings.antifake || db.anti?.antifake)) {
            let num = p.split('@')[0];
            if (!num.startsWith('234') && !num.startsWith('1')) {
              // Don't auto-kick, just log - to avoid false kick
              console.log(`⚠️ Fake join detected: ${num} in ${from}`);
            }
          }
          if (u.action === 'add' && (g.welcome || db.auto?.autowelcome)) {
            let activeP = getPrefix();
            let msg = (g.welcomeMsg || `👋 Welcome @user to *{group}*!\n\nType ${activeP}menu`).replace(/@user/g, `@${p.split('@')[0]}`).replace(/\{group\}/g, u.subject || 'group');
            await sock.sendMessage(from, { text: msg, mentions: [p] }).catch(()=>{});
          }
          if (u.action === 'remove' && (g.goodbye || db.auto?.autogoodbye)) {
            let msg = (g.goodbyeMsg || '👋 Bye @user, we go miss you 😢').replace(/@user/g, `@${p.split('@')[0]}`);
            await sock.sendMessage(from, { text: msg, mentions: [p] }).catch(()=>{});
          }
          if (u.action === 'promote' && (db.anti?.antipromote || protectionSettings.antipromote)) {
            await sock.groupParticipantsUpdate(from, [p], 'demote').catch(()=>{});
            await sock.sendMessage(from, { text: `🚫 Anti-Promote: @${p.split('@')[0]} demoted back`, mentions: [p] }).catch(()=>{});
          }
          if (u.action === 'demote' && (db.anti?.antidemote || protectionSettings.antidemote)) {
            await sock.groupParticipantsUpdate(from, [p], 'promote').catch(()=>{});
            await sock.sendMessage(from, { text: `✅ Anti-Demote: @${p.split('@')[0]} promoted back`, mentions: [p] }).catch(()=>{});
          }
        }
      } catch(e){ console.log('Group update err:', e.message); }
    });

    // ===== MAIN MESSAGE HANDLER - CONNECTED ALL =====
    sock.ev.on('messages.upsert', async ({ messages }) => {
      for(let m of messages){
        try{
          if(!m?.message) continue;
          if (m.key.remoteJid === 'status@broadcast') continue;
          let from = m.key.remoteJid;
          let sender = m.key.participant || m.key.remoteJid;
          let senderNum = sender.split('@')[0];
          let pushname = m.pushName || 'User';
          let body = F.getText(m);
          if(!body) continue;
          console.log(`📩 [${m.key.fromMe ? 'FROM-ME' : 'FROM-OTHER'}] ${senderNum}: ${body.slice(0,80)}`);
          let isGroup = F.isGroup(from);

          // ===== 1. OWNER + SELF =====
          let isOwner = isOwnerCheck(sender, db);
          let isSelfCommand = false;
          let activePrefix = getPrefix();
          if(m.key.fromMe){
            if(!body.startsWith(activePrefix)) continue;
            isSelfCommand = true;
            isOwner = true;
            console.log('✅ Self-command detected, treating as owner');
          }

          // ===== 2. PRIVATE MODE - from F.getMode (single source) =====
          let mode = getMode();
          if(mode === 'private' && !isOwner){
            console.log(`🔒 PRIVATE MODE - Ignored ${senderNum}: ${body.slice(0,30)}`);
            continue;
          }

          // ===== 3. BAN + MUTE =====
          if (db.banned?.includes(senderNum) && !isOwner) continue;
          if (isGroup && db.muted?.[from]?.includes(sender) && !isOwner) {
            try { await sock.sendMessage(from, { delete: m.key }); } catch(e){}
            continue;
          }

          // ===== 4. isAdmin ONCE - pass to all commands =====
          let isAdmin = false;
          if (isGroup) {
            try {
              let md = await sock.groupMetadata(from).catch(()=>null);
              let me = md?.participants.find(p=>p.id===sender);
              isAdmin = !!(me && me.admin);
            } catch(e){}
          }

          // ===== 5. PROTECTION + AUTO (only for others, not self) =====
          if(!isSelfCommand){
            // 5a. PROTECTION - MAIN anti engine, ONE warn system (no triple warn)
            try {
              if (protectionMod?.handleProtection) {
                let blocked = await protectionMod.handleProtection(sock, m, db, F, config);
                if (blocked) { F.saveDB(db); continue; }
              } else if (antiMod?.handleAnti) {
                // Fallback if protection.js no dey
                let blocked = await antiMod.handleAnti(sock, m, db, F);
                if (blocked) { F.saveDB(db); continue; }
              }
            } catch(e){ console.log('Protection err:', e.message); }

            // 5b. AUTO - autoread, autoreact, autosticker, etc
            try { if (autoMod?.handleAuto) await autoMod.handleAuto(sock, m, db, F, config); } catch(e){ console.log('Auto err:', e.message); }

            // 5c. AUTOFORWARD
            if (db.auto?.autoforward && !isOwner) {
              try { await sock.sendMessage(`${config.ownerNumber}@s.whatsapp.net`, { text: `📩 Forward from @${senderNum} in ${isGroup ? from : 'DM'}:\n${body}`, mentions: [sender] }); } catch(e){}
            }
          }

          // ===== 6. PREFIX + COMMAND PARSE =====
          let usedPrefix = activePrefix;
          if(!body.startsWith(usedPrefix)) continue;
          let args = body.slice(usedPrefix.length).trim().split(/ +/);
          let cmdName = (args.shift()||'').toLowerCase();
          let text = args.join(' ');
          const reply = async (t, opts={}) => sock.sendMessage(from, { text: t }, { quoted: m, ...opts });
          const fancyReply = async (t, opts={}) => sock.sendMessage(from, { text: fancy(t) }, { quoted: m, ...opts });

          if(cmdName === 'menu' || cmdName === 'help' || cmdName === 'allmenu'){
            try{
              let menuText = getMenu({ ownerName: config.ownerAlias, prefix: usedPrefix, botUser: config.botName, hosting: config.hosting });
              return await sock.sendMessage(from, { image: { url: MENU_PFP }, caption: menuText }, { quoted: m });
            }catch(e){ return await reply('Menu error: '+e.message); }
          }
          if(cmdName === 'reload' && isOwner){
            loadPlugins();
            return await reply(`✅ ${fancy('Reloaded!')} Total: ${commands.size} commands`);
          }

          // ===== 7. CTX - CONNECTED: isAdmin + isOwner + prefix + db + F =====
          let ctx = { sock, m, from, sender, senderNum, pushname, args, text, q: text, cmd: cmdName, cmdName, prefix: usedPrefix, isOwner, isAdmin, isGroup, db, config, F, reply, fancy, fancyReply };

          // ===== 8. PROTECTION COMMANDS - ,antilink on, ,protection, etc =====
          try {
            if (protectionMod?.handleCommands) {
              let handledProt = await protectionMod.handleCommands(sock, m, ctx);
              if (handledProt) { F.saveDB(db); continue; }
            }
          } catch(e){ console.log('Protection cmd err:', e.message); }

          // ===== 9. FUNCTION PLUGINS =====
          let handled = false;
          for(let fp of functionPlugins){
            try{
              let r = await Promise.race([
                fp.fn(sock, m, ctx),
                new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')), 10000))
              ]);
              if(r){ handled = true; F.saveDB(db); break; }
            }catch(e){
              if(e.message !== 'timeout') console.log('FUNC PLUGIN ERR', fp.file, cmdName, e.message);
            }
          }
          if(handled) continue;

          // ===== 10. ARRAY COMMANDS - owner/group/moderator/auto/anti =====
          let plugin = commands.get(cmdName);
          if(!plugin) return await reply(`❌ ${fancy('Unknown command:')} ${usedPrefix}${cmdName}\n${fancy('Type')} ${usedPrefix}menu\n\n${config.footer}`);
          if(plugin.ownerOnly && !isOwner) return await reply(config.messages.ownerOnly);
          if(plugin.groupOnly && !isGroup) return await reply(config.messages.groupOnly);
          try{
            await Promise.race([
              plugin.run({ sock, m, from, sender, senderNum, pushname, args, text, cmd: cmdName, prefix: usedPrefix, isOwner, isAdmin, isGroup, db, config, F, reply, fancy, fancyReply }),
              new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')), 10000))
            ]);
            F.saveDB(db);
          }catch(e){ console.log('CMD ERR', cmdName, e.message); await reply(`${config.messages.error}\n${e.message}\n\n${config.footer}`); }

        }catch(e){ console.log('Message handler err:', e.message); }
      }
    });
  }catch(e){ console.log('Start failed', e.message); isStarting = false; reconnectTimer = setTimeout(()=>{ reconnectTimer=null; start(); }, 3000); }
}
start();

process.on('uncaughtException', e=>console.log('Uncaught:', e.message));
process.on('unhandledRejection', e=>console.log('Rejection:', e.message));
