const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware"); // ✅ single middleware
const upload = require("../middlewares/uploadPostImageMiddleware"); // ✅ multer instance

const {
  createPost,
  getMyPosts,
  deletePost,
} = require("../controllers/postController");
console.log("upload.single:", typeof upload.single); // should be 'function'

// ✅ all handlers MUST be functions
router.post("/add", protect, upload.single("image"), createPost);
router.get("/my-posts", protect, getMyPosts);
router.delete("/delete/:id", protect, deletePost);

module.exports = router;
