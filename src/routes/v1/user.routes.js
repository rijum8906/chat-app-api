// --- Dependencies ---
const express = require('express');

// --- Controller Functions ---
const {
  getUserInfo,
  // Todo getMyProfileInfo
} = require('./../../controllers/v1/user.controller');

// --- Middlewares ---
const  ATVM = require('./../../middlewares/auth.middleware'); // access token verification middleware


const router = express.Router();

router.get('/:username', getUserInfo);
// Todo router.get('/me', ATVM, getMyProfileInfo);

module.exports = router;
