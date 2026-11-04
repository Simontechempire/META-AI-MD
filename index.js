// index.js - META AI MD Plugin Loader by Simon Tech - CONNECTED EDITION
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const express = require('express');
const path = require('path');
const fs = require('fs');
const pino = require('pino');
const config = require('./config');
const F = require('./lib/function');
const { getMenu } = require('./lib/menu');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
const PORT = config.port || 10000;
let sock = null;
let db = F.loadDB();

// ===== LOAD PLUGINS =====
let commands = new Map();
function loadPlugins(){
  commands.clear();
  let dir = path.join(__dirname, 'commands');
  if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  let files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  for(let file of files){
    try{
      let full = path.join(dir, file);
      delete require.cache[require.resolve(full)];
      let plugin = require(full);
      let list = Array.isArray(plugin) ? plugin : [plugin];
      for(let p of list){
        if(!p || !p.name || typeof p.run !== 'function') continue;
        // Skip engine exports - they are not plugins
        if(p.name === 'handleAuto' || p.name === 'handleAnti') continue;
        commands.set(p.name.toLowerCase(), p);
        if(p.aliases) for(let a of p.aliases) commands.set(a.toLowerCase(), p);
      }
      console.log('Loaded plugin:', file);
    }catch(e){ console.log('Plugin failed:', file, e.message); }
  }
  console.log(`Total commands loaded: ${commands.size}`);
}
loadPlugins();

async function start(){
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionFolder || './Meta');
  const { version } = await fetchLatestBaileysVersion();
  sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.macOS('Safari'),
    auth: state,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
  });
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (u) => {
    const { connection, lastDisconnect } = u;
    if(connection === 'close'){
      let code = lastDisconnect?.error?.output?.statusCode;
      console.log('Closed', code);
      if(code !== DisconnectReason.loggedOut) start();
    }
    if(connection === 'open'){
      console.log('META AI MD CONNECTED ✅');
      // ===== AUTO BIO / ONLINE ENGINE =====
      try{ const autoMod = require('./commands/auto.js'); if(autoMod.startAutoBio) autoMod.startAutoBio(sock, db); }catch(e){ console.log('AutoBio err', e.message); }
    }
  });

  // ===== PAIRING API =====
  app.get('/status', (req,res)=> res.json({ connected: !!sock?.user, user: sock?.user?.id || '', totalCmds: commands.size }));
  app.get('/pair', async (req,res)=>{
    try{
      let number = String(req.query.number||'').replace(/[^0-9]/g,'');
      if(!number || number.length < 9) return res.json({ error: 'Invalid number' });
      if(!sock) return res.json({ error: 'Bot starting, try again in 10s' });
      if(sock.user) return res.json({ error: 'Already connected' });
      let code = await sock.requestPairingCode(number);
      return res.json({ code });
    }catch(e){ console.log('PAIR ERR', e.message); return res.json({ error: 'Try again in 10s - '+e.message }); }
  });
  app.get('/', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));
  app.listen(PORT, ()=> console.log('Server on '+PORT));

  // ===== STATUS HANDLER - AUTO VIEW / LIKE STATUS =====
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    // STATUS: messages from status@broadcast
    if (type === 'append' || messages[0]?.key?.remoteJid === 'status@broadcast') {
      try {
        const autoMod = require('./commands/auto.js');
        if (autoMod.handleStatus) for (let s of messages) await autoMod.handleStatus(sock, s, db);
      } catch(e){}
    }
  });

  // ===== GROUP WELCOME / GOODBYE / ANTI PROMOTE / DEMOTE =====
  sock.ev.on('group-participants.update', async (u) => {
    try {
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
        // ANTI PROMOTE / DEMOTE
        if (u.action === 'promote' && db.anti?.antipromote) {
          await sock.groupParticipantsUpdate(from, [p], 'demote').catch(()=>{});
          await sock.sendMessage(from, { text: `🚫 Anti-Promote: @${p.split('@')[0]} demoted back`, mentions: [p] }).catch(()=>{});
        }
        if (u.action === 'demote' && db.anti?.antidemote) {
          await sock.groupParticipantsUpdate(from, [p], 'promote').catch(()=>{});
          await sock.sendMessage(from, { text: `✅ Anti-Demote: @${p.split('@')[0]} promoted back`, mentions: [p] }).catch(()=>{});
        }
      }
    } catch(e){ console.log('Group update err', e.message); }
  });

  // ===== MESSAGE HANDLER =====
  sock.ev.on('messages.upsert', async ({ messages }) => {
    let m = messages[0];
    if(!m?.message || m.key.fromMe) return;
    // Skip status here - handled above
    if (m.key.remoteJid === 'status@broadcast') return;

    let from = m.key.remoteJid;
    let sender = m.key.participant || m.key.remoteJid;
    let senderNum = sender.split('@')[0];
    let pushname = m.pushName || 'User';
    let body = F.getText(m);
    if(!body) return;
    let isGroup = F.isGroup(from);
    let isOwner = F.isOwner(sender, db);

    // ===== 1. BANNED CHECK =====
    if (db.banned?.includes(senderNum) && !isOwner) return;

    // ===== 2. MUTE CHECK - Moderator .mute =====
    if (isGroup && db.muted?.[from]?.includes(sender) && !isOwner) {
      try { await sock.sendMessage(from, { delete: m.key }); } catch(e){}
      return;
    }

    // ===== 3. ANTI ENGINE - Delete bad msgs before commands =====
    try {
      const antiMod = require('./commands/anti.js');
      if (antiMod.handleAnti) {
        let blocked = await antiMod.handleAnti(sock, m, db, F);
        if (blocked) { F.saveDB(db); return; }
      }
    } catch(e){ console.log('Anti err', e.message); }

    // ===== 4. AUTO ENGINE - autoread, autoreact, etc =====
    try {
      const autoMod = require('./commands/auto.js');
      if (autoMod.handleAuto) await autoMod.handleAuto(sock, m, db);
    } catch(e){ console.log('Auto err', e.message); }

    // ===== 5. AUTO FORWARD TO OWNER =====
    if (db.auto?.autoforward && !isOwner) {
      try { await sock.sendMessage(`${config.ownerNumber}@s.whatsapp.net`, { text: `📩 Forward from @${senderNum} in ${isGroup ? from : 'DM'}:\n${body}`, mentions: [sender] }); } catch(e){}
    }

    // Find prefix
    let usedPrefix = config.prefixes.find(p => body.startsWith(p));
    if(!usedPrefix) return;
    let args = body.slice(usedPrefix.length).trim().split(/ +/);
    let cmdName = (args.shift()||'').toLowerCase();
    let text = args.join(' ');

    // Mode check
    if(db.settings?.mode === 'private' && !isOwner) return;

    const reply = async (t, opts={}) => sock.sendMessage(from, { text: t }, { quoted: m, ...opts });

    // Built-in menu
    if(cmdName === 'menu' || cmdName === 'help' || cmdName === 'allmenu'){
      try{
        let menuText = getMenu({ ownerName: config.ownerAlias, prefix: usedPrefix, botUser: config.botName, hosting: config.hosting });
        return await reply(menuText);
      }catch(e){ return await reply('Menu error: '+e.message); }
    }
    if(cmdName === 'reload' && isOwner){
      loadPlugins();
      return await reply(`Reloaded! Total: ${commands.size} commands`);
    }

    let plugin = commands.get(cmdName);
    if(!plugin){
      return await reply(`❌ Unknown command: .${cmdName}\nType .menu for 300 cmds\n\n${config.footer}`);
    }
    if(plugin.ownerOnly && !isOwner) return await reply(config.messages.ownerOnly);
    if(plugin.groupOnly && !isGroup) return await reply(config.messages.groupOnly);

    try{
      await plugin.run({ sock, m, from, sender, senderNum, pushname, args, text, cmd: cmdName, prefix: usedPrefix, isOwner, isGroup, db, config, F, reply });
      F.saveDB(db);
    }catch(e){
      console.log('CMD ERR', cmdName, e.message);
      await reply(`${config.messages.error}\n${e.message}\n\n${config.footer}`);
    }
  });
}
start();
