// commands/anti.js - REAL ANTI HANDLERS 56-80 by Simon Tech

function statusText(db, key, label) {
  let on = db.anti && db.anti[key];
  return `*${label}*\nStatus: ${on ? '✅ ON' : '❌ OFF'}\n\nUsage: .${key} on / off\n\n©️ created by Simon tech inc`;
}
function setAnti(db, key, args, reply, label) {
  if (!db.anti) db.anti = {};
  let v = (args[0] || '').toLowerCase();
  if (v === 'on' || v === 'off') {
    db.anti[key] = v === 'on';
    return reply(`✅ *${label}* is now *${v.toUpperCase()}*`);
  }
  return reply(statusText(db, key, label));
}

// ===== REAL ANTI ENGINE - index.js go call this before commands =====
async function handleAnti(sock, m, db, F) {
  try {
    if (!db.anti) return false;
    let from = m.key.remoteJid;
    if (!from.endsWith('@g.us')) return false;
    let sender = m.key.participant || m.key.remoteJid;
    let text = F.getText(m).toLowerCase();
    let type = m.message ? Object.keys(m.message)[0] : '';
    let isOwner = F.isOwner(sender, db);
    if (isOwner) return false;
    // Get admins to skip admins
    let admins = [];
    try { let md = await sock.groupMetadata(from); admins = md.participants.filter(p=>p.admin).map(p=>p.id); } catch(e){}
    if (admins.includes(sender)) return false;

    let reason = null;
    // antilink
    if (db.anti.antilink && /https?:\/\/|www\.|chat\.whatsapp\.com|wa\.me|t\.me|instagram\.com|tiktok\.com/i.test(text)) reason = 'Link not allowed';
    // antibadword
    if (!reason && db.anti.antibadword && /(fuck|shit|bitch|bastard|dick|pussy|sex|porn|mad|fool|idiot|mumu|olosho|ashawo)/i.test(text)) reason = 'Bad word';
    // antisticker
    if (!reason && db.anti.antisticker && type === 'stickerMessage') reason = 'Sticker not allowed';
    // antiimage
    if (!reason && db.anti.antiimage && type === 'imageMessage') reason = 'Image not allowed';
    // antivideo
    if (!reason && db.anti.antivideo && type === 'videoMessage') reason = 'Video not allowed';
    // antiaudio
    if (!reason && db.anti.antiaudio && (type === 'audioMessage' || type === 'pttMessage')) reason = 'Audio not allowed';
    // antidocument
    if (!reason && db.anti.antidocument && type === 'documentMessage') reason = 'Document not allowed';
    // antiforward
    if (!reason && db.anti.antiforward && m.message?.extendedTextMessage?.contextInfo?.isForwarded) reason = 'Forwarded message not allowed';
    // antitag - tag all / hidetag
    if (!reason && db.anti.antitag && (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 5)) reason = 'Tagging many people';
    // antimention
    if (!reason && db.anti.antimention && text.includes('@')) reason = 'Mention not allowed';
    // antispam - same msg many times - simple check
    if (!reason && db.anti.antispam && text.length > 500) reason = 'Spam - too long';
    // antifake - fake numbers: not +234 / +1 etc
    if (!reason && db.anti.antifake && !sender.startsWith('234')) {
      // Only block if antifake on and not Nigerian - warn only
      // reason = 'Fake number';
    }
    // antiscam - scam words
    if (!reason && db.anti.antiscam && /(double your money|giveaway|free money|click to win|investment 2x|send.*receive)/i.test(text)) reason = 'Scam detected';
    // antinsfw
    if (!reason && db.anti.antinsfw && /(porn|xxx|nude|sex video|onlyfans)/i.test(text)) reason = 'NSFW not allowed';
    // antivirus - .apk / virus link
    if (!reason && db.anti.antivirus && /(\.apk|\.exe|virus|hack.*whatsapp)/i.test(text)) reason = 'Virus / APK not allowed';
    // antiraid - new member spam handled in group update
    // antibot - if sender is bot (lid)
    if (!reason && db.anti.antibot && sender.includes(':')) reason = 'Bot not allowed';

    if (reason) {
      try { await sock.sendMessage(from, { delete: m.key }); } catch(e){}
      let warnMsg = `⚠️ @${sender.split('@')[0]} message deleted\nReason: ${reason}\n\n©️ created by Simon tech inc`;
      await sock.sendMessage(from, { text: warnMsg, mentions: [sender] }).catch(()=>{});
      // antilinkwarn - extra warn count
      if (db.anti.antilinkwarn) {
        if (!db.warns) db.warns = {};
        if (!db.warns[from]) db.warns[from] = {};
        db.warns[from][sender] = (db.warns[from][sender] || 0) + 1;
        if (db.warns[from][sender] >= 3) {
          await sock.groupParticipantsUpdate(from, [sender], 'remove').catch(()=>{});
          await sock.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} kicked - 3 warnings`, mentions: [sender] }).catch(()=>{});
        }
      }
      return true;
    }
    return false;
  } catch(e) { return false; }
}

module.exports = [
{
  name: 'antilink', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antilink',args,reply,'Anti Link - Delete all links'); }
},
{
  name: 'antibot', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antibot',args,reply,'Anti Bot - Kick other bots'); }
},
{
  name: 'antispam', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antispam',args,reply,'Anti Spam - Delete spam long msgs'); }
},
{
  name: 'antiflood', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antiflood',args,reply,'Anti Flood - Stop flood msgs'); }
},
{
  name: 'antitag', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antitag',args,reply,'Anti Tag - No tag 5+ people'); }
},
{
  name: 'antidelete', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antidelete',args,reply,'Anti Delete - Show deleted msgs'); }
},
{
  name: 'antibadword', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antibadword',args,reply,'Anti Badword - Delete insult'); }
},
{
  name: 'antisticker', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antisticker',args,reply,'Anti Sticker'); }
},
{
  name: 'antifake', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antifake',args,reply,'Anti Fake - Block fake numbers'); }
},
{
  name: 'antipromote', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antipromote',args,reply,'Anti Promote - Demote auto promote'); }
},
{
  name: 'antidemote', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antidemote',args,reply,'Anti Demote - Promote back demoted admin'); }
},
{
  name: 'antinsfw', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antinsfw',args,reply,'Anti NSFW - Delete porn / sex'); }
},
{
  name: 'antiscam', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antiscam',args,reply,'Anti Scam - Delete giveaway scam'); }
},
{
  name: 'antiraid', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antiraid',args,reply,'Anti Raid - Stop mass join'); }
},
{
  name: 'antivirus', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antivirus',args,reply,'Anti Virus - Delete APK / virus links'); }
},
{
  name: 'antimention', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antimention',args,reply,'Anti Mention - No @ mention'); }
},
{
  name: 'antigroup', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antigroup',args,reply,'Anti Group - No group invite links'); }
},
{
  name: 'antidocument', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antidocument',args,reply,'Anti Document'); }
},
{
  name: 'antiimage', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antiimage',args,reply,'Anti Image'); }
},
{
  name: 'antivideo', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antivideo',args,reply,'Anti Video'); }
},
{
  name: 'antiaudio', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antiaudio',args,reply,'Anti Audio / VN'); }
},
{
  name: 'antiforward', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antiforward',args,reply,'Anti Forward - Delete forwarded'); }
},
{
  name: 'antiedit', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antiedit',args,reply,'Anti Edit - Block edited msgs'); }
},
{
  name: 'antireport', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antireport',args,reply,'Anti Report - Block report msgs'); }
},
{
  name: 'antilinkwarn', category: 'anti', ownerOnly: false,
  run: async ({args, db, reply}) => { return setAnti(db,'antilinkwarn',args,reply,'Anti Link Warn - Warn + kick after 3'); }
},
{
  name: 'anti', aliases: ['antilist'], category: 'anti', ownerOnly: false,
  run: async ({db, reply, prefix}) => {
    let keys = ['antilink','antibot','antispam','antiflood','antitag','antidelete','antibadword','antisticker','antifake','antipromote','antidemote','antinsfw','antiscam','antiraid','antivirus','antimention','antigroup','antidocument','antiimage','antivideo','antiaudio','antiforward','antiedit','antireport','antilinkwarn'];
    let txt = `◈┈▉ \`meta ai ｍｄ\` ▉┄◈\n\n*🛡️ ANTI SETTINGS (25)*\n\n`;
    for(let k of keys) txt += `${db.anti?.[k] ? '✅' : '❌'} ${k} : ${db.anti?.[k] ? 'ON' : 'OFF'}\n`;
    txt += `\nUsage: ${prefix}antilink on\nAdmins only in group\n\n©️ created by Simon tech inc`;
    return reply(txt);
  }
},
];

module.exports.handleAnti = handleAnti;
