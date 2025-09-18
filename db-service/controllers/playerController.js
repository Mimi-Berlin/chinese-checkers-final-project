const Player = require('../models/Player');

const createPlayer = async (req, res) => {
  try {
    const { name, code, email, success_rate } = req.body;

    // יצירת שחקן חדש בלי ID – MongoDB ייצור אוטומטית
    const newPlayer = new Player({ name, code, email, success_rate });

    // שמירת השחקן במסד הנתונים
    const savedPlayer = await newPlayer.save();

    // החזרת תגובה עם ה-ID האוטומטי
    res.status(201).json({
      message: 'השחקן נשמר',
      id: savedPlayer._id // זה ה-ID שמונגו מייצר
    });

  } catch (error) {
    res.status(500).json({ message: 'שגיאה', error });
  }
};


const getAllPlayers = async (req, res) => {
  try {
    const players = await Player.find();
    res.status(200).json(players);
  } catch (error) {
    res.status(500).json({ message: "שגיאה בשליפת שחקנים", error });
  }
};

const loginPlayer = async (req, res) => {
  try {
    const { email,code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Missing email or code" });
    }

    const existingPlayer = await Player.findOne({  email: email, code: code });
    
    if (existingPlayer) {
      res.status(200).json({
        id: existingPlayer._id.toString(),
        name: existingPlayer.name 
      });
      } else {
      res.status(405).json({ exists: false, message: "Player not found" });
    }
    
    } catch (error) {
      res.status(500).json({ message: "Error checking player", error });
    }
    
};

module.exports = {
  createPlayer,
  getAllPlayers,
  loginPlayer
};

