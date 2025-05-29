// --- Dependencies ---
const express = require('express');

// --- Controller Functions ---
const {
  getFriends,
  sendFriendReq,
  respondToFriendReq
} = require('./../../controllers/v1/friendship.controller');

// --- Middlewares ---
const  ATVM = require('./../../middlewares/auth.middleware'); // access token verification middleware


const router = express.Router();

router.get('/', ATVM, getFriends);
router.post('/requests/', ATVM, sendFriendReq);
router.put('/requests/:requestId', ATVM, respondToFriendReq);

module.exports = router;
