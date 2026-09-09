const puppeteer = require('puppeteer-core');

// REEMPLAZA ESTE TOKEN POR EL TUYO CADA VEZ QUE VAYAS A ENCENDER EL HOST
const TOKEN = "thr1.AAAAAGqg8TUGHJELCvw4wg.IW6iK2Lb8ik";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();

  page.on('console', msg => console.log('BOT:', msg.text()));

  // Carga la página de Haxball
  await page.goto('https://www.haxball.com/headless', { waitUntil: 'networkidle2' });

  // Espera explícitamente a que HBInit esté disponible en la ventana
  await page.waitForFunction(() => typeof window.HBInit === 'function');

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
      // Admin automático si el nombre coincide con tu Nick
      if (player.name === "TuNombreEnElJuego") {
        room.setPlayerAdmin(player.id, true);
      }
      room.sendAnnouncement("¡Bienvenido! Hosteado desde servidores EE. UU. / Miami 🇻🇪", player.id, 0x00FF00);
    };
  }, TOKEN);

  console.log("El host de Haxball está activo.");
})();
