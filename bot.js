const puppeteer = require('puppeteer');

// 🔑 PEGA TU TOKEN DE HAXBALL AQUÍ ABAJO (entre las comillas)
const HAXBALL_TOKEN = "thr1.AAAAAGqnaMZI-netwhLTog.jtrpuCg12Ck"; 

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();

  // Imprimir los logs de la consola dentro de la pestaña de GitHub Actions
  page.on('console', msg => console.log('BOT LOG:', msg.text()));
  page.on('pageerror', err => console.log('BOT ERROR:', err.toString()));

  await page.goto('https://html5.haxball.com/headless', { waitUntil: 'networkidle2' });

  // Esperar a que la API de HaxBall cargue completamente
  await page.waitForFunction(() => typeof window.HBInit === 'function');

  // Inyectar el token y la configuración dentro de la página
  await page.evaluate((token) => {
    const roomName = "🌙 [ 𝗡𝗢𝗖𝗧𝗜𝗚𝗢𝗟 ] 🌙 x5 Venezuela";
    const botName = "Nocti bot";
    const maxPlayers = 30;
    const roomPublic = true;
    const geo = [{ code: "VE", lat: 10.4806, lon: -66.8983 }];

    window.room = HBInit({ 
        roomName: roomName, 
        maxPlayers: maxPlayers, 
        public: roomPublic, 
        playerName: botName, 
        geo: geo[0],
        token: token // Token aplicado aquí
    });

    // Mostrar el enlace de la sala en los logs de GitHub cuando se cree
    window.room.onRoomLink = function(link) {
        console.log("==========================================");
        console.log("🔗 ENLACE DE LA SALA:", link);
        console.log("==========================================");
    };

    const adminPassword = "noctiadmin";
    const scoreLimitFutsal = 3;
    const timeLimitFutsal = 5;

    const XP_PER_WIN = 100;
    const XP_PER_GOAL = 20;
    const XP_PER_GAME = 30;

    var statsDatabase = {};

    const frasesgoles = [
        " Mira que te como dijo ", 
        " ¡Vestite que no se puede jugar desnudo en la cancha ", 
        " Apareciendo cuando mas se le necesita, el amo y señor de haxball ", 
        " estás on fire 🔥🔥🔥 ", 
        " Increible el golazo de ", 
        " Futbol champagne señores! de parte de "
    ];

    room.setTeamsLock(true);
    room.setScoreLimit(scoreLimitFutsal);
    room.setTimeLimit(timeLimitFutsal);

    function getRequiredXP(level) {
        return Math.floor(100 * Math.pow(level, 1.5));
    }

    function addXP(playerAuth, amount, player) {
        if (!statsDatabase[playerAuth]) return;
        let currentXP = (statsDatabase[playerAuth][12] || 0) + amount;
        let currentLevel = statsDatabase[playerAuth][13] || 1;
        let requiredXP = getRequiredXP(currentLevel);

        while (currentXP >= requiredXP) {
            currentXP -= requiredXP;
            currentLevel++;
            room.sendChat(`🎉 ¡FELICITACIONES! ${player.name} ha subido al Nivel ${currentLevel} 🌟`, player.id);
            requiredXP = getRequiredXP(currentLevel);
        }

        statsDatabase[playerAuth][12] = currentXP;
        statsDatabase[playerAuth][13] = currentLevel;
    }

    room.onPlayerChat = function(player, message) {
        let msg = message.trim().toLowerCase();

        if (msg === "!level" || msg === "!lvl") {
            let auth = player.auth;
            if (statsDatabase[auth]) {
                let lvl = statsDatabase[auth][13] || 1;
                let xp = statsDatabase[auth][12] || 0;
                let reqXp = getRequiredXP(lvl);
                room.sendChat(`⭐ [NIVEL] ${player.name} | Nivel: ${lvl} | XP: ${xp}/${reqXp}`, player.id);
            } else {
                room.sendChat(`⚠️ No tienes registro de estadísticas aún.`, player.id);
            }
            return false;
        }

        if (msg === "!stats") {
            let auth = player.auth;
            if (statsDatabase[auth]) {
                let pData = statsDatabase[auth];
                room.sendChat(`📊 [STATS FUTSAL] ${player.name} | PJ: ${pData[0]} | G: ${pData[5]} | WR: ${pData[4]}`, player.id);
            } else {
                room.sendChat(`⚠️ No hay datos registrados para tu cuenta.`, player.id);
            }
            return false;
        }

        if (msg.startsWith("!admin ")) {
            let pass = message.split(" ")[1];
            if (pass === adminPassword) {
                room.setPlayerAdmin(player.id, true);
                room.sendChat("✅ Modo administrador activado.", player.id);
            }
            return false;
        }
    };

    room.onPlayerJoin = function(player) {
        if (!statsDatabase[player.auth]) {
            statsDatabase[player.auth] = [0, 0, 0, 0, "0%", 0, 0, 0, 0, "0%", "User", player.name, 0, 1];
        } else {
            statsDatabase[player.auth][11] = player.name;
        }
        room.sendChat(`👋 ¡Bienvenido ${player.name} a NOCTIGOL Futsal! Usa !stats y !level para ver tu progreso.`);
    };

    room.onTeamVictory = function(scores) {
        let winningTeam = scores.red > scores.blue ? 1 : 2;
        let players = room.getPlayerList();

        players.forEach(p => {
            if (p.team !== 0 && statsDatabase[p.auth]) {
                statsDatabase[p.auth][0]++; 
                addXP(p.auth, XP_PER_GAME, p);

                if (p.team === winningTeam) {
                    statsDatabase[p.auth][1]++;
                    addXP(p.auth, XP_PER_WIN, p);
                } else {
                    statsDatabase[p.auth][3]++;
                }

                let wins = statsDatabase[p.auth][1];
                let games = statsDatabase[p.auth][0];
                statsDatabase[p.auth][4] = Math.round((wins / games) * 100) + "%";
            }
        });
    };

    room.onPlayerGoal = function(player, team) {
        if (player && statsDatabase[player.auth]) {
            statsDatabase[player.auth][5]++;
            addXP(player.auth, XP_PER_GOAL, player);
            let randFrase = frasesgoles[Math.floor(Math.random() * frasesgoles.length)];
            room.sendChat(`⚽ ¡GOL! ${randFrase} ${player.name}!`);
        }
    };
  }, HAXBALL_TOKEN);

  console.log("Host de Haxball iniciado con token exitosamente.");
})();
