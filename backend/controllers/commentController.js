// controllers/commentController.js
const Comment = require("../models/comment");
const Post = require("../models/post");

// Add a new comment
exports.createComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    const userId = req.user.id;

    if (!postId || !content) {
      return res.status(400).json({ message: "Post ID and content are required." });
    }

    const comment = await Comment.create({
      post: postId,
      author: userId,
      content,
    });

    res.status(201).json({ message: "Comment created successfully.", comment });
  } catch (err) {
    console.error("❌ Error creating comment:", err);
    res.status(500).json({ message: "Server error while creating comment." });
  }
};

// Get comments for a specific post
exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .populate("author", "name avatar email")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (err) {
    console.error("❌ Error fetching comments:", err);
    res.status(500).json({ message: "Server error while fetching comments." });
  }
};

// Delete a comment (only author or admin can delete)
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const comment = await Comment.findById(commentId);

    if (!comment) return res.status(404).json({ message: "Comment not found." });

    if (comment.author.toString() !== userId && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to delete this comment." });
    }

    await Comment.findByIdAndDelete(commentId);
    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting comment:", err);
    res.status(500).json({ message: "Server error while deleting comment." });
  }
};
