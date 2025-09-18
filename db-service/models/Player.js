
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  success_rate: { type: Number, default: 0 },
  games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game' }] // רשימת משחקים
});


// אינדקס לחיפוש יעיל לפי שם וקוד
playerSchema.index({ name: 1 });
playerSchema.index({ code: 1 }, { unique: true });

const Player = mongoose.model("Player", playerSchema, "players");
module.exports = Player;
