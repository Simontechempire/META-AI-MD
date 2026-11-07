// plugins/photoediting.js
// PHOTOLAB - FREE UNLIMITED - NO API KEY - SHARP + IMGLY AI
// SIMON TECH INC - 2GB PANEL READY

const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// FREE AI - runs on your server, no key, no limit
// Install: npm install @imgly/background-removal-node
let removeBackground = null;
try { ({ removeBackground } = require('@imgly/background-removal-node')); } catch (e) { console.log('Photolab: run npm install @imgly/background-removal-node'); }

// ============ REAL DOWNLOAD ============
async function getImageBuffer(sock, m) {
  try {
    let msg = null;
    if (m.message?.imageMessage) msg = m.message.imageMessage;
    else {
      let ctxInfo = m.message?.extendedTextMessage?.contextInfo || m.message?.imageMessage?.contextInfo || m.message?.videoMessage?.contextInfo;
      let quoted = ctxInfo?.quotedMessage;
      if (quoted?.imageMessage) msg = quoted.imageMessage;
      else if (quoted?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) msg = quoted.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
    }
    if (!msg && m.message?.viewOnceMessageV2?.message?.imageMessage) msg = m.message.viewOnceMessageV2.message.imageMessage;
    if (!msg) return null;
    const stream = await downloadContentFromMessage(msg, 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    return buffer.length ? buffer : null;
  } catch (e) { console.log('Download error:', e.message); return null; }
}

async function sendImg(ctx, buffer, caption) {
  const { sock, from, m } = ctx;
  await sock.sendMessage(from, { image: buffer, caption }, { quoted: m });
}
function needImg(reply) {
  return reply('📸 *Reply to a REAL photo*\n\n1. Send photo\n2. Reply that photo with command\nExample: reply photo + `.enhance`');
}

// Free text overlay
async function addText(buffer, text) {
  const meta = await sharp(buffer).metadata();
  const w = meta.width || 800;
  const fontSize = Math.floor(w / 12);
  const svg = `<svg width="${w}" height="120"><rect x="0" y="0" width="${w}" height="120" fill="black" fill-opacity="0.5"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${text.replace(/[<>&]/g, '')}</text></svg>`;
  return await sharp(buffer).composite([{ input: Buffer.from(svg), gravity: 'south' }]).jpeg({ quality: 92 }).toBuffer();
}

// FREE background blur - uses AI mask, no API
async function blurBackground(buffer, blurAmount = 15) {
  if (!removeBackground) throw new Error('Install @imgly/background-removal-node first');
  // 1. Get person cutout (PNG with transparency)
  const cutoutBlob = await removeBackground(buffer);
  const cutoutBuf = Buffer.from(await cutoutBlob.arrayBuffer());
  // 2. Blur full image
  const meta = await sharp(buffer).metadata();
  const blurred = await sharp(buffer).blur(blurAmount).jpeg().toBuffer();
  // 3. Put sharp person on top of blurred bg
  const out = await sharp(blurred).composite([{ input: cutoutBuf, gravity: 'centre' }]).jpeg({ quality: 92 }).toBuffer();
  return out;
}

const commands = [

  {
    name: 'photolab', aliases: ['photoedit', 'pedit', 'edit', 'plab'],
    run: async (ctx) => {
      const { reply, prefix } = ctx;
      return reply(`📸 *PHOTOLAB - FREE UNLIMITED - NO API*\n\n*Reply to photo + command:*\n\n*SHARP - FREE:*\n${prefix}enhance - HD\n${prefix}bright 30 / ${prefix}contrast 30\n${prefix}grayscale / ${prefix}sepia / ${prefix}invert\n${prefix}blur 5 / ${prefix}vintage / ${prefix}gold\n${prefix}cartoon / ${prefix}circle / ${prefix}square\n${prefix}flip / ${prefix}rotate 90 / ${prefix}resize 1080\n${prefix}text Hello World\n${prefix}sticker\n\n*AI - FREE UNLIMITED - NO KEY:*\n${prefix}removebg - Cut person, transparent PNG\n${prefix}blurbg - Portrait mode, blur background only\n${prefix}bgwhite - White background\n${prefix}bgblack - Black background\n\nAll free. First removebg go slow (download model once), after that fast.`);
    }
  },

  // ===== SHARP - FREE UNLIMITED =====
  {
    name: 'enhance', aliases: ['hd', 'quality'],
    run: async (ctx) => {
      const { sock, m, reply } = ctx;
      const buf = await getImageBuffer(sock, m); if (!buf) return needImg(reply);
      await reply('⏳ Enhancing...');
      const out = await sharp(buf).modulate({ brightness: 1.12, saturation: 1.25 }).linear(1.15, -10).sharpen({ sigma: 1.2 }).normalize().jpeg({ quality: 95, mozjpeg: true }).toBuffer();
      await sendImg(ctx, out, '✨ *ENHANCED - FREE*');
    }
  },
  {
    name: 'bright',
    run: async (ctx) => {
      const { sock, m, reply, text } = ctx;
      const buf = await getImageBuffer(sock, m); if (!buf) return needImg(reply);
      let v = parseInt(text) || 30;
      const out = await sharp(buf).modulate({ brightness: 1 + v / 100 }).jpeg({ quality: 92 }).toBuffer();
      await sendImg(ctx, out, `💡 *BRIGHTNESS ${v}*`);
    }
  },
  {
    name: 'contrast',
    run: async (ctx) => {
      const { sock, m, reply, text } = ctx;
      const buf = await getImageBuffer(sock, m); if (!buf) return needImg(reply);
      let v = parseInt(text) || 30; let a = 1 + v / 100;
      const out = await sharp(buf).linear(a, -(128 * (a - 1))).jpeg({ quality: 92 }).toBuffer();
      await sendImg(ctx, out, `🎨 *CONTRAST ${v}*`);
    }
  },
  {
    name: 'grayscale', aliases: ['grey', 'bw'],
    run: async (ctx) => {
      const { sock, m, reply } = ctx;
      const buf = await getImageBuffer(sock, m); if (!buf) return needImg(reply);
      const out = await sharp(buf).grayscale().jpeg({ quality: 92 }).toBuffer();
      await sendImg(ctx, out, '⬛ *GRAYSCALE*');
    }
  },
  {
    name: 'sepia',
    run: async (ctx) => {
      const { sock, m, reply } = ctx;
      const buf = await getImageBuffer(sock, m); if (!buf) return needImg(reply);
      const out = await sharp(buf).modulate({ saturation: 0.4 }).tint({ r: 112, g: 66, b: 20 }).jpeg({ quality: 92 }).toBuffer();
      await sendImg(ctx, out, '🤎 *SEPIA*');
    }
  },
  {
    name: 'invert', aliases: ['negative'],
    run: async (ctx) => {
      const { sock, m, reply } = ctx;
      const buf = await getImageBuffer(sock, m); if (!buf) return needImg(reply);
      const out = await sharp(buf).negate().jpeg({ quality: 92 }).toBuffer();
      await sendImg(ctx, out, '🔄 *INVERT*');
    }
  },
  {
    name: 'blur',
    run: async (ctx) => {
      const { sock, m, reply, text } = ctx;
      const buf = await getImageBuffer(sock, m); if (!buf) return needImg(reply);
      let v = parseInt(text) || 5; if (v > 30) v = 30;
      const out = await sharp(buf).blur(v).jpeg({ quality: 92 }).toBuffer();
      await sendImg(ctx, out, `🌫️ *BLUR ${v}*`);
    }
  },
  {
    name: 'vintage',
    run: async (ctx) => {
      const { sock, m, reply } = ctx;
      const buf = await getImageBuffer(sock, m); if (!buf) return needImg(reply);
      const out = await sharp(buf).modulate({ brightness: 0.95, saturation: 0.6 }).tint({ r: 255, g: 220, b: 180 }).jpeg({ quality: 92 }).toBuffer();
      await sendImg(ctx, out, '📷 *VINTAGE*');
    }
  },
  {
    name: 'gold', aliases: ['golden'],
    run: async (ctx) => {
      const { sock, m, reply } = ctx;
      const buf = await getImageBuffer(sock, m); if (!buf) return needImg(reply);
      const out = await sharp(buf).modulate({ brightness: 1.1, saturation: 1.4 }).tint({ r: 255, g: 215, b: 0 }).jpeg({ quality: 92 }).toBuffer();
      await sendImg(ctx, out, '✨ *GOLD*');
    }
  },
  {
    name: 'cartoon', aliases: ['toon'],
    run: async (ctx) => {
      const { sock, m, reply } = ctx;
      const buf = await getImageBuffer(sock, m); if (!buf) return needImg(reply);
      const out = await sharp(buf).median(3).modulate({ saturation: 1.6 }).sharpen().jpeg({ quality: 92 }).toBuffer();
      await sendImg(ctx, out, '🎭 *CARTOON*');
    }
  },
  {
    name: 'circle',
    run: async (ctx) => {
      const { sock, m, reply } = ctx;
      const buf = await getImageBuffer(sock, m); if (!buf) return needImg(reply);
      const meta = await sharp(buf).metadata();
      const size = Math.min(meta.width, meta.height);
      const svg = `<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/></svg>`;
      const out = await sharp(buf).resize(size, size, { fit: 'cover' }).composite([{ input: Buffer.from(svg), blend: 'dest-in' }]).png().toBuffer();
      await sendImg(ctx, out, '⭕ *CIRCLE*');
    }
  },
  {
    name: 'square',
    run: async (ctx) => {
      const { sock, m, reply } = ctx;
      const buf = await getImageBuffer(sock, m); if (!buf) return needImg(reply);
      const meta = await sharp(buf).metadata(); const size = Math.min(meta.width, meta.height);
      const out = await sharp(buf).resize(size, size, { fit: 'cover' }).jpeg({ quality: 92 }).toBuffer();
      await sendImg(ctx, out, '⬛ *SQUARE*');
    }
  },
  {
    name: 'flip',
    run: async (ctx) => {
      const { sock, m, reply } = ctx;
      const buf = await getImageBuffer(sock, m); if (!buf) return needImg(reply);
      const out = await sharp(buf).flop().jpeg({ quality: 92 }).toBuffer();
      await sendImg(ctx, out, '🔄 *FLIP*');
    }
  },
  {
    name: 'rotate',
    run: async (ctx) => {
      const { sock, m, reply, text } = ctx;
      const buf = await getImageBuffer(sock, m); if (!buf) return needImg(reply);
      let deg = parseInt(text) || 90;
      const out = await sharp(buf).rotate(deg).jpeg({ quality: 92 }).toBuffer();
      await sendImg(ctx, out, `🔁 *ROTATE ${deg}°*`);
    }
  },
  {
    name: 'resize',
    run: async (ctx) => {
      const { sock, m, reply, text } = ctx;
      const buf = await getImageBuffer(sock, m); if (!buf) return needImg(reply);
      let size = parseInt(text) || 1080;
      const out = await sharp(buf).resize(size, null).jpeg({ quality: 92 }).toBuffer();
      await sendImg(ctx, out, `📐 *RESIZED ${size}px*`);
    }
  },
  {
    name: 'text',
    run: async (ctx) => {
      const { sock, m, reply, text } = ctx;
      if (!text) return reply('Usage: reply photo + `.text Happy Birthday`');
      const buf = await getImageBuffer(sock, m); if (!buf) return needImg(reply);
      const out = await addText(buf, text);
      await sendImg(ctx, out, `✍️ *TEXT: ${text}*`);
    }
  },
  {
    name: 'sticker', aliases: ['s'],
    run: async (ctx) => {
      const { sock, m, from, reply } = ctx;
      const buf = await getImageBuffer(sock, m); if (!buf) return needImg(reply);
      const out = await sharp(buf).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 90 }).toBuffer();
      await sock.sendMessage(from, { sticker: out }, { quoted: m });
    }
  },

  // ===== FREE AI - NO API KEY - UNLIMITED =====
  {
    name: 'removebg', aliases: ['nobg', 'bg'],
    run: async (ctx) => {
      const { sock, m, reply } = ctx;
      if (!removeBackground) return reply('❌ Run: `npm install @imgly/background-removal-node` then restart');
      const buf = await getImageBuffer(sock, m); if (!buf) return needImg(reply);
      await reply('⏳ Removing BG... FREE AI, first time go slow (downloading model ~100MB), after that fast. Wait 20-30 sec...');
      try {
        const blob = await removeBackground(buf);
        const out = Buffer.from(await blob.arrayBuffer());
        await sendImg(ctx, out, '✂️ *BACKGROUND REMOVED - FREE UNLIMITED - NO API*');
      } catch (e) { return reply('❌ ' + e.message); }
    }
  },
  {
    name: 'blurbg', aliases: ['portrait', 'blurback'],
    run: async (ctx) => {
      const { sock, m, reply } = ctx;
      if (!removeBackground) return reply('❌ Install @imgly/background-removal-node');
      const buf = await getImageBuffer(sock, m); if (!buf) return needImg(reply);
      await reply('⏳ Portrait mode... blurring background only, keeping you sharp...');
      try {
        const out = await blurBackground(buf, 18);
        await sendImg(ctx, out, '📸 *PORTRAIT - BG BLURRED - FREE*');
      } catch (e) { return reply('❌ ' + e.message); }
    }
  },
  {
    name: 'bgwhite', aliases: ['whitebg'],
    run: async (ctx) => {
      const { sock, m, reply } = ctx;
      if (!removeBackground) return reply('❌ Install @imgly/background-removal-node');
      const buf = await getImageBuffer(sock, m); if (!buf) return needImg(reply);
      await reply('⏳ Changing to white background...');
      try {
        const blob = await removeBackground(buf);
        const cutout = Buffer.from(await blob.arrayBuffer());
        const meta = await sharp(buffer).metadata().catch(() => ({ width: 800, height: 800 }));
        const meta2 = await sharp(cutout).metadata();
        const bg = await sharp({ create: { width: meta2.width, height: meta2.height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } }).png().toBuffer();
        const out = await sharp(bg).composite([{ input: cutout }]).jpeg({ quality: 92 }).toBuffer();
        await sendImg(ctx, out, '⬜ *WHITE BACKGROUND - FREE*');
      } catch (e) { return reply('❌ ' + e.message); }
    }
  },
  {
    name: 'bgblack', aliases: ['blackbg'],
    run: async (ctx) => {
      const { sock, m, reply } = ctx;
      if (!removeBackground) return reply('❌ Install @imgly/background-removal-node');
      const buf = await getImageBuffer(sock, m); if (!buf) return needImg(reply);
      await reply('⏳ Changing to black background...');
      try {
        const blob = await removeBackground(buf);
        const cutout = Buffer.from(await blob.arrayBuffer());
        const meta2 = await sharp(cutout).metadata();
        const bg = await sharp({ create: { width: meta2.width, height: meta2.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } } }).png().toBuffer();
        const out = await sharp(bg).composite([{ input: cutout }]).jpeg({ quality: 92 }).toBuffer();
        await sendImg(ctx, out, '⬛ *BLACK BACKGROUND - FREE*');
      } catch (e) { return reply('❌ ' + e.message); }
    }
  },
];

module.exports = { commands };
module.exports.commands = commands;
