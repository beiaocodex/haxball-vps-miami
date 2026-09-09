const puppeteer = require('puppeteer-core');

// REEMPLAZA ESTE TOKEN POR EL TUYO CADA VEZ QUE VAYAS A ENCENDER EL HOST
const TOKEN = "thr1.AAAAAGqg-soIGlonvTcKUA.rC_tulFMF4E";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--ignore-certificate-errors',
      '--use-gl=angle',
      '--use-angle=gl-egl'
    ]
  });
  
  const page = await browser.newPage();

  page.on('console', msg => console.log('BOT:', msg.text()));

  // Carga la página de Haxball Headless
  await page.goto('https://www.haxball.com/headless', { waitUntil: 'networkidle2' });

  // Espera a que la API de Haxball esté cargada
  await page.waitForFunction(() => typeof window.HBInit === 'function');

  await page.evaluate((token) => {
    window.room = HBInit({
      roomName: "⚽ [VE / MIAMI] Tu Sala Gratis",
      maxPlayers: 12,
      public: true,
      token: token,
      noPlayer: true
    });

    room.setDefaultStadium("Big");
    room.setScoreLimit(3);
    room.setTimeLimit(3);

    room.onPlayerJoin = function(player) {
      // Reemplaza TuNickExacto con el nombre que usas para jugar
      if (player.name === "besinhoooo") {
        room.setPlayerAdmin(player.id, true);
      }
      room.sendAnnouncement("¡Bienvenido! Hosteado con bajo ping desde Miami 🇻🇪", player.id, 0x00FF00);
    };
  }, TOKEN);

  console.log("El host de Haxball está activo.");
})();
