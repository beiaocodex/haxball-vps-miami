const puppeteer = require('puppeteer-core');

const TOKEN = "thr1.AAAAAGqg7MqcPOXHgJo8Dw.w5APOtVUgqY";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();

  page.on('console', msg => console.log('BOT:', msg.text()));

  await page.goto('https://www.haxball.com/headless');

  await page.evaluate((token) => {
    window.room = HBInit({
      roomName: "⚽ [VE / MIAMI] Tu Sala Gratis",
      maxPlayers: 12,
      public: true,
      token: token,
      noPlayer: true,
      geo: { code: "ve", lat: 10.9575, lon: -63.8697 }
    });

    room.setDefaultStadium("Big");
    room.setScoreLimit(3);
    room.setTimeLimit(3);

   room.onPlayerJoin = function(player) {
      // Reemplaza "besinhooo" por tu Nick exacto en Haxball
      if (player.name === "besinhoooo") {
        room.setPlayerAdmin(player.id, true);
      }

      room.sendAnnouncement("¡Bienvenido! Hosteado desde servidores EE. UU. / Miami 🇻🇪", player.id, 0x00FF00);
    };
