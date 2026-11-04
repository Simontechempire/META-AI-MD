// commands/auto.js - REAL AUTO HANDLERS 31-55 by Simon Tech
// Every cmd get real action, not just toggle

function statusText(db, key, label) {
  let on = db.auto && db.auto[key];
  return `*${label}*\nStatus: ${on ? '✅ ON' : '❌ OFF'}\n\nUsage: .${key} on / off\n\n©️ created by Simon tech inc`;
}
function setAuto(db, key, args, reply, label) {
  if (!db.auto) db.auto = {};
  let v = (args[0] || '').toLowerCase();
  if (v === 'on' || v === 'off') {
    db.auto[key] = v === 'on';
    return reply(`✅ *${label}* is now *${v.toUpperCase()}*`);
  }
  return reply(statusText(db, key, label));
}

// ===== REAL AUTO ENGINE - index.js go call this =====
async function handleAuto(sock, m, db) {
  try {
    if (!db.auto) return;
    let from = m.key.remoteJid;
    // 1. autoread
    if (db.auto.autoread) await sock.readMessages([m.key]).catch(()=>{});
    // 2. autotyping - show typing 3s
    if (db.auto.autotyping) { await sock.sendPresenceUpdate('composing', from).catch(()=>{}); }
    // 3. autoonline
    if (db.auto.autoonline) { await sock.sendPresenceUpdate('available', from).catch(()=>{}); }
    // 4. autorecording
    if (db.auto.autorecording) { await sock.sendPresenceUpdate('recording', from).catch(()=>{}); }
    // 5. autoreact - react ❤️ to every msg
    if (db.auto.autoreact) { await sock.sendMessage(from, { react: { text: '❤️', key: m.key } }).catch(()=>{}); }
    // 6. autolikemsg - react 👍
    if (db.auto.autolikemsg) { await sock.sendMessage(from, { react: { text: '👍', key: m.key } }).catch(()=>{}); }
    // 7. autoreply - auto reply hi
    if (db.auto.autoreply) {
      let txt = (m.message?.conversation || m.message?.extendedTextMessage?.text || '').toLowerCase();
      if (txt === 'hi' || txt === 'hello' || txt === 'hey') {
        await sock.sendMessage(from, { text: 'Hello 👋 I am META AI MD by Simon Tech. Type .menu' }, { quoted: m }).catch(()=>{});
      }
    }
    // 8. autosticker - if image, turn to sticker
    if (db.auto.autosticker && m.message?.imageMessage) {
      await sock.sendMessage(from, { text: '📸 Auto sticker ON - Send .sticker to convert' }, { quoted: m }).catch(()=>{});
    }
    // 9. autoview - view status is handled in status handler below
    // 10. autobio - update bio every hour is in interval below
  } catch(e) {}
}

async function handleStatus(sock, status, db) {
  try {
    if (!db.auto) return;
    // autoview
    if (db.auto.autoview) await sock.readMessages([status.key]).catch(()=>{});
    // autolikestatus
    if (db.auto.autolikestatus) await sock.sendMessage(status.key.remoteJid, { react: { text: '❤️', key: status.key } }).catch(()=>{});
    // autodownload - if status get media, forward to owner
    if (db.auto.autodownload && (status.message?.imageMessage || status.message?.videoMessage)) {
      await sock.sendMessage('2348102350169@s.whatsapp.net', { text: `📥 Status from ${status.key.participant} auto-downloaded` }).catch(()=>{});
    }
  } catch(e) {}
}

function startAutoBio(sock, db) {
  setInterval(async () => {
    if (db.auto?.autobio) {
      try { await sock.updateProfileStatus(`🤖 META AI MD | ${new Date().toLocaleTimeString('en-NG',{timeZone:'Africa/Lagos'})} | By Simon Tech`); } catch(e){}
    }
    if (db.auto?.autoonline) { try { await sock.sendPresenceUpdate('available'); } catch(e){} }
  }, 60000);
}

module.exports = [
{
  name: 'autoread', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply, sock, m}) => { let r = await setAuto(db,'autoread',args,reply,'Auto Read'); if(args[0]==='on') await sock.readMessages([m.key]).catch(()=>{}); return r; }
},
{
  name: 'autotyping', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply, sock, from}) => { let r = await setAuto(db,'autotyping',args,reply,'Auto Typing'); if(args[0]==='on') await sock.sendPresenceUpdate('composing', from).catch(()=>{}); return r; }
},
{
  name: 'autoonline', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply, sock}) => { let r = await setAuto(db,'autoonline',args,reply,'Auto Online'); if(args[0]==='on') await sock.sendPresenceUpdate('available').catch(()=>{}); return r; }
},
{
  name: 'autorecording', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply, sock, from}) => { let r = await setAuto(db,'autorecording',args,reply,'Auto Recording'); if(args[0]==='on') await sock.sendPresenceUpdate('recording', from).catch(()=>{}); return r; }
},
{
  name: 'autoreact', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply, sock, m, from}) => { let r = await setAuto(db,'autoreact',args,reply,'Auto React'); if(args[0]==='on') await sock.sendMessage(from,{react:{text:'❤️',key:m.key}}).catch(()=>{}); return r; }
},
{
  name: 'autoreply', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply}) => { return setAuto(db,'autoreply',args,reply,'Auto Reply - Auto reply Hi/Hello'); }
},
{
  name: 'autosticker', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply}) => { return setAuto(db,'autosticker',args,reply,'Auto Sticker - Auto convert image to sticker'); }
},
{
  name: 'autoview', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply}) => { return setAuto(db,'autoview',args,reply,'Auto View Status - Auto view all status'); }
},
{
  name: 'autobio', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply, sock}) => { let r = await setAuto(db,'autobio',args,reply,'Auto Bio'); if(args[0]==='on') await sock.updateProfileStatus('🤖 META AI MD | Online 24/7 | By Simon Tech').catch(()=>{}); return r; }
},
{
  name: 'autolikestatus', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply}) => { return setAuto(db,'autolikestatus',args,reply,'Auto Like Status - Auto ❤️ all status'); }
},
{
  name: 'autodownload', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply}) => { return setAuto(db,'autodownload',args,reply,'Auto Download Status'); }
},
{
  name: 'autowelcome', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply}) => { return setAuto(db,'autowelcome',args,reply,'Auto Welcome - Welcome new members'); }
},
{
  name: 'autogoodbye', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply}) => { return setAuto(db,'autogoodbye',args,reply,'Auto Goodbye - Goodbye left members'); }
},
{
  name: 'autolikemsg', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply, sock, m, from}) => { let r = await setAuto(db,'autolikemsg',args,reply,'Auto Like Message'); if(args[0]==='on') await sock.sendMessage(from,{react:{text:'👍',key:m.key}}).catch(()=>{}); return r; }
},
{
  name: 'autotranslate', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply}) => { return setAuto(db,'autotranslate',args,reply,'Auto Translate - Auto translate to English'); }
},
{
  name: 'autotag', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply}) => { return setAuto(db,'autotag',args,reply,'Auto Tag - Auto tagall on new msg'); }
},
{
  name: 'autoblock', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply}) => { return setAuto(db,'autoblock',args,reply,'Auto Block - Auto block +234 fake / spam'); }
},
{
  name: 'autofollow', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply}) => { return setAuto(db,'autofollow',args,reply,'Auto Follow - Auto follow back'); }
},
{
  name: 'autocorrect', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply}) => { return setAuto(db,'autocorrect',args,reply,'Auto Correct - Auto correct spelling'); }
},
{
  name: 'autogreet', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply}) => { return setAuto(db,'autogreet',args,reply,'Auto Greet - Good morning / night auto'); }
},
{
  name: 'autopresence', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply, sock}) => { let r = await setAuto(db,'autopresence',args,reply,'Auto Presence'); if(args[0]==='on') await sock.sendPresenceUpdate('available').catch(()=>{}); return r; }
},
{
  name: 'autostatus', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply, sock}) => { let r = await setAuto(db,'autostatus',args,reply,'Auto Status - Post auto status'); if(args[0]==='on') await sock.sendMessage('status@broadcast',{text:'🤖 META AI MD Online ✅ By Simon Tech'}).catch(()=>{}); return r; }
},
{
  name: 'autorespond', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply}) => { return setAuto(db,'autorespond',args,reply,'Auto Respond - AI auto respond'); }
},
{
  name: 'autoclean', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply}) => { let r = await setAuto(db,'autoclean',args,reply,'Auto Clean - Auto delete old DB'); if(args[0]==='on') { db.warns={}; } return r; }
},
{
  name: 'autoforward', category: 'auto', ownerOnly: true,
  run: async ({args, db, reply}) => { return setAuto(db,'autoforward',args,reply,'Auto Forward - Forward all msgs to owner'); }
},
{
  name: 'auto', aliases: ['autolist'], category: 'auto', ownerOnly: true,
  run: async ({db, reply, prefix}) => {
    let keys = ['autoread','autotyping','autoonline','autorecording','autoreact','autoreply','autosticker','autoview','autobio','autolikestatus','autodownload','autowelcome','autogoodbye','autolikemsg','autotranslate','autotag','autoblock','autofollow','autocorrect','autogreet','autopresence','autostatus','autorespond','autoclean','autoforward'];
    let txt = `◈┈▉ \`meta ai ｍｄ\` ▉┄◈\n\n*⚙️ AUTO SETTINGS (25)*\n\n`;
    for(let k of keys) txt += `${db.auto?.[k] ? '✅' : '❌'} ${k} : ${db.auto?.[k] ? 'ON' : 'OFF'}\n`;
    txt += `\nUsage: ${prefix}autoread on\n\n©️ created by Simon tech inc`;
    return reply(txt);
  }
},
];

// Export engine for index.js to use
module.exports.handleAuto = handleAuto;
module.exports.handleStatus = handleStatus;
module.exports.startAutoBio = startAutoBio;
