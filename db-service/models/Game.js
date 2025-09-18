// const mongoose = require('mongoose');

// const playerInGameSchema = new mongoose.Schema({
//   //playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
//   //name: { type: String, required: true },
//   //color: { type: String, required: true },
//   isHost: { type: Boolean, default: false },
//   type: { type: String, enum: ['human', 'bot'], default: 'human' }
// }, { _id: false });

// const gameSchema = new mongoose.Schema({
//   joinCode: { 
//     type: String, 
//     required: true, 
//     unique: true,
//     default: 0
//     //default: () => Math.random().toString(36).substring(2, 8).toUpperCase()
//   },
//   maxPlayers: { type: Number, required: true },
//   gameType: { type: String, enum: ['bot', 'online'], required: true },
//   players: { type: [playerInGameSchema], required: true },
//   status: { type: String, enum: ['WAITING', 'ACTIVE', 'FINISHED'], default: 'WAITING' },
//   isPublic: { type: Boolean, default: true },
//   createdAt: { type: Date, default: Date.now },
//   //currentTurn: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }
// });

// gameSchema.index({ joinCode: 1 }, { unique: true });

// // gameSchema.statics.findAvailableGames = function() {
// //   return this.find({ 
// //     status: 'WAITING', 
// //     isPublic: true, 
// //     'players.3': { $exists: false }
// //   }).sort({ createdAt: -1 });
// // };

// const Game = mongoose.model('Game', gameSchema, 'games');
// module.exports = Game;


const mongoose = require('mongoose');

const playerInGameSchema = new mongoose.Schema({
  playerId: { type: String },           // אופציונלי
  name: { type: String },               // אופציונלי  
  color: { type: String },              // אופציונלי
  playerIndex: { type: Number },        // Index ברשימת השחקנים (0-5)
  pieceType: { type: Number },          // PieceType במשחק (1-6, מתאים ל-PLAYER1-PLAYER6)
  isHost: { type: Boolean, default: false },
  type: { type: String, enum: ['human', 'bot'], default: 'human' }
}, { _id: false });

const gameSchema = new mongoose.Schema({
  joinCode: { 
    type: String, 
    required: true,
    default: "0"
  },
  maxPlayers: { type: Number, required: true },
  gameType: { type: String, enum: ['bot', 'online'], required: true },
  players: { type: [playerInGameSchema], required: true },
  status: { type: String, enum: ['WAITING', 'ACTIVE', 'FINISHED'], default: 'WAITING' },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// ✅ תיקון: unique רק עבור joinCode שאינו ריק או "0"
gameSchema.index(
  { joinCode: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { 
      joinCode: { $nin: ["", "0", null] }  // unique רק אם לא ריק/0/null
    }
  }
);

// פונקציה לוולידציה לפני שמירה
gameSchema.pre('save', function(next) {
  // אם joinCode ריק או "0", צור קוד אוטומטי רק למשחקים פרטיים
  if ((this.joinCode === "" || this.joinCode === "0") && !this.isPublic) {
    // צור קוד אוטומטי למשחק פרטי
    this.joinCode = 'G' + Date.now().toString().slice(-6);
    console.log('Generated joinCode for private game:', this.joinCode);
  } else if (this.isPublic && (this.joinCode === "" || this.joinCode === "0")) {
    // למשחקים ציבוריים, השאר ריק או "0"
    this.joinCode = "0";
  }
  next();
});

// פונקציה סטטית לחיפוש משחקים זמינים
gameSchema.statics.findAvailableGames = function() {
  return this.find({ 
    status: 'WAITING', 
    isPublic: true, 
    $expr: { $lt: [{ $size: "$players" }, "$maxPlayers"] }  // לא מלא
  }).sort({ createdAt: -1 });
};

// פונקציה סטטית לחיפוש משחק לפי קוד (רק אם לא ריק)
gameSchema.statics.findByJoinCode = function(code) {
  if (!code || code === "0" || code === "") {
    return null;  // לא מחפש משחק עם קוד ריק
  }
  return this.findOne({ 
    joinCode: code, 
    status: 'WAITING' 
  });
};

const Game = mongoose.model('Game', gameSchema, 'games');
module.exports = Game;