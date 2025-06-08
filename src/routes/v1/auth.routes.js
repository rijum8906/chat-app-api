// --- Dependencies ---
const express = require('express');

// --- Controller Functions ---
const { signIn, signUp, googleAuth, signOut, linkAccount } = require('./../../controllers/v1/auth.controller');

// --- Middlewares ---
const ATVM = require('./../../middlewares/auth.middleware'); // access token verification middleware

const router = express.Router();

router.post('/signin', signIn);
router.post('/signup', signUp);
router.post('/google', googleAuth);
router.post('/signout', ATVM, signOut);
router.post('/link-account', ATVM, linkAccount);

module.exports = router;
