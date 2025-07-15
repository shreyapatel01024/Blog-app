const Post = require("../models/Post");

const createPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    const image = req.file
      ? {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        }
      : null;

    const post = new Post({
      title,
      content,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      image,
      author: req.user.id,
    });

    await post.save();

    res.status(201).json({ message: "Post created successfully", post });
  } catch (err) {
    console.error("❌ Error creating post:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error("❌ Error fetching posts:", err.message);
    res.status(500).json({ message: "Failed to fetch posts", error: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting post:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createPost,
  getMyPosts,
  deletePost,
};
