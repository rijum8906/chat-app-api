const errorHandler = (err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    success: false,
    error: {
      message: err.message,
      stack: err.stack
    }
  });
};

module.exports = errorHandler;
