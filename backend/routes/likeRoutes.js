// backend/routes/likeRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const { getLikesByPost, toggleLike } = require("../controllers/likeController");

// GET likes for a post + check if current user liked it
router.get("/:postId", protect, getLikesByPost);

// Toggle like/unlike for a post
router.post("/", protect, toggleLike);

module.exports = router;
