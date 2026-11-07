// META AI MD - Helper Functions
// Developer: SIMON TECH INC - FIXED LID + PN

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys');

const OWNER = '2348102350169';
const FOOTER = '©️ Created by Simon Tech Inc';
const DB_FILE = path.join(__dirname, '../database.json');

// ---------- HELPERS ----------
function cleanNumber(text){ return String(text || '').replace(/[^0-9]/g, ''); }
function getNum(jid){ return String(jid||'').split('@')[0].split(':')[0].replace(/[^0-9]/g,''); }
function getNums(...jids){ let o=[]; for(let j of jids){ let n=getNum(j); if(n) o.push(n); } return [...new Set(o)]; }

// ---------- DATABASE ----------
function loadDB(){
  let db=null;
  try{
    if(fs.existsSync(DB_FILE)) db=JSON.parse(fs.readFileSync(DB_FILE,'utf8'));
  }catch(e){ console.error('Database load error:', e.message); }
  if(!db || typeof db!=='object') db={};
  db.owners = Array.isArray(db.owners) ? db.owners : [];
  if(!db.owners.includes(OWNER)) db.owners.push(OWNER);
  if(!db.owner) db.owner=OWNER;
  // FIXED: Don't overwrite saved prefix/mode. Keep saved, fallback to defaults only if missing
  db.settings = { prefix:'.', mode:'public', botName:'META AI MD', ...(db.settings||{}) };
  // FIXED: Ensure ALL keys index/group/owner/anti/auto use
  for(const key of ['auto','anti','warns','welcome','goodbye','rules','chat','group','banned','muted','bots']){
    if(key==='banned' || key==='muted' || key==='bots'){
      // banned = array, muted = {}, bots = array
      if(key==='banned' && !Array.isArray(db.banned)) db.banned=[];
      if(key==='bots' && !Array.isArray(db.bots)) db.bots=[];
      if(key==='muted' && (!db.muted || typeof db.muted!=='object')) db.muted={};
    } else {
      db[key]=db[key]||{};
    }
  }
  return db;
}
function saveDB(db){
  try{ fs.mkdirSync(path.dirname(DB_FILE),{recursive:true}); fs.writeFileSync(DB_FILE, JSON.stringify(db,null,2)); return true; }
  catch(e){ console.error('Database save error:', e.message); return false; }
}

// ---------- OWNER - FIXED LID + PN + db.owners ----------
function isOwner(jid, db, extraJid){
  let nums=getNums(jid, extraJid);
  if(!nums.length) return false;
  if(nums.includes(OWNER)) return true;
  let owners=[];
  if(db?.owner) owners.push(...getNums(db.owner));
  if(Array.isArray(db?.owners)) db.owners.forEach(o=>owners.push(...getNums(o)));
  if(db?.settings?.owner) owners.push(...getNums(db.settings.owner));
  // Also check config owners if passed via db? index.js already checks config, here check db only
  return nums.some(n=>owners.includes(n));
}
function isOwnerMessage(m, db, config){
  // Check sender LID + PN together
  let sender=m?.key?.participant || m?.key?.remoteJid;
  let senderPn=m?.key?.participantPn || m?.key?.remoteJidAlt || sender;
  if(isOwner(sender, db, senderPn)) return true;
  if(config?.ownerNumber && getNums(sender, senderPn).includes(getNum(config.ownerNumber))) return true;
  if(Array.isArray(config?.owners) && config.owners.some(o=>getNums(sender, senderPn).includes(getNum(o)))) return true;
  return false;
}

// ---------- TARGET - FIXED ----------
function getTarget(m, args=[]){
  let ctxInfo = m?.message?.extendedTextMessage?.contextInfo || m?.message?.imageMessage?.contextInfo || m?.message?.videoMessage?.contextInfo || m?.message?.documentMessage?.contextInfo || m?.message?.stickerMessage?.contextInfo || {};
  // 1. Mentioned
  if(ctxInfo.mentionedJid?.length) return ctxInfo.mentionedJid[0];
  // 2. Quoted / replied - FIXED: Was missing, this is why .kick (reply) failed
  if(ctxInfo.participant) return ctxInfo.participant;
  if(ctxInfo.quotedMessage && ctxInfo.participant) return ctxInfo.participant;
  // 3. Number in args
  if(args?.[0]){
    let number=cleanNumber(args[0]);
    if(number.length>=7) return number+'@s.whatsapp.net';
  }
  return null;
}
function getPn(jid, md){
  // If jid is LID, try resolve to PN via group metadata
  if(!String(jid||'').endsWith('@lid')) return jid;
  if(md){
    let p=findParticipant(md, jid);
    if(p?.phoneNumber) return p.phoneNumber;
  }
  return jid;
}
// LID -> PN via metadata. If no metadata, returns original (caller must pass md)
async function lidToPn(jid, mdOrSock, groupJid){
  if(!String(jid||'').endsWith('@lid')) return jid;
  try{
    let md=null;
    if(mdOrSock && mdOrSock.participants) md=mdOrSock;
    else if(mdOrSock && groupJid) md=await mdOrSock.groupMetadata(groupJid).catch(()=>null);
    if(md){ let p=findParticipant(md, jid); if(p?.phoneNumber) return p.phoneNumber; }
  }catch{}
  return jid;
}

// ---------- TEXT - FIXED ephemeral / viewOnce ----------
function getText(m){
  let msg=m?.message||{};
  // Unwrap ephemeral / viewOnce / viewOnceV2
  if(msg.ephemeralMessage?.message) msg=msg.ephemeralMessage.message;
  if(msg.viewOnceMessage?.message) msg=msg.viewOnceMessage.message;
  if(msg.viewOnceMessageV2?.message) msg=msg.viewOnceMessageV2.message;
  if(msg.documentWithCaptionMessage?.message) msg=msg.documentWithCaptionMessage.message;
  return msg.conversation || msg.extendedTextMessage?.text || msg.imageMessage?.caption || msg.videoMessage?.caption || msg.documentMessage?.caption || '';
}
function getQuoted(m){
  let msg=m?.message||{};
  if(msg.ephemeralMessage?.message) msg=msg.ephemeralMessage.message;
  return msg.extendedTextMessage?.contextInfo?.quotedMessage || msg.imageMessage?.contextInfo?.quotedMessage || msg.videoMessage?.contextInfo?.quotedMessage || null;
}
function isGroup(jid){ return String(jid||'').endsWith('@g.us'); }

// ---------- GROUP - FIXED LID ----------
function findParticipant(md, uid){
  if(!md || !uid) return null;
  let nums=getNums(uid);
  return (md.participants||[]).find(p=>{
    if(p.id===uid || p.phoneNumber===uid) return true;
    return getNums(p.id, p.phoneNumber).some(n=>nums.includes(n));
  });
}
async function getGroupMeta(sock, jid){
  try{ return await sock.groupMetadata(jid); }catch{ return null; }
}
async function getAdmins(sock, jid){
  try{
    const md=await sock.groupMetadata(jid);
    const participants=md.participants||[];
    return {
      md,
      admins: participants.filter(p=>p.admin).map(p=>p.id),
      all: participants.map(p=>p.id),
      // FIXED: isAdmin now checks LID + PN + number
      isAdmin: (id)=>{ let p=findParticipant(md, id); return !!p?.admin; },
      isBotAdmin: (sock2)=>{ let s=sock2||sock; let p=findParticipant(md, s.user?.id) || findParticipant(md, s.user?.lid); return !!p?.admin; }
    };
  }catch{ return { md:null, admins:[], all:[], isAdmin:()=>false, isBotAdmin:()=>false }; }
}

// ---------- MEDIA ----------
async function downloadMedia(m){
  try{
    let msg=m.message||{};
    if(msg.ephemeralMessage?.message) msg=msg.ephemeralMessage.message;
    if(msg.viewOnceMessage?.message) msg=msg.viewOnceMessage.message;
    if(msg.viewOnceMessageV2?.message) msg=msg.viewOnceMessageV2.message;
    const type=getContentType(msg);
    if(!type || !type.endsWith('Message')) return null;
    const stream=await downloadContentFromMessage(msg[type], type.replace('Message','').toLowerCase());
    const chunks=[]; for await(const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
  }catch(e){ console.error('Media download error:', e.message); return null; }
}

// ---------- HTTP ----------
async function getBuffer(url, opts={}){ const r=await axios.get(url,{responseType:'arraybuffer', timeout:30000, ...opts}); return Buffer.from(r.data); }
async function fetchJson(url, opts={}){ const r=await axios.get(url,{timeout:20000, ...opts}); return r.data; }
async function fetchText(url){ const r=await axios.get(url,{timeout:20000}); return r.data; }

// ---------- TIME ----------
function runtime(){ const s=Math.floor(process.uptime()); const h=Math.floor(s/3600); const mi=Math.floor((s%3600)/60); const se=s%60; return `${h}h ${mi}m ${se}s`; }
function formatNumber(n){ return Number(n).toLocaleString('en-US'); }

// ---------- REPLY ----------
function makeReply(sock){
  return async (m, text, opts={})=> sock.sendMessage(m.key.remoteJid, {text:String(text)+'\n\n'+FOOTER, ...opts}, {quoted:m});
}

module.exports={
  OWNER, FOOTER, loadDB, saveDB,
  isOwner, isOwnerMessage, cleanNumber, getNum, getNums,
  getTarget, getText, getQuoted, isGroup,
  findParticipant, getGroupMeta, getAdmins, getPn, lidToPn,
  downloadMedia, getBuffer, fetchJson, fetchText, runtime, formatNumber, makeReply
};
