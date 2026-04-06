const express = require("express");
const { register, login, logout, refreshAccessToken, getMe } = require("../controllers/auth.controller.js");
const { verifyJWT } = require("../middleware/auth.middleware.js");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", verifyJWT, logout);
router.post("/refresh", refreshAccessToken);
router.get("/me", verifyJWT, getMe);

module.exports = router;
