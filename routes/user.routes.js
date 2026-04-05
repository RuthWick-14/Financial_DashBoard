const express = require("express");
const { getAllUsers, updateUserRole, updateUserStatus } = require("../controllers/user.controller.js");
const { verifyJWT } = require("../middleware/auth.middleware.js");
const { allowRoles } = require("../middleware/role.middleware.js");

const router = express.Router();

router.use(verifyJWT, allowRoles("admin"));

router.get("/", getAllUsers);
router.patch("/:id/role", updateUserRole);
router.patch("/:id/status", updateUserStatus);

module.exports = router;