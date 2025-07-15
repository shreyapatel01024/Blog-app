// backend/routes/searchRoute.js
const express = require("express");
const router = express.Router();
const Blog = require("../models/Post");
const User = require("../models/User");

// 🔍 Search blogs by title or tags
router.get("/blogs", async (req, res) => {
  const query = req.query.q;

  try {
    const blogs = await Blog.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } }
      ]
    }).populate("author", "name avatar");

    res.json(blogs);
  } catch (err) {
    console.error("Blog search error:", err);
    res.status(500).json({ message: "Failed to search blogs" });
  }
});

// 🔍 Search user by name
router.get("/user", async (req, res) => {
  const query = req.query.q;

  try {
    const user = await User.findOne({ name: { $regex: query, $options: "i" } });

    if (!user) return res.status(404).json({ message: "User not found" });

    const blogsByUser = await Blog.find({ author: user._id })
      .select("title image content tags")
      .lean();

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
        totalBlogs: blogsByUser.length,
        totalSubscribers: user.subscribers?.length || 0,
      },
      userBlogs: blogsByUser
    });
  } catch (err) {
    console.error("User search error:", err);
    res.status(500).json({ message: "Failed to search user" });
  }
});

// ✅ Random or Recent Blogs Route
router.get("/random", async (req, res) => {
  try {
    const blogs = await Blog.find({})
      .sort({ createdAt: -1 }) // or use .sample for pure randomness
      .limit(10)
      .populate("author", "name email avatar");

    res.json(blogs);
  } catch (err) {
    console.error("Failed to fetch random blogs:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
