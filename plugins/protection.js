// plugins/protection.js - GROUP PROTECTION - NORMAL TEXT - BY SIMON TECH
module.exports = [
  {
    name: 'antilink',
    groupOnly: true,
    run: async ({ reply, args, db, F, from }) => {
      if(!args[0]) return reply('Usage: .antilink on / off\nExample: .antilink on');
      db.group = db.group || {};
      db.group[from] = db.group[from] || {};
      db.group[from].antilink = args[0].toLowerCase() !== 'off';
      F.saveDB(db);
      return reply(`Antilink: ${db.group[from].antilink ? 'ON - Links will be deleted' : 'OFF'}`);
    }
  },
  {
    name: 'antispam',
    groupOnly: true,
    run: async ({ reply, args, db, F, from }) => {
      if(!args[0]) return reply('Usage: .antispam on / off');
      db.group = db.group || {};
      db.group[from] = db.group[from] || {};
      db.group[from].antispam = args[0].toLowerCase() !== 'off';
      F.saveDB(db);
      return reply(`Antispam: ${db.group[from].antispam ? 'ON' : 'OFF'}`);
    }
  },
  {
    name: 'antibot',
    groupOnly: true,
    run: async ({ reply, args, db, F, from }) => {
      if(!args[0]) return reply('Usage: .antibot on / off');
      db.group = db.group || {};
      db.group[from] = db.group[from] || {};
      db.group[from].antibot = args[0].toLowerCase() !== 'off';
      F.saveDB(db);
      return reply(`Antibot: ${db.group[from].antibot ? 'ON - Other bots will be removed' : 'OFF'}`);
    }
  },
  {
    name: 'antibadword',
    groupOnly: true,
    run: async ({ reply, args, db, F, from }) => {
      if(!args[0]) return reply('Usage: .antibadword on / off');
      db.group = db.group || {};
      db.group[from] = db.group[from] || {};
      db.group[from].antibadword = args[0].toLowerCase() !== 'off';
      F.saveDB(db);
      return reply(`Antibadword: ${db.group[from].antibadword ? 'ON' : 'OFF'}`);
    }
  },
  {
    name: 'antiviewonce',
    groupOnly: true,
    run: async ({ reply, args, db, F, from }) => {
      if(!args[0]) return reply('Usage: .antiviewonce on / off');
      db.group = db.group || {};
      db.group[from] = db.group[from] || {};
      db.group[from].antiviewonce = args[0].toLowerCase() !== 'off';
      F.saveDB(db);
      return reply(`Antiviewonce: ${db.group[from].antiviewonce ? 'ON - Viewonce will be saved' : 'OFF'}`);
    }
  },
  {
    name: 'antitag',
    groupOnly: true,
    run: async ({ reply, args, db, F, from }) => {
      if(!args[0]) return reply('Usage: .antitag on / off');
      db.group = db.group || {};
      db.group[from] = db.group[from] || {};
      db.group[from].antitag = args[0].toLowerCase() !== 'off';
      F.saveDB(db);
      return reply(`Antitag: ${db.group[from].antitag ? 'ON' : 'OFF'}`);
    }
  },
  {
    name: 'antiforeign',
    groupOnly: true,
    run: async ({ reply, args, db, F, from }) => {
      if(!args[0]) return reply('Usage: .antiforeign on / off\nExample: .antiforeign on 234\nThis will remove numbers not starting with 234');
      db.group = db.group || {};
      db.group[from] = db.group[from] || {};
      db.group[from].antiforeign = args[0].toLowerCase() !== 'off';
      if(args[1]) db.group[from].allowedCode = args[1];
      F.saveDB(db);
      return reply(`Antiforeign: ${db.group[from].antiforeign ? 'ON - Only +' + (db.group[from].allowedCode || '234') + ' allowed' : 'OFF'}`);
    }
  },
  {
    name: 'antidelete',
    groupOnly: true,
    run: async ({ reply, args, db, F, from }) => {
      if(!args[0]) return reply('Usage: .antidelete on / off');
      db.group = db.group || {};
      db.group[from] = db.group[from] || {};
      db.group[from].antidelete = args[0].toLowerCase() !== 'off';
      F.saveDB(db);
      return reply(`Antidelete: ${db.group[from].antidelete ? 'ON - Deleted messages will be recovered' : 'OFF'}`);
    }
  },
  {
    name: 'antipromote',
    groupOnly: true,
    run: async ({ reply, args, db, F }) => {
      db.anti = db.anti || {};
      db.anti.antipromote = args[0] !== 'off';
      F.saveDB(db);
      return reply(`Antipromote: ${db.anti.antipromote ? 'ON - Anyone promoted will be demoted back' : 'OFF'}`);
    }
  },
  {
    name: 'antidemote',
    groupOnly: true,
    run: async ({ reply, args, db, F }) => {
      db.anti = db.anti || {};
      db.anti.antidemote = args[0] !== 'off';
      F.saveDB(db);
      return reply(`Antidemote: ${db.anti.antidemote ? 'ON - Anyone demoted will be promoted back' : 'OFF'}`);
    }
  },
  {
    name: 'protection',
    groupOnly: true,
    run: async ({ reply, db, from }) => {
      let g = db.group?.[from] || {};
      return reply(`PROTECTION SETTINGS FOR THIS GROUP\n\nAntilink: ${g.antilink ? 'ON' : 'OFF'}\nAntispam: ${g.antispam ? 'ON' : 'OFF'}\nAntibot: ${g.antibot ? 'ON' : 'OFF'}\nAntibadword: ${g.antibadword ? 'ON' : 'OFF'}\nAntiviewonce: ${g.antiviewonce ? 'ON' : 'OFF'}\nAntitag: ${g.antitag ? 'ON' : 'OFF'}\nAntiforeign: ${g.antiforeign ? 'ON' : 'OFF'}\nAntidelete: ${g.antidelete ? 'ON' : 'OFF'}\nAntipromote: ${db.anti?.antipromote ? 'ON' : 'OFF'}\nAntidemote: ${db.anti?.antidemote ? 'ON' : 'OFF'}\n\nUse .antilink on to turn on any protection.`);
    }
  },
  {
    name: 'protectall',
    groupOnly: true,
    run: async ({ reply, db, F, from }) => {
      db.group = db.group || {};
      db.group[from] = db.group[from] || {};
      db.group[from].antilink = true;
      db.group[from].antispam = true;
      db.group[from].antibot = true;
      db.group[from].antibadword = true;
      db.group[from].antiviewonce = true;
      db.group[from].antitag = true;
      db.group[from].antidelete = true;
      db.anti = db.anti || {};
      db.anti.antipromote = true;
      db.anti.antidemote = true;
      F.saveDB(db);
      return reply('All protections turned ON for this group.\nUse .protection to see settings.');
    }
  },
  {
    name: 'unprotect',
    groupOnly: true,
    run: async ({ reply, db, F, from }) => {
      db.group = db.group || {};
      db.group[from] = {};
      db.anti = db.anti || {};
      db.anti.antipromote = false;
      db.anti.antidemote = false;
      F.saveDB(db);
      return reply('All protections turned OFF for this group.');
    }
  }
];
