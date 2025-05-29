// Dependencies
const express = require('express');

// Router Dependencies
const authRouter = require('./auth.routes');
const friendshipRouter = require('./friendship.routes');

// Router
const router = express.Router();
router.use('/auth', authRouter);
router.use('/friendship', friendshipRouter);

// Exports
module.exports = router;
