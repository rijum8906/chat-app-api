// Dependencies
const express = require('express');

// Router Dependencies
const authRouter = require('./auth.routes');

// Router
const router = express.Router();
router.use('/auth', authRouter);

// Exports
module.exports = router;
