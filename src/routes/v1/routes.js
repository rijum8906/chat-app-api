// Dependencies
const express = require('express');

// Router Dependencies
const authRouter = require('./auth.routes');
const friendshipRouter = require('./friendship.routes');
const userRouter = require('./user.routes');

// Router
const router = express.Router();
router.use('/auth', authRouter);
router.use('/friendships', friendshipRouter);
router.use('/users', userRouter);

// Exports
module.exports = router;
