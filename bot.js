const puppeteer = require('puppeteer-core');

const TOKEN = "thr1.AAAAAGqg8K1i-WTPiVcgeQ.-gUFQBsy2Eg";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
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
      // Otorga admin automático al usuario que coincida con tu nick
      if (player.name === "TuNombreEnElJuego") {
        room.setPlayerAdmin(player.id, true);
      }
      room.sendAnnouncement("¡Bienvenido! Hosteado desde servidores EE. UU. / Miami 🇻🇪", player.id, 0x00FF00);
    };
  }, TOKEN);

  console.log("El host de Haxball está activo.");
})();
