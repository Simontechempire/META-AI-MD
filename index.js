// index.js - META AI MD Plugin Loader by Simon Tech
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
    if(connection === 'open') console.log('META AI MD CONNECTED ✅');
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

  // ===== MESSAGE HANDLER =====
  sock.ev.on('messages.upsert', async ({ messages }) => {
    let m = messages[0];
    if(!m?.message || m.key.fromMe) return;
    let from = m.key.remoteJid;
    let sender = m.key.participant || m.key.remoteJid;
    let senderNum = sender.split('@')[0];
    let pushname = m.pushName || 'User';
    let body = F.getText(m);
    if(!body) return;

    // Find prefix
    let usedPrefix = config.prefixes.find(p => body.startsWith(p));
    if(!usedPrefix) return;
    let args = body.slice(usedPrefix.length).trim().split(/ +/);
    let cmdName = (args.shift()||'').toLowerCase();
    let text = args.join(' ');
    let isOwner = F.isOwner(sender, db);
    let isGroup = F.isGroup(from);

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
