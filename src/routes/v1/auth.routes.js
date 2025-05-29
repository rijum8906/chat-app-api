// --- Dependencies ---
const express = require('express');

// --- Controller Functions ---
const {
  login,
  register,
  googleAuth,
  logout,
  linkAccount
} = require('./../../controllers/v1/auth.controller');

// --- Middlewares ---
const  ATVM = require('./../../middlewares/auth.middleware'); // access token verification middleware


const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/continue-with-google', googleAuth);
router.post('/logout', ATVM, logout);
router.post('/link-account', ATVM, linkAccount);

module.exports = router;
