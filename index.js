// META AI MD - INDEX.JS
// SIMON TECH INC - LOADS ALL PLUGINS GENERICALLY

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const express = require('express');
const path = require('path');
const fs = require('fs');
const pino = require('pino');
const config = require('./config');
const F = require('./lib/function');
const { getMenu, MENU_PFP } = require('./lib/menu');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
const PORT = config.port || process.env.PORT || 10000;

let sock = null;
let db = F.loadDB() || {};
let isStarting = false;
let reconnectTimer = null;
if (!db.settings) db.settings = {};
if (!db.anti) db.anti = {};
if (!db.group) db.group = {};
if (!db.auto) db.auto = {};

function fancy(text){
  const map={a:'𝐚',b:'𝐛',c:'𝐜',d:'𝐝',e:'𝐞',f:'𝐟',g:'𝐠',h:'𝐡',i:'𝐢',j:'𝐣',k:'𝐤',l:'𝐥',m:'𝐦',n:'𝐧',o:'𝐨',p:'𝐩',q:'𝐪',r:'𝐫',s:'𝐬',t:'𝐭',u:'𝐮',v:'𝐯',w:'𝐰',x:'𝐱',y:'𝐲',z:'𝐳',A:'𝐀',B:'𝐁',C:'𝐂',D:'𝐃',E:'𝐄',F:'𝐅',G:'𝐆',H:'𝐇',I:'𝐈',J:'𝐉',K:'𝐊',L:'𝐋',M:'𝐌',N:'𝐍',O:'𝐎',P:'𝐏',Q:'𝐐',R:'𝐑',S:'𝐒',T:'𝐓',U:'𝐔',V:'𝐕',W:'𝐖',X:'𝐗',Y:'𝐘',Z:'𝐙',0:'𝟎',1:'𝟏',2:'𝟐',3:'𝟑',4:'𝟒',5:'𝟓',6:'𝟔',7:'𝟕',8:'𝟖',9:'𝟗'};
  return String(text).split('').map(c=>map[c]||c).join('');
}
F.fancy = fancy; F.bold = fancy;

// FIXED: Check BOTH LID and PN
function getNums(...jids){
  let out=[];
  for(let j of jids){ let n=String(j||'').split('@')[0].split(':')[0].replace(/[^0-9]/g,''); if(n) out.push(n); }
  return [...new Set(out)];
}
function isOwnerCheck(sender, senderPn, database){
  let nums = getNums(sender, senderPn);
  if(!nums.length) return false;
  let owners=[];
  if(config.ownerNumber) owners.push(...getNums(config.ownerNumber));
  if(database.owner) owners.push(...getNums(database.owner));
  if(Array.isArray(database.owners)) database.owners.forEach(o=>owners.push(...getNums(o)));
  if(Array.isArray(config.owners)) config.owners.forEach(o=>owners.push(...getNums(o)));
  if(database.settings?.owner) owners.push(...getNums(database.settings.owner));
  try{ if(F.isOwner && (F.isOwner(sender, database) || F.isOwner(senderPn, database))) return true; }catch{}
  return nums.some(n=>owners.includes(n));
}
function getMode(database){
  if(config.forceMode && config.mode) return String(config.mode).toLowerCase()==='private' ? 'private' : 'public';
  const mode = database.settings?.mode || database.mode || config.mode || 'public';
  return String(mode).toLowerCase()==='private' ? 'private' : 'public';
}
}
function getPrefixes(){
  // FIXED: db.settings.prefix first, then config.prefixes / config.prefix
  let p = db.settings?.prefix || config.prefix || '.';
  let list = [];
  if(Array.isArray(config.prefixes)) list.push(...config.prefixes);
  list.push(p);
  if(config.prefix && !list.includes(config.prefix)) list.push(config.prefix);
  return [...new Set(list)];
}

// ================= GENERIC PLUGIN LOADER - LOADS ALL =================
let commands = new Map();
let functionPlugins = [];
let handlerMods = []; // any plugin that exports handleAnti / handleAuto / handleProtection / handleMuted / handleStatus / handleParticipants / handleDelete / startAutoBio

function loadPlugins(){
  commands.clear(); functionPlugins=[]; handlerMods=[];
  const dir = path.join(__dirname, 'plugins');
  if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
  const files = fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort();
  for(const file of files){
    try{
      const fullPath = path.join(dir, file);
      delete require.cache[require.resolve(fullPath)];
      const plugin = require(fullPath);
      // Collect handlers generically - NOT hardcoded to anti/auto
      let handlers = {};
      for(let k of ['handleAnti','handleAuto','handleProtection','handleParticipantProtection','handleMuted','handleStatus','handleParticipants','handleDelete','startAutoBio']){
        if(typeof plugin?.[k]==='function') handlers[k]=plugin[k];
      }
      if(Object.keys(handlers).length) handlerMods.push({ file, handlers });
      if(typeof plugin==='function'){ functionPlugins.push({file, fn:plugin}); console.log(`✅ Loaded ${file}: function plugin`); continue; }
      if(plugin && typeof plugin.handler==='function'){ functionPlugins.push({file, fn:plugin.handler}); continue; }
      let list=[];
      if(Array.isArray(plugin)) list=plugin;
      else if(Array.isArray(plugin?.plugins)) list=plugin.plugins;
      else if(plugin?.name) list=[plugin];
      let added=0;
      for(const command of list){
        if(!command?.name || typeof command.run!=='function') continue;
        let name=command.name.toLowerCase();
        // FIXED: Duplicate check - keep first, warn, don't silently overwrite
        if(commands.has(name)){ console.log(`⚠️ Duplicate command ${name} in ${file} - keeping first, skipping this one`); continue; }
        commands.set(name, command); added++;
        if(Array.isArray(command.aliases)){
          for(let alias of command.aliases){
            let a=String(alias).toLowerCase();
            if(commands.has(a)){ console.log(`⚠️ Duplicate alias ${a} in ${file} - keeping first, skipping`); continue; }
            commands.set(a, command);
          }
        }
      }
      console.log(`✅ Loaded ${file}: ${added} commands`);
    }catch(e){ console.log(`❌ Plugin error ${file}:`, e.message); }
  }
  console.log(`📦 Commands loaded: ${commands.size}`);
  console.log(`⚙️ Function plugins: ${functionPlugins.length} | Handler mods: ${handlerMods.length}`);
}
loadPlugins();
function getHandler(name){
  let out=[];
  for(let m of handlerMods) if(m.handlers[name]) out.push(m.handlers[name]);
  return out;
}

// ================= SERVER =================
app.get('/ping',(req,res)=>res.send('pong'));
app.get('/status',(req,res)=>res.json({connected:Boolean(sock?.user), user:sock?.user?.id||null, commands:commands.size, mode:getMode(db)}));
app.get('/pair', async (req,res)=>{
  try{
    const number=String(req.query.number||'').replace(/[^0-9]/g,'');
    if(!number || number.length<9) return res.status(400).json({error:'Invalid phone number'});
    if(!sock) return res.status(503).json({error:'Bot is starting. Try again shortly.'});
    if(sock.user) return res.status(409).json({error:'This bot session is already connected.'});
    const code=await sock.requestPairingCode(number);
    return res.json({code});
  }catch(e){ console.log('Pairing error:', e.message); return res.status(500).json({error:'Pairing failed. Try again.'}); }
});
app.get('/',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,()=>console.log(`🌐 Server running on port ${PORT}`));
setInterval(async()=>{ try{ const url=process.env.RENDER_EXTERNAL_URL||`http://localhost:${PORT}`; await fetch(`${url}/ping`); }catch{} }, 4*60*1000);

// ================= GROUP ADMIN CHECK - LID + PN =================
async function getGroupPermissions(from, sender, senderPn){
  try{
    const metadata = await sock.groupMetadata(from);
    const participants = metadata.participants||[];
    // FIXED: Use F.findParticipant if available, else match LID + PN + number
    let participant=null, bot=null;
    if(F.findParticipant){
      participant = F.findParticipant(metadata, sender) || F.findParticipant(metadata, senderPn);
      bot = F.findParticipant(metadata, sock.user?.id) || F.findParticipant(metadata, sock.user?.lid);
    } else {
      let sNums=getNums(sender, senderPn);
      participant=participants.find(p=> sNums.includes(getNums(p.id)[0]) || sNums.includes(getNums(p.phoneNumber)[0]) || p.id===sender || p.phoneNumber===sender);
      let bNums=getNums(sock.user?.id, sock.user?.lid);
      bot=participants.find(p=> bNums.includes(getNums(p.id)[0]) || bNums.includes(getNums(p.phoneNumber)[0]));
    }
    return { isAdmin:['admin','superadmin'].includes(participant?.admin), isBotAdmin:['admin','superadmin'].includes(bot?.admin), metadata };
  }catch(e){ return {isAdmin:false,isBotAdmin:false,metadata:null}; }
}

// ================= WHATSAPP CONNECTION =================
async function start(){
  if(isStarting) return; isStarting=true;
  if(reconnectTimer){ clearTimeout(reconnectTimer); reconnectTimer=null; }
  try{
    const sessionFolder=config.sessionFolder || './Meta';
    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    const { version } = await fetchLatestBaileysVersion();
    sock = makeWASocket({ version, logger:pino({level:'silent'}), browser:Browsers.macOS('Safari'), auth:state, printQRInTerminal:false, markOnlineOnConnect:true, syncFullHistory:false, shouldSyncHistoryMessage:()=>false, connectTimeoutMs:60000, keepAliveIntervalMs:10000, getMessage:async()=>undefined });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', async update=>{
      const { connection, lastDisconnect } = update;
      if(connection==='connecting') console.log('🔄 Connecting...');
      if(connection==='open'){
        isStarting=false; console.log('✅ META AI MD CONNECTED');
        for(let fn of getHandler('startAutoBio')){ try{ await fn(sock, db, config); }catch(e){ console.log('Auto bio error:', e.message); } }
      }
      if(connection==='close'){
        isStarting=false;
        const code=lastDisconnect?.error?.output?.statusCode;
        console.log('Connection closed:', code);
        if(code===DisconnectReason.loggedOut){ console.log('❌ Session logged out. Pair again.'); return; }
        if(!reconnectTimer) reconnectTimer=setTimeout(()=>{ reconnectTimer=null; start(); },5000);
      }
    });
    // STATUS
    sock.ev.on('messages.upsert', async ({messages})=>{
      for(let message of messages){
        try{
          if(message.key?.remoteJid!=='status@broadcast') continue;
          if(getMode(db)==='private') continue;
          for(let fn of getHandler('handleStatus')) await fn(sock, message, db, F, config);
        }catch(e){ console.log('Status handler error:', e.message); }
      }
    });
    // ANTIDELETE
    sock.ev.on('messages.update', async updates=>{
      try{ for(let fn of getHandler('handleDelete')) await fn(sock, updates, db, F, config); }catch(e){ console.log('Anti-delete error:', e.message); }
    });
    // GROUP PARTICIPANTS - FIXED: Call ALL handlers, not just inline welcome
    sock.ev.on('group-participants.update', async update=>{
      try{
        if(getMode(db)==='private') return;
        // 1. Protection antipromote / antidemote
        for(let fn of getHandler('handleParticipantProtection')) await fn(sock, update, db, F, config);
        // 2. Auto welcome / goodbye + custom per-group messages
        // Use handlerMods that export handleParticipants (auto.js) - it already checks db.auto + per-group? Fallback inline if none
        let handled=false;
        for(let fn of getHandler('handleParticipants')){ await fn(sock, update, db, F, config); handled=true; }
        if(!handled){
          const from=update.id; const group=db.group?.[from]; if(!group) return;
          for(let participant of update.participants||[]){
            let pn = F.getPn ? F.getPn(participant) : participant.split('@')[0];
            // Try resolve PN via group meta
            try{ let md=await sock.groupMetadata(from); let p = F.findParticipant ? F.findParticipant(md, participant) : null; if(p?.phoneNumber) pn=getNums(p.phoneNumber)[0]; }catch{}
            if(update.action==='add' && (group.welcome || db.auto?.autowelcome)){
              let msg=(group.welcomeMsg||'👋 Welcome @user to *{group}*!\n\nType .menu').replace(/@user/g,`@${pn}`).replace(/\{group\}/g, update.subject||'group');
              await sock.sendMessage(from,{text:msg, mentions:[participant]}).catch(()=>{});
            }
            if(update.action==='remove' && (group.goodbye || db.auto?.autogoodbye)){
              let msg=(group.goodbyeMsg||'👋 Bye @user!').replace(/@user/g,`@${pn}`);
              await sock.sendMessage(from,{text:msg, mentions:[participant]}).catch(()=>{});
            }
          }
        }
      }catch(e){ console.log('Group event error:', e.message); }
    });
    // MESSAGE HANDLER
    sock.ev.on('messages.upsert', async ({messages})=>{
      for(let m of messages){
        try{
          if(!m?.message) continue;
          const from=m.key.remoteJid; if(!from || from==='status@broadcast') continue;
          const sender=m.key.participant || from;
          const senderPn=m.key.participantPn || m.key.remoteJidAlt || sender;
          const senderNums=getNums(sender, senderPn);
          const pushname=m.pushName||'User';
          const body=F.getText(m);
          if(!body) continue;
          const isGroup=F.isGroup(from);
          let isOwner=isOwnerCheck(sender, senderPn, db);
          if(m.key.fromMe){
            let prefixes=getPrefixes();
            if(!prefixes.some(p=>body.startsWith(p))) continue;
            isOwner=true;
          }
          if(getMode(db)==='private' && !isOwner) continue;
          // FIXED: Ban check BOTH LID + PN
          if(!isOwner && db.banned?.length && senderNums.some(n=>db.banned.includes(n))) continue;
          // Group permissions early - needed for admin bypass in handlers
          let permissions={isAdmin:false,isBotAdmin:false,metadata:null};
          if(isGroup) permissions=await getGroupPermissions(from, sender, senderPn);
          if(isOwner) permissions.isAdmin=true;
          // FIXED ORDER: Muted -> Protection -> Anti -> Auto
          if(!m.key.fromMe){
            // 1. MUTED (moderator .restrict)
            try{
              for(let fn of getHandler('handleMuted')){ let blocked=await fn(sock, m, db, F, config); if(blocked){ F.saveDB(db); continue; } }
              // Legacy inline muted check if no handler
              if(!getHandler('handleMuted').length && isGroup && db.muted?.[from]?.length){
                let hit=db.muted[from].some(x=> senderNums.includes(getNums(x)[0]) || x===sender || x===senderPn);
                if(hit && !isOwner && !permissions.isAdmin){ await sock.sendMessage(from,{delete:m.key}).catch(()=>{}); continue; }
              }
            }catch(e){ console.log('Muted handler error:', e.message); }
            // 2. PROTECTION (antibot / antiforeign)
            try{
              for(let fn of getHandler('handleProtection')){ let blocked=await fn(sock, m, db, F, config); if(blocked){ F.saveDB(db); continue; } }
            }catch(e){ console.log('Protection handler error:', e.message); }
            // 3. ANTI (antilink etc) - skip if sender is admin/owner, anti.js also checks
            try{
              for(let fn of getHandler('handleAnti')){ let blocked=await fn(sock, m, db, F, config); if(blocked){ F.saveDB(db); continue; } }
            }catch(e){ console.log('Anti handler error:', e.message); }
            // 4. AUTO
            try{
              for(let fn of getHandler('handleAuto')) await fn(sock, m, db, F, config);
            }catch(e){ console.log('Auto handler error:', e.message); }
          }
          // Prefix check - FIXED: Use db.settings.prefix
          const prefixes=getPrefixes();
          const usedPrefix=prefixes.find(p=>body.startsWith(p));
          if(!usedPrefix) continue;
          const args=body.slice(usedPrefix.length).trim().split(/\s+/);
          const cmdName=(args.shift()||'').toLowerCase();
          const text=args.join(' ');
          const reply=async (message, options={})=> sock.sendMessage(from,{text:String(message), ...options},{quoted:m});
          const fancyReply=async (message, options={})=> reply(fancy(message), options);
          if(['menu','help','allmenu'].includes(cmdName)){
            try{
              const menuText=getMenu({ownerName:config.ownerAlias, prefix:usedPrefix, botUser:config.botName, hosting:config.hosting});
              return await sock.sendMessage(from,{image:{url:MENU_PFP}, caption:menuText},{quoted:m});
            }catch(e){ return reply('Menu error: '+e.message); }
          }
          if(cmdName==='reload' && isOwner){ loadPlugins(); return reply(`✅ ${fancy('Plugins reloaded')}\nCommands: ${commands.size}`); }
          const ctx={ sock, m, from, sender, senderNum:getNums(sender)[0], senderPn, senderNums, pushname, args, text, q:text, cmd:cmdName, cmdName, prefix:usedPrefix, isOwner, isGroup, isAdmin:permissions.isAdmin, isBotAdmin:permissions.isBotAdmin, metadata:permissions.metadata, db, config, F, reply, fancy, fancyReply };
          let handled=false;
          for(let plugin of functionPlugins){
            try{ let result=await plugin.fn(sock, m, ctx); if(result){ handled=true; F.saveDB(db); break; } }catch(e){ console.log('Function plugin error:', plugin.file, e.message); }
          }
          if(handled) continue;
          const plugin=commands.get(cmdName);
          if(!plugin){ await reply(`❌ Unknown command: ${usedPrefix}${cmdName}\nType ${usedPrefix}menu`); continue; }
          if(plugin.ownerOnly && !isOwner){ await reply(config.messages?.ownerOnly || '❌ Owner only command.'); continue; }
          if(plugin.groupOnly && !isGroup){ await reply(config.messages?.groupOnly || '❌ Group only command.'); continue; }
          if(plugin.adminOnly && !permissions.isAdmin && !isOwner){ await reply('❌ Admins only.'); continue; }
          await plugin.run(ctx);
          F.saveDB(db);
        }catch(e){ console.log('Message handler error:', e.message); }
      }
    });
  }catch(e){
    console.log('Start failed:', e.message); isStarting=false;
    if(!reconnectTimer) reconnectTimer=setTimeout(()=>{ reconnectTimer=null; start(); },5000);
  }
}
start();
process.on('uncaughtException', e=>console.log('Uncaught exception:', e.message));
process.on('unhandledRejection', e=>console.log('Unhandled rejection:', e.message));
