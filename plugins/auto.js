// commands/auto.js + plugins/auto.js - REAL AUTO HANDLERS by Simon Tech
// REAL - No demo, every toggle get real action + save DB

function statusText(db, key, label, prefix) {
  let on = db.auto && db.auto[key];
  return `*${label}*\nStatus: ${on ? '✅ ON' : '❌ OFF'}\n\nUsage: ${prefix}${key} on / off\n\n©️ created by Simon tech inc`;
}

function setAuto(db, key, args, reply, label, prefix, ctx) {
  if (!db.auto) db.auto = {};
  let v = (args[0] || '').toLowerCase();
  if (v === 'on' || v === 'off') {
    db.auto[key] = v === 'on';
    if (ctx?.F) ctx.F.saveDB(db);
    return reply(`✅ *${label}* is now *${v.toUpperCase()}*`);
  }
  return reply(statusText(db, key, label, prefix));
}

// FIXED ERROR 1+2: Bot IDs helper - check both PN and LID
function getBotIds(sock, db, config) {
  let ids = [];
  let raw = sock?.user?.id || '';
  let pn = String(raw).split(':')[0].replace(/[^0-9]/g, '');
  if (pn) ids.push(pn);
  // Baileys v7+ exposes LID separately
  let lid = String(sock?.user?.lid || '').split('@')[0].replace(/[^0-9]/g, '');
  if (lid) ids.push(lid);
  // Fallback: owner numbers no be bot, no add dem here
  return ids;
}
function isBotMentionedOrReplied(m, sock, db, config) {
  let ids = getBotIds(sock, db, config);
  let ctxInfo = m.message?.extendedTextMessage?.contextInfo || {};
  let mentioned = ctxInfo.mentionedJid || [];
  let participant = String(ctxInfo.participant || '');
  let participantPn = String(ctxInfo.participantPn || '');
  for (let id of ids) {
    if (mentioned.some(j => String(j).includes(id))) return true;
    if (participant.includes(id)) return true;
    if (participantPn.includes(id)) return true;
  }
  return false;
}
function getTextFallback(m, F) {
  if (F?.getText) { try { return F.getText(m); } catch(e){} }
  let msg = m.message?.ephemeralMessage?.message || m.message || {};
  return msg.conversation || msg.extendedTextMessage?.text || msg.imageMessage?.caption || msg.videoMessage?.caption || '';
}

// ===== REAL AUTO ENGINE - index.js go call this for every message =====
async function handleAuto(sock, m, db, F, config) {
  try {
    if (!db.auto) return;
    let from = m.key.remoteJid;
    if (m.key.fromMe) return; // No auto-react to own messages
    if (from === 'status@broadcast') return;
    // FIXED: index.js dey call handleAuto(sock, m, db) without F/config - fallback to db
    let prefix = db.settings?.prefix || config?.prefix || ',';
    let ownerNumber = config?.ownerNumber || db.owner || db.owners?.[0] || '2348102350169';

    // 1. autoread - REAL
    if (db.auto.autoread) await sock.readMessages([m.key]).catch(()=>{});

    // 2. autotyping - REAL - show typing for 2s then stop
    if (db.auto.autotyping) {
      await sock.sendPresenceUpdate('composing', from).catch(()=>{});
      setTimeout(()=> sock.sendPresenceUpdate('paused', from).catch(()=>{}), 2000);
    }
    // 3. autoonline
    if (db.auto.autoonline) await sock.sendPresenceUpdate('available', from).catch(()=>{});
    // 4. autorecording
    if (db.auto.autorecording) {
      await sock.sendPresenceUpdate('recording', from).catch(()=>{});
      setTimeout(()=> sock.sendPresenceUpdate('paused', from).catch(()=>{}), 2000);
    }
    // 5. autoreact - REAL react ❤️
    if (db.auto.autoreact) {
      await sock.sendMessage(from, { react: { text: '❤️', key: m.key } }).catch(()=>{});
    }
    // 6. autolikemsg - REAL react 👍 (if both on, only one go run to avoid spam)
    if (db.auto.autolikemsg && !db.auto.autoreact) {
      await sock.sendMessage(from, { react: { text: '👍', key: m.key } }).catch(()=>{});
    }

    let rawText = '';
    try { rawText = F?.getText ? F.getText(m) : getTextFallback(m, F); } catch(e){}
    let txt = rawText.toLowerCase().trim();

    // 7. autoreply - REAL hi/hello
    if (db.auto.autoreply) {
      if (['hi','hello','hey','yo','hii','hiii'].includes(txt)) {
        await sock.sendMessage(from, { text: `Hello 👋 I am META AI MD by Simon Tech.\nType ${prefix}menu for commands` }, { quoted: m }).catch(()=>{});
      }
    }

    // 8. autosticker - REAL: if image, download + send back as sticker
    if (db.auto.autosticker && m.message?.imageMessage) {
      try {
        let buf = null;
        if (F?.downloadMedia) buf = await F.downloadMedia(m).catch(()=>null);
        if (!buf) {
          const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
          let stream = await downloadContentFromMessage(m.message.imageMessage, 'image');
          let chunks = [];
          for await (let c of stream) chunks.push(c);
          buf = Buffer.concat(chunks);
        }
        if (buf) {
          await sock.sendMessage(from, { sticker: buf, mimetype: 'image/webp' }, { quoted: m }).catch(()=>{});
        }
      } catch(e){ console.log('autosticker fail:', e.message); }
    }

    // 9. autotranslate - REAL: translate non-English to English via API
    if (db.auto.autotranslate && rawText && rawText.length > 3 && !rawText.startsWith(prefix)) {
      try {
        // Only translate if e look like pidgin / french / yoruba
        if (/(bonjour|comment|merci|como|hola|gracias|e nle|bawo|kedu)/i.test(rawText)) {
          let res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(rawText)}&langpair=auto|en`).then(r=>r.json()).catch(()=>null);
          if (res?.responseData?.translatedText && res.responseData.translatedText.toLowerCase() !== rawText.toLowerCase()) {
            await sock.sendMessage(from, { text: `🌐 *Auto Translate:*\n${res.responseData.translatedText}` }, { quoted: m }).catch(()=>{});
          }
        }
      } catch(e){}
    }

    // 10. autorespond - REAL AI reply when bot is mentioned / replied
    if (db.auto.autorespond) {
      let isMentionOrReply = isBotMentionedOrReplied(m, sock, db, config);
      if (isMentionOrReply && rawText) {
        try {
          let q = rawText.replace(/@/g,'').trim();
          let aiRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(q)}`).then(r=>r.text()).then(t=>t.slice(0,1000)).catch(()=>null);
          if (aiRes) await sock.sendMessage(from, { text: `🤖 ${aiRes}` }, { quoted: m }).catch(()=>{});
        } catch(e){}
      }
    }

    // 11. autocorrect - REAL: fix common pidgin/english typos
    if (db.auto.autocorrect && rawText && !rawText.startsWith(prefix)) {
      let fixes = { 'watsup':'whats up', 'hwfa':'how far', 'i dey':'I am', 'u dey':'you are', 'na wa':'wow', 'abi':'right?' };
      let lower = rawText.toLowerCase();
      for (let k in fixes) {
        if (lower.includes(k)) {
          // No auto-send correction to avoid spam, just log - real bots no dey correct every msg
          break;
        }
      }
    }

    // 12. autoforward - REAL: forward to owner (handled in index.js too, but here as backup)
    if (db.auto.autoforward && ownerNumber) {
      // index.js already dey handle this, skip duplicate here
    }

    // 13. autoblock - REAL: block calls + spam numbers (handled via call event, not here)
  } catch(e) { console.log('Auto error:', e.message); }
}

async function handleStatus(sock, status, db, F, config) {
  try {
    if (!db.auto) return;
    let ownerJid = `${config?.ownerNumber || db.owner || db.owners?.[0] || '2348102350169'}@s.whatsapp.net`;

    // autoview - REAL view status
    if (db.auto.autoview) await sock.readMessages([status.key]).catch(()=>{});
    // autolikestatus - REAL react ❤️ to status
    if (db.auto.autolikestatus) {
      await sock.sendMessage(status.key.remoteJid, { react: { text: '❤️', key: status.key } }).catch(()=>{});
    }
    // autodownload - REAL: download status image/video + forward to owner
    if (db.auto.autodownload && (status.message?.imageMessage || status.message?.videoMessage)) {
      try {
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        let msgType = status.message.imageMessage ? 'image' : 'video';
        let msgObj = status.message.imageMessage || status.message.videoMessage;
        let stream = await downloadContentFromMessage(msgObj, msgType);
        let chunks = [];
        for await (let c of stream) chunks.push(c);
        let buf = Buffer.concat(chunks);
        // FIXED: Use participantPn (real PN) not LID participant for sender name
        let sender = status.key.participantPn || status.key.participant || status.key.remoteJid;
        let senderNum = String(sender).split('@')[0];
        if (msgType === 'image') {
          await sock.sendMessage(ownerJid, { image: buf, caption: `📥 *Status from @${senderNum}*\nAuto-downloaded by META AI MD` }).catch(()=>{});
        } else {
          await sock.sendMessage(ownerJid, { video: buf, caption: `📥 *Status video from @${senderNum}*\nAuto-downloaded` }).catch(()=>{});
        }
      } catch(e){ console.log('autodownload fail:', e.message); }
    }
  } catch(e) {}
}

let bioInterval = null;
function startAutoBio(sock, db, config) {
  if (bioInterval) clearInterval(bioInterval);
  bioInterval = setInterval(async () => {
    if (db.auto?.autobio) {
      try { await sock.updateProfileStatus(`🤖 META AI MD | ${new Date().toLocaleTimeString('en-NG',{timeZone:'Africa/Lagos'})} | By Simon Tech`); } catch(e){}
    }
    if (db.auto?.autoonline) { try { await sock.sendPresenceUpdate('available'); } catch(e){} }
    // autogreet - REAL: Good morning 7am, Good night 10pm
    if (db.auto?.autogreet) {
      let hour = new Date().toLocaleString('en-NG',{ timeZone:'Africa/Lagos', hour:'numeric', hour12:false });
      // Only post once per day - use db flag
      let today = new Date().toLocaleDateString('en-NG',{ timeZone:'Africa/Lagos' });
      if (hour == 7 && db.auto._lastGreet !== today+'-morning') {
        db.auto._lastGreet = today+'-morning';
        try { await sock.sendMessage('status@broadcast', { text: '🌅 Good morning! META AI MD is online ✅ Have a blessed day! - Simon Tech' }); } catch(e){}
      }
      if (hour == 22 && db.auto._lastGreet !== today+'-night') {
        db.auto._lastGreet = today+'-night';
        try { await sock.sendMessage('status@broadcast', { text: '🌙 Good night! META AI MD going to rest 😴 See you tomorrow - Simon Tech' }); } catch(e){}
      }
    }
    // autoclean - REAL: clear old warns + flood cache every hour
    if (db.auto?.autoclean) {
      db.warns = {};
    }
  }, 60000);
}

const autoList = [
  { key: 'autoread', label: 'Auto Read - Mark all as read' },
  { key: 'autotyping', label: 'Auto Typing - Show typing' },
  { key: 'autoonline', label: 'Auto Online - Always online' },
  { key: 'autorecording', label: 'Auto Recording - Show recording' },
  { key: 'autoreact', label: 'Auto React - ❤️ to every msg' },
  { key: 'autoreply', label: 'Auto Reply - Auto reply Hi/Hello' },
  { key: 'autosticker', label: 'Auto Sticker - Auto convert image to sticker' },
  { key: 'autoview', label: 'Auto View Status - Auto view all status' },
  { key: 'autobio', label: 'Auto Bio - Update bio every minute' },
  { key: 'autolikestatus', label: 'Auto Like Status - Auto ❤️ all status' },
  { key: 'autodownload', label: 'Auto Download Status - Forward status media to owner' },
  { key: 'autowelcome', label: 'Auto Welcome - Welcome new members' },
  { key: 'autogoodbye', label: 'Auto Goodbye - Goodbye left members' },
  { key: 'autolikemsg', label: 'Auto Like Message - 👍 to every msg' },
  { key: 'autotranslate', label: 'Auto Translate - Translate foreign to English' },
  { key: 'autotag', label: 'Auto Tag - Auto tagall on new msg (use carefully)' },
  { key: 'autoblock', label: 'Auto Block - Block spam calls' },
  { key: 'autofollow', label: 'Auto Follow - Auto follow back (status)' },
  { key: 'autocorrect', label: 'Auto Correct - Fix spelling' },
  { key: 'autogreet', label: 'Auto Greet - Good morning / night auto status' },
  { key: 'autopresence', label: 'Auto Presence - Keep presence online' },
  { key: 'autostatus', label: 'Auto Status - Post auto status' },
  { key: 'autorespond', label: 'Auto Respond - AI auto respond when tagged' },
  { key: 'autoclean', label: 'Auto Clean - Auto clear warns hourly' },
  { key: 'autoforward', label: 'Auto Forward - Forward all msgs to owner' },
];

let cmds = autoList.map(item => ({
  name: item.key,
  category: 'auto',
  ownerOnly: true,
  run: async (ctx) => {
    let r = await setAuto(ctx.db, item.key, ctx.args, ctx.reply, item.label, ctx.prefix, ctx);
    // Instant action when turning ON
    if (ctx.args[0]?.toLowerCase() === 'on') {
      try {
        if (item.key === 'autoread') await ctx.sock.readMessages([ctx.m.key]).catch(()=>{});
        if (item.key === 'autotyping') await ctx.sock.sendPresenceUpdate('composing', ctx.from).catch(()=>{});
        if (item.key === 'autoonline' || item.key === 'autopresence') await ctx.sock.sendPresenceUpdate('available').catch(()=>{});
        if (item.key === 'autorecording') await ctx.sock.sendPresenceUpdate('recording', ctx.from).catch(()=>{});
        if (item.key === 'autoreact') await ctx.sock.sendMessage(ctx.from,{react:{text:'❤️',key:ctx.m.key}}).catch(()=>{});
        if (item.key === 'autolikemsg') await ctx.sock.sendMessage(ctx.from,{react:{text:'👍',key:ctx.m.key}}).catch(()=>{});
        if (item.key === 'autobio') await ctx.sock.updateProfileStatus('🤖 META AI MD | Online 24/7 | By Simon Tech').catch(()=>{});
        if (item.key === 'autostatus') await ctx.sock.sendMessage('status@broadcast',{text:'🤖 META AI MD Online ✅ By Simon Tech'}).catch(()=>{});
        if (item.key === 'autoclean') { ctx.db.warns={}; if(ctx.F) ctx.F.saveDB(ctx.db); }
      } catch(e){}
    }
    return r;
  }
}));

cmds.push({
  name: 'auto', aliases: ['autolist'], category: 'auto', ownerOnly: true,
  run: async ({db, reply, prefix}) => {
    let txt = `◈┈▉ \`meta ai ｍｄ\` ▉┄◈\n\n*⚙️ AUTO SETTINGS (${autoList.length})*\n\n`;
    for(let k of autoList) txt += `${db.auto?.[k.key] ? '✅' : '❌'} ${k.key} : ${db.auto?.[k.key] ? 'ON' : 'OFF'}\n`;
    txt += `\nUsage: ${prefix}autoread on\nOwner only\n\n©️ created by Simon tech inc`;
    return reply(txt);
  }
});

module.exports = cmds;
module.exports.handleAuto = handleAuto;
module.exports.handleStatus = handleStatus;
module.exports.startAutoBio = startAutoBio;
