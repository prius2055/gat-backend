const express = require("express");
const router = express.Router();
const { getAllUsers, getSingleUser } = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect);

router.get("/users", protect, restrictTo("admin"), getAllUsers);

// router.get("/", protect, getUserTransactions);

module.exports = router;
