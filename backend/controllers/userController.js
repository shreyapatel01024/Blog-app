const User = require("../models/User");
const fs = require("fs");
const path = require("path");

exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.user.userId;
    const avatarFilename = req.file?.filename || req.body.avatar;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Only delete old avatar if it's a custom uploaded one
    if (user.avatar && !["avatar1.png", "avatar2.png", "avatar3.png", "avatar4.png", "avatar5.png"].includes(user.avatar)) {
      const oldPath = path.join(__dirname, "../uploads/avatars", user.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    user.avatar = avatarFilename;
    await user.save();

    res.status(200).json({ message: "Avatar updated", avatar: avatarFilename });
  } catch (error) {
    console.error("Avatar update error:", error.message);
    res.status(500).json({ message: "Avatar update failed", error: error.message });
  }
};
