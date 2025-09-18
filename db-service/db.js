const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ התחברת למונגו!");
  } catch (err) {
    console.error("❌ שגיאה בחיבור:", err);
    process.exit(1);
  }
}

module.exports = connectDB;
