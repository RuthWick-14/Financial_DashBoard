const ApiError = require("../utils/ApiError.js");

const allowRoles = (...roles) => {
    return (req, res, next) => {
        if(!req.user) {
            throw new ApiError(401, "Unauthorized request");
        }
        if(!roles.includes(req.user.role)) {
            throw new ApiError(403, `Access denied. Required: ${roles.join(", ")} | Your role: ${req.user.role}`);
        }
        next();
    }
}

module.exports = { allowRoles };