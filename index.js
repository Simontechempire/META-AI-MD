// META AI MD - INDEX.JS
// SIMON TECH INC

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');

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

function fancy(text) {
  const map = {
    a:'𝐚',b:'𝐛',c:'𝐜',d:'𝐝',e:'𝐞',f:'𝐟',g:'𝐠',
    h:'𝐡',i:'𝐢',j:'𝐣',k:'𝐤',l:'𝐥',m:'𝐦',n:'𝐧',
    o:'𝐨',p:'𝐩',q:'𝐪',r:'𝐫',s:'𝐬',t:'𝐭',u:'𝐮',
    v:'𝐯',w:'𝐰',x:'𝐱',y:'𝐲',z:'𝐳',
    A:'𝐀',B:'𝐁',C:'𝐂',D:'𝐃',E:'𝐄',F:'𝐅',
    G:'𝐆',H:'𝐇',I:'𝐈',J:'𝐉',K:'𝐊',L:'𝐋',
    M:'𝐌',N:'𝐍',O:'𝐎',P:'𝐏',Q:'𝐐',R:'𝐑',
    S:'𝐒',T:'𝐓',U:'𝐔',V:'𝐕',W:'𝐖',X:'𝐗',
    Y:'𝐘',Z:'𝐙',
    0:'𝟎',1:'𝟏',2:'𝟐',3:'𝟑',4:'𝟒',
    5:'𝟓',6:'𝟔',7:'𝟕',8:'𝟖',9:'𝟗'
  };

  return String(text).split('').map(c => map[c] || c).join('');
}

F.fancy = fancy;
F.bold = fancy;

// ================= OWNER CHECK =================

function isOwnerCheck(sender, database) {
  const number = String(sender || '').replace(/[^0-9]/g, '');
  const owners = [];

  if (config.ownerNumber) {
    owners.push(String(config.ownerNumber).replace(/[^0-9]/g, ''));
  }

  if (database.owner) {
    owners.push(String(database.owner).replace(/[^0-9]/g, ''));
  }

  if (Array.isArray(database.owners)) {
    database.owners.forEach(owner => {
      owners.push(String(owner).replace(/[^0-9]/g, ''));
    });
  }

  if (Array.isArray(config.owners)) {
    config.owners.forEach(owner => {
      owners.push(String(owner).replace(/[^0-9]/g, ''));
    });
  }

  try {
    if (F.isOwner && F.isOwner(sender, database)) return true;
  } catch (e) {}

  return owners.includes(number);
}

// ================= BOT MODE =================

function getMode(database) {
  const mode = database.settings?.mode || database.mode || 'public';
  return String(mode).toLowerCase() === 'private' ? 'private' : 'public';
}

// ================= PLUGIN LOADER =================

let antiMod = null;
let autoMod = null;

let commands = new Map();
let functionPlugins = [];

function loadPlugins() {
  commands.clear();
  functionPlugins = [];

  const dir = path.join(__dirname, 'plugins');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const files = fs.readdirSync(dir).filter(file => file.endsWith('.js'));

  for (const file of files) {
    try {
      const fullPath = path.join(dir, file);

      delete require.cache[require.resolve(fullPath)];

      const plugin = require(fullPath);

      if (typeof plugin === 'function') {
        functionPlugins.push({ file, fn: plugin });
        continue;
      }

      if (plugin && typeof plugin.handler === 'function') {
        functionPlugins.push({ file, fn: plugin.handler });
        continue;
      }

      let list = [];

      if (Array.isArray(plugin)) {
        list = plugin;
      } else if (Array.isArray(plugin?.plugins)) {
        list = plugin.plugins;
      } else if (plugin?.name) {
        list = [plugin];
      }

      for (const command of list) {
        if (!command?.name || typeof command.run !== 'function') continue;

        commands.set(command.name.toLowerCase(), command);

        if (Array.isArray(command.aliases)) {
          for (const alias of command.aliases) {
            commands.set(alias.toLowerCase(), command);
          }
        }
      }

      console.log(`✅ Loaded ${file}: ${list.length} commands`);
    } catch (error) {
      console.log(`❌ Plugin error ${file}:`, error.message);
    }
  }

  try {
    delete require.cache[require.resolve('./plugins/anti.js')];
    antiMod = require('./plugins/anti.js');
  } catch (e) {
    antiMod = null;
    console.log('Anti plugin error:', e.message);
  }

  try {
    delete require.cache[require.resolve('./plugins/auto.js')];
    autoMod = require('./plugins/auto.js');
  } catch (e) {
    autoMod = null;
    console.log('Auto plugin error:', e.message);
  }

  console.log(`📦 Commands loaded: ${commands.size}`);
  console.log(`⚙️ Function plugins: ${functionPlugins.length}`);
}

loadPlugins();

// ================= SERVER =================

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.get('/status', (req, res) => {
  res.json({
    connected: Boolean(sock?.user),
    user: sock?.user?.id || null,
    commands: commands.size,
    mode: getMode(db)
  });
});

app.get('/pair', async (req, res) => {
  try {
    const number = String(req.query.number || '').replace(/[^0-9]/g, '');

    if (!number || number.length < 9) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    if (!sock) {
      return res.status(503).json({ error: 'Bot is starting. Try again shortly.' });
    }

    if (sock.user) {
      return res.status(409).json({ error: 'This bot session is already connected.' });
    }

    const code = await sock.requestPairingCode(number);
    return res.json({ code });
  } catch (error) {
    console.log('Pairing error:', error.message);
    return res.status(500).json({ error: 'Pairing failed. Try again.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});

// ================= KEEP ALIVE =================

setInterval(async () => {
  try {
    const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    await fetch(`${url}/ping`);
  } catch (e) {}
}, 4 * 60 * 1000);

// ================= GROUP ADMIN CHECK =================

async function getGroupPermissions(from, sender) {
  try {
    const metadata = await sock.groupMetadata(from);
    const participants = metadata.participants || [];

    const senderNumber = String(sender || '').split('@')[0];

    const participant = participants.find(p =>
      p.id === sender ||
      p.phoneNumber === sender ||
      String(p.id || '').split('@')[0] === senderNumber ||
      String(p.phoneNumber || '').split('@')[0] === senderNumber
    );

    const botId = sock.user?.id || '';
    const botNumber = botId.split('@')[0].split(':')[0];

    const bot = participants.find(p =>
      p.id === botId ||
      p.phoneNumber === botId ||
      String(p.id || '').split('@')[0] === botNumber ||
      String(p.phoneNumber || '').split('@')[0] === botNumber
    );

    return {
      isAdmin: ['admin', 'superadmin'].includes(participant?.admin),
      isBotAdmin: ['admin', 'superadmin'].includes(bot?.admin),
      metadata
    };
  } catch (e) {
    return {
      isAdmin: false,
      isBotAdmin: false,
      metadata: null
    };
  }
}

// ================= WHATSAPP CONNECTION =================

async function start() {
  if (isStarting) return;

  isStarting = true;

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  try {
    const sessionFolder = config.sessionFolder || './Meta';

    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      browser: Browsers.macOS('Safari'),
      auth: state,
      printQRInTerminal: false,
      markOnlineOnConnect: true,
      syncFullHistory: false,
      shouldSyncHistoryMessage: () => false,
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 10000,
      getMessage: async () => undefined
    });

    sock.ev.on('creds.update', saveCreds);

    // ================= CONNECTION STATUS =================

    sock.ev.on('connection.update', async update => {
      const { connection, lastDisconnect } = update;

      if (connection === 'connecting') {
        console.log('🔄 Connecting...');
      }

      if (connection === 'open') {
        isStarting = false;
        console.log('✅ META AI MD CONNECTED');

        try {
          if (autoMod?.startAutoBio) {
            await autoMod.startAutoBio(sock, db);
          }
        } catch (e) {
          console.log('Auto bio error:', e.message);
        }
      }

      if (connection === 'close') {
        isStarting = false;

        const code = lastDisconnect?.error?.output?.statusCode;

        console.log('Connection closed:', code);

        if (code === DisconnectReason.loggedOut) {
          console.log('❌ Session logged out. Pair again.');
          return;
        }

        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            start();
          }, 5000);
        }
      }
    });

    // ================= STATUS HANDLER =================

    sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const message of messages) {
        try {
          if (message.key?.remoteJid !== 'status@broadcast') continue;
          if (getMode(db) === 'private') continue;

          if (autoMod?.handleStatus) {
            await autoMod.handleStatus(sock, message, db);
          }
        } catch (e) {
          console.log('Status handler error:', e.message);
        }
      }
    });

    // ================= ANTIDELETE EVENT =================

    sock.ev.on('messages.update', async updates => {
      try {
        if (antiMod?.handleDelete) {
          await antiMod.handleDelete(sock, updates, db, F);
        }
      } catch (e) {
        console.log('Anti-delete error:', e.message);
      }
    });

    // ================= GROUP PARTICIPANTS =================

    sock.ev.on('group-participants.update', async update => {
      try {
        if (getMode(db) === 'private') return;

        const from = update.id;
        const group = db.group?.[from];

        if (!group) return;

        for (const participant of update.participants || []) {
          const number = participant.split('@')[0];

          if (update.action === 'add' && (group.welcome || db.auto?.autowelcome)) {
            const message = (group.welcomeMsg ||
              '👋 Welcome @user to *{group}*!\n\nType .menu')
              .replace(/@user/g, `@${number}`)
              .replace(/\{group\}/g, update.subject || 'group');

            await sock.sendMessage(from, {
              text: message,
              mentions: [participant]
            });
          }

          if (update.action === 'remove' && (group.goodbye || db.auto?.autogoodbye)) {
            const message = (group.goodbyeMsg ||
              '👋 Bye @user!')
              .replace(/@user/g, `@${number}`);

            await sock.sendMessage(from, {
              text: message,
              mentions: [participant]
            });
          }
        }
      } catch (e) {
        console.log('Group event error:', e.message);
      }
    });

    // ================= MESSAGE HANDLER =================

    sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const m of messages) {
        try {
          if (!m?.message) continue;

          const from = m.key.remoteJid;
          if (!from || from === 'status@broadcast') continue;

          const sender = m.key.participant || from;
          const senderNum = sender.split('@')[0];
          const pushname = m.pushName || 'User';
          const body = F.getText(m);

          if (!body) continue;

          const isGroup = F.isGroup(from);
          let isOwner = isOwnerCheck(sender, db);

          // Commands sent by the connected account itself
          if (m.key.fromMe) {
            const prefixes = config.prefixes || [config.prefix || '.'];
            if (!prefixes.some(prefix => body.startsWith(prefix))) continue;
            isOwner = true;
          }

          // Private mode blocks non-owners before all handlers
          if (getMode(db) === 'private' && !isOwner) continue;

          if (db.banned?.includes(senderNum) && !isOwner) continue;

          if (isGroup && db.muted?.[from]?.includes(sender) && !isOwner) {
            try {
              await sock.sendMessage(from, { delete: m.key });
            } catch (e) {}
            continue;
          }

          // Group permissions
          let permissions = {
            isAdmin: false,
            isBotAdmin: false,
            metadata: null
          };

          if (isGroup) {
            permissions = await getGroupPermissions(from, sender);
          }

          // Anti engine
          if (!m.key.fromMe) {
            try {
              if (antiMod?.handleAnti) {
                const blocked = await antiMod.handleAnti(sock, m, db, F);
                if (blocked) {
                  F.saveDB(db);
                  continue;
                }
              }
            } catch (e) {
              console.log('Anti handler error:', e.message);
            }

            // Auto handlers
            try {
              if (autoMod?.handleAuto) {
                await autoMod.handleAuto(sock, m, db);
              }
            } catch (e) {
              console.log('Auto handler error:', e.message);
            }
          }

          // Prefix check
          const prefixes = config.prefixes || [config.prefix || '.'];
          const usedPrefix = prefixes.find(prefix => body.startsWith(prefix));

          if (!usedPrefix) continue;

          const args = body.slice(usedPrefix.length).trim().split(/\s+/);
          const cmdName = (args.shift() || '').toLowerCase();
          const text = args.join(' ');

          const reply = async (message, options = {}) => {
            return sock.sendMessage(
              from,
              { text: String(message), ...options },
              { quoted: m }
            );
          };

          const fancyReply = async (message, options = {}) => {
            return reply(fancy(message), options);
          };

          // Menu
          if (['menu', 'help', 'allmenu'].includes(cmdName)) {
            try {
              const menuText = getMenu({
                ownerName: config.ownerAlias,
                prefix: usedPrefix,
                botUser: config.botName,
                hosting: config.hosting
              });

              return await sock.sendMessage(
                from,
                {
                  image: { url: MENU_PFP },
                  caption: menuText
                },
                { quoted: m }
              );
            } catch (e) {
              return reply('Menu error: ' + e.message);
            }
          }

          // Reload plugins
          if (cmdName === 'reload' && isOwner) {
            loadPlugins();
            return reply(`✅ ${fancy('Plugins reloaded')}\nCommands: ${commands.size}`);
          }

          const ctx = {
            sock,
            m,
            from,
            sender,
            senderNum,
            senderPn: m.key.participantPn || m.key.remoteJidAlt || sender,
            pushname,
            args,
            text,
            q: text,
            cmd: cmdName,
            cmdName,
            prefix: usedPrefix,
            isOwner,
            isGroup,
            isAdmin: permissions.isAdmin,
            isBotAdmin: permissions.isBotAdmin,
            metadata: permissions.metadata,
            db,
            config,
            F,
            reply,
            fancy,
            fancyReply
          };

          // Function plugins
          let handled = false;

          for (const plugin of functionPlugins) {
            try {
              const result = await plugin.fn(sock, m, ctx);

              if (result) {
                handled = true;
                F.saveDB(db);
                break;
              }
            } catch (e) {
              console.log('Function plugin error:', plugin.file, e.message);
            }
          }

          if (handled) continue;

          // Command plugins
          const plugin = commands.get(cmdName);

          if (!plugin) {
            await reply(
              `❌ Unknown command: ${usedPrefix}${cmdName}\nType ${usedPrefix}menu`
            );
            continue;
          }

          if (plugin.ownerOnly && !isOwner) {
            await reply(config.messages?.ownerOnly || '❌ Owner only command.');
            continue;
          }

          if (plugin.groupOnly && !isGroup) {
            await reply(config.messages?.groupOnly || '❌ Group only command.');
            continue;
          }

          await plugin.run(ctx);
          F.saveDB(db);

        } catch (error) {
          console.log('Message handler error:', error.message);
        }
      }
    });

  } catch (error) {
    console.log('Start failed:', error.message);
    isStarting = false;

    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        start();
      }, 5000);
    }
  }
}

// ================= START BOT =================

start();

process.on('uncaughtException', error => {
  console.log('Uncaught exception:', error.message);
});

process.on('unhandledRejection', error => {
  console.log('Unhandled rejection:', error.message);
});
