const redis = require('redis');
const client = redis.createClient({
  username: 'default',
  password: 'bl7IxUHh0Gk5H0uHuR1NnEeEHuzSItIC',
  socket: {
    host: 'redis-12494.crce179.ap-south-1-1.ec2.redns.redis-cloud.com',
    port: 12494
  }
});

client.on('error', err => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Connected to Redis'));

module.exports = client;
