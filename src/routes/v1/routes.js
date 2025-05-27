// Dependencies
const express = require('express');
// Router Dependencies
const authRouter = require('./auth.route');

// Router
const router = express.Router();
router.use('/auth', authRouter);

// Exports
module.exports = router;
