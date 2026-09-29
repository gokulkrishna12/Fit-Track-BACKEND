// backend/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
    // Determine the status code (default to 500 Internal Server Error)
    const statusCode = res.statusCode ? res.statusCode : 500;

    res.status(statusCode);

    // Standardized API Error Response
    res.json({
        success: false,
        message: err.message || 'An unexpected error occurred on the server.',
        // Only show the stack trace if we are in local development mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;