const puppeteer = require('puppeteer-core');

// REEMPLAZA ESTE TOKEN POR EL TUYO CADA VEZ QUE VAYAS A ENCENDER EL HOST
const TOKEN = "thr1.AAAAAGqhrV0xth9rMyQ5Aw.VPV0oBq8Sq0";

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new', // o true
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--single-process'
    ]
  });
  
  // resto de tu código de Haxball
})();
  
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
      noPlayer: true,
      // Esta línea hace que la sala salga en Venezuela en la lista publica:
      geo: { code: "ve", lat: 11.4045, lon: -69.6734 }
    });

    room.setDefaultStadium("Big");
    room.setScoreLimit(3);
    room.setTimeLimit(3);

    room.onPlayerJoin = function(player) {
      if (player.name === "besinhoooo") {
        room.setPlayerAdmin(player.id, true);
      }
      room.sendAnnouncement("¡Bienvenido! Hosteado desde Miami, USA 🇻🇪", player.id, 0x00FF00);
    };
  }, TOKEN);

  console.log("El host de Haxball está activo.");
})();
