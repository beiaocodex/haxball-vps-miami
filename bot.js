// Stats: "Auth" : '["0-Games", "1-Wins", "2-Draws", "3-Losses", "4-Winrate", "5-Goals", "6-Assists", "7-GK", "8-CS", "9-CS%", "10-Role", "11-Nick", "12-XP", "13-Level"]'

/* VARIABLES GENERALES */

const roomName = "🌙 [ 𝗡𝗢𝗖𝗧𝗜𝗚𝗢𝗟 ] 🌙 x5 Venezuela";
const botName = "Nocti bot";
const maxPlayers = 30; // Capacidad máxima ajustada a 30 jugadores
const roomPublic = true;
const geo = [{ code: "VE", lat: 10.4806, lon: -66.8983 }];

const room = HBInit({ 
    roomName: roomName, 
    maxPlayers: maxPlayers, 
    public: roomPublic, 
    playerName: botName, 
    geo: geo[0] 
});

const adminPassword = "noctiadmin";
const vipPassword = "noctivip";

const scoreLimitFutsal = 3;
const timeLimitFutsal = 5;

// Variables del sistema de experiencia (XP)
const XP_PER_WIN = 100;
const XP_PER_GOAL = 20;
const XP_PER_ASSIST = 15;
const XP_PER_GAME = 30;

// Objeto para almacenamiento de datos (Simulación de DB/Memoria Local)
var statsDatabase = {};

/* MENSAJES Y FRASES */

const frasesgoles = [
    " Mira que te como dijo ", 
    " ¡Vestite que no se puede jugar desnudo en la cancha ", 
    " Apareciendo cuando mas se le necesita, el amo y señor de haxball ", 
    " estás on fire 🔥🔥🔥 ", 
    " Increible el golazo de ", 
    " Futbol champagne señores! de parte de "
];

const frasesasis = [
    " 🔥🔥 ¡Y el pase milimetrico de ", 
    " ¡Y donde pone el ojo pone el pase ", 
    " ¡Con tremendo pase de ", 
    " ¡Asistencia fenomenal de "
];

const frasesautogol = [
    " ¡Prende el monitor! ", 
    " Para que te trajeee ", 
    " ¡El troll de troles es ", 
    " ¡Se equivoco de arco "
];

room.setTeamsLock(true);
room.setScoreLimit(scoreLimitFutsal);
room.setTimeLimit(timeLimitFutsal);

/* SISTEMA DE NIVELES Y EXPERIENCIA */

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

/* GESTIÓN Y RESETEO MENSUAL DE ESTADÍSTICAS */

function checkMonthlyReset() {
    const today = new Date();
    // Verifica si es el primer día del mes
    if (today.getDate() === 1) {
        for (let auth in statsDatabase) {
            // Reseteo de partidas, victorias, derrotas, goles, asistencias
            statsDatabase[auth][0] = 0; // Games
            statsDatabase[auth][1] = 0; // Wins
            statsDatabase[auth][2] = 0; // Draws
            statsDatabase[auth][3] = 0; // Losses
            statsDatabase[auth][4] = "0%"; // Winrate
            statsDatabase[auth][5] = 0; // Goals
            statsDatabase[auth][6] = 0; // Assists
            statsDatabase[auth][7] = 0; // GK
            statsDatabase[auth][8] = 0; // CS
            statsDatabase[auth][9] = "0%"; // CS%
            // XP y Nivel se conservan
        }
        room.sendChat("📅 ¡Las estadísticas mensuales de Futsal han sido reseteadas exitosamente!");
    }
}

// Comprobación de reseteo al iniciar
checkMonthlyReset();

/* COMANDOS DE CHAT */

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
            room.sendChat(`📊 [STATS FUTSAL] ${player.name} | PJ: ${pData[0]} | G: ${pData[5]} | A: ${pData[6]} | WR: ${pData[4]}`, player.id);
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
        } else {
            room.sendChat("❌ Contraseña incorrecta.", player.id);
        }
        return false;
    }
};

/* EVENTOS DE JUGADORES Y PARTIDA */

room.onPlayerJoin = function(player) {
    if (!statsDatabase[player.auth]) {
        // Inicialización de estructura del jugador
        statsDatabase[player.auth] = [0, 0, 0, 0, "0%", 0, 0, 0, 0, "0%", "User", player.name, 0, 1];
    } else {
        statsDatabase[player.auth][11] = player.name; // Actualizar Nick
    }
    room.sendChat(`👋 ¡Bienvenido ${player.name} a NOCTIGOL Futsal! Usa !stats y !level para ver tu progreso.`);
};

room.onTeamVictory = function(scores) {
    let winningTeam = scores.red > scores.blue ? 1 : 2;
    let players = room.getPlayerList();

    players.forEach(p => {
        if (p.team !== 0 && statsDatabase[p.auth]) {
            // Partida jugada
            statsDatabase[p.auth][0]++; 
            addXP(p.auth, XP_PER_GAME, p);

            if (p.team === winningTeam) {
                statsDatabase[p.auth][1]++; // Victorias
                addXP(p.auth, XP_PER_WIN, p);
            } else {
                statsDatabase[p.auth][3]++; // Derrotas
            }

            // Recálculo de Winrate
            let wins = statsDatabase[p.auth][1];
            let games = statsDatabase[p.auth][0];
            statsDatabase[p.auth][4] = Math.round((wins / games) * 100) + "%";
        }
    });
};

room.onPlayerGoal = function(player, team) {
    if (player && statsDatabase[player.auth]) {
        statsDatabase[player.auth][5]++; // Goles
        addXP(player.auth, XP_PER_GOAL, player);
        
        let randFrase = frasesgoles[Math.floor(Math.random() * frasesgoles.length)];
        room.sendChat(`⚽ ¡GOL! ${randFrase} ${player.name}!`);
    }
};
