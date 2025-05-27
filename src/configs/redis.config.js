const redis = require('redis');
const { REDIS_USERNAME, REDIS_PASSWORD, REDIS_PORT, REDIS_URL } = process.env;
const client = redis.createClient({
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_URL,
    port: REDIS_PORT
  }
});

client.on('error', err => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Connected to Redis'));

module.exports = client;
