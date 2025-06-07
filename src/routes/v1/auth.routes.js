// --- Dependencies ---
const express = require('express');

// --- Controller Functions ---
const {
  signin,
  signup,
  googleAuth,
  signout,
  linkAccount
} = require('./../../controllers/v1/auth.controller');

// --- Middlewares ---
const  ATVM = require('./../../middlewares/auth.middleware'); // access token verification middleware


const router = express.Router();

router.post('/signin', signin);
router.post('/signup', signup);
router.post('/google', googleAuth);
router.post('/signout', ATVM, signout);
router.post('/link-account', ATVM, linkAccount);

module.exports = router;
