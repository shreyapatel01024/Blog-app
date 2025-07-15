// routes/subscriptionRoutes.js
const express = require("express");
const router = express.Router();
const {
  toggleSubscription,
  checkSubscription,
  getSubscriptionFeed,
} = require("../controllers/subscriptionController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/:id", authMiddleware, toggleSubscription);
router.get("/check/:id", authMiddleware, checkSubscription);
router.get("/feed", authMiddleware, getSubscriptionFeed); // ✅ this is what you're missing

module.exports = router;
