const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadPostImageMiddleware");

const {
  createPost,
  getMyPosts,
  deletePost,
} = require("../controllers/postController");

router.post("/add", protect, upload.single("image"), createPost);
router.get("/my-posts", protect, getMyPosts);
router.delete("/delete/:id", protect, deletePost);


module.exports = router;
