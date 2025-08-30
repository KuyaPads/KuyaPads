const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  // Joi validation errors
  if (error.isJoi) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(detail => ({
        message: detail.message,
        path: detail.path
      }))
    });
  }

  // Database constraint errors
  if (error.code === '23505') { // PostgreSQL unique constraint violation
    return res.status(400).json({
      error: 'Resource already exists',
      message: 'This value must be unique'
    });
  }

  if (error.code === '23503') { // PostgreSQL foreign key constraint violation
    return res.status(400).json({
      error: 'Referenced resource does not exist'
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired'
    });
  }

  // Default server error
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

module.exports = errorHandler;