const express = require('express');
const {
  login,
  register,
  googleAuth,
  checkReq,
  logout,
  linkAccount
} = require('./../../controllers/v1/auth.controller');
const {
  accessTokenVerificationMiddleware
} = require('./../../middlewares/auth-middleware');
const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/continue-with-google', googleAuth);
router.post('/logout', accessTokenVerificationMiddleware, logout);
router.post('/check-request', accessTokenVerificationMiddleware, checkReq);
router.post('/link-account', accessTokenVerificationMiddleware, linkAccount);

module.exports = router;
