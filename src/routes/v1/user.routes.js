// --- Dependencies ---
const express = require('express');

// --- Controller Functions ---
const {
  getUserInfo
} = require('./../../controllers/v1/friendship.controller');

// --- Middlewares ---
const  ATVM = require('./../../middlewares/auth.middleware'); // access token verification middleware


const router = express.Router();

router.get('/:username', getUserInfo);

module.exports = router;
