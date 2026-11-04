// index.js - META AI MD by Simon Tech - PLUGINS FOLDER FIXED
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

// ===== LOAD PLUGINS - USES plugins/ FOLDER =====
let commands = new Map();
function loadPlugins(){
  commands.clear();
  let dir = path.join(__dirname, 'plugins');
  if(!fs.existsSync(dir)) {
    console.log('❌ NO plugins folder! Creating am...');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'test.js'), `module.exports = [{ name: 'testping', run: async ({reply}) => reply('✅ Loader dey work!') }];`);
    console.log('✅ Created plugins/test.js');
  }
  let files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  console.log('📁 Found files in plugins/:', files);
  for(let file of files){
    try{
      let full = path.join(dir, file);
      delete require.cache[require.resolve(full)];
      let plugin = require(full);
      let list = [];
      if (Array.isArray(plugin)) list = plugin;
      else if (plugin && Array.isArray(plugin.plugins)) list = plugin.plugins;
      else if (plugin && plugin.name) list = [plugin];
      else { console.log('⚠️ No plugins in', file); continue; }
      let count = 0;
      for(let p of list){
        if(!p || !p.name || typeof p.run !== 'function') continue;
        commands.set(p.name.toLowerCase(), p);
        if(p.aliases) for(let a of p.aliases) commands.set(a.toLowerCase(), p);
        count++;
      }
      console.log(`✅ Loaded ${file}: ${count} cmds`);
    }catch(e){ console.log('❌ Plugin failed:', file, e.message); console.log(e.stack); }
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
      try{ const autoMod = require('./plugins/auto.js'); if(autoMod.startAutoBio) autoMod.startAutoBio(sock, db); }catch(e){ console.log('AutoBio err', e.message); }
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

  // ===== STATUS HANDLER =====
  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      if (messages[0]?.key?.remoteJid === 'status@broadcast') {
        const autoMod = require('./plugins/auto.js');
        if (autoMod.handleStatus) for (let s of messages) await autoMod.handleStatus(sock, s, db);
      }
    } catch(e){}
  });

  // ===== GROUP WELCOME / GOODBYE / ANTI PROMOTE =====
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
    if (m.key.remoteJid === 'status@broadcast') return;
    let from = m.key.remoteJid;
    let sender = m.key.participant || m.key.remoteJid;
    let senderNum = sender.split('@')[0];
    let pushname = m.pushName || 'User';
    let body = F.getText(m);
    if(!body) return;
    let isGroup = F.isGroup(from);
    let isOwner = F.isOwner(sender, db);

    if (db.banned?.includes(senderNum) && !isOwner) return;

    if (isGroup && db.muted?.[from]?.includes(sender) && !isOwner) {
      try { await sock.sendMessage(from, { delete: m.key }); } catch(e){}
      return;
    }

    // ANTI ENGINE - plugins/anti.js
    try {
      const antiMod = require('./plugins/anti.js');
      if (antiMod.handleAnti) {
        let blocked = await antiMod.handleAnti(sock, m, db, F);
        if (blocked) { F.saveDB(db); return; }
      }
    } catch(e){}

    // AUTO ENGINE - plugins/auto.js
    try {
      const autoMod = require('./plugins/auto.js');
      if (autoMod.handleAuto) await autoMod.handleAuto(sock, m, db);
    } catch(e){}

    if (db.auto?.autoforward && !isOwner) {
      try { await sock.sendMessage(`${config.ownerNumber}@s.whatsapp.net`, { text: `📩 Forward from @${senderNum} in ${isGroup ? from : 'DM'}:\n${body}`, mentions: [sender] }); } catch(e){}
    }

    let usedPrefix = config.prefixes.find(p => body.startsWith(p));
    if(!usedPrefix) return;
    let args = body.slice(usedPrefix.length).trim().split(/ +/);
    let cmdName = (args.shift()||'').toLowerCase();
    let text = args.join(' ');

    if(db.settings?.mode === 'private' && !isOwner) return;

    const reply = async (t, opts={}) => sock.sendMessage(from, { text: t }, { quoted: m, ...opts });

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
