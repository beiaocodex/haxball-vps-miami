// Multi-room Haxball host using haxball.js
// This script reads rooms-config.json and creates multiple headless rooms.
// Requirements: node 18+, npm i

const HaxballJS = require('haxball.js');
const fs = require('fs');

const CONFIG_PATH = './rooms-config.json';
if (!fs.existsSync(CONFIG_PATH)) {
  console.error('rooms-config.json not found. Create it from rooms-config.example.json and add your tokens.');
  process.exit(1);
}

const rooms = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

function safeLog(...args) {
  console.log(new Date().toISOString(), ...args);
}

HaxballJS.then((HBInit) => {
  safeLog('haxball.js initialized. Creating', rooms.length, 'rooms...');

  rooms.forEach((r, i) => {
    try {
      const geo = r.geo || { code: 'VE', lat: 10.4806, lon: -66.9036 };
      const opts = {
        roomName: r.roomName || `Sala ${i+1}`,
        maxPlayers: r.maxPlayers || 16,
        public: r.public !== false,
        noPlayer: true,
        token: r.token || undefined,
        geo: geo,
        // proxy: r.proxy || undefined // Uncomment if you want to use proxies per room
      };

      const room = HBInit(opts);

      room.setDefaultStadium(r.stadium || 'Big');
      room.setScoreLimit(r.scoreLimit || 0);
      room.setTimeLimit(r.timeLimit || 0);
      if (r.autoLockTeams) room.setTeamsLock(true);

      room.onRoomLink = (link) => safeLog(`[room ${i}] LINK: ${link}`);
      room.onPlayerJoin = (player) => safeLog(`[room ${i}] JOIN: ${player.name} (id:${player.id})`);
      room.onPlayerLeave = (player) => safeLog(`[room ${i}] LEAVE: ${player.name}`);

      // simple chat command example
      room.onPlayerChat = (player, message) => {
        if (!message) return;
        const msg = message.trim();
        if (msg === '!ping') {
          room.sendAnnouncement(`Pong! (${new Date().toLocaleTimeString()})`, player.id);
        }
      };

      safeLog(`Created room ${i}: ${opts.roomName}`);
    } catch (err) {
      safeLog(`Error creating room ${i}:`, err && err.message ? err.message : err);
    }
  });
});

process.on('SIGINT', () => {
  safeLog('SIGINT received — exiting');
  process.exit(0);
});
process.on('SIGTERM', () => {
  safeLog('SIGTERM received — exiting');
  process.exit(0);
});
