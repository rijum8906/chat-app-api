const jwt = require("jsonwebtoken");

const ioAuthenticate = ((socket, next) => {
const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = payload; // Attach user data to socket
    next();
  } catch (err) {
    return next(new Error("Invalid Token"));
  }
});


module.exports = ioAuthenticate;