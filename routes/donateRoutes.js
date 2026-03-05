const express = require("express");
const router = express.Router();
const {
  initializePayment,
  verifyPayment,
} = require("../controllers/donateController");
const { protect } = require("../middleware/auth");

// router.use(protect); // Protect all wallet routes

router.post("/", initializePayment);
router.get("/verify", verifyPayment);

// router.post("/admin/update-prices", protect, restrictTo("admin"), updatePrices);

module.exports = router;
