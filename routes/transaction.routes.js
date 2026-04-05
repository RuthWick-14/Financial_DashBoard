const express = require("express");
const { getTransactions, getTransactionById, createTransaction, updateTransaction, deleteTransaction } = require("../controllers/transaction.controller.js");
const { verifyJWT } = require("../middleware/auth.middleware.js");
const { allowRoles } = require("../middleware/role.middleware.js");

const router = express.Router();

router.use(verifyJWT);

router.get("/", allowRoles("viewer", "analyst", "admin"), getTransactions);
router.get("/:id", allowRoles("viewer", "analyst", "admin"), getTransactionById);
router.post("/", allowRoles("analyst", "admin"), createTransaction);
router.patch("/:id", allowRoles("analyst", "admin"), updateTransaction);
router.delete("/:id", allowRoles("admin"), deleteTransaction);

module.exports = router;