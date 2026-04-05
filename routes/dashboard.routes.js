const express = require("express");
const { getSummary, getTrends } = require("../controllers/dashboard.controller.js");
const { verifyJWT } = require("../middleware/auth.middleware.js");
const { allowRoles } = require("../middleware/role.middleware.js");

const router = express.Router();

router.use(verifyJWT, allowRoles("analyst", "admin"));

router.get("/summary", getSummary);
router.get("/trends", getTrends);

module.exports = router;