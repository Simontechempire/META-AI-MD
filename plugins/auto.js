// plugins/auto.js
// META AI MD - Auto Plugin (REAL)
// © Simon Tech Inc

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const autoList = [
  ['autoread', 'Auto Read'],
  ['autotyping', 'Auto Typing'],
  ['autoonline', 'Auto Online'],
  ['autorecording', 'Auto Recording'],
  ['autoreact', 'Auto React'],
  ['autolikemsg', 'Auto Like Message'],
  ['autoreply', 'Auto Reply'],
  ['autorespond', 'Auto Respond To Mentions'],
  ['autosticker', 'Auto Sticker'],
  ['autoview', 'Auto View Status'],
  ['autolikestatus', 'Auto Like Status'],
  ['autobio', 'Auto Bio'],
  ['autowelcome', 'Auto Welcome'],
  ['autogoodbye', 'Auto Goodbye'],
  ['autogreet', 'Auto Greet']
];

function getNumber(jid){ return String(jid || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, ''); }

function unwrap(msg){
  if(!msg) return {};
  if(msg.viewOnceMessage) return unwrap(msg.viewOnceMessage.message);
  if(msg.viewOnceMessageV2) return unwrap(msg.viewOnceMessageV2.message);
  if(msg.ephemeralMessage) return unwrap(msg.ephemeralMessage.message);
  if(msg.editedMessage) return unwrap(msg.editedMessage.message);
  return msg;
}
function getText(m, F){
  if(typeof F?.getText === 'function'){ try{ const t = F.getText(m); if(t) return t; }catch{} }
  const msg = unwrap(m.message || {});
  const type = Object.keys(msg)[0] || '';
  const body = msg[type] || {};
  return body.text || body.caption || msg.conversation || '';
}
function getCtx(m){
  const msg = unwrap(m.message || {});
  const type = Object.keys(msg)[0] || '';
  return { type, body: msg[type] || {}, ctx: (msg[type] || {}).contextInfo || {} };
}
function getBotIds(sock){
  const ids = [];
  const n = String(sock.user?.id || '').split(':')[0].split('@')[0].replace(/\D/g, '');
  if(n) ids.push(n);
  const lid = String(sock.user?.lid || '').split('@')[0].replace(/\D/g, '');
  if(lid) ids.push(lid);
  return ids;
}
function isBotMentioned(m, sock){
  const { ctx } = getCtx(m);
  const ids = getBotIds(sock);
  return (ctx.mentionedJid || []).some(j => ids.some(id => String(j).includes(id)));
}
function setAuto(db, key, value){ if(!db.auto) db.auto = {}; db.auto[key] = value; }

// ================= AUTO MESSAGE =================
async function handleAuto(sock, m, db, F, config){
  try{
    if(!m?.key || m.key.fromMe) return false;
    if(m.key.remoteJid === 'status@broadcast') return false;
    const auto = db.auto || {};
    if(!Object.values(auto).some(v => v === true)) return false;
    const from = m.key.remoteJid;
    const prefix = db.settings?.prefix || config?.prefix || '.';

    // REAL presence - recording wins over typing, else they fight
    if(auto.autoonline) await sock.sendPresenceUpdate('available').catch(()=>{});
    if(auto.autorecording) await sock.sendPresenceUpdate('recording', from).catch(()=>{});
    else if(auto.autotyping) await sock.sendPresenceUpdate('composing', from).catch(()=>{});

    // REAL read - blue tick
    if(auto.autoread) await sock.readMessages([m.key]).catch(()=>{});

    // REAL react - ONE react only, else second overwrites first
    if(auto.autoreact || auto.autolikemsg){
      const emoji = auto.autoreact ? '❤️' : '👍' :'🍻' :'🪴' :'🧫' :'💖';
      await sock.sendMessage(from, { react: { text: emoji, key: m.key } }).catch(()=>{});
    }

    const text = getText(m, F).trim();
    const lower = text.toLowerCase();
    let replied = false;

    // Autorespond to mention = highest priority, no double reply
    if(auto.autorespond && text && isBotMentioned(m, sock)){
      await sock.sendMessage(from, { text: `Yes? 👋 You mentioned me.\nType ${prefix}menu to see what I can do.` }, { quoted: m }).catch(()=>{});
      replied = true;
    }
    // Autoreply to hi/hello - DM + group, but not if already replied
    if(!replied && auto.autoreply && ['hi','hello','hey','hii','hiii','yo','good morning','good afternoon'].includes(lower)){
      await sock.sendMessage(from, { text: `Hello 👋\nI am META AI MD.\nType ${prefix}menu to see my commands.` }, { quoted: m }).catch(()=>{});
      replied = true;
    }

    // REAL autosticker - image -> sticker
    if(auto.autosticker){
      const { type, body } = getCtx(m);
      if(type === 'imageMessage' && body){
        try{
          const stream = await downloadContentFromMessage(body, 'image');
          const chunks = [];
          for await (const c of stream) chunks.push(c);
          const buf = Buffer.concat(chunks);
          // Baileys accepts image buffer as sticker (it converts to webp internally on most versions).
          // If your Baileys version no convert, install sharp/ffmpeg - this code still sends real sticker attempt.
          if(buf.length && buf.length < 1024*1024) await sock.sendMessage(from, { sticker: buf }, { quoted: m }).catch(()=>{});
        }catch{}
      }
    }
    return false; // auto never blocks commands
  }catch(e){ console.log('[AUTO MESSAGE]', e.message); return false; }
}

// ================= STATUS =================
async function handleStatus(sock, status, db, F, config){
  try{
    if(!status?.key || !db.auto) return;
    // status.key.remoteJid is status@broadcast, key is real
    if(db.auto.autoview) await sock.readMessages([status.key]).catch(()=>{});
    if(db.auto.autolikestatus){
      await sock.sendMessage('status@broadcast', { react: { text: '❤️', key: status.key } }).catch(()=>{});
    }
  }catch(e){ console.log('[AUTO STATUS]', e.message); }
}

// ================= GROUP JOIN/LEAVE =================
async function handleParticipants(sock, update, db, F, config){
  try{
    if(!db.auto) return;
    const { id, participants, action } = update;
    if(!id || !participants?.length) return;
    let meta = null;
    try{ if(F?.getGroupMeta) meta = await F.getGroupMeta(sock, id); }catch{}
    const display = (uid) => {
      if(meta && F?.findParticipant){
        const p = F.findParticipant(meta, uid);
        if(p?.phoneNumber) return getNumber(p.phoneNumber);
      }
      return getNumber(uid);
    };
    for(const user of participants){
      const num = display(user);
      if(action === 'add' && db.auto.autowelcome){
        await sock.sendMessage(id, { text: `👋 Welcome @${num}!\nWelcome to the group.\nType .menu for commands.`, mentions: [user] }).catch(()=>{});
      } else if(action === 'add' && db.auto.autogreet){
        await sock.sendMessage(id, { text: `👋 Hello @${num}, welcome!`, mentions: [user] }).catch(()=>{});
      }
      if(action === 'remove' && db.auto.autogoodbye){
        await sock.sendMessage(id, { text: `👋 Goodbye @${num}. We will miss you.`, mentions: [user] }).catch(()=>{});
      }
    }
  }catch(e){ console.log('[AUTO GROUP]', e.message); }
}

// ================= AUTO BIO =================
const bioTimers = new WeakMap();
function startAutoBio(sock, db, config = {}){
  const prev = bioTimers.get(sock);
  if(prev) clearInterval(prev);
  // 5 mins, not 60s - 60s go cause rate-limit / ban
  const timer = setInterval(async () => {
    try{
      if(db.auto?.autobio){
        const time = new Date().toLocaleTimeString('en-US', { timeZone: config.timezone || 'Africa/Lagos', hour: '2-digit', minute: '2-digit' });
        await sock.updateProfileStatus(`🤖 META AI MD | ${time} | Simon Tech`);
      }
      if(db.auto?.autoonline) await sock.sendPresenceUpdate('available').catch(()=>{});
    }catch(e){ console.log('[AUTO BIO]', e.message); }
  }, 5 * 60 * 1000);
  bioTimers.set(sock, timer);
}

// ================= COMMANDS =================
const cmds = autoList.map(([key, label]) => ({
  name: key, category: 'auto', ownerOnly: true,
  run: async ctx => {
    const value = String(ctx.args?.[0] || '').toLowerCase();
    if(value !== 'on' && value !== 'off'){
      const on = ctx.db.auto?.[key] === true;
      return ctx.reply(`*${label}*\n\nStatus: ${on ? '✅ ON' : '❌ OFF'}\n\nUsage:\n${ctx.prefix}${key} on\n${ctx.prefix}${key} off\n\n©️ Simon Tech Inc`);
    }
    setAuto(ctx.db, key, value === 'on');
    if(ctx.F?.saveDB) { try{ await ctx.F.saveDB(ctx.db); }catch{} }
    return ctx.reply(`✅ *${label}* is now *${value.toUpperCase()}*.`);
  }
}));
cmds.push({
  name: 'auto', aliases: ['autolist'], category: 'auto', ownerOnly: true,
  run: async ({ db, reply, prefix }) => {
    let out = `◈┈▉ META AI MD ▉┄◈\n\n⚙️ *AUTO SETTINGS*\n\n`;
    for(const [key, label] of autoList) out += `${db.auto?.[key] ? '✅' : '❌'} ${label} (${prefix}${key})\n`;
    out += `\nUsage: ${prefix}autoread on\n\n©️ Simon Tech Inc`;
    return reply(out);
  }
});

module.exports = cmds;
module.exports.handleAuto = handleAuto;
module.exports.handleStatus = handleStatus;
module.exports.handleParticipants = handleParticipants;
module.exports.startAutoBio = startAutoBio;
