const sessionInfoGenerator = (req, res, next) => {
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  req.session = {
    ...(req.session || {}),
    ipAddress,
    userAgent
  };
  next();
};

module.exports = sessionInfoGenerator;
