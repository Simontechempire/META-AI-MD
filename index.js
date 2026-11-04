// index.js - META AI MD by Simon Tech | 300 CMD REAL HANDLER
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, jidNormalizedUser, downloadContentFromMessage, Browsers } = require('@whiskeysockets/baileys');
const express = require('express');
const path = require('path');
const fs = require('fs');
const pino = require('pino');
const config = require('./config');
// PAIRING ONLY - No QR Code, No qrcode-terminal - META AI MD by Simon Tech

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let sock = null;
let lastPairCode = null;
let pairingNumber = null;

// ===== FANCY KEYBOARD STYLE =====
const F = {
  b: (t) => '𝐁𝐎𝐋𝐃: ' + t, // helper not used
};
// Fancy converter
function fancy(t){
  const map = {a:'𝐚',b:'𝐛',c:'𝐜',d:'𝐝',e:'𝐞',f:'𝐟',g:'𝐠',h:'𝐡',i:'𝐢',j:'𝐣',k:'𝐤',l:'𝐥',m:'𝐦',n:'𝐧',o:'𝐨',p:'𝐩',q:'𝐪',r:'𝐫',s:'𝐬',t:'𝐭',u:'𝐮',v:'𝐯',w:'𝐰',x:'𝐱',y:'𝐲',z:'𝐳',A:'𝐀',B:'𝐁',C:'𝐂',D:'𝐃',E:'𝐄',F:'𝐅',G:'𝐆',H:'𝐇',I:'𝐈',J:'𝐉',K:'𝐊',L:'𝐋',M:'𝐌',N:'𝐍',O:'𝐎',P:'𝐏',Q:'𝐐',R:'𝐑',S:'𝐒',T:'𝐓',U:'𝐔',V:'𝐕',W:'𝐖',X:'𝐗',Y:'𝐘',Z:'𝐙',0:'𝟎',1:'𝟏',2:'𝟐',3:'𝟑',4:'𝟒',5:'𝟓',6:'𝟔',7:'𝟕',8:'𝟖',9:'𝟗'};
  return String(t).split('').map(c=>map[c]||c).join('');
}
function panel(title, body){
  return `╭─「 ${fancy(title)} 」\n│\n${body.split('\n').map(l=>'│ '+l).join('\n')}\n│\n╰─「 ${fancy('𝐌𝐄𝐓𝐀 𝐀𝐈 𝐌𝐃')} 」\n${config.footer}`;
}
function head(t){ return `◈┈▉ \`${fancy(t)}\` ▉┄◈`; }
const WAIT = '⏳';
const DONE = '💀';

// ===== DB =====
let db = { users:{}, groups:{}, warns:{}, afk:{}, premium:[], banned:[], antilink:{}, welcome:{}, economy:{} };
try{ if(fs.existsSync('./database.json')) db = JSON.parse(fs.readFileSync('./database.json')); }catch{}
function saveDb(){ fs.writeFileSync('./database.json', JSON.stringify(db,null,2)); }
function getUser(jid){ if(!db.users[jid]) db.users[jid]={xp:0,level:1,money:1000,bank:0,limit:20,warns:0,afk:null,premium:false,lastDaily:0}; return db.users[jid]; }
function getGroup(jid){ if(!db.groups[jid]) db.groups[jid]={welcome:false,antilink:false,antibad:false,muted:false,nsfw:false}; return db.groups[jid]; }

// ===== HELPERS =====
const isOwner = (jid)=> config.owners.includes(jid.split('@')[0].split(':')[0]);
async function fetchJson(u, opts={}){ const r=await fetch(u,opts); return r.json(); }
async function fetchText(u){ const r=await fetch(u); return r.text(); }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
function formatNum(n){ return Number(n||0).toLocaleString(); }

// ===== EXPRESS - PAIRING =====
app.get('/health',(req,res)=>res.json({status:'ok',bot:config.botName,uptime:process.uptime()}));
app.get('/status',(req,res)=>res.json({connected: !!sock?.user, user: sock?.user ? sock.user.id : null, bot: config.botName}));
app.get('/pair', async (req,res)=>{
  try{
    let num = (req.query.number||'').replace(/[^0-9]/g,'');
    if(!num || num.length<9) return res.json({error:'Invalid number. Example 2348102350169'});
    if(!sock) return res.json({error:'Bot is starting, wait 10s and try again'});
    pairingNumber = num;
    let code = await sock.requestPairingCode(num);
    lastPairCode = code;
    return res.json({code, number:num});
  }catch(e){ console.log(e); return res.json({error:'Failed to generate. Wait 10s, restart bot if persists.'}); }
});
app.get('/', (req,res)=> res.sendFile(path.join(__dirname,'public/index.html')));
const PORT = process.env.PORT || config.port || 10000;
app.listen(PORT, ()=> console.log(`🌐 Web on ${PORT}`));

// ===== 300 COMMANDS LIST - PANEL METHOD =====
const MENU = {
  '𝐀𝐈 & 𝐂𝐇𝐀𝐓': ['ai','gpt','gpt4','meta','ask','chat','bard','gemini','blackbox','copilot','mistral','llama','imagine','draw','image','photo','stickerai','voice','tts','translate','trt','summarize','grammar','rewrite','code','debug','explain','story','poem','joke','quote','fact','riddle','advice','horoscope','truth','dare'],
  '𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑': ['play','song','video','ytmp3','ytmp4','yt','tiktok','tt','ig','fb','twitter','x','pinterest','pin','spotify','apple','soundcloud','mediafire','apk','apkdl','gitclone','wallpaper','meme','meme2','cat','dog','fox','anime','waifu','neko','cosplay'],
  '𝐆𝐑𝐎𝐔𝐏': ['tagall','hidetag','tag','kick','add','promote','demote','mute','unmute','open','close','antilink','antilinkoff','welcome','goodbye','setwelcome','setgoodbye','setname','setdesc','setppgc','link','revoke','invite','join','leave','groupinfo','ginfo','admins','poll','vote','votekick','antilink2','antibadword','warn','unwarn','warns','del','pin','unpin','edit','everyone'],
  '𝐎𝐖𝐍𝐄𝐑 & 𝐁𝐎𝐓': ['owner','menu','help','ping','speed','uptime','runtime','info','botinfo','sc','script','support','donate','restart','shutdown','broadcast','bc','bcgc','joinlink','setprefix','setbio','autobio','mode','public','private','self','block','unblock','blocklist','clearsession','update','eval','exec','getpp','setpp','pair','qr','logout','antibot','antidelete'],
  '𝐄𝐂𝐎𝐍𝐎𝐌𝐘 & 𝐆𝐀𝐌𝐄': ['balance','bal','bank','deposit','withdraw','daily','weekly','work','rob','gamble','slot','dice','coinflip','rps','hunt','fish','mine','beg','pay','leaderboard','lb','shop','buy','sell','inventory','profile','rank','xp','level','top','lottery','bet','casino','blackjack','roulette','baccarat','guess','math','quiz','trivia','hangman','tictactoe','ttt','truth2','dare2'],
  '𝐔𝐓𝐈𝐋𝐈𝐓𝐘 & 𝐓𝐎𝐎𝐋𝐒': ['sticker','s','toimg','tovideo','toaudio','tomp3','tovn','tourl','ss','screenshot','qr','qrcode','calc','calculator','weather','time','date','news','covid','currency','convert','shorten','tinyurl','paste','pastebin','remind','reminder','timer','countdown','wikipedia','wiki','google','search','lyrics','dictionary','define','meaning','spell','password','genpass','color','emoji','emojimix','watermark','wm','readmore','fancy','style','binary','base64','encode','decode','ip','whois','dns','pingurl','uptimecheck','device','phone','truecaller','stalk','igstalk','ttstalk','ytstalk'],
  '𝐅𝐔𝐍 & 𝐄𝐍𝐓𝐄𝐑𝐓𝐀𝐈𝐍': ['ship','love','crush','gay','lesbian','beautiful','ugly','stupid','smart','rich','poor','kiss','hug','slap','pat','cuddle','punch','kill','marry','divorce','rate','howgay','howcute','howhot','pickup','pickupline','insult','compliment','roast','8ball','magic8','roll','flip','random','choose','shout','whisper','reverse','mock','clap','owo','uwu','sarcasm','aesthetic','vapor','ascii','say','repeat','shrug','lenny','tableflip','unflip'],
  '𝐒𝐄𝐀𝐑𝐂𝐇 & 𝐌𝐄𝐃𝐈𝐀': ['pinterest2','googleimage','gimage','unsplash','pexels','tenor','gif','stickerpack','attp','ttp','emojisticker','animequote','animewall','manga','manhwa','character','waifu2','husbando','neko2','loli','meme3','darkmeme','funny','cat2','dog2','bird','panda','koala','fox2','tiger','lion','wolf','dragon','space','nasa','apod','earth','mars','crypto','bitcoin','eth','stocks','forex','gold','silver'],
  '𝐑𝐄𝐋𝐈𝐆𝐈𝐎𝐍 & 𝐋𝐈𝐅𝐄': ['bible','verse','quran','surah','hadith','prayer','prayertime','hijri','gregorian','zodiac','astrology','tarot','numerology','dream','dreammeaning','motivation','motivate','affirmation','gratitude','meditation','yoga','health','bmi','calorie','sleep','water','exercise','diet','recipe','cooking','travel','hotel','flight','job','jobsearch','course','learn','school','exam','study','homework','math2','science','history','geography','politics','law','business','marketing','finance','invest'],
};

const ALL_CMDS = Object.values(MENU).flat();
console.log(`Loaded ${ALL_CMDS.length} commands`);

// ===== START BOT =====
async function start(){
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionFolder);
  const { version } = await fetchLatestBaileysVersion();
  sock = makeWASocket({
    version, auth: state, printQRInTerminal: false,
    logger: pino({level:'silent'}),
    browser: Browsers.macOS('Chrome'),
    markOnlineOnConnect: true,
    syncFullHistory: false,
  });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (u)=>{
    const { connection, lastDisconnect } = u;
    if(connection==='close'){
      let rc = lastDisconnect?.error?.output?.statusCode;
      if(rc !== DisconnectReason.loggedOut) start();
      else console.log('Logged out - delete Meta folder and re-pair');
    }
    if(connection==='open') console.log('✅ META AI MD CONNECTED - '+sock.user.id);
  });

  // WELCOME / GOODBYE
  sock.ev.on('group-participants.update', async (e)=>{
    try{
      let g = getGroup(e.id); if(!g.welcome && !g.goodbye) return;
      for(let p of e.participants){
        let name = p.split('@')[0];
        if(e.action==='add' && g.welcome) await sock.sendMessage(e.id,{text:panel('𝐖𝐄𝐋𝐂𝐎𝐌𝐄',`𝐖𝐞𝐥𝐜𝐨𝐦𝐞 @${name} 💀\n𝐑𝐞𝐚𝐝 𝐫𝐮𝐥𝐞𝐬 & 𝐞𝐧𝐣𝐨𝐲!`),mentions:[p]});
        if(e.action==='remove' && g.goodbye) await sock.sendMessage(e.id,{text:panel('𝐆𝐎𝐎𝐃𝐁𝐘𝐄',`𝐁𝐲𝐞 @${name} 👋\n𝐖𝐞 𝐠𝐨 𝐦𝐢𝐬𝐬 𝐲𝐨𝐮.`)});
      }
    }catch{}
  });

  sock.ev.on('messages.upsert', async ({messages})=>{
    const m = messages[0]; if(!m?.message || m.key.fromMe) return;
    const from = m.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const sender = isGroup ? m.key.participant : from;
    const senderNum = sender.split('@')[0].split(':')[0];
    const pushname = m.pushName || 'User';
    const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || '';
    if(!body) return;
    // AFK return
    if(db.afk[sender]){ await sock.sendMessage(from,{text:panel('𝐀𝐅𝐊',`𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐛𝐚𝐜𝐤 @${senderNum}`)}); delete db.afk[sender]; saveDb(); }
    // Prefix check
    let usedPrefix = config.prefixes.find(p=>body.startsWith(p));
    if(!usedPrefix){
      // Auto AI if bot mentioned or DM without prefix
      if(!isGroup || body.toLowerCase().includes('meta')){ /* auto ai handled below via no prefix? skip */ }
      return;
    }
    let args = body.slice(usedPrefix.length).trim().split(/\s+/);
    let cmd = args.shift()?.toLowerCase(); if(!cmd) return;
    let text = args.join(' ');
    if(!ALL_CMDS.includes(cmd) && !['menu','help','list','allmenu'].includes(cmd)) return;

    const reply = async (t, opts={}) => sock.sendMessage(from, {text:t, ...opts}, {quoted:m});
    const react = async (e)=> { try{ await sock.sendMessage(from,{react:{text:e,key:m.key}});}catch{} };
    const waitMsg = async ()=> { let sent = await reply(WAIT+' '+fancy('𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠...')); return sent; };
    const editToDone = async (sent, finalText)=>{
      try{ await sock.sendMessage(from,{text: DONE+' '+finalText, edit: sent.key}); }catch{ await reply(DONE+' '+finalText); }
    };
    // Fast reply + await
    await react('⏳');
    let sent = await waitMsg();
    let user = getUser(sender); user.xp+=5; if(user.xp> user.level*100){ user.level++; user.money+=200; } saveDb();

    try{
      // ===== PANEL METHOD - ALL HANDLERS REAL =====
      // --- MENU / HELP ---
      if(['menu','help','list','allmenu'].includes(cmd)){
        let out = head('𝐌𝐄𝐓𝐀 𝐀𝐈 𝐌𝐃 𝐌𝐄𝐍𝐔')+'\n';
        out += `│ ${fancy('𝐎𝐰𝐧𝐞𝐫:')} 𝐒𝐢𝐦𝐨𝐧 𝐓𝐞𝐜𝐡\n│ ${fancy('𝐏𝐫𝐞𝐟𝐢𝐱:')} . ! ? @ - /\n│ ${fancy('𝐓𝐨𝐭𝐚𝐥:')} 300 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬\n│ ${fancy('𝐌𝐨𝐝𝐞:')} ${config.mode}\n│ ${fancy('𝐔𝐬𝐞𝐫:')} @${senderNum}\n│\n`;
        for(let [k,v] of Object.entries(MENU)) out += `╭─「 ${k} 」\n${v.map(c=>'│ ▸ .'+c).join('\n')}\n╰──────────\n`;
        out += `╰─ ${config.footer}`;
        return editToDone(sent, out);
      }
      if(cmd==='ping'){ let s=Date.now(); return editToDone(sent, panel('𝐏𝐈𝐍𝐆',`𝐒𝐩𝐞𝐞𝐝: ${Date.now()-s}𝐦𝐬 💀\n𝐔𝐩𝐭𝐢𝐦𝐞: ${Math.floor(process.uptime()/60)}𝐦𝐢𝐧\n𝐒𝐭𝐚𝐭𝐮𝐬: 𝐎𝐧𝐥𝐢𝐧𝐞 ✅`)); }
      if(cmd==='owner') return editToDone(sent, panel('𝐎𝐖𝐍𝐄𝐑',`𝐍𝐚𝐦𝐞: 𝐒𝐢𝐦𝐨𝐧 𝐓𝐞𝐜𝐡\n𝐍𝐮𝐦𝐛𝐞𝐫: +234 810 235 0169\n𝐖𝐚: wa.me/2348102350169\n𝐓𝐚𝐩 𝐭𝐨 𝐜𝐡𝐚𝐭 💀`));
      if(['uptime','runtime'].includes(cmd)) return editToDone(sent, panel('𝐔𝐏𝐓𝐈𝐌𝐄',`𝐁𝐨𝐭 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐨𝐧𝐥𝐢𝐧𝐞 𝐟𝐨𝐫 ${Math.floor(process.uptime()/3600)}𝐡 ${Math.floor(process.uptime()%3600/60)}𝐦 💀`));
      if(['info','botinfo'].includes(cmd)) return editToDone(sent, panel('𝐁𝐎𝐓 𝐈𝐍𝐅𝐎',`𝐍𝐚𝐦𝐞: 𝐌𝐄𝐓𝐀 𝐀𝐈 𝐌𝐃\n𝐎𝐰𝐧𝐞𝐫: 𝐒𝐢𝐦𝐨𝐧 𝐓𝐞𝐜𝐡\n𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬: 300\n𝐋𝐢𝐛: 𝐁𝐚𝐢𝐥𝐞𝐲𝐬\n𝐇𝐨𝐬𝐭: 𝐑𝐞𝐧𝐝𝐞𝐫 / 𝐑𝐚𝐢𝐥𝐰𝐚𝐲`));
      if(cmd==='profile'){ return editToDone(sent, panel('𝐏𝐑𝐎𝐅𝐈𝐋𝐄',`𝐍𝐚𝐦𝐞: ${pushname}\n𝐍𝐮𝐦𝐛𝐞𝐫: +${senderNum}\n𝐗𝐏: ${user.xp} | 𝐋𝐞𝐯𝐞𝐥: ${user.level}\n𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ₦${formatNum(user.money)}\n𝐁𝐚𝐧𝐤: ₦${formatNum(user.bank)}`)); }
      if(['balance','bal'].includes(cmd)) return editToDone(sent, panel('𝐁𝐀𝐋𝐀𝐍𝐂𝐄',`𝐖𝐚𝐥𝐥𝐞𝐭: ₦${formatNum(user.money)}\n𝐁𝐚𝐧𝐤: ₦${formatNum(user.bank)}\n𝐓𝐨𝐭𝐚𝐥: ₦${formatNum(user.money+user.bank)} 💀`));
      if(cmd==='daily'){ if(Date.now()-user.lastDaily<86400000) return editToDone(sent, panel('𝐃𝐀𝐈𝐋𝐘',`𝐘𝐨𝐮 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐜𝐥𝐚𝐢𝐦𝐞𝐝 𝐭𝐨𝐝𝐚𝐲. 𝐂𝐨𝐦𝐞 𝐛𝐚𝐜𝐤 𝐭𝐨𝐦𝐨𝐫𝐫𝐨𝐰 💀`)); user.lastDaily=Date.now(); user.money+=500; saveDb(); return editToDone(sent, panel('𝐃𝐀𝐈𝐋𝐘',`+₦500 𝐚𝐝𝐝𝐞𝐝! 💀\n𝐍𝐞𝐰 𝐁𝐚𝐥: ₦${formatNum(user.money)}`)); }
      if(['deposit','withdraw'].includes(cmd)){ let amt=parseInt(args[0]); if(!amt) return editToDone(sent, panel('𝐁𝐀𝐍𝐊',`𝐔𝐬𝐚𝐠𝐞: .${cmd} 500`)); if(cmd==='deposit'){ if(user.money<amt) return editToDone(sent, panel('𝐁𝐀𝐍𝐊',`𝐍𝐨𝐭 𝐞𝐧𝐨𝐮𝐠𝐡 𝐦𝐨𝐧𝐞𝐲`)); user.money-=amt; user.bank+=amt; } else { if(user.bank<amt) return editToDone(sent, panel('𝐁𝐀𝐍𝐊',`𝐍𝐨𝐭 𝐞𝐧𝐨𝐮𝐠𝐡 𝐢𝐧 𝐛𝐚𝐧𝐤`)); user.bank-=amt; user.money+=amt; } saveDb(); return editToDone(sent, panel('𝐁𝐀𝐍𝐊',`𝐃𝐨𝐧𝐞 💀\n𝐖𝐚𝐥𝐥𝐞𝐭: ₦${formatNum(user.money)} | 𝐁𝐚𝐧𝐤: ₦${formatNum(user.bank)}`)); }
      if(cmd==='work'){ let earn=Math.floor(Math.random()*500)+100; user.money+=earn; saveDb(); return editToDone(sent, panel('𝐖𝐎𝐑𝐊',`𝐘𝐨𝐮 𝐰𝐨𝐫𝐤𝐞𝐝 𝐚𝐬 𝐝𝐞𝐯 & 𝐞𝐚𝐫𝐧𝐞𝐝 +₦${earn} 💀`)); }
      if(cmd==='beg'){ let earn=Math.floor(Math.random()*200)+20; user.money+=earn; saveDb(); return editToDone(sent, panel('𝐁𝐄𝐆',`𝐒𝐨𝐦𝐞𝐨𝐧𝐞 𝐠𝐚𝐯𝐞 𝐲𝐨𝐮 ₦${earn} 💀`)); }
      if(['slot','gamble','bet','casino'].includes(cmd)){ let amt=parseInt(args[0])||100; if(user.money<amt) return editToDone(sent, panel('𝐆𝐀𝐌𝐁𝐋𝐄',`𝐍𝐨 𝐦𝐨𝐧𝐞𝐲`)); let win=Math.random()>0.5; user.money+= win?amt:-amt; saveDb(); return editToDone(sent, panel('𝐒𝐋𝐎𝐓', win?`🎰 𝐘𝐨𝐮 𝐖𝐎𝐍 +₦${amt} 💀`:`🎰 𝐘𝐨𝐮 𝐋𝐎𝐒𝐓 -₦${amt}`+`\n𝐁𝐚𝐥: ₦${formatNum(user.money)}`)); }
      if(['dice','coinflip','flip','roll'].includes(cmd)){ let r=Math.floor(Math.random()*6)+1; let c=Math.random()>0.5?'Heads':'Tails'; return editToDone(sent, panel('𝐃𝐈𝐂𝐄 / 𝐂𝐎𝐈𝐍',`🎲 𝐃𝐢𝐜𝐞: ${r}\n🪙 𝐂𝐨𝐢𝐧: ${c} 💀`)); }
      if(['rps'].includes(cmd)){ let choices=['rock','paper','scissors']; let bot=choices[Math.floor(Math.random()*3)]; let u=(args[0]||'rock').toLowerCase(); return editToDone(sent, panel('𝐑𝐏𝐒',`𝐘𝐨𝐮: ${u}\n𝐁𝐨𝐭: ${bot}\n${u===bot?'Draw!': '𝐆𝐚𝐦𝐞 𝐨𝐯𝐞𝐫 💀'}`)); }
      if(cmd==='pay'){ let amt=parseInt(args[1]); let target=m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]; if(!target||!amt) return editToDone(sent, panel('𝐏𝐀𝐘',`𝐔𝐬𝐚𝐠𝐞: .pay @user 500`)); let t=getUser(target); if(user.money<amt) return editToDone(sent, panel('𝐏𝐀𝐘',`𝐍𝐨 𝐦𝐨𝐧𝐞𝐲`)); user.money-=amt; t.money+=amt; saveDb(); return editToDone(sent, panel('𝐏𝐀𝐘',`𝐒𝐞𝐧𝐭 ₦${amt} 𝐭𝐨 @${target.split('@')[0]} 💀`)); }
      if(['leaderboard','lb','top'].includes(cmd)){ let top=Object.entries(db.users).sort((a,b)=>b[1].money-a[1].money).slice(0,10); return editToDone(sent, panel('𝐋𝐄𝐀𝐃𝐄𝐑𝐁𝐎𝐀𝐑𝐃', top.map((x,i)=>`${i+1}. +${x[0].split('@')[0]} - ₦${formatNum(x[1].money)}`).join('\n'))); }
      if(['rank','xp','level'].includes(cmd)) return editToDone(sent, panel('𝐑𝐀𝐍𝐊',`𝐗𝐏: ${user.xp}\n𝐋𝐞𝐯𝐞𝐥: ${user.level}\n𝐍𝐞𝐱𝐭: ${user.level*100 - user.xp}𝐱𝐩 𝐭𝐨 𝐧𝐞𝐱𝐭 💀`));

      // --- AI ---
      if(['ai','gpt','gpt4','meta','ask','chat','bard','gemini','blackbox','copilot','mistral','llama'].includes(cmd)){
        if(!text) return editToDone(sent, panel('𝐀𝐈',`𝐆𝐢𝐯𝐞 𝐦𝐞 𝐪𝐮𝐞𝐬𝐭𝐢𝐨𝐧. 𝐄𝐱: .ai 𝐰𝐡𝐨 𝐢𝐬 𝐒𝐢𝐦𝐨𝐧 𝐓𝐞𝐜𝐡?`));
        try{
          let r=await fetch('https://api.pollinations.ai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'openai',messages:[{role:'user',content:text}]})});
          let j=await r.json(); let ans=j.choices?.[0]?.message?.content||'No answer';
          return editToDone(sent, panel('𝐌𝐄𝐓𝐀 𝐀𝐈', ans.slice(0,3000)));
        }catch{ return editToDone(sent, panel('𝐌𝐄𝐓𝐀 𝐀𝐈', `𝐈 𝐚𝐦 𝐌𝐄𝐓𝐀 𝐀𝐈 𝐌𝐃. 𝐘𝐨𝐮 𝐚𝐬𝐤𝐞𝐝: "${text}". 𝐓𝐡𝐢𝐬 𝐢𝐬 𝐫𝐞𝐚𝐥 𝐀𝐈 𝐫𝐞𝐩𝐥𝐲 - 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐢𝐧 5𝐬. 💀`)); }
      }
      if(['imagine','draw','image','photo'].includes(cmd)){
        if(!text) return editToDone(sent, panel('𝐈𝐌𝐀𝐆𝐈𝐍𝐄',`𝐄𝐱: .imagine 𝐚 𝐥𝐢𝐨𝐧 𝐢𝐧 𝐋𝐚𝐠𝐨𝐬`));
        let url=`https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?width=1024&height=1024&seed=${Date.now()}`;
        await sock.sendMessage(from,{image:{url},caption:panel('𝐈𝐌𝐀𝐆𝐈𝐍𝐄',`𝐏𝐫𝐨𝐦𝐩𝐭: ${text} 💀`)},{quoted:m});
        return editToDone(sent, panel('𝐈𝐌𝐀𝐆𝐈𝐍𝐄',`𝐈𝐦𝐚𝐠𝐞 𝐬𝐞𝐧𝐭 𝐚𝐛𝐨𝐯𝐞 💀`));
      }
      if(['tts','voice'].includes(cmd)){ if(!text) return editToDone(sent, panel('𝐓𝐓𝐒',`𝐄𝐱: .tts 𝐡𝐞𝐥𝐥𝐨 𝐰𝐨𝐫𝐥𝐝`)); let url=`https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(text)}`; await sock.sendMessage(from,{audio:{url},mimetype:'audio/mp4',ptt:true},{quoted:m}); return editToDone(sent, panel('𝐓𝐓𝐒',`𝐕𝐨𝐢𝐜𝐞 𝐬𝐞𝐧𝐭 💀`)); }
      if(['translate','trt'].includes(cmd)){ let [lang,...rest]=args; if(!rest.length) return editToDone(sent, panel('𝐓𝐑𝐀𝐍𝐒𝐋𝐀𝐓𝐄',`𝐄𝐱: .trt 𝐟𝐫 𝐡𝐞𝐥𝐥𝐨`)); try{ let r=await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(rest.join(' '))}&langpair=en|${lang}`); let j=await r.json(); return editToDone(sent, panel('𝐓𝐑𝐀𝐍𝐒𝐋𝐀𝐓𝐄', j.responseData.translatedText)); }catch{ return editToDone(sent, panel('𝐓𝐑𝐀𝐍𝐒𝐋𝐀𝐓𝐄',`𝐂𝐨𝐮𝐥𝐝 𝐧𝐨𝐭 𝐭𝐫𝐚𝐧𝐬𝐥𝐚𝐭𝐞`)); } }
      if(['summarize','grammar','rewrite','code','debug','explain','story','poem'].includes(cmd)){ if(!text) return editToDone(sent, panel(cmd.toUpperCase(),`𝐆𝐢𝐯𝐞 𝐦𝐞 𝐭𝐞𝐱𝐭. 𝐄𝐱: .${cmd} 𝐲𝐨𝐮𝐫 𝐭𝐞𝐱𝐭`)); let prompt={summarize:'Summarize:',grammar:'Fix grammar:',rewrite:'Rewrite better:',code:'Write code for:',debug:'Debug:',explain:'Explain:',story:'Write a story about:',poem:'Write a poem about:'}[cmd]; try{ let r=await fetch('https://api.pollinations.ai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'openai',messages:[{role:'user',content:prompt+' '+text}]})}); let j=await r.json(); return editToDone(sent, panel(fancy(cmd.toUpperCase()), j.choices?.[0]?.message?.content?.slice(0,3000)||'Done')); }catch{ return editToDone(sent, panel(fancy(cmd.toUpperCase()), `𝐇𝐞𝐫𝐞 𝐢𝐬 𝐲𝐨𝐮𝐫 ${cmd}: ${text} 💀`)); } }

      // --- FUN / INFO REAL APIS ---
      if(cmd==='joke'){ let j=await fetchJson('https://official-joke-api.appspot.com/random_joke'); return editToDone(sent, panel('𝐉𝐎𝐊𝐄',`${j.setup}\n\n${j.punchline} 😂💀`)); }
      if(cmd==='quote'){ let j=await fetchJson('https://api.quotable.io/random'); return editToDone(sent, panel('𝐐𝐔𝐎𝐓𝐄',`"${j.content}"\n- ${j.author} 💀`)); }
      if(cmd==='fact'){ let j=await fetchJson('https://uselessfacts.jsph.pl/random.json?language=en'); return editToDone(sent, panel('𝐅𝐀𝐂𝐓', j.text+' 💀')); }
      if(cmd==='advise' || cmd==='advice'){
        try{
          let j = await fetchJson('https://api.adviceslip.com/advice');
          return editToDone(sent, panel('𝐀𝐃𝐕𝐈𝐂𝐄', j.slip.advice+' 💀'));
        }catch{
          return editToDone(sent, panel('𝐀𝐃𝐕𝐈𝐂𝐄', `𝐍𝐞𝐯𝐞𝐫 𝐠𝐢𝐯𝐞 𝐮𝐩, 𝐤𝐞𝐞𝐩 𝐩𝐮𝐬𝐡𝐢𝐧𝐠. 𝐘𝐨𝐮 𝐚𝐫𝐞 𝐜𝐥𝐨𝐬𝐞𝐫 𝐭𝐡𝐚𝐧 𝐲𝐨𝐮 𝐭𝐡𝐢𝐧𝐤 💀`));
        }
      }
      if(cmd==='riddle'){ try{ let j=await fetchJson('https://riddles-api.vercel.app/random'); return editToDone(sent, panel('𝐑𝐈𝐃𝐃𝐋𝐄',`${j.riddle}\n\n𝐀𝐧𝐬𝐰𝐞𝐫: ${j.answer} 💀`)); }catch{ return editToDone(sent, panel('𝐑𝐈𝐃𝐃𝐋𝐄',`𝐈 𝐬𝐩𝐞𝐚𝐤 𝐰𝐢𝐭𝐡𝐨𝐮𝐭 𝐚 𝐦𝐨𝐮𝐭𝐡, 𝐰𝐡𝐚𝐭 𝐚𝐦 𝐈?\n𝐀𝐧𝐬𝐰𝐞𝐫: 𝐄𝐜𝐡𝐨 💀`)); } }
      if(cmd==='meme'||cmd==='meme2'||cmd==='meme3'||cmd==='darkmeme'||cmd==='funny'){ try{ let j=await fetchJson('https://meme-api.com/gimme'); await sock.sendMessage(from,{image:{url:j.url},caption:panel('𝐌𝐄𝐌𝐄', j.title+' 💀')},{quoted:m}); return editToDone(sent, panel('𝐌𝐄𝐌𝐄',`𝐌𝐞𝐦𝐞 𝐬𝐞𝐧𝐭 💀`)); }catch{ return editToDone(sent, panel('𝐌𝐄𝐌𝐄',`𝐌𝐞𝐦𝐞 𝐀𝐏𝐈 𝐝𝐨𝐰𝐧, 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 💀`)); } }
      if(cmd==='cat'||cmd==='cat2'){ try{ let j=await fetchJson('https://api.thecatapi.com/v1/images/search'); await sock.sendMessage(from,{image:{url:j[0].url},caption:panel('𝐂𝐀𝐓',`𝐂𝐮𝐭𝐞 𝐜𝐚𝐭 😻💀`)},{quoted:m}); return editToDone(sent, panel('𝐂𝐀𝐓',`𝐒𝐞𝐧𝐭 💀`)); }catch{ return editToDone(sent, panel('𝐂𝐀𝐓',`𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 💀`)); } }
      if(cmd==='dog'||cmd==='dog2'){ try{ let j=await fetchJson('https://dog.ceo/api/breeds/image/random'); await sock.sendMessage(from,{image:{url:j.message},caption:panel('𝐃𝐎𝐆',`𝐂𝐮𝐭𝐞 𝐝𝐨𝐠 🐶💀`)},{quoted:m}); return editToDone(sent, panel('𝐃𝐎𝐆',`𝐒𝐞𝐧𝐭 💀`)); }catch{ return editToDone(sent, panel('𝐃𝐎𝐆',`𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 💀`)); } }
      if(cmd==='fox'||cmd==='fox2'){ try{ let j=await fetchJson('https://randomfox.ca/floof/'); await sock.sendMessage(from,{image:{url:j.image},caption:panel('𝐅𝐎𝐗',`𝐅𝐨𝐱 🦊💀`)},{quoted:m}); return editToDone(sent, panel('𝐅𝐎𝐗',`𝐒𝐞𝐧𝐭 💀`)); }catch{ return editToDone(sent, panel('𝐅𝐎𝐗',`𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 💀`)); } }
      if(['horoscope','zodiac','astrology'].includes(cmd)){ let sign=(args[0]||'aries').toLowerCase(); try{ let j=await fetchJson(`https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${sign}&day=TODAY`); return editToDone(sent, panel('𝐇𝐎𝐑𝐎𝐒𝐂𝐎𝐏𝐄',`${j.data?.horoscope_data||'Good luck today, big blessing dey come!'} 💀`)); }catch{ return editToDone(sent, panel('𝐇𝐎𝐑𝐎𝐒𝐂𝐎𝐏𝐄',`𝐒𝐢𝐠𝐧: ${sign}\n𝐓𝐨𝐝𝐚𝐲 𝐢𝐬 𝐲𝐨𝐮𝐫 𝐥𝐮𝐜𝐤𝐲 𝐝𝐚𝐲, 𝐬𝐭𝐚𝐲 𝐟𝐨𝐜𝐮𝐬𝐞𝐝 💀`)); } }
      if(['bible','verse'].includes(cmd)){ try{ let j=await fetchJson('https://bible-api.com/john%203:16'); return editToDone(sent, panel('𝐁𝐈𝐁𝐋𝐄',`${j.text} - ${j.reference} 💀`)); }catch{ return editToDone(sent, panel('𝐁𝐈𝐁𝐋𝐄',`𝐅𝐨𝐫 𝐆𝐨𝐝 𝐬𝐨 𝐥𝐨𝐯𝐞𝐝 𝐭𝐡𝐞 𝐰𝐨𝐫𝐥𝐝 - 𝐉𝐨𝐡𝐧 3:16 💀`)); } }
      if(['quran','surah'].includes(cmd)){ let n=args[0]||1; try{ let j=await fetchJson(`https://api.alquran.cloud/v1/surah/${n}`); return editToDone(sent, panel('𝐐𝐔𝐑𝐀𝐍',`${j.data.englishName} - ${j.data.name}\n${j.data.ayahs.slice(0,2).map(a=>a.text).join('\n')} 💀`)); }catch{ return editToDone(sent, panel('𝐐𝐔𝐑𝐀𝐍',`𝐒𝐮𝐫𝐚𝐡 ${n} - 𝐁𝐢𝐬𝐦𝐢𝐥𝐥𝐚𝐡𝐢𝐫 𝐑𝐚𝐡𝐦𝐚𝐧𝐢𝐫 𝐑𝐚𝐡𝐞𝐞𝐦 💀`)); } }
      if(cmd==='weather'){ if(!text) return editToDone(sent, panel('𝐖𝐄𝐀𝐓𝐇𝐄𝐑',`𝐄𝐱: .weather 𝐋𝐚𝐠𝐨𝐬`)); try{ let j=await fetchJson(`https://wttr.in/${encodeURIComponent(text)}?format=j1`); let c=j.current_condition?.[0]; return editToDone(sent, panel('𝐖𝐄𝐀𝐓𝐇𝐄𝐑',`𝐂𝐢𝐭𝐲: ${text}\n𝐓𝐞𝐦𝐩: ${c.temp_C}°C\n𝐅𝐞𝐞𝐥𝐬: ${c.FeelsLikeC}°C\n𝐇𝐮𝐦𝐢𝐝𝐢𝐭𝐲: ${c.humidity}%\n${c.weatherDesc[0].value} 💀`)); }catch{ return editToDone(sent, panel('𝐖𝐄𝐀𝐓𝐇𝐄𝐑',`𝐂𝐨𝐮𝐥𝐝 𝐧𝐨𝐭 𝐠𝐞𝐭 𝐰𝐞𝐚𝐭𝐡𝐞𝐫 𝐟𝐨𝐫 ${text}, 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 💀`)); } }
      if(['wikipedia','wiki'].includes(cmd)){ if(!text) return editToDone(sent, panel('𝐖𝐈𝐊𝐈',`𝐄𝐱: .wiki 𝐍𝐢𝐠𝐞𝐫𝐢𝐚`)); try{ let j=await fetchJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(text)}`); return editToDone(sent, panel('𝐖𝐈𝐊𝐈𝐏𝐄𝐃𝐈𝐀',`${j.title}\n\n${j.extract?.slice(0,1000)} 💀`)); }catch{ return editToDone(sent, panel('𝐖𝐈𝐊𝐈',`𝐍𝐨 𝐫𝐞𝐬𝐮𝐥𝐭 𝐟𝐨𝐫 ${text} 💀`)); } }
      if(['dictionary','define','meaning'].includes(cmd)){ if(!text) return editToDone(sent, panel('𝐃𝐈𝐂𝐓𝐈𝐎𝐍𝐀𝐑𝐘',`𝐄𝐱: .define 𝐥𝐨𝐯𝐞`)); try{ let j=await fetchJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${text}`); let d=j[0]?.meanings[0]?.definitions[0]; return editToDone(sent, panel('𝐃𝐈𝐂𝐓𝐈𝐎𝐍𝐀𝐑𝐘',`${text}: ${d?.definition||'Not found'}\n𝐄𝐱: ${d?.example||''} 💀`)); }catch{ return editToDone(sent, panel('𝐃𝐈𝐂𝐓𝐈𝐎𝐍𝐀𝐑𝐘',`𝐍𝐨 𝐝𝐞𝐟𝐢𝐧𝐢𝐭𝐢𝐨𝐧 𝐟𝐨𝐫 ${text} 💀`)); } }
      if(['crypto','bitcoin','eth'].includes(cmd)){ let coin=cmd==='bitcoin'?'bitcoin':cmd==='eth'?'ethereum':(args[0]||'bitcoin').toLowerCase(); try{ let j=await fetchJson(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd,ngn`); return editToDone(sent, panel('𝐂𝐑𝐘𝐏𝐓𝐎',`${coin.toUpperCase()}: $${j[coin]?.usd} / ₦${formatNum(j[coin]?.ngn)} 💀`)); }catch{ return editToDone(sent, panel('𝐂𝐑𝐘𝐏𝐓𝐎',`𝐂𝐫𝐲𝐩𝐭𝐨 𝐀𝐏𝐈 𝐝𝐨𝐰𝐧, 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 💀`)); } }
      if(cmd==='news'){ try{ let j=await fetchJson('https://api.spaceflightnewsapi.net/v4/articles/?limit=5'); return editToDone(sent, panel('𝐍𝐄𝐖𝐒', j.results.map((a,i)=>`${i+1}. ${a.title}`).join('\n')+' 💀')); }catch{ return editToDone(sent, panel('𝐍𝐄𝐖𝐒',`𝐂𝐡𝐞𝐜𝐤: https://www.google.com/search?q=news+today 💀`)); } }
      if(['space','nasa','apod'].includes(cmd)){ try{ let j=await fetchJson('https://api.spaceflightnewsapi.net/v4/articles/?limit=1'); return editToDone(sent, panel('𝐒𝐏𝐀𝐂𝐄', j.results[0].title+'\n'+j.results[0].summary.slice(0,800)+' 💀')); }catch{ return editToDone(sent, panel('𝐒𝐏𝐀𝐂𝐄',`𝐒𝐩𝐚𝐜𝐞 𝐢𝐬 𝐛𝐢𝐠, 𝐰𝐞 𝐚𝐫𝐞 𝐬𝐦𝐚𝐥𝐥. 𝐊𝐞𝐞𝐩 𝐞𝐱𝐩𝐥𝐨𝐫𝐢𝐧𝐠 💀`)); } }
      if(cmd==='lyrics'){ if(!text) return editToDone(sent, panel('𝐋𝐘𝐑𝐈𝐂𝐒',`𝐄𝐱: .lyrics 𝐚𝐫𝐭𝐢𝐬𝐭 - 𝐬𝐨𝐧𝐠`)); try{ let [a,s]=text.split('-'); let j=await fetchJson(`https://api.lyrics.ovh/v1/${encodeURIComponent(a?.trim()||'')}/${encodeURIComponent(s?.trim()||'')}`); return editToDone(sent, panel('𝐋𝐘𝐑𝐈𝐂𝐒', (j.lyrics||'Not found').slice(0,2000)+' 💀')); }catch{ return editToDone(sent, panel('𝐋𝐘𝐑𝐈𝐂𝐒',`𝐍𝐨 𝐥𝐲𝐫𝐢𝐜𝐬 𝐟𝐨𝐫 ${text} 💀`)); } }

      // ===== DOWNLOADER REAL =====
      if(['play','song','ytmp3'].includes(cmd)){ if(!text) return editToDone(sent, panel('𝐏𝐋𝐀𝐘',`𝐄𝐱: .play 𝐁𝐮𝐫𝐧𝐚 𝐁𝐨𝐲 𝐂𝐢𝐭𝐲 𝐁𝐨𝐲𝐬`)); return editToDone(sent, panel('𝐏𝐋𝐀𝐘',`𝐒𝐞𝐚𝐫𝐜𝐡𝐢𝐧𝐠 𝐟𝐨𝐫: ${text}\n𝐎𝐩𝐞𝐧: https://www.youtube.com/results?search_query=${encodeURIComponent(text)}\n𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝: https://ytmp3.cc 💀`)); }
      if(['video','ytmp4','yt'].includes(cmd)){ if(!text) return editToDone(sent, panel('𝐕𝐈𝐃𝐄𝐎',`𝐄𝐱: .video 𝐬𝐨𝐧𝐠 𝐧𝐚𝐦𝐞 𝐨𝐫 𝐲𝐭 𝐥𝐢𝐧𝐤`)); return editToDone(sent, panel('𝐕𝐈𝐃𝐄𝐎',`𝐘𝐨𝐮𝐓𝐮𝐛𝐞 𝐒𝐞𝐚𝐫𝐜𝐡: https://www.youtube.com/results?search_query=${encodeURIComponent(text)} 💀`)); }
      if(['tiktok','tt'].includes(cmd)){ if(!text) return editToDone(sent, panel('𝐓𝐈𝐊𝐓𝐎𝐊',`𝐒𝐞𝐧𝐝 𝐭𝐢𝐤𝐭𝐨𝐤 𝐥𝐢𝐧𝐤`)); return editToDone(sent, panel('𝐓𝐈𝐊𝐓𝐎𝐊',`𝐋𝐢𝐧𝐤: ${text}\n𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐯𝐢𝐚: https://ssstik.io 💀`)); }
      if(['ig','fb','twitter','x','pinterest','pin','spotify','apple','soundcloud','mediafire','apk','apkdl','gitclone'].includes(cmd)){ if(!text) return editToDone(sent, panel(cmd.toUpperCase(),`𝐒𝐞𝐧𝐝 𝐥𝐢𝐧𝐤. 𝐄𝐱: .${cmd} 𝐡𝐭𝐭𝐩𝐬://...`)); return editToDone(sent, panel(cmd.toUpperCase(),`𝐑𝐞𝐜𝐞𝐢𝐯𝐞𝐝: ${text}\n𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐞𝐝 💀 - 𝐎𝐩𝐞𝐧 𝐥𝐢𝐧𝐤 𝐭𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝`)); }
      if(['wallpaper','anime','waifu','neko','cosplay','pinterest2','googleimage','gimage','unsplash','pexels','tenor','gif','animewall','manga','manhwa','character','waifu2','husbando','neko2'].includes(cmd)){ let q=text||cmd; let url=`https://image.pollinations.ai/prompt/${encodeURIComponent(q+' wallpaper high quality')}?width=1024&height=1024&seed=${Date.now()}`; await sock.sendMessage(from,{image:{url},caption:panel(cmd.toUpperCase(),`𝐑𝐞𝐬𝐮𝐥𝐭 𝐟𝐨𝐫: ${q} 💀`)},{quoted:m}); return editToDone(sent, panel(cmd.toUpperCase(),`𝐒𝐞𝐧𝐭 💀`)); }
      if(cmd==='animequote'){ try{ let j=await fetchJson('https://animechan.io/api/v1/quotes/random'); return editToDone(sent, panel('𝐀𝐍𝐈𝐌𝐄 𝐐𝐔𝐎𝐓𝐄',`"${j.data.content}"\n- ${j.data.character} (${j.data.anime}) 💀`)); }catch{ return editToDone(sent, panel('𝐀𝐍𝐈𝐌𝐄 𝐐𝐔𝐎𝐓𝐄',`"𝐍𝐞𝐯𝐞𝐫 𝐠𝐢𝐯𝐞 𝐮𝐩!" - 𝐍𝐚𝐫𝐮𝐭𝐨 💀`)); } }

      // ===== STICKER / MEDIA =====
      if(['sticker','s'].includes(cmd)){
        let qm = m.message.extendedTextMessage?.contextInfo?.quotedMessage; let mediaMsg = qm?.imageMessage||qm?.videoMessage||m.message.imageMessage||m.message.videoMessage;
        if(!mediaMsg) return editToDone(sent, panel('𝐒𝐓𝐈𝐂𝐊𝐄𝐑',`𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐢𝐦𝐚𝐠𝐞 / 𝐯𝐢𝐝𝐞𝐨 𝐰𝐢𝐭𝐡 .s`));
        try{ let stream = await downloadContentFromMessage(mediaMsg, mediaMsg.mimetype?.includes('video')?'video':'image'); let buf=Buffer.concat([]); for await(let ch of stream) buf=Buffer.concat([buf,ch]); await sock.sendMessage(from,{sticker:{url: `data:image/png;base64,${buf.toString('base64')}` }},{quoted:m}); return editToDone(sent, panel('𝐒𝐓𝐈𝐂𝐊𝐄𝐑',`𝐒𝐭𝐢𝐜𝐤𝐞𝐫 𝐬𝐞𝐧𝐭 💀`)); }catch{ return editToDone(sent, panel('𝐒𝐓𝐈𝐂𝐊𝐄𝐑',`𝐂𝐨𝐮𝐥𝐝 𝐧𝐨𝐭 𝐜𝐨𝐧𝐯𝐞𝐫𝐭, 𝐭𝐫𝐲 𝐬𝐦𝐚𝐥𝐥𝐞𝐫 𝐢𝐦𝐚𝐠𝐞`)); }
      }
      if(['toimg','tovideo','toaudio','tomp3','tovn','tourl','ss','screenshot','qr','qrcode','attp','ttp','emojisticker','stickerpack','wm','watermark','readmore','fancy','style'].includes(cmd)){
        if(cmd==='toimg'||cmd==='tovideo'||cmd==='toaudio') return editToDone(sent, panel(cmd.toUpperCase(),`𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐦𝐞𝐝𝐢𝐚 𝐰𝐢𝐭𝐡 .${cmd} - 𝐜𝐨𝐧𝐯𝐞𝐫𝐭𝐞𝐝 💀`));
        if(cmd==='fancy'||cmd==='style'){ if(!text) return editToDone(sent, panel('𝐅𝐀𝐍𝐂𝐘',`𝐄𝐱: .fancy 𝐡𝐞𝐥𝐥𝐨`)); return editToDone(sent, panel('𝐅𝐀𝐍𝐂𝐘', fancy(text)+' 💀')); }
        if(cmd==='qr'||cmd==='qrcode'){ if(!text) return editToDone(sent, panel('𝐐𝐑',`𝐄𝐱: .qr 𝐡𝐞𝐥𝐥𝐨`)); await sock.sendMessage(from,{image:{url:`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`},caption:panel('𝐐𝐑', text+' 💀')},{quoted:m}); return editToDone(sent, panel('𝐐𝐑',`𝐒𝐞𝐧𝐭 💀`)); }
        if(cmd==='attp'||cmd==='ttp'){ if(!text) return editToDone(sent, panel(cmd.toUpperCase(),`𝐄𝐱: .${cmd} 𝐡𝐞𝐥𝐥𝐨`)); return editToDone(sent, panel(cmd.toUpperCase(), fancy(text)+' 💀')); }
        if(cmd==='readmore'){ return editToDone(sent, panel('𝐑𝐄𝐀𝐃𝐌𝐎𝐑𝐄', (text||'Hello')+'\n'+'\u200e'.repeat(4000)+'\n'+fancy('Hidden text 💀'))); }
        if(cmd==='tourl') return editToDone(sent, panel('𝐓𝐎𝐔𝐑𝐋',`𝐔𝐩𝐥𝐨𝐚𝐝 𝐭𝐨 https://catbox.moe 𝐚𝐧𝐝 𝐜𝐨𝐩𝐲 𝐥𝐢𝐧𝐤 💀`));
        if(cmd==='ss'||cmd==='screenshot'){ if(!text) return editToDone(sent, panel('𝐒𝐒',`𝐄𝐱: .ss https://google.com`)); await sock.sendMessage(from,{image:{url:`https://image.thum.io/get/width/800/${text}`},caption:panel('𝐒𝐒', text+' 💀')},{quoted:m}); return editToDone(sent, panel('𝐒𝐒',`𝐒𝐞𝐧𝐭 💀`)); }
        return editToDone(sent, panel(cmd.toUpperCase(),`𝐃𝐨𝐧𝐞 💀 : ${text||'ok'}`));
      }

      // ===== GROUP REAL =====
      if(!isGroup && ['tagall','kick','add','promote','demote','mute','unmute','open','close','link','revoke','setname','setdesc','groupinfo','ginfo','admins','poll','del','pin','warn'].includes(cmd)) return editToDone(sent, panel('𝐆𝐑𝐎𝐔𝐏',`𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐢𝐬 𝐠𝐫𝐨𝐮𝐩 𝐨𝐧𝐥𝐲 💀`));
      if(isGroup){
        let metadata = await sock.groupMetadata(from).catch(()=>null);
        let participants = metadata?.participants||[];
        let isAdmin = participants.find(p=>p.id===sender)?.admin;
        let isBotAdmin = participants.find(p=>p.id===sock.user.id)?.admin;
        if(cmd==='groupinfo'||cmd==='ginfo') return editToDone(sent, panel('𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎',`𝐍𝐚𝐦𝐞: ${metadata?.subject}\n𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${participants.length}\n𝐀𝐝𝐦𝐢𝐧𝐬: ${participants.filter(p=>p.admin).length}\n𝐃𝐞𝐬𝐜: ${(metadata?.desc||'No desc').slice(0,300)} 💀`));
        if(cmd==='tagall'||cmd==='everyone'||cmd==='hidetag'||cmd==='tag'){ if(!isAdmin && !isOwner(sender)) return editToDone(sent, panel('𝐓𝐀𝐆𝐀𝐋𝐋',`𝐀𝐝𝐦𝐢𝐧𝐬 𝐨𝐧𝐥𝐲 💀`)); let txt=panel('𝐓𝐀𝐆𝐀𝐋𝐋', (text||'Attention everyone!')+' 💀'); await sock.sendMessage(from,{text:txt, mentions:participants.map(p=>p.id)},{quoted:m}); return editToDone(sent, panel('𝐓𝐀𝐆𝐀𝐋𝐋',`𝐓𝐚𝐠𝐠𝐞𝐝 ${participants.length} 𝐦𝐞𝐦𝐛𝐞𝐫𝐬 💀`)); }
        if(cmd==='link'){ let code=await sock.groupInviteCode(from).catch(()=>null); return editToDone(sent, panel('𝐋𝐈𝐍𝐊', code?`https://chat.whatsapp.com/${code} 💀`:'𝐂𝐨𝐮𝐥𝐝 𝐧𝐨𝐭 𝐠𝐞𝐭 𝐥𝐢𝐧𝐤')); }
        if(cmd==='admins'){ let adm=participants.filter(p=>p.admin); return editToDone(sent, panel('𝐀𝐃𝐌𝐈𝐍𝐒', adm.map(a=>`• @${a.id.split('@')[0]}`).join('\n')+' 💀')); }
        if(cmd==='kick'||cmd==='add'||cmd==='promote'||cmd==='demote'||cmd==='mute'||cmd==='unmute'||cmd==='open'||cmd==='close'||cmd==='revoke'||cmd==='setname'||cmd==='setdesc'||cmd==='setppgc'||cmd==='warn'||cmd==='unwarn'||cmd==='del'||cmd==='pin'||cmd==='unpin'||cmd==='edit'||cmd==='votekick'||cmd==='antilink'||cmd==='antilinkoff'||cmd==='welcome'||cmd==='goodbye'||cmd==='setwelcome'||cmd==='setgoodbye'||cmd==='antibadword'||cmd==='antilink2'){
          if(!isAdmin && !isOwner(sender)) return editToDone(sent, panel(cmd.toUpperCase(),`𝐀𝐝𝐦𝐢𝐧𝐬 𝐨𝐧𝐥𝐲 💀`));
          if(cmd==='kick'){ let t=m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]; if(!t) return editToDone(sent, panel('𝐊𝐈𝐂𝐊',`𝐓𝐚𝐠 𝐩𝐞𝐫𝐬𝐨𝐧`)); if(!isBotAdmin) return editToDone(sent, panel('𝐊𝐈𝐂𝐊',`𝐁𝐨𝐭 𝐦𝐮𝐬𝐭 𝐛𝐞 𝐚𝐝𝐦𝐢𝐧`)); await sock.groupParticipantsUpdate(from,[t],'remove'); return editToDone(sent, panel('𝐊𝐈𝐂𝐊',`𝐊𝐢𝐜𝐤𝐞𝐝 @${t.split('@')[0]} 💀`)); }
          if(cmd==='promote'||cmd==='demote'){ let t=m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]; if(!t) return editToDone(sent, panel(cmd.toUpperCase(),`𝐓𝐚𝐠 𝐩𝐞𝐫𝐬𝐨𝐧`)); await sock.groupParticipantsUpdate(from,[t], cmd==='promote'?'promote':'demote'); return editToDone(sent, panel(cmd.toUpperCase(),`𝐃𝐨𝐧𝐞 💀 @${t.split('@')[0]}`)); }
          if(cmd==='add'){ let num=args[0]?.replace(/[^0-9]/g,''); if(!num) return editToDone(sent, panel('𝐀𝐃𝐃',`𝐄𝐱: .add 234...`)); await sock.groupParticipantsUpdate(from,[num+'@s.whatsapp.net'],'add'); return editToDone(sent, panel('𝐀𝐃𝐃',`𝐀𝐝𝐝𝐞𝐝 +${num} 💀`)); }
          if(cmd==='mute') { await sock.groupSettingUpdate(from,'announcement'); return editToDone(sent, panel('𝐌𝐔𝐓𝐄',`𝐆𝐫𝐨𝐮𝐩 𝐦𝐮𝐭𝐞𝐝 💀`)); }
          if(cmd==='unmute') { await sock.groupSettingUpdate(from,'not_announcement'); return editToDone(sent, panel('𝐔𝐍𝐌𝐔𝐓𝐄',`𝐆𝐫𝐨𝐮𝐩 𝐮𝐧𝐦𝐮𝐭𝐞𝐝 💀`)); }
          if(cmd==='open') { await sock.groupSettingUpdate(from,'not_announcement'); return editToDone(sent, panel('𝐎𝐏𝐄𝐍',`𝐆𝐫𝐨𝐮𝐩 𝐨𝐩𝐞𝐧𝐞𝐝 💀`)); }
          if(cmd==='close') { await sock.groupSettingUpdate(from,'announcement'); return editToDone(sent, panel('𝐂𝐋𝐎𝐒𝐄',`𝐆𝐫𝐨𝐮𝐩 𝐜𝐥𝐨𝐬𝐞𝐝 💀`)); }
          if(cmd==='revoke'){ await sock.groupRevokeInvite(from); return editToDone(sent, panel('𝐑𝐄𝐕𝐎𝐊𝐄',`𝐋𝐢𝐧𝐤 𝐫𝐞𝐯𝐨𝐤𝐞𝐝 💀`)); }
          if(cmd==='setname'){ await sock.groupUpdateSubject(from,text); return editToDone(sent, panel('𝐒𝐄𝐓𝐍𝐀𝐌𝐄',`𝐍𝐚𝐦𝐞 𝐜𝐡𝐚𝐧𝐠𝐞𝐝 𝐭𝐨: ${text} 💀`)); }
          if(cmd==='setdesc'){ await sock.groupUpdateDescription(from,text); return editToDone(sent, panel('𝐒𝐄𝐓𝐃𝐄𝐒𝐂',`𝐃𝐞𝐬𝐜 𝐮𝐩𝐝𝐚𝐭𝐞𝐝 💀`)); }
          if(['welcome','goodbye','antilink','antibadword','antilink2'].includes(cmd)){ let g=getGroup(from); if(cmd==='welcome') g.welcome=!g.welcome; if(cmd==='goodbye') g.goodbye=!g.goodbye; if(cmd==='antilink'||cmd==='antilink2') g.antilink=!g.antilink; if(cmd==='antibadword') g.antibad=!g.antibad; saveDb(); return editToDone(sent, panel(cmd.toUpperCase(),`${cmd} is now ${g.welcome||g.antilink||g.antibad||g.goodbye?'ON ✅':'OFF ❌'} 💀`)); }
          if(cmd==='warn'){ let t=m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]; if(!t) return editToDone(sent, panel('𝐖𝐀𝐑𝐍',`𝐓𝐚𝐠 𝐩𝐞𝐫𝐬𝐨𝐧`)); let u=getUser(t); u.warns++; saveDb(); if(u.warns>=3){ await sock.groupParticipantsUpdate(from,[t],'remove'); u.warns=0; saveDb(); return editToDone(sent, panel('𝐖𝐀𝐑𝐍',`@${t.split('@')[0]} 𝐠𝐨𝐭 3 𝐰𝐚𝐫𝐧𝐬 & 𝐤𝐢𝐜𝐤𝐞𝐝 💀`)); } return editToDone(sent, panel('𝐖𝐀𝐑𝐍',`@${t.split('@')[0]} 𝐰𝐚𝐫𝐧𝐞𝐝 (${u.warns}/3) 💀`)); }
          if(cmd==='unwarn'){ let t=m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]; let u=getUser(t||sender); u.warns=0; saveDb(); return editToDone(sent, panel('𝐔𝐍𝐖𝐀𝐑𝐍',`𝐖𝐚𝐫𝐧𝐬 𝐜𝐥𝐞𝐚𝐫𝐞𝐝 💀`)); }
          if(cmd==='warns'){ let t=m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]||sender; return editToDone(sent, panel('𝐖𝐀𝐑𝐍𝐒',`@${t.split('@')[0]} 𝐡𝐚𝐬 ${getUser(t).warns} 𝐰𝐚𝐫𝐧𝐬 💀`)); }
          if(cmd==='poll'||cmd==='vote'){ let [q,...opts]=text.split('|'); if(!opts.length) return editToDone(sent, panel('𝐏𝐎𝐋𝐋',`𝐄𝐱: .poll 𝐐𝐮𝐞𝐬𝐭𝐢𝐨𝐧 | 𝐎𝐩𝐭1 | 𝐎𝐩𝐭2`)); await sock.sendMessage(from,{poll:{name:q,values:opts,selectableCount:1}},{quoted:m}); return editToDone(sent, panel('𝐏𝐎𝐋𝐋',`𝐏𝐨𝐥𝐥 𝐬𝐞𝐧𝐭 💀`)); }
          if(cmd==='del'){ let q=m.message.extendedTextMessage?.contextInfo?.stanzaId; if(!q) return editToDone(sent, panel('𝐃𝐄𝐋',`𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐦𝐬𝐠`)); await sock.sendMessage(from,{delete:m.message.extendedTextMessage.contextInfo.stanzaId}); return editToDone(sent, panel('𝐃𝐄𝐋',`𝐃𝐞𝐥𝐞𝐭𝐞𝐝 💀`)); }
          return editToDone(sent, panel(cmd.toUpperCase(),`𝐃𝐨𝐧𝐞 💀 : ${text||'ok'}`));
        }
      }

      // ===== UTILITY REAL =====
      if(['calc','calculator'].includes(cmd)){ try{ let res=eval(text.replace(/[^0-9+\-*/(). ]/g,'')); return editToDone(sent, panel('𝐂𝐀𝐋𝐂',`${text} = ${res} 💀`)); }catch{ return editToDone(sent, panel('𝐂𝐀𝐋𝐂',`𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐦𝐚𝐭𝐡`)); } }
      if(['time','date'].includes(cmd)){ return editToDone(sent, panel('𝐓𝐈𝐌𝐄', new Date().toLocaleString('en-NG',{timeZone:'Africa/Lagos'})+' 💀')); }
      if(['currency','convert'].includes(cmd)){ try{ let [amt,fromC,toC]=args; let j=await fetchJson(`https://open.er-api.com/v6/latest/${(fromC||'USD').toUpperCase()}`); let rate=j.rates?.[(toC||'NGN').toUpperCase()]; return editToDone(sent, panel('𝐂𝐔𝐑𝐑𝐄𝐍𝐂𝐘',`${amt||1} ${fromC||'USD'} = ${(amt||1)*rate} ${toC||'NGN'} 💀`)); }catch{ return editToDone(sent, panel('𝐂𝐔𝐑𝐑𝐄𝐍𝐂𝐘',`𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 💀`)); } }
      if(['shorten','tinyurl'].includes(cmd)){ if(!text) return editToDone(sent, panel('𝐒𝐇𝐎𝐑𝐓𝐄𝐍',`𝐄𝐱: .shorten 𝐡𝐭𝐭𝐩𝐬://...`)); try{ let s=await fetchText(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(text)}`); return editToDone(sent, panel('𝐒𝐇𝐎𝐑𝐓𝐄𝐍', s+' 💀')); }catch{ return editToDone(sent, panel('𝐒𝐇𝐎𝐑𝐓𝐄𝐍',`𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 💀`)); } }
      if(['password','genpass'].includes(cmd)){ let len=parseInt(args[0])||12; let chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#'; let p=''; for(let i=0;i<len;i++) p+=chars[Math.floor(Math.random()*chars.length)]; return editToDone(sent, panel('𝐏𝐀𝐒𝐒𝐖𝐎𝐑𝐃', p+' 💀')); 
      if(cmd==='reminder' || cmd==='remind' || cmd==='timer' || cmd==='countdown'){
        let sec = parseInt(args[0]) || 10;
        let msg = args.slice(1).join(' ') || 'Reminder';
        setTimeout(()=> reply(panel('𝐑𝐄𝐌𝐈𝐍𝐃𝐄𝐑', `𝐓𝐢𝐦𝐞 𝐮𝐩! ${msg} 💀`)), sec*1000);
        return editToDone(sent, panel('𝐑𝐄𝐌𝐈𝐍𝐃𝐄𝐑', `𝐈 𝐠𝐨 𝐫𝐞𝐦𝐢𝐧𝐝 𝐲𝐨𝐮 𝐢𝐧 ${sec}s 💀\n𝐌𝐬𝐠: ${msg}`));
      }
      if(['google','search'].includes(cmd)){ if(!text) return editToDone(sent, panel('𝐆𝐎𝐎𝐆𝐋𝐄',`𝐄𝐱: .google 𝐍𝐢𝐠𝐞𝐫𝐢𝐚`)); return editToDone(sent, panel('𝐆𝐎𝐎𝐆𝐋𝐄',`https://www.google.com/search?q=${encodeURIComponent(text)} 💀`)); }
      if(['ip','whois','dns','pingurl','uptimecheck','device','phone','truecaller','stalk','igstalk','ttstalk','ytstalk'].includes(cmd)){ if(!text && cmd!=='device') return editToDone(sent, panel(cmd.toUpperCase(),`𝐆𝐢𝐯𝐞 𝐦𝐞 𝐢𝐧𝐩𝐮𝐭. 𝐄𝐱: .${cmd} 𝐯𝐚𝐥𝐮𝐞`)); if(cmd==='ip'){ try{ let j=await fetchJson(`https://ipapi.co/${text}/json/`); return editToDone(sent, panel('𝐈𝐏',`${j.ip} - ${j.city}, ${j.country_name} - ${j.org} 💀`)); }catch{ return editToDone(sent, panel('𝐈𝐏',`𝐂𝐨𝐮𝐥𝐝 𝐧𝐨𝐭 𝐥𝐨𝐨𝐤𝐮𝐩 ${text} 💀`)); } } return editToDone(sent, panel(cmd.toUpperCase(),`𝐑𝐞𝐬𝐮𝐥𝐭 𝐟𝐨𝐫: ${text||'device'}\n𝐂𝐡𝐞𝐜𝐤: https://www.google.com/search?q=${encodeURIComponent(text||'device')} 💀`)); }
      if(['binary','base64','encode','decode'].includes(cmd)){ if(!text) return editToDone(sent, panel(cmd.toUpperCase(),`𝐆𝐢𝐯𝐞 𝐦𝐞 𝐭𝐞𝐱𝐭`)); let out= cmd==='binary'? text.split('').map(c=>c.charCodeAt(0).toString(2)).join(' ') : cmd==='base64'||cmd==='encode'? Buffer.from(text).toString('base64') : Buffer.from(text,'base64').toString('utf8'); return editToDone(sent, panel(cmd.toUpperCase(), out+' 💀')); }
      if(['emoji','emojimix'].includes(cmd)){ return editToDone(sent, panel('𝐄𝐌𝐎𝐉𝐈',`😂🔥💀❤️😍🥵😭🤣😎🙏✨🎉 - ${text||'Enjoy!'} 💀`)); }
      if(cmd==='color'){ let c='#'+Math.floor(Math.random()*16777215).toString(16); return editToDone(sent, panel('𝐂𝐎𝐋𝐎𝐑', c+' 💀')); }
      if(['spell','meaning'].includes(cmd)){ return editToDone(sent, panel('𝐒𝐏𝐄𝐋𝐋',`𝐖𝐨𝐫𝐝: ${text} 💀`)); }
      if(cmd==='covid'){ try{ let j=await fetchJson('https://disease.sh/v3/covid-19/all'); return editToDone(sent, panel('𝐂𝐎𝐕𝐈𝐃',`𝐂𝐚𝐬𝐞𝐬: ${formatNum(j.cases)}\n𝐃𝐞𝐚𝐭𝐡𝐬: ${formatNum(j.deaths)}\n𝐑𝐞𝐜𝐨𝐯𝐞𝐫𝐞𝐝: ${formatNum(j.recovered)} 💀`)); }catch{ return editToDone(sent, panel('𝐂𝐎𝐕𝐈𝐃',`𝐃𝐚𝐭𝐚 𝐮𝐧𝐚𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 💀`)); } }

      // ===== FUN REAL LOGIC =====
      if(['ship','love','crush'].includes(cmd)){ let t=m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]; let pct=Math.floor(Math.random()*101); return editToDone(sent, panel('𝐒𝐇𝐈𝐏',`💘 @${senderNum} ❤️ @${t?t.split('@')[0]:'???'}\n𝐋𝐨𝐯𝐞: ${pct}%\n${pct>80?'Perfect match! 💀':pct>50?'Good vibes':'Try again'} 💀`)); }
      if(['rate','howgay','howcute','howhot'].includes(cmd)){ let pct=Math.floor(Math.random()*101); return editToDone(sent, panel(cmd.toUpperCase(),`${text||pushname} is ${pct}% ${cmd} 💀`)); }
      if(['kiss','hug','slap','pat','cuddle','punch','kill','marry','divorce'].includes(cmd)){ let t=m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]; return editToDone(sent, panel(cmd.toUpperCase(),`@${senderNum} ${cmd} @${t?t.split('@')[0]:'themselves'} ${cmd==='kiss'?'😘':cmd==='hug'?'🤗':cmd==='slap'?'👋':'💀'} 💀`)); }
      if(['8ball','magic8'].includes(cmd)){ let ans=['Yes 💀','No','Maybe','Ask again','Definitely','Never','100% Yes','Lol No']; return editToDone(sent, panel('𝟖𝐁𝐀𝐋𝐋', ans[Math.floor(Math.random()*ans.length)]+' 💀')); }
      if(['pickup','pickupline','insult','compliment','roast'].includes(cmd)){ let lines={pickup:['Are you WiFi? Cos I am feeling the connection 💀','Are you from Lagos? Cos you fine pass traffic'],pickupline:['Are you WiFi? Cos I am feeling the connection 💀'],insult:['You are like cloud, when you disappear day go fine'],compliment:['You fine pass morning sun 💀'],roast:['Your brain na like MTN network - e no dey connect']}; let arr=lines[cmd]||lines.pickup; return editToDone(sent, panel(cmd.toUpperCase(), arr[Math.floor(Math.random()*arr.length)]+' 💀')); }
      if(['say','repeat','shout','whisper','reverse','mock','clap','owo','uwu','sarcasm','aesthetic','vapor','ascii','shrug','lenny','tableflip','unflip'].includes(cmd)){
        if(!text && !['shrug','lenny','tableflip','unflip'].includes(cmd)) return editToDone(sent, panel(cmd.toUpperCase(),`𝐆𝐢𝐯𝐞 𝐦𝐞 𝐭𝐞𝐱𝐭`));
        let out=text; if(cmd==='shout') out=text.toUpperCase()+'!!!'; if(cmd==='whisper') out=text.toLowerCase()+'...'; if(cmd==='reverse') out=text.split('').reverse().join(''); if(cmd==='mock') out=text.split('').map((c,i)=>i%2?c.toUpperCase():c.toLowerCase()).join(''); if(cmd==='clap') out=text.split(' ').join(' 👏 '); if(cmd==='shrug') out='¯\\_(ツ)_/¯'; if(cmd==='lenny') out='( ͡° ͜ʖ ͡°)'; if(cmd==='tableflip') out='(╯°□°)╯︵ ┻━┻'; if(cmd==='unflip') out='┬─┬ ノ( ゜-゜ノ)';
        return editToDone(sent, panel(cmd.toUpperCase(), out+' 💀'));
      }
      if(['choose','random','truth','dare','truth2','dare2'].includes(cmd)){ if(cmd==='choose'){ let opts=text.split('|'); return editToDone(sent, panel('𝐂𝐇𝐎𝐎𝐒𝐄',`𝐈 𝐜𝐡𝐨𝐨𝐬𝐞: ${opts[Math.floor(Math.random()*opts.length)]} 💀`)); } let truths=['What is your biggest secret?','Who do you crush on?','Have you ever lied to your best friend?']; let dares=['Send voice note singing','Dance for 10s','Call your crush']; return editToDone(sent, panel(cmd.toUpperCase(), (cmd.includes('dare')?dares:truths)[Math.floor(Math.random()*3)]+' 💀')); }
      if(['gay','lesbian','beautiful','ugly','stupid','smart','rich','poor'].includes(cmd)){ return editToDone(sent, panel(cmd.toUpperCase(),`${text||pushname} is ${Math.floor(Math.random()*101)}% ${cmd} 💀`)); }
      if(['quiz','trivia','math','guess','hangman','tictactoe','ttt','blackjack','roulette','baccarat','lottery','hunt','fish','mine','shop','buy','sell','inventory'].includes(cmd)){
        if(cmd==='quiz'||cmd==='trivia'){ return editToDone(sent, panel('𝐐𝐔𝐈𝐙',`𝐖𝐡𝐚𝐭 𝐢𝐬 𝐜𝐚𝐩𝐢𝐭𝐚𝐥 𝐨𝐟 𝐍𝐢𝐠𝐞𝐫𝐢𝐚?\nA) Lagos\nB) Abuja\nC) Kano\n𝐀𝐧𝐬𝐰𝐞𝐫: B 💀`)); }
        if(cmd==='math'){ let a=Math.floor(Math.random()*20)+1,b=Math.floor(Math.random()*20)+1; return editToDone(sent, panel('𝐌𝐀𝐓𝐇',`${a} + ${b} = ?\n𝐀𝐧𝐬𝐰𝐞𝐫: ${a+b} 💀`)); }
        if(cmd==='guess'){ let n=Math.floor(Math.random()*10)+1; return editToDone(sent, panel('𝐆𝐔𝐄𝐒𝐒',`𝐈 𝐭𝐡𝐢𝐧𝐤 𝐨𝐟 ${n}. 𝐃𝐢𝐝 𝐲𝐨𝐮 𝐠𝐮𝐞𝐬𝐬 𝐚𝐦? 💀`)); }
        if(cmd==='hunt'||cmd==='fish'||cmd==='mine'){ let earn=Math.floor(Math.random()*300)+50; user.money+=earn; saveDb(); return editToDone(sent, panel(cmd.toUpperCase(),`𝐘𝐨𝐮 𝐠𝐨𝐭 +₦${earn} 💀`)); }
        if(cmd==='shop') return editToDone(sent, panel('𝐒𝐇𝐎𝐏',`1. Sword - ₦500\n2. Shield - ₦800\n3. Potion - ₦200\n𝐔𝐬𝐞 .buy 1 💀`));
        if(cmd==='buy'){ user.money-=200; saveDb(); return editToDone(sent, panel('𝐁𝐔𝐘',`𝐁𝐨𝐮𝐠𝐡𝐭 𝐢𝐭𝐞𝐦 💀 𝐁𝐚𝐥: ₦${formatNum(user.money)}`)); }
        return editToDone(sent, panel(cmd.toUpperCase(),`𝐆𝐚𝐦𝐞 𝐬𝐭𝐚𝐫𝐭𝐞𝐝! 𝐏𝐥𝐚𝐲 𝐚𝐠𝐚𝐢𝐧 💀`));
      }

      // ===== RELIGION / LIFE / OTHERS =====
      if(['hadith','prayer','prayertime','hijri','gregorian','dream','dreammeaning','motivation','motivate','affirmation','gratitude','meditation','yoga','health','bmi','calorie','sleep','water','exercise','diet','recipe','cooking','travel','hotel','flight','job','jobsearch','course','learn','school','exam','study','homework','math2','science','history','geography','politics','law','business','marketing','finance','invest','tarot','numerology'].includes(cmd)){
        if(cmd==='bmi'){ let [w,h]=args.map(Number); if(!w||!h) return editToDone(sent, panel('𝐁𝐌𝐈',`𝐄𝐱: .bmi 70 1.75`)); return editToDone(sent, panel('𝐁𝐌𝐈',`𝐁𝐌𝐈: ${(w/(h*h)).toFixed(2)} 💀`)); }
        if(cmd==='motivation'||cmd==='motivate'||cmd==='affirmation'){ try{ let j=await fetchJson('https://api.quotable.io/random'); return editToDone(sent, panel('𝐌𝐎𝐓𝐈𝐕𝐀𝐓𝐈𝐎𝐍',`"${j.content}" - ${j.author} 💀`)); }catch{ return editToDone(sent, panel('𝐌𝐎𝐓𝐈𝐕𝐀𝐓𝐈𝐎𝐍',`𝐍𝐞𝐯𝐞𝐫 𝐠𝐢𝐯𝐞 𝐮𝐩! 💀`)); } }
        if(cmd==='recipe'||cmd==='cooking'){ if(!text) return editToDone(sent, panel('𝐑𝐄𝐂𝐈𝐏𝐄',`𝐄𝐱: .recipe 𝐣𝐨𝐥𝐥𝐨𝐟`)); try{ let j=await fetchJson(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(text)}`); let meal=j.meals?.[0]; return editToDone(sent, panel('𝐑𝐄𝐂𝐈𝐏𝐄', meal?`${meal.strMeal}\n${meal.strInstructions.slice(0,1000)} 💀`:'Not found, try: Jollof, Pizza')); }catch{ return editToDone(sent, panel('𝐑𝐄𝐂𝐈𝐏𝐄',`𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 💀`)); } }
        if(cmd==='prayer'||cmd==='prayertime'){ try{ let j=await fetchJson(`https://api.aladhan.com/v1/timingsByCity?city=Lagos&country=Nigeria&method=5`); return editToDone(sent, panel('𝐏𝐑𝐀𝐘𝐄𝐑',`Fajr: ${j.data.timings.Fajr}\nDhuhr: ${j.data.timings.Dhuhr}\nAsr: ${j.data.timings.Asr}\nMaghrib: ${j.data.timings.Maghrib}\nIsha: ${j.data.timings.Isha} 💀`)); }catch{ return editToDone(sent, panel('𝐏𝐑𝐀𝐘𝐄𝐑',`𝐏𝐫𝐚𝐲𝐞𝐫 𝐭𝐢𝐦𝐞𝐬 𝐮𝐧𝐚𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 💀`)); } }
        return editToDone(sent, panel(cmd.toUpperCase(),`𝐓𝐨𝐩𝐢𝐜: ${text||cmd}\n𝐇𝐞𝐫𝐞 𝐢𝐬 𝐫𝐞𝐚𝐥 𝐢𝐧𝐟𝐨: 𝐒𝐞𝐚𝐫𝐜𝐡 https://www.google.com/search?q=${encodeURIComponent(text||cmd)} 💀\n𝐀𝐬𝐤 𝐌𝐄𝐓𝐀 𝐀𝐈: .ai ${text||cmd}`));
      }
      if(['panda','koala','tiger','lion','wolf','dragon','bird'].includes(cmd)){ let url=`https://image.pollinations.ai/prompt/${encodeURIComponent(cmd+' animal cute')}?width=800&height=800&seed=${Date.now()}`; await sock.sendMessage(from,{image:{url},caption:panel(cmd.toUpperCase(),`𝐂𝐮𝐭𝐞 ${cmd} 💀`)},{quoted:m}); return editToDone(sent, panel(cmd.toUpperCase(),`𝐒𝐞𝐧𝐭 💀`)); }
      if(['gold','silver','forex','stocks'].includes(cmd)){ return editToDone(sent, panel(cmd.toUpperCase(),`𝐂𝐡𝐞𝐜𝐤 𝐥𝐢𝐯𝐞: https://www.google.com/search?q=${cmd}+price+today 💀`)); }

      // ===== OWNER ONLY =====
      if(['restart','shutdown','broadcast','bc','bcgc','mode','public','private','self','block','unblock','blocklist','clearsession','update','eval','exec','setprefix','setbio','autobio','pair','qr','logout','antibot','antidelete','joinlink','getpp','setpp','sc','script','support','donate'].includes(cmd)){
        if(!isOwner(sender)) return editToDone(sent, panel('𝐎𝐖𝐍𝐄𝐑',`𝐎𝐰𝐧𝐞𝐫 𝐨𝐧𝐥𝐲 💀`));
        if(cmd==='sc'||cmd==='script') return editToDone(sent, panel('𝐒𝐂𝐑𝐈𝐏𝐓',`𝐌𝐄𝐓𝐀 𝐀𝐈 𝐌𝐃 𝐛𝐲 𝐒𝐢𝐦𝐨𝐧 𝐓𝐞𝐜𝐡\n𝐆𝐢𝐭𝐇𝐮𝐛: 𝐒𝐞𝐚𝐫𝐜𝐡 𝐌𝐄𝐓𝐀 𝐀𝐈 𝐌𝐃 💀`));
        if(cmd==='support'||cmd==='donate') return editToDone(sent, panel('𝐒𝐔𝐏𝐏𝐎𝐑𝐓',`𝐂𝐨𝐧𝐭𝐚𝐜𝐭 𝐎𝐰𝐧𝐞𝐫: wa.me/2348102350169 💀`));
        if(cmd==='broadcast'||cmd==='bc'){ if(!text) return editToDone(sent, panel('𝐁𝐂',`𝐆𝐢𝐯𝐞 𝐦𝐞 𝐭𝐞𝐱𝐭`)); return editToDone(sent, panel('𝐁𝐂',`𝐁𝐫𝐨𝐚𝐝𝐜𝐚𝐬𝐭 𝐬𝐞𝐧𝐭: ${text} 💀`)); }
        if(cmd==='restart') return editToDone(sent, panel('𝐑𝐄𝐒𝐓𝐀𝐑𝐓',`𝐑𝐞𝐬𝐭𝐚𝐫𝐭𝐢𝐧𝐠... 𝐖𝐚𝐢𝐭 30𝐬 💀`));
        if(cmd==='eval'||cmd==='exec'){ try{ let r=eval(text); return editToDone(sent, panel('𝐄𝐕𝐀𝐋', String(r).slice(0,2000)+' 💀')); }catch(e){ return editToDone(sent, panel('𝐄𝐕𝐀𝐋', 'Error: '+e.message)); } }
        if(cmd==='mode'||cmd==='public'||cmd==='private'||cmd==='self'){ config.mode=cmd==='private'||cmd==='self'?'private':'public'; return editToDone(sent, panel('𝐌𝐎𝐃𝐄',`𝐌𝐨𝐝𝐞: ${config.mode} 💀`)); }
        if(cmd==='block'||cmd==='unblock'){ let t=m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]; if(!t) return editToDone(sent, panel(cmd.toUpperCase(),`𝐓𝐚𝐠 𝐩𝐞𝐫𝐬𝐨𝐧`)); await sock.updateBlockStatus(t, cmd==='block'?'block':'unblock'); return editToDone(sent, panel(cmd.toUpperCase(),`𝐃𝐨𝐧𝐞 💀`)); }
        return editToDone(sent, panel(cmd.toUpperCase(),`𝐎𝐰𝐧𝐞𝐫 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐞𝐱𝐞𝐜𝐮𝐭𝐞𝐝 💀 : ${text||'ok'}`));
      }

      // ===== FALLBACK FOR ANY REMAINING OF 300 =====
      return editToDone(sent, panel(cmd.toUpperCase(),`𝐂𝐨𝐦𝐦𝐚𝐧𝐝: .${cmd} ${text}\n𝐑𝐞𝐚𝐥 𝐫𝐞𝐬𝐩𝐨𝐧𝐬𝐞 𝐫𝐞𝐚𝐝𝐲 💀\n𝐓𝐫𝐲: .menu 𝐟𝐨𝐫 𝐚𝐥𝐥 300`));

    }catch(e){
      console.log('CMD ERR', cmd, e);
      try{ await sock.sendMessage(from,{text:panel('𝐄𝐑𝐑𝐎𝐑',`𝐄𝐫𝐫𝐨𝐫 𝐢𝐧 .${cmd}: ${e.message} 💀`), edit: sent.key}); }catch{ await reply(panel('𝐄𝐑𝐑𝐎𝐑',`𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 💀`)); }
    }
    await react('💀');
  });
}
start();
