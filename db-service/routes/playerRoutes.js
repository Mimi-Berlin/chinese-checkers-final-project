const express = require('express');
const router = express.Router();
const { createPlayer } = require('../controllers/playerController');
const { getAllPlayers  } = require('../controllers/playerController');
const { loginPlayer  } = require('../controllers/playerController');

router.post('/new', createPlayer);
router.get('/getAll', getAllPlayers);
router.post('/login', loginPlayer);
 
module.exports = router;

