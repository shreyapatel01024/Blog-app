// backend/controllers/adminController.js

const User = require("../models/User");
const Post = require("../models/Post");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};



exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "name email avatar");
    res.status(200).json(posts);
  } catch (err) {
    console.error("❌ Error fetching posts:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting post:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
