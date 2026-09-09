const puppeteer = require('puppeteer');

// REEMPLAZA ESTE TOKEN POR EL TUYO CADA VEZ QUE VAYAS A ENCENDER EL HOST
const TOKEN = "thr1.AAAAAGqg6JMW40Fvjr7VoA.8pJSQG4Yg6o";

(async () => {
  const browser = await puppeteer.launch({
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
      // Ubicación forzada en Venezuela (Margarita) pero hosteada desde EE. UU.
      geo: { code: "ve", lat: 10.9575, lon: -63.8697 }
    });

    room.setDefaultStadium("Big");
    room.setScoreLimit(3);
    room.setTimeLimit(3);

    room.onPlayerJoin = function(player) {
      room.sendAnnouncement("¡Bienvenido! Hosteado desde servidores EE. UU. / Miami 🇻🇪", player.id, 0x00FF00);
    };
  }, TOKEN);

  console.log("El host de Haxball está activo.");
})();
