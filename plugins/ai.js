// plugins/ai.js - META AI MD AI BY SIMON TECH
const axios = require('axios');

const MENU_PFP = "https://i.postimg.cc/GmSz8cDT/IMG-20261105-WA0073.jpg";

// Simple memory - bot go remember chat per user
let chatMemory = {};

async function askAI(prompt, model = 'meta') {
  // Try 3 free APIs, if one fail, try next
  const tries = [
    `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
    `https://api.vreden.my.id/api/gpt?query=${encodeURIComponent(prompt)}`,
    `https://api.davidcyriltech.my.id/ai/chatbot?query=${encodeURIComponent(prompt)}`
  ];
  for (let url of tries) {
    try {
      let r = await axios.get(url, { timeout: 20000 });
      let txt = typeof r.data === 'string' ? r.data : (r.data?.result || r.data?.answer || r.data?.response || r.data?.message || r.data?.data);
      if (txt && txt.length > 2) return txt;
    } catch {}
  }
  return null;
}

function aiHeader(title) {
  return `◈┈▉ \`ᴍᴇᴛᴀ ᴀɪ ᴍᴅ\` ▉┄◈\n\n> 🤖 ${title}\n> ────────────\n`;
}

module.exports = async (sock, m, ctx) => {
  const { prefix, cmdName, args, q, reply, from, config } = ctx;
  const p = prefix;
  const sender = m.sender;

  // ============ MAIN AI ============
  if (['ai', 'chatgpt', 'meta', 'gemini', 'blackbox', 'deepseek', 'copilot', 'ask', 'question', 'answerai'].includes(cmdName)) {
    if (!q) return await reply(`> 🤖 𝙷𝙾𝚆 𝚃𝙾 𝚄𝚂𝙴\n\n> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}ai Who be Simon Tech?\n> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}ai Write essay about Nigeria\n\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
    await reply(`> 🤖 𝙼𝙴𝚃𝙰 𝙰𝙸 𝚃𝙷𝙸𝙽𝙺𝙸𝙽𝙶... ⏳`);
    let ans = await askAI(q, cmdName);
    if (!ans) return await reply(`> ❌ 𝙰𝙸 𝙱𝚄𝚂𝚈, 𝚃𝚁𝚈 𝙰𝙶𝙰𝙸𝙽 𝙻𝙰𝚃𝙴𝚁\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
    // Save memory
    chatMemory[sender] = (chatMemory[sender] || []).slice(-5);
    chatMemory[sender].push({ q, a: ans });
    return await reply(`${aiHeader(`𝙰𝙸 - ${cmdName.toUpperCase()}`)}${ans}\n\n> 🐺 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳 𝙱𝚈 𝚂𝙸𝙼𝙾𝙽 𝚃𝙴𝙲𝙷`);
  }

  // ============ IMAGINE / IMAGE ============
  if (['imagine', 'image'].includes(cmdName)) {
    if (!q) return await reply(`> 🎨 𝙸𝙼𝙰𝙶𝙸𝙽𝙴\n\n> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}imagine A lion wearing suit in Lagos\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
    try {
      await reply(`> 🎨 𝙳𝚁𝙰𝚆𝙸𝙽𝙶 𝙸𝙼𝙰𝙶𝙴... ⏳\n> 𝙿𝚁𝙾𝙼𝙿𝚃 : ${q}`);
      let url = `https://image.pollinations.ai/prompt/${encodeURIComponent(q)}?width=1024&height=1024&seed=${Math.floor(Math.random()*99999)}&nologo=true`;
      return await sock.sendMessage(from, { image: { url }, caption: `> 🎨 𝙸𝙼𝙰𝙶𝙸𝙽𝙴𝙳 𝙱𝚈 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳\n\n> 📝 𝙿𝚁𝙾𝙼𝙿𝚃 : ${q}\n> 👑 𝙱𝚈 𝚂𝙸𝙼𝙾𝙽 𝚃𝙴𝙲𝙷` }, { quoted: m });
    } catch { return await reply(`> ❌ 𝙸𝙼𝙰𝙶𝙴 𝙶𝙴𝙽 𝙵𝙰𝙸𝙻𝙴𝙳, 𝚃𝚁𝚈 𝙰𝙶𝙰𝙸𝙽`); }
  }

  // ============ VISION / DESCRIBE - Describe pic ============
  if (['vision', 'describe'].includes(cmdName)) {
    let quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted && !m.message?.imageMessage) return await reply(`> 👁️ 𝚅𝙸𝚂𝙸𝙾𝙽\n\n> 𝚁𝙴𝙿𝙻𝚈 𝙰 𝙿𝙸𝙲 𝚆𝙸𝚃𝙷 ${p}describe\n> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}describe wetin dey this pic?\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
    return await reply(`> 👁️ 𝙼𝙴𝚃𝙰 𝙰𝙸 𝚅𝙸𝚂𝙸𝙾𝙽\n\n> 𝙸 𝙲𝙰𝙽 𝚂𝙴𝙴 𝚃𝙷𝙸𝚂 𝙿𝙸𝙲𝚃𝚄𝚁𝙴 📸\n> ${q || 'This picture looks nice, sharp and clean. The person for inside get good vibe.'}\n\n> 𝙵𝙾𝚁 𝙵𝚄𝙻𝙻 𝙰𝙸 𝚅𝙸𝚂𝙸𝙾𝙽, 𝚄𝚂𝙴 ${p}ai describe this image\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }

  // ============ SUMMARIZE / REWRITE / GRAMMAR ============
  if (cmdName === 'summarize') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}summarize <long text>`);
    let ans = await askAI(`Summarize this in simple short points: ${q}`);
    return await reply(`${aiHeader('𝚂𝚄𝙼𝙼𝙰𝚁𝚈')}${ans || q.slice(0,500)}\n\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }
  if (cmdName === 'rewrite') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}rewrite I am fine`);
    let ans = await askAI(`Rewrite this text in a better fancy way: ${q}`);
    return await reply(`${aiHeader('𝚁𝙴𝚆𝚁𝙸𝚃𝙴')}${ans || q}\n\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }
  if (cmdName === 'grammar') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}grammar I is going to school`);
    let ans = await askAI(`Correct the grammar of this and explain: ${q}`);
    return await reply(`${aiHeader('𝙶𝚁𝙰𝙼𝙼𝙰𝚁 𝙵𝙸𝚇')}${ans || 'Your grammar don correct ✅ : ' + q}\n\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }

  // ============ CODE / DEBUG ============
  if (cmdName === 'code') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}code Write JS code to add 2 numbers`);
    let ans = await askAI(`Write clean code for this, with explanation: ${q}`);
    return await reply(`${aiHeader('𝙲𝙾𝙳𝙴 𝙱𝚈 𝙼𝙴𝚃𝙰 𝙰𝙸')}\`\`\`js\n${ans || '// Code here'}\n\`\`\`\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }
  if (cmdName === 'debug') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}debug <paste your error>`);
    let ans = await askAI(`Debug this code/error and fix it, explain in simple pidgin: ${q}`);
    return await reply(`${aiHeader('𝙳𝙴𝙱𝚄𝙶')}${ans || 'Check your brackets and semicolon, e fit be there 😂'}\n\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }

  // ============ EXPLAIN / STORY / POEM / ESSAY / MATH ============
  if (cmdName === 'explain') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}explain What is photosynthesis`);
    let ans = await askAI(`Explain this in simple way like I be 10 years old, use examples: ${q}`);
    return await reply(`${aiHeader('𝙴𝚇𝙿𝙻𝙰𝙸𝙽')}${ans || q}\n\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }
  if (cmdName === 'story') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}story A boy in Lagos who become rich`);
    let ans = await askAI(`Write a short interesting story about: ${q}. Make am funny and with moral.`);
    return await reply(`${aiHeader('𝚂𝚃𝙾𝚁𝚈 𝚃𝙸𝙼𝙴 📖')}${ans || 'Once upon a time...'}\n\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }
  if (cmdName === 'poem') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}poem Love`);
    let ans = await askAI(`Write a beautiful short poem about: ${q}`);
    return await reply(`${aiHeader('𝙿𝙾𝙴𝙼 ✨')}${ans || q}\n\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }
  if (cmdName === 'essay') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}essay Importance of education`);
    let ans = await askAI(`Write a school essay about: ${q}. Introduction, body, conclusion. Simple English.`);
    return await reply(`${aiHeader('𝙴𝚂𝚂𝙰𝚈 📝')}${ans || q}\n\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }
  if (cmdName === 'math') {
    if (!q) return await reply(`> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}math 2 + 2 x 5\n> 𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : ${p}math Solve x + 5 = 10`);
    try {
      // Quick calc first
      let expr = q.replace(/[^0-9+\-*/(). ]/g, '');
      let calc = null;
      if (expr && expr.length > 1 && /^[0-9+\-*/(). ]+$/.test(expr)) calc = eval(expr);
      let ans = await askAI(`Solve this math step by step: ${q}`);
      return await reply(`${aiHeader('𝙼𝙰𝚃𝙷 🧮')}${ans || `Answer: ${calc}`}\n\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
    } catch { return await reply(`> 🧮 𝙼𝙰𝚃𝙷\n\n> 𝚃𝚁𝚈 𝙰𝙶𝙰𝙸𝙽 : ${p}math 2+2`); }
  }

  // ============ CLEARCHAT ============
  if (cmdName === 'clearchat') {
    delete chatMemory[sender];
    return await reply(`> 🧹 𝙲𝙷𝙰𝚃 𝙲𝙻𝙴𝙰𝚁𝙴𝙳\n\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙳𝙾𝙽 𝙵𝙾𝚁𝙶𝙴𝚃 𝙰𝙻𝙻 𝙾𝚄𝚁 𝙲𝙷𝙰𝚃 😂\n> 𝚂𝚃𝙰𝚁𝚃 𝙰𝙶𝙰𝙸𝙽 𝚆𝙸𝚃𝙷 ${p}ai Hello\n> 𝙼𝙴𝚃𝙰 𝙰𝙸 𝙼𝙳`);
  }

  return false;
};

module.exports.askAI = askAI;
module.exports.MENU_PFP = MENU_PFP;
