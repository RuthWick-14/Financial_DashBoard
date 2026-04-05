const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const {User} = require("../models/user.model.js");
const jwt = require("jsonwebtoken");

const verifyJWT = asyncHandler(async(req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if(!token) throw new ApiError(401, "Unauthorized request, no token provided");
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id);

    if(!user) throw new ApiError(401, "Invalid access token, user not found");
    if(!user.isActive) throw new ApiError(401, "Your account has been deactivated");

    req.user = user;
    next();
});

module.exports = { verifyJWT };