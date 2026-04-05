const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Something went wrong";
    let errors = err.errors || [];

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        statusCode = 409;
        message = `${field} already exists`;
    }

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(", ");
    }

    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ID: ${err.value}`;
    }

    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired, please login again";
    }

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

module.exports = errorHandler;