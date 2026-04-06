//this whole structure is fo admins only

const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const {User} = require("../models/user.model.js");

//this is only allowed for admin (GET request gateway)
const getAllUsers = asyncHandler(async(req, res) => {
    const users = await User.find();
    return res
        .status(200)
        .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const updateUserRole = asyncHandler(async(req, res) => {
    const { role } = req.body;

    const allowedRoles = ["viewer", "analyst", "admin"];
    if(!allowedRoles.includes(role)) throw new ApiError(400, `Invlaid role. Must be one of: ${allowedRoles.join(", ")}`);

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
    );

    if(!user) throw new ApiError(404, "user not found.");

    return res
        .json(new ApiResponse(200, user, `Role updated to ${role}`));
})

const updateUserStatus = asyncHandler(async (req, res) => {
    const { isActive } = req.body;

    if(typeof isActive !== "boolean") throw new ApiError(400, "isActive must be boolean");

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { returnDocument: 'after' }
    );

    if(!user) throw new ApiError(404, "User not found");

    return res
        .status(200)
        .json(new ApiResponse(200, user, `User ${isActive?"activated" : "deactivated"} successfully`));
});

module.exports = { getAllUsers, updateUserRole, updateUserStatus };