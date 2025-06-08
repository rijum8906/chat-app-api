require('dotenv').config();
const app = require('./app');
const connectDB = require('./src/configs/db.config');
const redisClient = require('./src/configs/redis.config');

// Connect to MongoDB & Redis
connectDB();
redisClient.connect();

// Start Server
app.listen(process.env.PORT, () => {
  console.log(`app running at port ${process.env.PORT}`);
});
