const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const {User} = require("../models/user.model.js");
const jwt = require("jsonwebtoken");

// const FILE_PATH = path.join(__dirname, "../data/user.json");

// const registerUser = async(req, next, res) => {
//     try{
//         const {name, email} = req.body;
//     }
// }

const generateAccessAndRefreshToken = async(userId) => {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();

    const refreshToken = jwt.sign(
        {_id: user._id},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    );

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});

    return { accessToken, refreshToken};
};

const cookieOptions = {
    httpOnly: true,
    secure: true
};

const register = asyncHandler(async(req, res) => {
    const {name, email, password, role} = req.body;

    if(!name || !email || !password) throw new ApiError(409, "Name, email and password are required");
    const existingUser = await User.findOne({ email });
    if(existingUser) throw new ApiError(409, "Email is already registered");

    const allowedRoles = ["viewer", "analyst", "admin"];
    const assignedRole = allowedRoles.includes(role) ? role : "viewer";

    const user = await User.create({
        name,
        email,
        password,
        role: assignedRole
    });

    const createdUser = await User.findById(user._id);

    if(!createdUser) throw new ApiError(500, "Something went wrong while registering user");

    return res
            .status(201)
            .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const login = asyncHandler(async(req, res) => {
    const { email, password } = req.body;
    
    if(!email || !password) throw new ApiError(400, "Email and password are required");

    const user = await User.findOne({email}).select("+password");

    if(!user) throw new ApiError(401, "Invalid email or password");

    if(!user.isActive) throw new ApiError(403, "Your account has been deactivated");

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid) throw new ApiError(401, "Invalid email or password");

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id);

    return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .json(
                new ApiResponse(200, {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                }, "Login successfully")
            );
});

const logout = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshtToken: null} },
        { new: true }
    );

    return res
            .status(200)
            .clearCookie("accessToken", cookieOptions)
            .clearCookie("refreshToken", cookieOptions)
            .json(new ApiResponse(200, {}, "Logged out successfully"));
});

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookie?.refreshToken || req.body?.refreshToken;

    if(!incomingRefreshToken) throw new ApiError(401, "Refresh token is required");

    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded._id);

    if(!user) throw new ApiError(401, "Invalid refresh token");

    if(user.refreshToken !== incomingRefreshToken) throw new ApiError(401, "Refresh Token is expired or already used.");

    const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshToken(user._id);

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed")
        );
});

const getMe = asyncHandler(async(req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched"));
});

module.exports = { register, login, logout, refreshAccessToken, getMe };