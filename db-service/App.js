const express = require('express');
const app = express();

const connectDB = require('./db');
connectDB(); 

const playerRoutes = require('./routes/playerRoutes'); 
const gameRoutes = require('./routes/gameRoutes');
app.use(express.json());
app.use('/api/players', playerRoutes);
app.use('/api/games', gameRoutes);

module.exports = app;