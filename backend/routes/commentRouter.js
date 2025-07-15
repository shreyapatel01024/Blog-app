// routes/commentRouter.js
const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authMiddleware = require("../middlewares/authMiddleware");

// POST: Create a new comment
router.post("/", authMiddleware, commentController.createComment);

// GET: Get comments by post ID
router.get("/:postId", commentController.getCommentsByPost);

// DELETE: Delete a comment
router.delete("/:commentId", authMiddleware, commentController.deleteComment);

module.exports = router;
