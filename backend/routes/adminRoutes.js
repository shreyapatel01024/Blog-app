// backend/routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getAllPosts,
  deleteUser,
  deletePost,
} = require("../controllers/adminController");

const protect = require("../middlewares/authMiddleware");

// Admin Routes
router.get("/users", protect, getAllUsers);     // GET /api/admin/users
router.get("/posts", protect, getAllPosts);     // GET /api/admin/posts
router.delete("/user/:id", protect, deleteUser); // DELETE user
router.delete("/post/:id", protect, deletePost); // DELETE blog post

module.exports = router;
