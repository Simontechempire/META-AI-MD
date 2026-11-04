// lib/menu.js - META AI MD Menu by Simon Tech

function getMenu({ ownerName = 'META', prefix = '.', botUser = 'META AI MD', hosting = 'Render', date = new Date().toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' }) } = {}) {
  const total = 300;
  const head = `◈┈▉ \`meta ai ｍｄ\` ▉┄◈\n\n> ╭────↯\n> │ ➠ 𝙾𝚆𝙽𝙴𝚁: ${ownerName}\n> │ ➠ 𝙿𝚁𝙴𝙵𝙸𝚇: ${prefix}\n> │ ➠ 𝚃𝙾𝚃𝙰𝙻 𝙲𝙼𝙳𝚂: ${total}\n> ╰────↯\n> BOT USER: ${botUser}\n> HOSTING PLATFORM: ${hosting}\n> DATE: ${date}`;

  const p = prefix;

  return `${head}

### ᴏᴡɴᴇʀ ᴍᴇɴᴜ (1–30)

\`\`\`text
╭──────────◈
┆ ◈ ${p}menu
┆ ◈ ${p}help
┆ ◈ ${p}ping
┆ ◈ ${p}alive
┆ ◈ ${p}owner
┆ ◈ ${p}runtime
┆ ◈ ${p}botinfo
┆ ◈ ${p}restart
┆ ◈ ${p}shutdown
┆ ◈ ${p}broadcast
┆ ◈ ${p}setprefix
┆ ◈ ${p}setname
┆ ◈ ${p}setbio
┆ ◈ ${p}setpp
┆ ◈ ${p}join
┆ ◈ ${p}leave
┆ ◈ ${p}block
┆ ◈ ${p}unblock
┆ ◈ ${p}ban
┆ ◈ ${p}unban
┆ ◈ ${p}clearsession
┆ ◈ ${p}getsession
┆ ◈ ${p}setowner
┆ ◈ ${p}addowner
┆ ◈ ${p}delowner
┆ ◈ ${p}listowner
┆ ◈ ${p}public
┆ ◈ ${p}private
┆ ◈ ${p}update
┆ ◈ ${p}repo
╰──────────◈
\`\`\`

### ᴀᴜᴛᴏ ᴍᴇɴᴜ (31–55)

\`\`\`text
╭──────────◈
┆ ◈ ${p}autoread
┆ ◈ ${p}autotyping
┆ ◈ ${p}autoonline
┆ ◈ ${p}autorecording
┆ ◈ ${p}autoreact
┆ ◈ ${p}autoreply
┆ ◈ ${p}autosticker
┆ ◈ ${p}autoview
┆ ◈ ${p}autobio
┆ ◈ ${p}autolikestatus
┆ ◈ ${p}autodownload
┆ ◈ ${p}autowelcome
┆ ◈ ${p}autogoodbye
┆ ◈ ${p}autolikemsg
┆ ◈ ${p}autotranslate
┆ ◈ ${p}autotag
┆ ◈ ${p}autoblock
┆ ◈ ${p}autofollow
┆ ◈ ${p}autocorrect
┆ ◈ ${p}autogreet
┆ ◈ ${p}autopresence
┆ ◈ ${p}autostatus
┆ ◈ ${p}autorespond
┆ ◈ ${p}autoclean
┆ ◈ ${p}autoforward
╰──────────◈
\`\`\`

### ᴀɴᴛɪ ᴍᴇɴᴜ (56–80)

\`\`\`text
╭──────────◈
┆ ◈ ${p}antilink
┆ ◈ ${p}antibot
┆ ◈ ${p}antispam
┆ ◈ ${p}antiflood
┆ ◈ ${p}antitag
┆ ◈ ${p}antidelete
┆ ◈ ${p}antibadword
┆ ◈ ${p}antisticker
┆ ◈ ${p}antifake
┆ ◈ ${p}antipromote
┆ ◈ ${p}antidemote
┆ ◈ ${p}antinsfw
┆ ◈ ${p}antiscam
┆ ◈ ${p}antiraid
┆ ◈ ${p}antivirus
┆ ◈ ${p}antimention
┆ ◈ ${p}antigroup
┆ ◈ ${p}antidocument
┆ ◈ ${p}antiimage
┆ ◈ ${p}antivideo
┆ ◈ ${p}antiaudio
┆ ◈ ${p}antiforward
┆ ◈ ${p}antiedit
┆ ◈ ${p}antireport
┆ ◈ ${p}antilinkwarn
╰──────────◈
\`\`\`

### ᴍᴏᴅᴇʀᴀᴛᴏʀ ᴍᴇɴᴜ (81–110)

\`\`\`text
╭──────────◈
┆ ◈ ${p}kick
┆ ◈ ${p}add
┆ ◈ ${p}promote
┆ ◈ ${p}demote
┆ ◈ ${p}warn
┆ ◈ ${p}warnings
┆ ◈ ${p}resetwarn
┆ ◈ ${p}mute
┆ ◈ ${p}unmute
┆ ◈ ${p}delete
┆ ◈ ${p}purge
┆ ◈ ${p}clear
┆ ◈ ${p}tagadmin
┆ ◈ ${p}hidetag
┆ ◈ ${p}groupmute
┆ ◈ ${p}groupunmute
┆ ◈ ${p}lock
┆ ◈ ${p}unlock
┆ ◈ ${p}approve
┆ ◈ ${p}disapprove
┆ ◈ ${p}restrict
┆ ◈ ${p}unrestrict
┆ ◈ ${p}setwarn
┆ ◈ ${p}resetmember
┆ ◈ ${p}removeall
┆ ◈ ${p}getadmin
┆ ◈ ${p}listwarn
┆ ◈ ${p}staff
┆ ◈ ${p}setrules
┆ ◈ ${p}resetgroup
╰──────────◈
\`\`\`

### ɢʀᴏᴜᴘ ᴍᴇɴᴜ (111–140)

\`\`\`text
╭──────────◈
┆ ◈ ${p}groupinfo
┆ ◈ ${p}grouplink
┆ ◈ ${p}setname
┆ ◈ ${p}setdesc
┆ ◈ ${p}open
┆ ◈ ${p}close
┆ ◈ ${p}tagall
┆ ◈ ${p}hidetag
┆ ◈ ${p}listmembers
┆ ◈ ${p}admins
┆ ◈ ${p}members
┆ ◈ ${p}getpic
┆ ◈ ${p}setgroup
┆ ◈ ${p}resetlink
┆ ◈ ${p}revoke
┆ ◈ ${p}invite
┆ ◈ ${p}accept
┆ ◈ ${p}reject
┆ ◈ ${p}welcome
┆ ◈ ${p}goodbye
┆ ◈ ${p}setwelcome
┆ ◈ ${p}setgoodbye
┆ ◈ ${p}poll
┆ ◈ ${p}vote
┆ ◈ ${p}endpoll
┆ ◈ ${p}groupid
┆ ◈ ${p}setrules
┆ ◈ ${p}rules
┆ ◈ ${p}getrules
┆ ◈ ${p}groupmembers
╰──────────◈
\`\`\`

### ᴠᴠ ᴍᴇɴᴜ (141–150)

\`\`\`text
╭──────────◈
┆ ◈ ${p}vv
┆ ◈ ${p}viewonce
┆ ◈ ${p}saveview
┆ ◈ ${p}readview
┆ ◈ ${p}vvimage
┆ ◈ ${p}vvvideo
┆ ◈ ${p}vvaudio
┆ ◈ ${p}vvinfo
┆ ◈ ${p}vvstatus
┆ ◈ ${p}vvhelp
╰──────────◈
\`\`\`

### ᴅᴏᴡɴʟᴏᴀᴅᴇʀ ᴍᴇɴᴜ (151–180)

\`\`\`text
╭──────────◈
┆ ◈ ${p}play
┆ ◈ ${p}song
┆ ◈ ${p}video
┆ ◈ ${p}tiktok
┆ ◈ ${p}instagram
┆ ◈ ${p}facebook
┆ ◈ ${p}mediafire
┆ ◈ ${p}apk
┆ ◈ ${p}pinterest
┆ ◈ ${p}github
┆ ◈ ${p}twitter
┆ ◈ ${p}xvideo
┆ ◈ ${p}spotify
┆ ◈ ${p}soundcloud
┆ ◈ ${p}youtube
┆ ◈ ${p}ytmp3
┆ ◈ ${p}ytmp4
┆ ◈ ${p}gdrive
┆ ◈ ${p}terabox
┆ ◈ ${p}capcut
┆ ◈ ${p}threads
┆ ◈ ${p}snapchat
┆ ◈ ${p}reddit
┆ ◈ ${p}telegram
┆ ◈ ${p}npm
┆ ◈ ${p}gitclone
┆ ◈ ${p}fbdl
┆ ◈ ${p}igdl
┆ ◈ ${p}ttdl
┆ ◈ ${p}lyrics
╰──────────◈
\`\`\`

### ᴛᴏᴏʟꜱ ᴍᴇɴᴜ (181–210)

\`\`\`text
╭──────────◈
┆ ◈ ${p}weather
┆ ◈ ${p}translate
┆ ◈ ${p}calculate
┆ ◈ ${p}shorturl
┆ ◈ ${p}qr
┆ ◈ ${p}readqr
┆ ◈ ${p}ssweb
┆ ◈ ${p}fetch
┆ ◈ ${p}tinyurl
┆ ◈ ${p}base64
┆ ◈ ${p}decode
┆ ◈ ${p}encode
┆ ◈ ${p}binary
┆ ◈ ${p}hash
┆ ◈ ${p}password
┆ ◈ ${p}uuid
┆ ◈ ${p}time
┆ ◈ ${p}date
┆ ◈ ${p}timezone
┆ ◈ ${p}ipinfo
┆ ◈ ${p}whois
┆ ◈ ${p}dns
┆ ◈ ${p}urlcheck
┆ ◈ ${p}reverse
┆ ◈ ${p}define
┆ ◈ ${p}dictionary
┆ ◈ ${p}wiki
┆ ◈ ${p}npmsearch
┆ ◈ ${p}githubsearch
┆ ◈ ${p}device
╰──────────◈
\`\`\`

### ꜱᴇᴛᴛɪɴɢꜱ ᴍᴇɴᴜ (211–230)

\`\`\`text
╭──────────◈
┆ ◈ ${p}prefix
┆ ◈ ${p}public
┆ ◈ ${p}private
┆ ◈ ${p}setmode
┆ ◈ ${p}language
┆ ◈ ${p}setlang
┆ ◈ ${p}setbotname
┆ ◈ ${p}setownername
┆ ◈ ${p}settimezone
┆ ◈ ${p}setmenu
┆ ◈ ${p}setthumb
┆ ◈ ${p}setbanner
┆ ◈ ${p}setfooter
┆ ◈ ${p}setheader
┆ ◈ ${p}settheme
┆ ◈ ${p}setemoji
┆ ◈ ${p}setautobio
┆ ◈ ${p}setstatus
┆ ◈ ${p}settings
┆ ◈ ${p}resetsettings
╰──────────◈
\`\`\`

### ꜱᴛɪᴄᴋᴇʀ ᴍᴇɴᴜ (231–250)

\`\`\`text
╭──────────◈
┆ ◈ ${p}sticker
┆ ◈ ${p}toimg
┆ ◈ ${p}take
┆ ◈ ${p}attp
┆ ◈ ${p}smeme
┆ ◈ ${p}emojimix
┆ ◈ ${p}circle
┆ ◈ ${p}crop
┆ ◈ ${p}resize
┆ ◈ ${p}blur
┆ ◈ ${p}wanted
┆ ◈ ${p}trigger
┆ ◈ ${p}pixelate
┆ ◈ ${p}removebg
┆ ◈ ${p}remini
┆ ◈ ${p}stickerinfo
┆ ◈ ${p}steal
┆ ◈ ${p}wm
┆ ◈ ${p}brat
┆ ◈ ${p}qc
╰──────────◈
\`\`\`

### ғᴜɴ ᴍᴇɴᴜ (251–275)

\`\`\`text
╭──────────◈
┆ ◈ ${p}joke
┆ ◈ ${p}quote
┆ ◈ ${p}meme
┆ ◈ ${p}truth
┆ ◈ ${p}dare
┆ ◈ ${p}fact
┆ ◈ ${p}riddle
┆ ◈ ${p}answer
┆ ◈ ${p}ship
┆ ◈ ${p}compatibility
┆ ◈ ${p}rate
┆ ◈ ${p}roast
┆ ◈ ${p}compliment
┆ ◈ ${p}insult
┆ ◈ ${p}character
┆ ◈ ${p}anime
┆ ◈ ${p}cat
┆ ◈ ${p}dog
┆ ◈ ${p}fox
┆ ◈ ${p}bird
┆ ◈ ${p}coinflip
┆ ◈ ${p}dice
┆ ◈ ${p}guess
┆ ◈ ${p}quiz
┆ ◈ ${p}rps
╰──────────◈
\`\`\`

### ᴀɪ ᴍᴇɴᴜ (276–300)

\`\`\`text
╭──────────◈
┆ ◈ ${p}ai
┆ ◈ ${p}chatgpt
┆ ◈ ${p}meta
┆ ◈ ${p}gemini
┆ ◈ ${p}blackbox
┆ ◈ ${p}deepseek
┆ ◈ ${p}copilot
┆ ◈ ${p}imagine
┆ ◈ ${p}image
┆ ◈ ${p}vision
┆ ◈ ${p}describe
┆ ◈ ${p}summarize
┆ ◈ ${p}rewrite
┆ ◈ ${p}grammar
┆ ◈ ${p}question
┆ ◈ ${p}answerai
┆ ◈ ${p}code
┆ ◈ ${p}debug
┆ ◈ ${p}explain
┆ ◈ ${p}story
┆ ◈ ${p}poem
┆ ◈ ${p}essay
┆ ◈ ${p}math
┆ ◈ ${p}ask
┆ ◈ ${p}clearchat
╰──────────◈
\`\`\`

### ◈┈▉ \`meta Ai MD\` ▉┄◈

> 🐺 META AI MD POWER BY SIMON TECH`;
}

module.exports = { getMenu };
