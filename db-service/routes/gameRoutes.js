
// const express = require('express');
// const router = express.Router();
// const { 
//   createGame, 
//   getAvailableGames, 
//   joinPlayerByGameCode,  // הפונקציה הישנה
//   getGameById,
//   updateGameStatus,
//   deleteGame,
  
//   // 🆕 פונקציות חדשות לחדר המתנה
//   getRoomStatus,
//   joinGameRoom,         // הפונקציה החדשה המשופרת
//   startGameRoom,
//   leaveGameRoom
// } = require('../controllers/gameController');

// // ========== נתיבים בסיסיים (קיימים) ==========
// router.post('/createGame', createGame);
// router.get('/getAvailableGames', getAvailableGames);
// router.post('/joinPlayerByGameCode', joinPlayerByGameCode);  // הישן - לתאימות לאחור

// // נתיבים לניהול משחק
// router.get('/:gameId', getGameById);                    
// router.put('/:gameId/status', updateGameStatus);        
// router.delete('/:gameId', deleteGame);                  

// // ========== 🆕 נתיבים חדשים לחדר המתנה ==========

// // 📋 קבלת מצב חדר המתנה
// router.get('/:gameId/room/status', getRoomStatus);

// // 🚪 הצטרפות לחדר המתנה (גרסה משופרת)
// router.post('/room/join', joinGameRoom);

// //  התחלת משחק על ידי המארח
// router.post('/:gameId/room/start', startGameRoom);

// // 🚪 יציאה מחדר המתנה
// router.post('/:gameId/room/leave', leaveGameRoom);

// module.exports = router;


// ================================
// gameRoutes.js מעודכן
// ================================

const express = require('express');
const router = express.Router();

const { 
  createGame, 
  getAvailableGames, 
  joinPlayerByGameCode,    // הישנה
  getGameById,
  updateGameStatus,
  deleteGame,
  // ✅ פונקציות חדשות
  joinPrivateGameByCode,   // הצטרפות למשחק פרטי
  joinPublicGameAuto,      // הצטרפות אוטומטית למשחק ציבורי
  leaveGame,               // עזיבת משחק
  getGameByJoinCode        // קבלת משחק לפי קוד
} = require('../controllers/gameController');

// ================================
// נתיבים קיימים
// ================================
router.post('/createGame', createGame);
router.get('/getAvailableGames', getAvailableGames);
router.post('/joinPlayerByGameCode', joinPlayerByGameCode);  // ישן - נשמור תאימות
router.get('/:gameId', getGameById);
router.put('/:gameId/status', updateGameStatus);
router.delete('/:gameId', deleteGame);

// ================================
// ✅ נתיבים חדשים למשחקים
// ================================

// הצטרפות למשחק פרטי עם קוד
router.post('/join/private', joinPrivateGameByCode);
// POST /api/games/join/private
// Body: { "joinCode": "G12345", "playerName": "אבי", "playerId": "abc123" }

// הצטרפות אוטומטית למשחק ציבורי
router.post('/join/public', joinPublicGameAuto);
// POST /api/games/join/public  
// Body: { "playerName": "שרה", "playerId": "def456", "preferredMaxPlayers": 4 }

// עזיבת משחק
router.post('/:gameId/leave', leaveGame);
// POST /api/games/[gameId]/leave
// Body: { "playerId": "abc123", "reason": "Connection lost" }

// קבלת משחק לפי קוד (לבדיקה)
router.get('/code/:joinCode', getGameByJoinCode);

router.put('/:gameId/status', updateGameStatus);

// קבלת כל השחקנים במשחק
router.get('/:gameId/players', async (req, res) => {
  try {
    const { gameId } = req.params;
    const Game = require('../models/Game');
    
    const game = await Game.findById(gameId);
    
    if (!game) {
      return res.status(404).json({ message: 'משחק לא נמצא' });
    }
    
    res.status(200).json({
      success: true,
      players: game.players,
      count: game.players.length,
      maxPlayers: game.maxPlayers
    });
    
  } catch (error) {
    res.status(500).json({ message: 'שגיאת שרת', error: error.message });
  }
});

// בדיקת סטטוס משחק
router.get('/:gameId/status', async (req, res) => {
  try {
    const { gameId } = req.params;
    const Game = require('../models/Game');
    
    const game = await Game.findById(gameId, 'status players maxPlayers');
    
    if (!game) {
      return res.status(404).json({ message: 'משחק לא נמצא' });
    }
    
    res.status(200).json({
      success: true,
      gameId: gameId,
      status: game.status,
      currentPlayers: game.players.length,
      maxPlayers: game.maxPlayers,
      isFull: game.players.length >= game.maxPlayers,
      canJoin: game.status === 'WAITING' && game.players.length < game.maxPlayers
    });
    
  } catch (error) {
    res.status(500).json({ message: 'שגיאת שרת', error: error.message });
  }
});


module.exports = router;