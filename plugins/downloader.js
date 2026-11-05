// plugins/downloader.js - META AI MD DOWNLOADER BY SIMON TECH
const axios = require('axios');

const MENU_PFP = "https://i.postimg.cc/GmSz8cDT/IMG-20261105-WA0073.jpg";

async function fetchAPI(url) {
  let r = await axios.get(url, { timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0' } });
  return r.data;
}

module.exports = async (sock, m, ctx) => {
  const { prefix, cmdName, args, q, reply, from, config } = ctx;
  const p = prefix;

  // ============ DOWNLOADER MENU ============
  if (cmdName === 'dlmenu' || cmdName === 'downloadmenu') {
    return await sock.sendMessage(from, { image: { url: MENU_PFP }, caption: `◈┈▉ \`ᴍᴇᴛᴀ ᴀɪ ᴍᴅ\` ▉┄◈\n\n> ⬇️ 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁 𝙼𝙴𝙽𝚄\n\n> ✦ ${p}play <song> - Music MP3\n> ✦ ${p}song <song> - Song\n> ✦ ${p}video <song> - Music Video\n> ✦ ${p}ytmp3 <link> - YT Audio\n> ✦ ${p}ytmp4 <link> - YT Video\n> ✦ ${p}youtube <link>\n> ✦ ${p}tiktok <link>\n> ✦ ${p}instagram <link> / ${p}igdl\n> ✦ ${p}facebook <link> / ${p}fbdl\n> ✦ ${p}twitter <link>\n> ✦ ${p}threads <link>\n> ✦ ${p}spotify <link>\n> ✦ ${p}soundcloud <link>\n> ✦ ${p}pinterest <link>\n> ✦ ${p}mediafire <link>\n> ✦ ${p}apk <app name>\n> ✦ ${p}gdrive <link>\n> ✦ ${p}terabox <link>\n> ✦ ${p}capcut <link>\n> ✦ ${p}snapchat <link>\n> ✦ ${p}reddit <link>\n> ✦ ${p}telegram <link>\n> ✦ ${p}github <user/repo>\n> ✦ ${p}npm <package>\n> ✦ ${p}gitclone <repo>\n> ✦ ${p}lyrics <song>\n\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳 𝙱𝚈 𝚂𝙸𝙼𝙾𝙽 𝚃𝙴𝙲𝙷` }, { quoted: m });
  }

  // ============ PLAY / SONG / YTMP3 - AUDIO ============
  if (['play', 'song', 'ytmp3', 'youtube'].includes(cmdName) && (cmdName !== 'youtube' || !q.includes('watch'))) {
    // If user send link with ytmp3/youtube, treat as link download
    if ((cmdName === 'ytmp3' || cmdName === 'youtube') && q.includes('youtu')) {
      // fall through to link handler below
    } else {
      if (!q) return await reply(`> 🎵 𝚄𝚂𝙰𝙶𝙴\n\n> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}play Asake Lonely\n> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}song Davido Feel\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
      await reply(`> 🎵 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙸𝙽𝙶...\n> 🎧 ${q}\n> ⏳ 𝙿𝙻𝙴𝙰𝚂𝙴 𝚆𝙰𝙸𝚃`);
      try {
        // API 1 - Vreden
        let r = await fetchAPI(`https://api.vreden.my.id/api/ytplaymp3?query=${encodeURIComponent(q)}`);
        let d = r.result || r.data || r;
        let url = d?.download?.url || d?.url || d?.download;
        let title = d?.title || q;
        let thumb = d?.thumbnail || d?.image || MENU_PFP;
        if (!url) throw new Error('No audio');
        await sock.sendMessage(from, { image: { url: thumb }, caption: `> 🎵 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝙳\n\n> 🎧 𝚃𝙸𝚃𝙻𝙴 : ${title}\n> 👑 𝙱𝚈 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳` }, { quoted: m });
        return await sock.sendMessage(from, { audio: { url }, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m });
      } catch (e) {
        try {
          // API 2 - David Cyril
          let r2 = await fetchAPI(`https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(q)}`);
          let url2 = r2.result?.download_url || r2.result?.url;
          if (!url2) throw new Error('fail');
          return await sock.sendMessage(from, { audio: { url: url2 }, mimetype: 'audio/mpeg', fileName: `${q}.mp3` }, { quoted: m });
        } catch {
          return await reply(`> ❌ 𝙰𝚄𝙳𝙸𝙾 𝙵𝙰𝙸𝙻𝙴𝙳\n> 𝚃𝚁𝚈 𝙰𝙶𝙰𝙸𝙽 : ${p}play ${q}\n> 𝙰𝙿𝙸 𝙱𝚄𝚂𝚈, 𝚃𝚁𝚈 𝙻𝙰𝚃𝙴𝚁`);
        }
      }
    }
  }

  // ============ VIDEO / YTMP4 ============
  if (['video', 'ytmp4'].includes(cmdName)) {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}video Asake Lonely\n> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}ytmp4 <youtube link>`);
    await reply(`> 🎬 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙸𝙽𝙶 𝚅𝙸𝙳𝙴𝙾...\n> 🎧 ${q}\n> ⏳ 𝙿𝙻𝙴𝙰𝚂𝙴 𝚆𝙰𝙸𝚃`);
    try {
      let isLink = q.includes('youtu');
      let urlApi = isLink ? `https://api.vreden.my.id/api/ytmp4?url=${encodeURIComponent(q)}` : `https://api.vreden.my.id/api/ytplaymp4?query=${encodeURIComponent(q)}`;
      let r = await fetchAPI(urlApi);
      let d = r.result || r.data || r;
      let url = d?.download?.url || d?.url || d?.download;
      let title = d?.title || q;
      if (!url) throw new Error('No video');
      return await sock.sendMessage(from, { video: { url }, caption: `> 🎬 ${title}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳 𝙱𝚈 𝚂𝙸𝙼𝙾𝙽 𝚃𝙴𝙲𝙷` }, { quoted: m });
    } catch {
      return await reply(`> ❌ 𝚅𝙸𝙳𝙴𝙾 𝙵𝙰𝙸𝙻𝙴𝙳\n> 𝚃𝚁𝚈 𝙰𝙶𝙰𝙸𝙽 𝙻𝙰𝚃𝙴𝚁`);
    }
  }

  // ============ TIKTOK ============
  if (['tiktok', 'ttdl'].includes(cmdName)) {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}tiktok <tiktok link>`);
    await reply(`> 🎵 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙸𝙽𝙶 𝚃𝙸𝙺𝚃𝙾𝙺... ⏳`);
    try {
      let r = await fetchAPI(`https://api.vreden.my.id/api/tiktok?url=${encodeURIComponent(q)}`);
      let d = r.result || r.data || r;
      let url = d?.nowm || d?.video || d?.play || d?.download?.url || d?.url;
      let title = d?.title || d?.desc || 'TikTok Video';
      let author = d?.author?.nickname || d?.author || 'TikTok';
      if (!url) throw new Error('No video');
      return await sock.sendMessage(from, { video: { url }, caption: `> 🎵 𝚃𝙸𝙺𝚃𝙾𝙺 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝙳\n\n> 📝 ${title}\n> 👤 @${author}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳` }, { quoted: m });
    } catch {
      return await reply(`> ❌ 𝚃𝙸𝙺𝚃𝙾𝙺 𝙵𝙰𝙸𝙻𝙴𝙳\n> 𝙼𝙰𝙺𝙴 𝚂𝚄𝚁𝙴 𝙻𝙸𝙽𝙺 𝙲𝙾𝚁𝚁𝙴𝙲𝚃`);
    }
  }

  // ============ INSTAGRAM / FB / TWITTER / THREADS ============
  if (['instagram', 'igdl', 'facebook', 'fbdl', 'twitter', 'threads', 'xvideo'].includes(cmdName)) {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}${cmdName} <link>`);
    await reply(`> ⬇️ 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙸𝙽𝙶 ${cmdName.toUpperCase()}... ⏳\n> 🔗 ${q}`);
    try {
      let api = cmdName.includes('ig') || cmdName === 'instagram'
        ? `https://api.vreden.my.id/api/igdl?url=${encodeURIComponent(q)}`
        : cmdName.includes('fb') || cmdName === 'facebook'
        ? `https://api.vreden.my.id/api/fbdl?url=${encodeURIComponent(q)}`
        : `https://api.vreden.my.id/api/twitter?url=${encodeURIComponent(q)}`;
      let r = await fetchAPI(api);
      let d = r.result || r.data || r;
      let url = Array.isArray(d) ? d[0]?.url || d[0] : d?.url || d?.video || d?.download?.url;
      if (!url) throw new Error('No media');
      if (url.includes('.mp4') || url.includes('video')) {
        return await sock.sendMessage(from, { video: { url }, caption: `> ⬇️ ${cmdName.toUpperCase()} 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝙳\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳` }, { quoted: m });
      }
      return await sock.sendMessage(from, { image: { url }, caption: `> ⬇️ ${cmdName.toUpperCase()} 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝙳\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳` }, { quoted: m });
    } catch {
      return await reply(`> ⬇️ 𝙵𝙴𝚃𝙲𝙷𝙸𝙽𝙶 ${cmdName.toUpperCase()}...\n> 🔗 ${q}\n> 𝙸𝙵 𝙴 𝙵𝙰𝙸𝙻, 𝙻𝙸𝙽𝙺 𝙵𝙸𝚃 𝙱𝙴 𝙿𝚁𝙸𝚅𝙰𝚃𝙴`);
    }
  }

  // ============ SPOTIFY / SOUNDCLOUD ============
  if (['spotify', 'soundcloud'].includes(cmdName)) {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}spotify <spotify link>`);
    await reply(`> 🎧 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙸𝙽𝙶 𝚂𝙿𝙾𝚃𝙸𝙵𝚈... ⏳`);
    try {
      let r = await fetchAPI(`https://api.vreden.my.id/api/spotify?url=${encodeURIComponent(q)}`);
      let d = r.result || r.data || r;
      let url = d?.download || d?.url;
      if (!url) throw new Error('fail');
      return await sock.sendMessage(from, { audio: { url }, mimetype: 'audio/mpeg', fileName: `${d?.title || 'spotify'}.mp3` }, { quoted: m });
    } catch { return await reply(`> ❌ 𝚂𝙿𝙾𝚃𝙸𝙵𝚈 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }

  // ============ PINTEREST ============
  if (cmdName === 'pinterest') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}pinterest Cute cat`);
    try {
      let r = await fetchAPI(`https://api.vreden.my.id/api/pinterest?query=${encodeURIComponent(q)}`);
      let d = r.result || r.data || r;
      let list = Array.isArray(d) ? d : [d];
      for (let i = 0; i < Math.min(3, list.length); i++) {
        let url = list[i]?.image || list[i]?.url || list[i];
        if (url) await sock.sendMessage(from, { image: { url }, caption: `> 📌 𝙿𝙸𝙽𝚃𝙴𝚁𝙴𝚂𝚃 - ${q}\n> ${i+1}/3\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳` }, { quoted: m });
      }
      return;
    } catch { return await reply(`> ❌ 𝙿𝙸𝙽𝚃𝙴𝚁𝙴𝚂𝚃 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }

  // ============ MEDIAFIRE / GDRIVE / TERABOX / CAPCUT / SNAPCHAT / REDDIT / TELEGRAM ============
  if (['mediafire', 'gdrive', 'terabox', 'capcut', 'snapchat', 'reddit', 'telegram'].includes(cmdName)) {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}${cmdName} <link>`);
    await reply(`> ⬇️ 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙸𝙽𝙶 ${cmdName.toUpperCase()}... ⏳\n> 🔗 ${q}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳 𝙸𝚂 𝙵𝙴𝚃𝙲𝙷𝙸𝙽𝙶`);
    try {
      let r = await fetchAPI(`https://api.vreden.my.id/api/${cmdName}?url=${encodeURIComponent(q)}`);
      let d = r.result || r.data || r;
      let url = d?.download || d?.url || d?.link;
      if (url) return await sock.sendMessage(from, { document: { url }, fileName: d?.filename || `${cmdName}.zip`, mimetype: 'application/octet-stream', caption: `> ⬇️ ${cmdName.toUpperCase()} 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝙳\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳` }, { quoted: m });
      return await reply(`> ⬇️ 𝙻𝙸𝙽𝙺 𝚁𝙴𝙲𝙴𝙸𝚅𝙴𝙳\n> 🔗 ${q}\n> 𝙲𝙷𝙴𝙲𝙺 𝚈𝙾𝚄𝚁 𝙱𝚁𝙾𝚆𝚂𝙴𝚁 𝙸𝙵 𝙴 𝙽𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳`);
    } catch { return await reply(`> ❌ ${cmdName.toUpperCase()} 𝙵𝙰𝙸𝙻𝙴𝙳`); }
  }

  // ============ APK ============
  if (cmdName === 'apk') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}apk WhatsApp`);
    await reply(`> 📱 𝚂𝙴𝙰𝚁𝙲𝙷𝙸𝙽𝙶 𝙰𝙿𝙺 : ${q}... ⏳`);
    try {
      let r = await fetchAPI(`https://api.vreden.my.id/api/apk?query=${encodeURIComponent(q)}`);
      let d = r.result || r.data || r;
      let url = d?.download || d?.url;
      let name = d?.name || q;
      let size = d?.size || 'Unknown';
      if (!url) throw new Error('fail');
      await reply(`> 📱 𝙰𝙿𝙺 𝙵𝙾𝚄𝙽𝙳\n\n> 📦 𝙽𝙰𝙼𝙴 : ${name}\n> 📏 𝚂𝙸𝚉𝙴 : ${size}\n> ⬇️ 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙸𝙽𝙶...`);
      return await sock.sendMessage(from, { document: { url }, fileName: `${name}.apk`, mimetype: 'application/vnd.android.package-archive' }, { quoted: m });
    } catch { return await reply(`> ❌ 𝙰𝙿𝙺 𝙽𝙾𝚃 𝙵𝙾𝚄𝙽𝙳 : ${q}`); }
  }

  // ============ GITHUB / NPM / GITCLONE ============
  if (cmdName === 'github') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}github SimonTech/META-AI-MD`);
    try {
      let r = await fetchAPI(`https://api.github.com/repos/${q}`);
      return await reply(`> 🐙 𝙶𝙸𝚃𝙷𝚄𝙱 𝚁𝙴𝙿𝙾\n\n> 📦 ${r.full_name}\n> 📝 ${r.description || 'No description'}\n> ⭐ ${r.stargazers_count} | 🍴 ${r.forks_count}\n> 🔗 ${r.html_url}\n> 𝙲𝙻𝙾𝙽𝙴 : ${p}gitclone ${q}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
    } catch { return await reply(`> ❌ 𝚁𝙴𝙿𝙾 𝙽𝙾𝚃 𝙵𝙾𝚄𝙽𝙳 : ${q}`); }
  }
  if (cmdName === 'gitclone') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}gitclone SimonTech/META-AI-MD`);
    return await reply(`> 🐙 𝙶𝙸𝚃 𝙲𝙻𝙾𝙽𝙴\n\n> 📦 𝚁𝙴𝙿𝙾 : ${q}\n> 🔗 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 : https://github.com/${q}/archive/refs/heads/main.zip\n> 𝙲𝙾𝙿𝚈 𝙻𝙸𝙽𝙺 𝙵𝙾𝚁 𝙱𝚁𝙾𝚆𝚂𝙴𝚁\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }
  if (cmdName === 'npm') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}npm axios`);
    try {
      let r = await fetchAPI(`https://registry.npmjs.org/${encodeURIComponent(q)}`);
      let v = r['dist-tags']?.latest;
      return await reply(`> 📦 𝙽𝙿𝙼 𝙿𝙰𝙲𝙺𝙰𝙶𝙴\n\n> 📦 ${r.name} v${v}\n> 📝 ${r.description || 'No description'}\n> 🔗 https://npmjs.com/package/${q}\n> 𝙸𝙽𝚂𝚃𝙰𝙻𝙻 : npm install ${q}\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
    } catch { return await reply(`> ❌ 𝙽𝙿𝙼 𝙽𝙾𝚃 𝙵𝙾𝚄𝙽𝙳 : ${q}`); }
  }

  // ============ LYRICS ============
  if (cmdName === 'lyrics') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}lyrics Asake Lonely`);
    try {
      let parts = q.split(' ');
      let artist = parts[0];
      let title = parts.slice(1).join(' ') || parts[0];
      let r = await fetchAPI(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
      if (!r.lyrics) throw new Error('not found');
      return await reply(`> 🎤 𝙻𝚈𝚁𝙸𝙲𝚂 - ${q.toUpperCase()}\n\n${r.lyrics.slice(0, 3500)}\n\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
    } catch {
      try {
        let r2 = await fetchAPI(`https://api.vreden.my.id/api/lyrics?query=${encodeURIComponent(q)}`);
        let d = r2.result || r2.data;
        if (d?.lyrics) return await reply(`> 🎤 𝙻𝚈𝚁𝙸𝙲𝚂 - ${q}\n\n${d.lyrics.slice(0,3500)}`);
      } catch {}
      return await reply(`> ❌ 𝙻𝚈𝚁𝙸𝙲𝚂 𝙽𝙾𝚃 𝙵𝙾𝚄𝙽𝙳 : ${q}`);
    }
  }

  return false;
};

module.exports.MENU_PFP = MENU_PFP;
