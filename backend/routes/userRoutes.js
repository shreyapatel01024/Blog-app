// backend/routes/userRouter.js
const express = require("express");
const router = express.Router();

const uploadAvatar = require("../middlewares/uploadAvatarMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const User = require("../models/User");
const Blog = require("../models/Post");
const { updateAvatar } = require("../controllers/userController");

// ✅ PUT: Update avatar (with auth)
router.put("/avatar", authMiddleware, uploadAvatar.single("avatar"), updateAvatar);

// ✅ GET: Public user profile with blogs by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch the user's blogs
    const blogs = await Blog.find({ author: user._id }).select("title content image tags createdAt");

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
        totalSubscribers: user.subscribers?.length || 0
      },
      blogs
    });
  } catch (err) {
    console.error("❌ Failed to fetch user profile:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
