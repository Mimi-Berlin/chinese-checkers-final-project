const Game = require('../models/Game');

const createGame = async (req, res) => {
  try {
    console.log('=== Creating new game ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      creator,
      isPublic,
      joinCode,
      gameType,
      maxPlayers,
      status
    } = req.body;

    if (!creator) {
      return res.status(400).json({ message: 'Creator is required' });
    }

    if (!maxPlayers || maxPlayers < 2 || maxPlayers > 6) {
      return res.status(400).json({ message: 'Invalid maxPlayers (must be 2-6)' });
    }


    // ✅ מיפוי צבעים לפי PieceType (בהתאם ל-Board.cpp)
    const pieceColors = {
      1: 'pink',    // PLAYER1
      2: 'orange',  // PLAYER2  
      3: 'brown',   // PLAYER3
      4: 'green',   // PLAYER4
      5: 'blue',    // PLAYER5
      6: 'purple'   // PLAYER6
    };
    
    // ✅ מיפוי שחקנים פעילים לפי מספר שחקנים
    let activePlayerIndices = [];
    if (maxPlayers === 2) {
      activePlayerIndices = [1, 4];
    } else if (maxPlayers === 3) {
      activePlayerIndices = [1, 3, 5];
    } else if (maxPlayers === 4) {
      activePlayerIndices = [1, 3, 4, 6];
    } else if (maxPlayers === 6) {
      activePlayerIndices = [1, 2, 3, 4, 5, 6];
    }

    // ✅ **Debug: הדפסת תוכן ה-creator object**
    console.log('🔍 DEBUG: Creator object received:', creator);
    console.log('🔍 Available fields in creator:', Object.keys(creator));

    // ✅ **תיקון: יצירת השחקן היוצר עם כל הפרטים**
    const creatorPieceType = activePlayerIndices[0]; // הראשון ברשימה
    const creatorColor = pieceColors[creatorPieceType] ;
    
    let finalPlayerId = '';
    let finalPlayerName = '';
    
    // ✅ חיפוש playerId בסדר העדיפות הנכון
    if (creator.playerId) {
      finalPlayerId = creator.playerId;
      console.log('✅ Found playerId:', finalPlayerId);
    } else if (creator._id) {
      finalPlayerId = creator._id;
      console.log('✅ Found _id:', finalPlayerId);
    } else {
      finalPlayerId = `creator_${Date.now()}`;
      console.log('🚨 Using fallback playerId:', finalPlayerId);
    }
    
    // ✅ חיפוש name בסדר העדיפות הנכון
    if (creator.playerName) {
      finalPlayerName = creator.playerName;
      console.log('✅ Found playerName:', finalPlayerName);
    } else if (creator.name) {
      finalPlayerName = creator.name;
      console.log('✅ Found name:', finalPlayerName);
    } else {
      finalPlayerName = 'Host';
      console.log('🚨 Using fallback name:', finalPlayerName);
    }
    
    const creatorPlayer = {
      playerId: finalPlayerId,    
      name: finalPlayerName,   
      color: creatorColor,                                                  // ✅ צבע אוטומטי
      playerIndex: 0,                                                       // ✅ תמיד ראשון
      pieceType: creatorPieceType,
      isHost: true,                                                         // ✅ מארח
      type: 'human'                                                         // ✅ אנושי
    };

    console.log('✅ Creator player created:', creatorPlayer);

    // ✅ טיפול חכם ב-joinCode
    let finalJoinCode = joinCode || "0";
    
    if (!isPublic && (finalJoinCode === "" || finalJoinCode === "0")) {
      finalJoinCode = 'G' + Date.now().toString().slice(-6);
      console.log('Generated joinCode for private game:', finalJoinCode);
    }
    
    if (gameType === 'bot' && isPublic) {
      finalJoinCode = "0";
    }

    let players = [creatorPlayer]; 
    
    // אם זה משחק בוט, הוסף בוטים
    if (gameType === 'bot') {
      console.log(`Adding bots for ${maxPlayers}-player bot game`);
      
      // הוסף בוטים לשאר המקומות
      for (let i = 1; i < activePlayerIndices.length; i++) {
        const pieceType = activePlayerIndices[i];
        const botColor = pieceColors[pieceType];
        
        const botPlayer = {
          playerId: `bot_${pieceType}_${Date.now()}_${i}`,
          name: `Robot ${pieceType}`,
          color: botColor,
          playerIndex: i,
          pieceType: pieceType,
          isHost: false,
          type: 'bot'
        };
        
        players.push(botPlayer);
        console.log(`Added bot: ${botPlayer.name} (Color: ${botPlayer.color}, PieceType: ${botPlayer.pieceType})`);
      }
      
      console.log(`Total players in ${maxPlayers}-player bot game: ${players.length}`);
      

      players.forEach((player, index) => {
        console.log(`  Player ${index}: ${player.name} (${player.color}, PieceType: ${player.pieceType}, Type: ${player.type})`);
      });
    }

    // יצירת המשחק
    const newGame = new Game({
      gameType: gameType || 'online',
      joinCode: finalJoinCode,
      isPublic: isPublic ?? true,
      maxPlayers: maxPlayers,
      players: players,          
      status: status || 'WAITING',
      createdAt: new Date()
    });

    // אם זה משחק בוט והוא מלא, שנה סטטוס לפעיל
    if (gameType === 'bot' && players.length === maxPlayers) {
      newGame.status = 'ACTIVE';
      console.log('Bot game is full - status changed to ACTIVE');
    }

    console.log('Saving game:', JSON.stringify(newGame, null, 2));
    
    const savedGame = await newGame.save();
    
    console.log('✅ Game saved successfully with ID:', savedGame._id);
    console.log('✅ Creator details:', savedGame.players[0]);

    res.status(201).json({
      message: 'Game created successfully',
      game: savedGame
    });
    
  } catch (error) {
    console.error('Error creating game:', error);
    
    if (error.code === 11000) {
      console.log('Duplicate join code, retrying with new code...');
      return res.status(409).json({ 
        message: 'Join code already exists, please try again',
        error: 'Duplicate join code',
        suggestion: 'Retry request'
      });
    }
    
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};
  
const getAvailableGames = async (req, res) => {
  try {
    console.log('=== Getting available games ===');
    
    const availableGames = await Game.aggregate([
      {
        $match: {
          gameType: 'online',
          status: 'WAITING',
          $expr: { $lt: [{ $size: "$players" }, "$maxPlayers"] }  
        }
      },
      { $sort: { createdAt: -1 } }  
    ]);
    
    console.log(`Found ${availableGames.length} available games`);
    
    return res.status(200).json(availableGames);
    
  } catch (error) {
    console.error('Error fetching available games:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch available games',
      message: error.message 
    });
  }
};

const joinPlayerByGameCode = async (req, res) => {
  try {
    console.log('=== Player joining game ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { gameCode, playerName, playerId } = req.body;

    // ולידציה
    if (!gameCode || !playerName || !playerId) {
      return res.status(400).json({ 
        message: 'Missing required fields: gameCode, playerName, playerId' 
      });
    }

    // ✅ בדיקה שהקוד לא ריק
    if (gameCode === "" || gameCode === "0") {
      return res.status(400).json({ 
        message: 'Invalid game code. Public games cannot be joined by code.' 
      });
    }

    // ✅ שימוש בפונקציה הסטטית המתוקנת
    const game = await Game.findByJoinCode(gameCode);

    if (!game) {
      return res.status(404).json({ 
        message: 'Game not found or already started' 
      });
    }

    // בדיקה שהמשחק לא מלא
    if (game.players.length >= game.maxPlayers) {
      return res.status(409).json({ 
        message: 'Game is full' 
      });
    }

    // בדיקה שהשחקן לא כבר במשחק
    const existingPlayer = game.players.find(p => p.playerId === playerId);
    if (existingPlayer) {
      return res.status(409).json({ 
        message: 'Player already in this game' 
      });
    }

    // צבעים זמינים
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    const usedColors = game.players
      .map(p => p.color)
      .filter(color => color); // רק צבעים שקיימים
    const availableColor = colors.find(color => !usedColors.includes(color)) || 'gray';

    // יצירת שחקן חדש
    const newPlayer = {
      playerId: playerId,
      name: playerName,
      color: availableColor,
      isHost: false,
      type: 'human'
    };

    console.log('Adding player:', newPlayer);

    // הוספת השחקן למשחק
    game.players.push(newPlayer);
    
    // // אם המשחק התמלא, שנה סטטוס לפעיל
    // if (game.players.length === game.maxPlayers) {
    //   game.status = 'ACTIVE';
    //   console.log('Game is now full - status changed to ACTIVE');
    // }
    
    const updatedGame = await game.save();
    
    console.log(`Player ${playerName} joined game ${gameCode} successfully`);

    res.status(200).json({
      message: 'Joined game successfully',
      game: updatedGame,
      playerColor: availableColor,
      gameStatus: updatedGame.status
    });
    
  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// פונקציה חדשה - קבלת משחק לפי ID
const getGameById = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    console.log(`Getting game by ID: ${gameId}`);
    
    const game = await Game.findById(gameId);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    res.status(200).json(game);
    
  } catch (error) {
    console.error('Error getting game by ID:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

const updateGameStatus = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { status } = req.body;
    
    console.log(`🔄 Updating game ${gameId} status to: ${status}`);
    
    // ולידציה של gameId
    if (!gameId) {
      return res.status(400).json({ 
        message: 'Missing gameId parameter' 
      });
    }
    
    // ולידציה של status
    const validStatuses = ['WAITING', 'ACTIVE', 'FINISHED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be: ' + validStatuses.join(', ') 
      });
    }
    
    // חיפוש המשחק
    const game = await Game.findById(gameId);
    
    if (!game) {
      console.log(`❌ Game not found: ${gameId}`);
      return res.status(404).json({ 
        message: 'Game not found' 
      });
    }
    
    // שמירת הסטטוס הקודם לצורך לוג
    const previousStatus = game.status;
    
    // עדכון הסטטוס
    game.status = status;
    const updatedGame = await game.save();
    
    console.log(`✅ Game ${gameId} status updated from ${previousStatus} to ${status}`);
    console.log(`📊 Game details - Players: ${updatedGame.players.length}/${updatedGame.maxPlayers}, Type: ${updatedGame.gameType}`);
    
    // תגובה מוצלחת עם פרטי המשחק
    res.status(200).json({
      success: true,
      message: `Game status updated successfully from ${previousStatus} to ${status}`,
      game: {
        id: updatedGame._id,
        status: updatedGame.status,
        previousStatus: previousStatus,
        currentPlayers: updatedGame.players.length,
        maxPlayers: updatedGame.maxPlayers,
        gameType: updatedGame.gameType,
        isPublic: updatedGame.isPublic,
        joinCode: updatedGame.joinCode !== "0" ? updatedGame.joinCode : null,
        players: updatedGame.players.map(p => ({
          playerId: p.playerId,
          name: p.name,
          color: p.color,
          isHost: p.isHost,
          type: p.type
        }))
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating game status:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message,
      gameId: req.params.gameId
    });
  }
};

// // פונקציה חדשה - עדכון סטטוס משחק
// const updateGameStatus = async (req, res) => {
//   try {
//     const { gameId } = req.params;
//     const { status } = req.body;
    
//     console.log(`Updating game ${gameId} status to: ${status}`);
    
//     // ולידציה
//     const validStatuses = ['WAITING', 'ACTIVE', 'FINISHED'];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ 
//         message: 'Invalid status. Must be: ' + validStatuses.join(', ') 
//       });
//     }
    
//     const game = await Game.findByIdAndUpdate(
//       gameId, 
//       { status: status }, 
//       { new: true }
//     );
    
//     if (!game) {
//       return res.status(404).json({ message: 'Game not found' });
//     }
    
//     console.log(`Game ${gameId} status updated to ${status}`);
    
//     res.status(200).json({
//       message: 'Game status updated successfully',
//       game: game
//     });
    
//   } catch (error) {
//     console.error('Error updating game status:', error);
//     res.status(500).json({ 
//       message: 'Internal server error',
//       error: error.message 
//     });
//   }
// };

// פונקציה חדשה - מחיקת משחק
const deleteGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    console.log(`Deleting game: ${gameId}`);
    
    const game = await Game.findByIdAndDelete(gameId);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    console.log(`Game ${gameId} deleted successfully`);
    
    res.status(200).json({
      message: 'Game deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};


// 🏠 פונקציה חדשה - קבלת מצב חדר המתנה
const getRoomStatus = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    console.log(`📋 Getting room status for game: ${gameId}`);
    
    const game = await Game.findById(gameId);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    // מידע מפורט על החדר
    const roomStatus = {
      gameId: game._id,
      status: game.status,
      currentPlayers: game.players.length,
      maxPlayers: game.maxPlayers,
      gameType: game.gameType,
      isPublic: game.isPublic,
      joinCode: game.joinCode !== "0" ? game.joinCode : null,
      canStart: game.players.length >= 2, // צריך לפחות 2 שחקנים
      createdAt: game.createdAt,
      
      // רשימת שחקנים מפורטת
      players: game.players.map((player, index) => ({
        playerId: player.playerId,
        name: player.name,
        color: player.color,
        isHost: player.isHost,
        type: player.type,
        playerIndex: index
      })),
      
      // מידע על המארח
      host: game.players.find(p => p.isHost),
      
      // האם החדר מלא
      isFull: game.players.length >= game.maxPlayers
    };
    
    console.log(`✅ Room status retrieved successfully`);
    
    res.status(200).json({
      success: true,
      room: roomStatus
    });
    
  } catch (error) {
    console.error('❌ Error getting room status:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// 🎮 פונקציה משופרת - הצטרפות למשחק עם עדכונים בזמן אמת  
const joinGameRoom = async (req, res) => {
  try {
    console.log('🚪 Player joining game room');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { gameCode, playerName, playerId } = req.body;

    // ולידציה
    if (!gameCode || !playerName || !playerId) {
      return res.status(400).json({ 
        message: 'Missing required fields: gameCode, playerName, playerId' 
      });
    }

    // בדיקה שהקוד לא ריק
    if (gameCode === "" || gameCode === "0") {
      return res.status(400).json({ 
        message: 'Invalid game code. Public games cannot be joined by code.' 
      });
    }

    // חיפוש המשחק
    const game = await Game.findByJoinCode(gameCode);

    if (!game) {
      return res.status(404).json({ 
        message: 'Game not found or already started' 
      });
    }

    // בדיקות נוספות
    if (game.players.length >= game.maxPlayers) {
      return res.status(409).json({ 
        message: 'Game is full' 
      });
    }

    if (game.status !== 'WAITING') {
      return res.status(409).json({ 
        message: 'Game already started or finished' 
      });
    }

    // בדיקה שהשחקן לא כבר במשחק
    const existingPlayer = game.players.find(p => p.playerId === playerId);
    if (existingPlayer) {
      return res.status(409).json({ 
        message: 'Player already in this game' 
      });
    }

    // בחירת צבע זמין
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    const usedColors = game.players
      .map(p => p.color)
      .filter(color => color);
    const availableColor = colors.find(color => !usedColors.includes(color)) || 'gray';

    // יצירת שחקן חדש
    const newPlayer = {
      playerId: playerId,
      name: playerName,
      color: availableColor,
      playerIndex: game.players.length, // אינדקס חדש
      isHost: false,
      type: 'human'
    };

    console.log('🎯 Adding new player:', newPlayer);

    // הוספת השחקן למשחק
    game.players.push(newPlayer);
    
    const updatedGame = await game.save();
    
    console.log(`✅ Player ${playerName} joined game ${gameCode} successfully`);

    // 📡 כאן נשלח עדכון לכל השחקנים בחדר (נוסיף בהמשך)
    // await notifyRoomPlayers(updatedGame._id, 'player_joined', newPlayer);

    res.status(200).json({
      success: true,
      message: 'Joined game successfully',
      game: {
        gameId: updatedGame._id,
        status: updatedGame.status,
        currentPlayers: updatedGame.players.length,
        maxPlayers: updatedGame.maxPlayers,
        canStart: updatedGame.players.length >= 2
      },
      player: {
        playerId: newPlayer.playerId,
        name: newPlayer.name,
        color: newPlayer.color,
        isHost: newPlayer.isHost,
        playerIndex: newPlayer.playerIndex
      }
    });
    
  } catch (error) {
    console.error('❌ Error joining game room:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// 🎬 פונקציה חדשה - התחלת משחק על ידי המארח
const startGameRoom = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { hostPlayerId } = req.body;
    
    console.log(`🎬 Starting game ${gameId} by host ${hostPlayerId}`);
    
    const game = await Game.findById(gameId);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    // בדיקה שזה באמת המארח
    const host = game.players.find(p => p.isHost && p.playerId === hostPlayerId);
    if (!host) {
      return res.status(403).json({ 
        message: 'Only the host can start the game' 
      });
    }
    
    // בדיקה שיש מספיק שחקנים
    if (game.players.length < 2) {
      return res.status(400).json({ 
        message: 'Need at least 2 players to start the game' 
      });
    }
    
    // בדיקה שהמשחק עדיין בהמתנה
    if (game.status !== 'WAITING') {
      return res.status(409).json({ 
        message: 'Game already started or finished' 
      });
    }
    
    // שינוי סטטוס לפעיל
    game.status = 'ACTIVE';
    const updatedGame = await game.save();
    
    console.log(`✅ Game ${gameId} started successfully`);
    
    // 📡 כאן נשלח עדכון לכל השחקנים שהמשחק התחיל
    // await notifyRoomPlayers(gameId, 'game_started', { gameId });
    
    res.status(200).json({
      success: true,
      message: 'Game started successfully',
      game: {
        gameId: updatedGame._id,
        status: updatedGame.status,
        players: updatedGame.players
      }
    });
    
  } catch (error) {
    console.error('❌ Error starting game:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// 🚪 פונקציה חדשה - יציאה מחדר המתנה
const leaveGameRoom = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { playerId } = req.body;
    
    console.log(`🚪 Player ${playerId} leaving game ${gameId}`);
    
    const game = await Game.findById(gameId);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    // מציאת השחקן
    const playerIndex = game.players.findIndex(p => p.playerId === playerId);
    if (playerIndex === -1) {
      return res.status(404).json({ message: 'Player not in this game' });
    }
    
    const leavingPlayer = game.players[playerIndex];
    
    // הסרת השחקן
    game.players.splice(playerIndex, 1);
    
    // אם זה היה המארח ויש עוד שחקנים, העבר מארחות
    if (leavingPlayer.isHost && game.players.length > 0) {
      game.players[0].isHost = true;
      console.log(`👑 Host transferred to ${game.players[0].name}`);
    }
    
    // אם אין יותר שחקנים, מחק את המשחק
    if (game.players.length === 0) {
      await Game.findByIdAndDelete(gameId);
      console.log(`🗑️ Game ${gameId} deleted - no players left`);
      
      return res.status(200).json({
        success: true,
        message: 'Game deleted - no players left'
      });
    }
    
    const updatedGame = await game.save();
    
    console.log(`✅ Player ${playerId} left game successfully`);
    
    // 📡 כאן נשלח עדכון לכל השחקנים הנותרים
    // await notifyRoomPlayers(gameId, 'player_left', { playerId, newHost: game.players[0] });
    
    res.status(200).json({
      success: true,
      message: 'Left game successfully',
      game: {
        gameId: updatedGame._id,
        currentPlayers: updatedGame.players.length,
        players: updatedGame.players
      }
    });
    
  } catch (error) {
    console.error('❌ Error leaving game room:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

















const joinPrivateGameByCode = async (req, res) => {
  try {
    const { gameId, joinCode, playerName, playerId } = req.body;  // ✅ הוספתי gameId
    
    console.log(`=== הצטרפות למשחק ===`);
    console.log(`Game ID: ${gameId}, קוד: ${joinCode}, שחקן: ${playerName}`);
    
    // ✅ ולידציה
    if (!gameId || !joinCode || !playerName || !playerId) {
      return res.status(400).json({ 
        message: 'חסרים נתונים: gameId, joinCode, playerName, playerId' 
      });
    }
    
    // ✅ בדיקה שהקוד לא ריק
    if (joinCode === "" || joinCode === "0") {
      return res.status(400).json({ 
        message: 'קוד לא תקין. לא ניתן להצטרף למשחק ציבורי עם קוד.' 
      });
    }
    
    // 🎯 **הבדיקה החדשה - gameId + joinCode יחד!**
    const game = await Game.findOne({
      _id: gameId,              // ✅ בדיקה מדויקת של המשחק
      joinCode: joinCode,       // ✅ ועוד בדיקה של הקוד
      status: 'WAITING'         // ✅ ושהוא עדיין מחכה
    });
    
    if (!game) {
      console.log(`❌ לא נמצא משחק עם ID: ${gameId} וקוד: ${gameCode}`);
      return res.status(404).json({ 
        message: 'משחק לא נמצא או קוד שגוי. בדוק את הפרטים ונסה שוב.' 
      });
    }
    
    // ✅ בדיקה שהמשחק לא מלא
    if (game.players.length >= game.maxPlayers) {
      return res.status(409).json({ 
        message: 'המשחק מלא' 
      });
    }
    
    // ✅ בדיקה שהשחקן לא כבר במשחק
    const existingPlayer = game.players.find(p => p.playerId === playerId);
    if (existingPlayer) {
      console.log(`❌ שחקן ${playerName} כבר במשחק ${game._id}`);
      return res.status(409).json({ 
        message: 'השחקן כבר במשחק הזה' 
      });
    }
    
    const pieceColors = {
      1: 'pink', 2: 'orange', 3: 'brown',
      4: 'green', 5: 'blue', 6: 'purple'
    };
    
    const playerIndex = game.players.length;
    
    let activePlayerIndices = [];
    if (game.maxPlayers === 2) {
      activePlayerIndices = [1, 4];
    } else if (game.maxPlayers === 3) {
      activePlayerIndices = [1, 3, 5];
    } else if (game.maxPlayers === 4) {
      activePlayerIndices = [1, 3, 4, 6];
    } else if (game.maxPlayers === 6) {
      activePlayerIndices = [1, 2, 3, 4, 5, 6];
    }
    
    const playerPieceType = activePlayerIndices[playerIndex];
    const playerColor = pieceColors[playerPieceType];
    
    const newPlayer = {
      playerId: playerId,
      name: playerName, 
      playerIndex: playerIndex,
      isHost: false,
      type: 'human',
      pieceType: playerPieceType,
      color: playerColor
    };

    game.players.push(newPlayer);
    

    if (game.players.length >= game.maxPlayers) {
      game.status = 'ACTIVE';
      console.log(`🏁 משחק ${game._id} מלא - התחיל!`);
    }
    
    const updatedGame = await game.save();
    
    console.log(`✅ שחקן ${playerName} הצטרף למשחק ${game._id}`);
    
    res.status(200).json({
      success: true,
      message: 'הצטרפת למשחק בהצלחה! ',
      game: {
        id: updatedGame._id,
        joinCode: updatedGame.joinCode,
        status: updatedGame.status,
        currentPlayers: updatedGame.players.length,
        maxPlayers: updatedGame.maxPlayers,
        gameType: updatedGame.gameType
      },
      yourPlayerInfo: newPlayer
    });
    
  } catch (error) {
    console.error(' שגיאה בהצטרפות למשחק:', error);
    res.status(500).json({
      message: 'שגיאת שרת פנימית',
      error: error.message
    });
  }
};


const joinPublicGameAuto = async (req, res) => {
  try {
    const { playerName, playerId, playerEmail, preferredMaxPlayers } = req.body;
    
    console.log(`=== הצטרפות אוטומטית למשחק ציבורי ===`);
    console.log(`שחקן: ${playerName}, העדפה: ${preferredMaxPlayers} שחקנים`);
    
    // ✅ ולידציה בסיסית
    if (!playerName || !playerId) {
      return res.status(400).json({ 
        message: 'חסרים נתונים: playerName, playerId' 
      });
    }
    
    // ✅ חיפוש משחק ציבורי זמין
    let availableGame = await Game.findOne({
      status: 'WAITING',
      isPublic: true,
      gameType: 'online',
      $expr: { $lt: [{ $size: "$players" }, "$maxPlayers"] },  // לא מלא
      ...(preferredMaxPlayers && { maxPlayers: preferredMaxPlayers })  // העדפת מספר שחקנים
    }).sort({ createdAt: 1 }); // הישן ביותר קודם
    
    // ✅ אם לא נמצא משחק מתאים, צור חדש
    if (!availableGame) {
      console.log('לא נמצא משחק זמין - יוצר משחק חדש');
      
      availableGame = new Game({
        joinCode: "0",  // משחק ציבורי
        maxPlayers: preferredMaxPlayers || 4,  // ברירת מחדל 4 שחקנים
        gameType: 'online',
        isPublic: true,
        status: 'WAITING',
        players: []
      });
    }
    
    // ✅ בדיקה שהשחקן לא כבר במשחק
    const existingPlayer = availableGame.players.find(p => p.playerId === playerId);
    if (existingPlayer) {
      return res.status(409).json({ 
        message: 'השחקן כבר במשחק הזה' 
      });
    }
    
    // ✅ הוספת השחקן
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    const usedColors = availableGame.players.map(p => p.color).filter(color => color);
    const availableColor = colors.find(color => !usedColors.includes(color)) || 'gray';
    
    const newPlayer = {
      playerId: playerId,
      name: playerName,
      color: availableColor,
      playerIndex: availableGame.players.length,
      pieceType: availableGame.players.length + 1,
      isHost: availableGame.players.length === 0,  // הראשון הוא המארח
      type: 'human'
    };
    
    availableGame.players.push(newPlayer);
    
    // ✅ אם המשחק התמלא, שנה סטטוס
    if (availableGame.players.length >= availableGame.maxPlayers) {
      availableGame.status = 'ACTIVE';
      console.log(`משחק ציבורי ${availableGame._id} מלא - סטטוס שונה ל-ACTIVE`);
    }
    
    const updatedGame = await availableGame.save();
    
    console.log(`✅ שחקן ${playerName} הצטרף למשחק ציבורי ${updatedGame._id}`);
    console.log(`שחקנים נוכחיים: ${updatedGame.players.length}/${updatedGame.maxPlayers}`);
    
    res.status(200).json({
      success: true,
      message: updatedGame.players.length === 1 ? 'משחק חדש נוצר והצטרפת אליו' : 'הצטרפת למשחק קיים',
      game: {
        id: updatedGame._id,
        joinCode: updatedGame.joinCode,
        status: updatedGame.status,
        currentPlayers: updatedGame.players.length,
        maxPlayers: updatedGame.maxPlayers,
        players: updatedGame.players,
        isPublic: updatedGame.isPublic,
        gameType: updatedGame.gameType
      },
      yourPlayerInfo: newPlayer,
      isNewGame: availableGame.players.length === 1
    });
    
  } catch (error) {
    console.error('שגיאה בהצטרפות למשחק ציבורי:', error);
    res.status(500).json({ 
      message: 'שגיאת שרת פנימית',
      error: error.message 
    });
  }
};

// ✅ 3. עזיבת משחק
const leaveGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { playerId, reason } = req.body;
    
    console.log(`=== עזיבת משחק ===`);
    console.log(`משחק: ${gameId}, שחקן: ${playerId}, סיבה: ${reason || 'לא צוין'}`);
    
    // ✅ ולידציה
    if (!playerId) {
      return res.status(400).json({ 
        message: 'חסר playerId' 
      });
    }
    
    // ✅ מצא את המשחק
    const game = await Game.findById(gameId);
    
    if (!game) {
      return res.status(404).json({ 
        message: 'משחק לא נמצא' 
      });
    }
    
    // ✅ מצא את השחקן במשחק
    const playerIndex = game.players.findIndex(p => p.playerId === playerId);
    
    if (playerIndex === -1) {
      return res.status(404).json({ 
        message: 'שחקן לא נמצא במשחק הזה' 
      });
    }
    
    const leavingPlayer = game.players[playerIndex];
    const wasHost = leavingPlayer.isHost;
    
    // ✅ הסר את השחקן
    game.players.splice(playerIndex, 1);
    
    console.log(`שחקן ${leavingPlayer.name} הוסר מהמשחק`);
    
    // ✅ אם המשחק התרוקן, מחק אותו
    if (game.players.length === 0) {
      await Game.findByIdAndDelete(gameId);
      console.log(`משחק ${gameId} נמחק - אין שחקנים`);
      
      return res.status(200).json({
        success: true,
        message: 'עזבת את המשחק והמשחק נמחק',
        gameDeleted: true,
        remainingPlayers: 0
      });
    }
    
    // ✅ אם השחקן שעזב היה המארח, העבר למישהו אחר
    if (wasHost && game.players.length > 0) {
      game.players[0].isHost = true;
      console.log(`מארח חדש נבחר: ${game.players[0].name}`);
    }
    
    // ✅ אם המשחק היה פעיל והתרוקן מדי, החזר ל-WAITING
    if (game.status === 'ACTIVE' && game.players.length < 2) {
      game.status = 'WAITING';
      console.log(`משחק חזר לסטטוס WAITING - פחות משני שחקנים`);
    }
    
    // ✅ עדכן אינדקסים ו-pieceTypes
    game.players.forEach((player, index) => {
      player.playerIndex = index;
      player.pieceType = index + 1;
    });
    
    const updatedGame = await game.save();
    
    console.log(`✅ שחקן עזב. שחקנים נותרו: ${updatedGame.players.length}/${updatedGame.maxPlayers}`);
    
    res.status(200).json({
      success: true,
      message: 'עזבת את המשחק בהצלחה',
      game: {
        id: updatedGame._id,
        status: updatedGame.status,
        currentPlayers: updatedGame.players.length,
        maxPlayers: updatedGame.maxPlayers,
        players: updatedGame.players
      },
      remainingPlayers: updatedGame.players.length,
      newHost: wasHost && updatedGame.players.length > 0 ? updatedGame.players[0].name : null
    });
    
  } catch (error) {
    console.error('שגיאה בעזיבת משחק:', error);
    res.status(500).json({ 
      message: 'שגיאת שרת פנימית',
      error: error.message 
    });
  }
};

// ✅ 4. קבלת פרטי משחק לפי קוד (לבדיקה)
const getGameByJoinCode = async (req, res) => {
  try {
    const { joinCode } = req.params;
    
    console.log(`חיפוש משחק לפי קוד: ${joinCode}`);
    
    if (!joinCode || joinCode === "0") {
      return res.status(400).json({ 
        message: 'קוד לא תקין' 
      });
    }
    
    const game = await Game.findOne({ joinCode: joinCode });
    
    if (!game) {
      return res.status(404).json({ 
        message: 'משחק לא נמצא עם הקוד הזה' 
      });
    }
    
    res.status(200).json({
      success: true,
      game: {
        id: game._id,
        joinCode: game.joinCode,
        status: game.status,
        currentPlayers: game.players.length,
        maxPlayers: game.maxPlayers,
        players: game.players,
        isPublic: game.isPublic,
        gameType: game.gameType,
        createdAt: game.createdAt
      }
    });
    
  } catch (error) {
    console.error('שגיאה בחיפוש משחק:', error);
    res.status(500).json({ 
      message: 'שגיאת שרת פנימית',
      error: error.message 
    });
  }
};

// 📡 פונקציה עזר להתראות (נממש בהמשך עם WebSocket)
const notifyRoomPlayers = async (gameId, eventType, data) => {
  // TODO: שילוח הודעות WebSocket לכל השחקנים בחדר
  console.log(`📡 Would notify room ${gameId} about ${eventType}:`, data);
};


// ✅ ייצוא כל הפונקציות
module.exports = {
  // פונקציות קיימות
  createGame,
  getAvailableGames,
  joinPlayerByGameCode,  // הישנה - עדיין נשמור
  getGameById,
  updateGameStatus,
  deleteGame,
  
  // ✅ פונקציות חדשות
  joinPrivateGameByCode,  // הצטרפות למשחק פרטי
  joinPublicGameAuto,     // הצטרפות אוטומטית למשחק ציבורי
  leaveGame,              // עזיבת משחק
  getGameByJoinCode       // קבלת משחק לפי קוד
};

// // ייצוא הפונקציות החדשות
// module.exports = {
//   createGame,
//   getAvailableGames,
//   joinPlayerByGameCode,  // הפונקציה הישנה
//   getGameById,
//   updateGameStatus,
//   deleteGame,
  
//   // 🆕 פונקציות חדשות לחדר המתנה
//   getRoomStatus,
//   joinGameRoom,      // הפונקציה החדשה המשופרת
//   startGameRoom,
//   leaveGameRoom
// };