// Dependencies
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const {
generateSessionInfo, 
generateDeviceId,
errorHandler
} = require("./src/middlewares");
require("dotenv").config();

// Test
const Auth = require("./src/models/auth.model");

// Dependency Configs
const connectDB = require("./src/configs/db.config");
const redisClient = require("./src/configs/redis.config");

// Connecting to MongoDB & Redis
connectDB();
redisClient.connect();

// Creating App
var app = express();

// Setting Middleware in App
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));
app.use(generateSessionInfo);
app.use(generateDeviceId);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: process.env.FRONTEND_URL ? true : false,
  }),
);

// Mount routes
app.use("/api/v1", require("./src/routes/v1/routes"));

// Error handler middleware
app.use(errorHandler);

// Listening the app
app.listen(process.env.PORT, () => {
  console.log(`app running at port ${process.env.PORT}`);
});
