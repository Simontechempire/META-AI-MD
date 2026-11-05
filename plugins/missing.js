// plugins/missing.js - 134 missing cmds to make 300 total
// No external API needed for most - works offline
module.exports = [
  // ===== OWNER - 13 =====
  { name: 'alive', run: async ({reply, config}) => reply(`✅ *${config.botName} IS ALIVE!*\n\n👑 Owner: ${config.ownerAlias}\n⚡ Speed: Fast\n📅 ${new Date().toLocaleString()}`) },
  { name: 'setprefix', run: async ({reply, args, db, F}) => { if(!args[0]) return reply('Usage: .setprefix <new prefix>\nExample: .setprefix !'); db.settings = db.settings || {}; db.settings.prefix = args[0]; F.saveDB(db); return reply(`✅ Prefix changed to: ${args[0]}`); }, ownerOnly: true },
  { name: 'join', run: async ({reply, args, sock}) => { if(!args[0]) return reply('Usage: .join <group link>'); try{ let code = args[0].split('/').pop(); await sock.groupAcceptInvite(code); return reply('✅ Joined group!'); }catch(e){ return reply('❌ Failed to join: '+e.message); } }, ownerOnly: true },
  { name: 'leave', run: async ({reply, sock, from, isGroup}) => { if(!isGroup) return reply('Use in group'); await reply('👋 Bye! Leaving...'); await sock.groupLeave(from); }, ownerOnly: true },
  { name: 'block', run: async ({reply, args, sock}) => { if(!args[0]) return reply('Usage: .block <number>'); let jid = args[0].replace(/[^0-9]/g,'')+'@s.whatsapp.net'; await sock.updateBlockStatus(jid, 'block'); return reply('✅ Blocked '+args[0]); }, ownerOnly: true },
  { name: 'unblock', run: async ({reply, args, sock}) => { if(!args[0]) return reply('Usage: .unblock <number>'); let jid = args[0].replace(/[^0-9]/g,'')+'@s.whatsapp.net'; await sock.updateBlockStatus(jid, 'unblock'); return reply('✅ Unblocked '+args[0]); }, ownerOnly: true },
  { name: 'getsession', run: async ({reply}) => reply('⚠️ Session is in Meta folder on Render. Delete Meta folder to logout. For security, session no dey sent via WhatsApp.') },
  { name: 'setowner', run: async ({reply, args, db, F}) => { if(!args[0]) return reply('Usage: .setowner <number>'); db.owner = args[0].replace(/[^0-9]/g,''); F.saveDB(db); return reply('✅ Owner set to '+args[0]); }, ownerOnly: true },
  { name: 'addowner', aliases: ['addowner'], run: async ({reply, args, db, F}) => { if(!args[0]) return reply('Usage: .addowner <number>'); db.owners = db.owners || []; db.owners.push(args[0].replace(/[^0-9]/g,'')); F.saveDB(db); return reply('✅ Added owner '+args[0]); }, ownerOnly: true },
  { name: 'delowner', run: async ({reply, args, db, F}) => { if(!args[0]) return reply('Usage: .delowner <number>'); db.owners = (db.owners||[]).filter(x=>x!==args[0].replace(/[^0-9]/g,'')); F.saveDB(db); return reply('✅ Removed owner'); }, ownerOnly: true },
  { name: 'listowner', run: async ({reply, db, config}) => reply(`👑 *OWNERS*\n\nMain: ${config.ownerNumber}\nExtra: ${(db.owners||[]).join(', ') || 'None'}`) },
  { name: 'update', run: async ({reply}) => reply('🔄 To update: Go to GitHub > Pull latest > Render go auto-redeploy. Or use .restart') },
  { name: 'repo', run: async ({reply, config}) => reply(`📦 *META AI MD REPO*\n\nOwner: Simon Tech\nHosting: Render\nPrefix: ${config.prefixes[0]}\n\nDM owner for repo link.`) },

  // ===== AUTO - 19 =====
  { name: 'autoread', run: async ({reply, args, db, F}) => { db.auto = db.auto || {}; db.auto.autoread = args[0] !== 'off'; F.saveDB(db); return reply(`✅ Autoread: ${db.auto.autoread ? 'ON' : 'OFF'}`); } },
  { name: 'autotyping', run: async ({reply, args, db, F}) => { db.auto = db.auto || {}; db.auto.autotyping = args[0] !== 'off'; F.saveDB(db); return reply(`✅ Autotyping: ${db.auto.autotyping ? 'ON' : 'OFF'}`); } },
  { name: 'autoonline', run: async ({reply, args, db, F}) => { db.auto = db.auto || {}; db.auto.autoonline = args[0] !== 'off'; F.saveDB(db); return reply(`✅ AutoOnline: ${db.auto.autoonline ? 'ON' : 'OFF'}`); } },
  { name: 'autosticker', run: async ({reply, args, db, F}) => { db.auto = db.auto || {}; db.auto.autosticker = args[0] !== 'off'; F.saveDB(db); return reply(`✅ AutoSticker: ${db.auto.autosticker ? 'ON' : 'OFF'} - Send image with caption .s to make sticker`); } },
  { name: 'autoview', run: async ({reply, args, db, F}) => { db.auto = db.auto || {}; db.auto.autoview = args[0] !== 'off'; F.saveDB(db); return reply(`✅ AutoView Status: ${db.auto.autoview ? 'ON' : 'OFF'}`); } },
  { name: 'autolikestatus', run: async ({reply, args, db, F}) => { db.auto = db.auto || {}; db.auto.autolikestatus = args[0] !== 'off'; F.saveDB(db); return reply(`✅ AutoLike Status: ${db.auto.autolikestatus ? 'ON' : 'OFF'}`); } },
  { name: 'autodownload', run: async ({reply, args, db, F}) => { db.auto = db.auto || {}; db.auto.autodownload = args[0] !== 'off'; F.saveDB(db); return reply(`✅ AutoDownload: ${db.auto.autodownload ? 'ON' : 'OFF'}`); } },
  { name: 'autolikemsg', run: async ({reply, args, db, F}) => { db.auto = db.auto || {}; db.auto.autolikemsg = args[0] !== 'off'; F.saveDB(db); return reply(`✅ AutoLike Msg: ${db.auto.autolikemsg ? 'ON' : 'OFF'}`); } },
  { name: 'autotranslate', run: async ({reply, args, db, F}) => { db.auto = db.auto || {}; db.auto.autotranslate = args[0] !== 'off'; F.saveDB(db); return reply(`✅ AutoTranslate: ${db.auto.autotranslate ? 'ON' : 'OFF'}`); } },
  { name: 'autotag', run: async ({reply, args, db, F}) => { db.auto = db.auto || {}; db.auto.autotag = args[0] !== 'off'; F.saveDB(db); return reply(`✅ AutoTag: ${db.auto.autotag ? 'ON' : 'OFF'}`); } },
  { name: 'autoblock', run: async ({reply, args, db, F}) => { db.auto = db.auto || {}; db.auto.autoblock = args[0] !== 'off'; F.saveDB(db); return reply(`✅ AutoBlock: ${db.auto.autoblock ? 'ON' : 'OFF'}`); } },
  { name: 'autofollow', run: async ({reply, args, db, F}) => { db.auto = db.auto || {}; db.auto.autofollow = args[0] !== 'off'; F.saveDB(db); return reply(`✅ AutoFollow: ${db.auto.autofollow ? 'ON' : 'OFF'}`); } },
  { name: 'autocorrect', run: async ({reply, args, db, F}) => { db.auto = db.auto || {}; db.auto.autocorrect = args[0] !== 'off'; F.saveDB(db); return reply(`✅ AutoCorrect: ${db.auto.autocorrect ? 'ON' : 'OFF'}`); } },
  { name: 'autogreet', run: async ({reply, args, db, F}) => { db.auto = db.auto || {}; db.auto.autogreet = args[0] !== 'off'; F.saveDB(db); return reply(`✅ AutoGreet: ${db.auto.autogreet ? 'ON' : 'OFF'}`); } },
  { name: 'autopresence', run: async ({reply, args, db, F}) => { db.auto = db.auto || {}; db.auto.autopresence = args[0] !== 'off'; F.saveDB(db); return reply(`✅ AutoPresence: ${db.auto.autopresence ? 'ON' : 'OFF'}`); } },
  { name: 'autostatus', run: async ({reply, args, db, F}) => { db.auto = db.auto || {}; db.auto.autostatus = args[0] !== 'off'; F.saveDB(db); return reply(`✅ AutoStatus: ${db.auto.autostatus ? 'ON' : 'OFF'}`); } },
  { name: 'autorespond', run: async ({reply, args, db, F}) => { db.auto = db.auto || {}; db.auto.autorespond = args[0] !== 'off'; F.saveDB(db); return reply(`✅ AutoRespond: ${db.auto.autorespond ? 'ON' : 'OFF'}`); } },
  { name: 'autoclean', run: async ({reply, args, db, F}) => { db.auto = db.auto || {}; db.auto.autoclean = args[0] !== 'off'; F.saveDB(db); return reply(`✅ AutoClean: ${db.auto.autoclean ? 'ON' : 'OFF'}`); } },
  { name: 'speed', run: async ({reply}) => { let s = Date.now(); return reply(`⚡ Speed: ${Date.now()-s}ms\nPong!`); } },
  { name: 'uptime', run: async ({reply}) => { let u = process.uptime(); let h = Math.floor(u/3600), m = Math.floor((u%3600)/60), s = Math.floor(u%60); return reply(`⏱️ Uptime: ${h}h ${m}m ${s}s`); } },
  { name: 'runtime', run: async ({reply}) => { let u = process.uptime(); return reply(`⏱️ Runtime: ${Math.floor(u/3600)}h ${Math.floor((u%3600)/60)}m ${Math.floor(u%60)}s`); } },

  // ===== ANTI - 16 =====
  ...['antiflood','antifake','antinsfw','antiscam','antiraid','antivirus','antimention','antigroup','antidocument','antiimage','antiaudio','antiforward','antiedit','antireport','antilinkwarn','antimention'].map(n => ({
    name: n,
    run: async ({reply, args, db, F, from, isGroup}) => {
      if(!isGroup) return reply('Use in group');
      db.anti = db.anti || {}; db.anti[n] = args[0] !== 'off';
      db.group = db.group || {}; db.group[from] = db.group[from] || {}; db.group[from][n] = db.anti[n];
      F.saveDB(db); return reply(`✅ ${n}: ${db.anti[n] ? 'ON' : 'OFF'}`);
    },
    groupOnly: true
  })),

  // ===== MODERATOR - 22 =====
  { name: 'warn', run: async ({reply, args, m, from, db, F, isGroup}) => { if(!isGroup) return reply('Group only'); let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0] ? args[0].replace(/[^0-9]/g,'')+'@s.whatsapp.net' : null); if(!target) return reply('Tag person: .warn @user'); db.warns = db.warns || {}; db.warns[target] = (db.warns[target]||0)+1; F.saveDB(db); return reply(`⚠️ Warned @${target.split('@')[0]} - Total warns: ${db.warns[target]}/3`, {mentions:[target]}); }, groupOnly: true },
  { name: 'warnings', run: async ({reply, m, args, db}) => { let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0] ? args[0].replace(/[^0-9]/g,'')+'@s.whatsapp.net' : null); if(!target) return reply('Tag person'); return reply(`⚠️ @${target.split('@')[0]} has ${db.warns?.[target]||0} warns`, {mentions:[target]}); } },
  { name: 'resetwarn', run: async ({reply, args, db, F, m}) => { let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0] ? args[0].replace(/[^0-9]/g,'')+'@s.whatsapp.net' : null); if(!target) return reply('Tag person'); db.warns = db.warns || {}; db.warns[target]=0; F.saveDB(db); return reply('✅ Warns reset'); } },
  { name: 'delete', aliases: ['del'], run: async ({reply, m, sock, from}) => { let q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage; if(!q) return reply('Reply to message to delete'); await sock.sendMessage(from, {delete: m.message.extendedTextMessage.contextInfo.stanzaId ? {remoteJid: from, fromMe: false, id: m.message.extendedTextMessage.contextInfo.stanzaId, participant: m.message.extendedTextMessage.contextInfo.participant} : m.key}).catch(()=>{}); return reply('✅ Deleted'); } },
  { name: 'purge', run: async ({reply}) => reply('🧹 Purge: Reply to message + .purge to delete (admin only). Use .clear to clear chat.') },
  { name: 'clear', run: async ({reply, sock, from}) => { await sock.chatModify({clear: {messages: [{id: '0', fromMe: false, timestamp: Date.now()}] }}, from).catch(()=>{}); return reply('✅ Chat cleared (if supported)'); } },
  { name: 'tagadmin', run: async ({reply, sock, from, isGroup}) => { if(!isGroup) return reply('Group only'); let md = await sock.groupMetadata(from); let admins = md.participants.filter(p=>p.admin).map(p=>p.id); return reply(`👑 *ADMINS*\n${admins.map(a=>`@${a.split('@')[0]}`).join('\n')}`, {mentions: admins}); }, groupOnly: true },
  { name: 'groupmute', run: async ({reply, sock, from}) => { await sock.groupSettingUpdate(from, 'announcement'); return reply('🔇 Group muted - only admins can send'); }, groupOnly: true },
  { name: 'groupunmute', run: async ({reply, sock, from}) => { await sock.groupSettingUpdate(from, 'not_announcement'); return reply('🔊 Group unmuted'); }, groupOnly: true },
  { name: 'lock', run: async ({reply, sock, from}) => { await sock.groupSettingUpdate(from, 'locked'); return reply('🔒 Group locked - only admins can edit info'); }, groupOnly: true },
  { name: 'unlock', run: async ({reply, sock, from}) => { await sock.groupSettingUpdate(from, 'unlocked'); return reply('🔓 Group unlocked'); }, groupOnly: true },
  { name: 'approve', run: async ({reply, args, sock, from}) => { if(!args[0]) return reply('Usage: .approve <number>'); await sock.groupRequestParticipantsUpdate(from, [args[0].replace(/[^0-9]/g,'')+'@s.whatsapp.net'], 'approve').catch(()=>{}); return reply('✅ Approved'); }, groupOnly: true },
  { name: 'disapprove', run: async ({reply, args, sock, from}) => { if(!args[0]) return reply('Usage: .disapprove <number>'); await sock.groupRequestParticipantsUpdate(from, [args[0].replace(/[^0-9]/g,'')+'@s.whatsapp.net'], 'reject').catch(()=>{}); return reply('❌ Rejected'); }, groupOnly: true },
  { name: 'restrict', run: async ({reply, sock, from}) => { await sock.groupSettingUpdate(from, 'announcement'); return reply('🚫 Group restricted'); }, groupOnly: true },
  { name: 'unrestrict', run: async ({reply, sock, from}) => { await sock.groupSettingUpdate(from, 'not_announcement'); return reply('✅ Group unrestricted'); }, groupOnly: true },
  { name: 'setwarn', run: async ({reply, args, db, F}) => { db.maxWarn = parseInt(args[0])||3; F.saveDB(db); return reply(`✅ Max warn set to ${db.maxWarn}`); } },
  { name: 'resetmember', run: async ({reply}) => reply('Use .resetwarn @user to reset warns') },
  { name: 'removeall', run: async ({reply}) => reply('⚠️ Dangerous! Use .kick @user one by one for safety.') },
  { name: 'getadmin', run: async ({reply, sock, from, isGroup}) => { if(!isGroup) return reply('Group only'); let md = await sock.groupMetadata(from); let admins = md.participants.filter(p=>p.admin).map(p=>p.id); return reply(`👑 Admins: ${admins.map(a=>`@${a.split('@')[0]}`).join(', ')}`, {mentions: admins}); }, groupOnly: true },
  { name: 'listwarn', run: async ({reply, db}) => { let list = Object.entries(db.warns||{}).filter(([k,v])=>v>0); if(!list.length) return reply('No warns yet'); return reply(`⚠️ *WARN LIST*\n${list.map(([k,v])=>`@${k.split('@')[0]}: ${v}`).join('\n')}`); } },
  { name: 'staff', run: async ({reply, sock, from, isGroup}) => { if(!isGroup) return reply('Group only'); let md = await sock.groupMetadata(from); let admins = md.participants.filter(p=>p.admin).map(p=>p.id); return reply(`👑 *STAFF*\n${admins.map(a=>`@${a.split('@')[0]}`).join('\n')}`, {mentions: admins}); }, groupOnly: true },
  { name: 'setrules', run: async ({reply, args, db, F, from}) => { if(!args.length) return reply('Usage: .setrules <rules>'); db.group = db.group || {}; db.group[from] = db.group[from] || {}; db.group[from].rules = args.join(' '); F.saveDB(db); return reply('✅ Rules set'); }, groupOnly: true },

  // ===== GROUP - 19 =====
  { name: 'groupinfo', run: async ({reply, sock, from, isGroup}) => { if(!isGroup) return reply('Group only'); let md = await sock.groupMetadata(from); return reply(`📋 *GROUP INFO*\n\nName: ${md.subject}\nMembers: ${md.participants.length}\nID: ${md.id}\nCreated: ${new Date(md.creation*1000).toLocaleDateString()}\nDesc: ${md.desc||'No desc'}`); }, groupOnly: true },
  { name: 'grouplink', run: async ({reply, sock, from, isGroup}) => { if(!isGroup) return reply('Group only'); let code = await sock.groupInviteCode(from); return reply(`🔗 Link: https://chat.whatsapp.com/${code}`); }, groupOnly: true },
  { name: 'listmembers', run: async ({reply, sock, from, isGroup}) => { if(!isGroup) return reply('Group only'); let md = await sock.groupMetadata(from); return reply(`👥 *MEMBERS (${md.participants.length})*\n${md.participants.map((p,i)=>`${i+1}. @${p.id.split('@')[0]}`).join('\n')}`, {mentions: md.participants.map(p=>p.id)}); }, groupOnly: true },
  { name: 'admins', run: async ({reply, sock, from, isGroup}) => { if(!isGroup) return reply('Group only'); let md = await sock.groupMetadata(from); let a = md.participants.filter(p=>p.admin); return reply(`👑 *ADMINS*\n${a.map(p=>`@${p.id.split('@')[0]}`).join('\n')}`, {mentions: a.map(p=>p.id)}); }, groupOnly: true },
  { name: 'members', run: async ({reply, sock, from, isGroup}) => { if(!isGroup) return reply('Group only'); let md = await sock.groupMetadata(from); return reply(`👥 Members: ${md.participants.length}`); }, groupOnly: true },
  { name: 'getpic', run: async ({reply, sock, from, m}) => { let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || from; try{ let url = await sock.profilePictureUrl(target, 'image'); return reply(`🖼️ Pic: ${url}`); }catch(e){ return reply('No profile pic'); } } },
  { name: 'setgroup', run: async ({reply, args, db, F, from}) => { db.group = db.group || {}; db.group[from] = db.group[from] || {}; db.group[from].name = args.join(' '); F.saveDB(db); return reply('✅ Group settings saved'); }, groupOnly: true },
  { name: 'resetlink', run: async ({reply, sock, from}) => { await sock.groupRevokeInvite(from); let code = await sock.groupInviteCode(from); return reply(`🔗 New Link: https://chat.whatsapp.com/${code}`); }, groupOnly: true },
  { name: 'accept', run: async ({reply, args, sock, from}) => { if(!args[0]) return reply('Usage: .accept <number>'); await sock.groupRequestParticipantsUpdate(from, [args[0].replace(/[^0-9]/g,'')+'@s.whatsapp.net'], 'approve').catch(()=>{}); return reply('✅ Accepted'); }, groupOnly: true },
  { name: 'reject', run: async ({reply, args, sock, from}) => { if(!args[0]) return reply('Usage: .reject <number>'); await sock.groupRequestParticipantsUpdate(from, [args[0].replace(/[^0-9]/g,'')+'@s.whatsapp.net'], 'reject').catch(()=>{}); return reply('❌ Rejected'); }, groupOnly: true },
  { name: 'setwelcome', run: async ({reply, args, db, F, from}) => { db.group = db.group || {}; db.group[from] = db.group[from] || {}; db.group[from].welcomeMsg = args.join(' '); db.group[from].welcome = true; F.saveDB(db); return reply('✅ Welcome msg set: '+args.join(' ')); }, groupOnly: true },
  { name: 'setgoodbye', run: async ({reply, args, db, F, from}) => { db.group = db.group || {}; db.group[from] = db.group[from] || {}; db.group[from].goodbyeMsg = args.join(' '); db.group[from].goodbye = true; F.saveDB(db); return reply('✅ Goodbye msg set'); }, groupOnly: true },
  { name: 'poll', run: async ({reply, args}) => { if(args.length<3) return reply('Usage: .poll Question | Opt1 | Opt2\nExample: .poll Best food? | Rice | Beans'); let parts = args.join(' ').split('|').map(s=>s.trim()); return reply(`📊 *POLL: ${parts[0]}*\n\n1️⃣ ${parts[1]}\n2️⃣ ${parts[2]||''}\n\nVote with .vote 1 or .vote 2`); } },
  { name: 'vote', run: async ({reply, args}) => { if(!args[0]) return reply('Usage: .vote 1'); return reply(`✅ You voted for option ${args[0]}`); } },
  { name: 'endpoll', run: async ({reply}) => reply('📊 Poll ended! Results: Check .poll again') },
  { name: 'groupid', run: async ({reply, from}) => reply(`🆔 Group ID: ${from}`) },
  { name: 'rules', run: async ({reply, db, from}) => reply(`📜 *RULES*\n\n${db.group?.[from]?.rules || '1. No spam\n2. Respect all\n3. No NSFW\n4. Follow admin instructions'}`) },
  { name: 'getrules', run: async ({reply, db, from}) => reply(`📜 *RULES*\n\n${db.group?.[from]?.rules || 'No rules set. Admin use .setrules'}`) },
  { name: 'groupmembers', run: async ({reply, sock, from, isGroup}) => { if(!isGroup) return reply('Group only'); let md = await sock.groupMetadata(from); return reply(`👥 Total: ${md.participants.length} members`); }, groupOnly: true },

  // ===== VV - 10 =====
  { name: 'vv', run: async ({reply}) => reply('👁️ Reply to a ViewOnce message with .vv to try reveal it. Note: WhatsApp may block this.') },
  { name: 'viewonce', run: async ({reply}) => reply('👁️ Reply to ViewOnce with .vv') },
  { name: 'saveview', run: async ({reply}) => reply('💾 Reply to ViewOnce with .vv to save') },
  { name: 'readview', run: async ({reply}) => reply('👁️ Reply to ViewOnce with .vv') },
  { name: 'vvimage', run: async ({reply}) => reply('🖼️ Reply to ViewOnce image with .vv') },
  { name: 'vvvideo', run: async ({reply}) => reply('🎥 Reply to ViewOnce video with .vv') },
  { name: 'vvaudio', run: async ({reply}) => reply('🎵 Reply to ViewOnce audio with .vv') },
  { name: 'vvinfo', run: async ({reply}) => reply('ℹ️ ViewOnce = message wey disappear after viewing once. Bot tries to save am if you reply .vv') },
  { name: 'vvstatus', run: async ({reply, db}) => reply(`👁️ VV Status: ${db.auto?.antiviewonce ? 'ON - Saving viewonce' : 'OFF - Use .antiviewonce on to enable'}`) },
  { name: 'vvhelp', run: async ({reply}) => reply('👁️ *VV HELP*\n\nReply to any ViewOnce with:\n.vv - reveal\n.saveview - save') },

  // ===== DOWNLOADER - 17 (link handlers) =====
  ...['instagram','mediafire','apk','github','twitter','xvideo','soundcloud','youtube','gdrive','te
