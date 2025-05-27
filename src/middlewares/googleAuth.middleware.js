const { googleTokenVerify } = require('./../utils/auth.utils');

const verifyGoogleToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    req.tokenData = await googleTokenVerify(token);
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = verifyGoogleToken;
