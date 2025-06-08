// Dependencies
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { generateSessionInfo, generateDeviceId, errorHandler } = require('./src/middlewares');

// Create App
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));
app.use(generateSessionInfo);
app.use(generateDeviceId);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: process.env.FRONTEND_URL ? true : false
  })
);

// Routes
app.use('/api/v1', require('./src/routes/v1/routes'));

// Error Handler
app.use(errorHandler);

module.exports = app;
