// backend/controllers/postController.js
const Post = require("../models/Post");

// Create a new blog post
const createPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    const image = req.file
      ? {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        }
      : null;

    const post = new Post({
      title,
      content,
      tags: tags?.split(",").map((t) => t.trim()),
      image,
      author: req.user.userId,
    });

    await post.save();
    res.status(201).json({ message: "Post created", post });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all posts by the currently logged-in user
const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

// Delete a specific post by ID
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createPost,
  getMyPosts,
  deletePost,
};
