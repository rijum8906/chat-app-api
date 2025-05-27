const redisClient = require('./../configs/redis.config');

module.exports.get = async keyName => {
  return await redisClient.get(keyName);
};

module.exports.compareKey = async (key, value) => {
  const keyVal = await redisClient.get(key);
  return value === keyVal;
};
