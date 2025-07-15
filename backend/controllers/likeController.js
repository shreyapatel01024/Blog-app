// backend/controllers/likeController.js
const Like = require("../models/Like");

const getLikesByPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user?.id;

    const likes = await Like.find({ postId });
    const likedByUser = likes.some((like) => like.userId.toString() === userId);

    res.status(200).json({
      likes,
      count: likes.length,
      likedByUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching likes", error });
  }
};

const toggleLike = async (req, res) => {
  const { postId } = req.body;
  const userId = req.user?.id;

  if (!postId || !userId) {
    return res.status(400).json({ message: "Post ID and User ID required" });
  }

  try {
    const existingLike = await Like.findOne({ postId, userId });

    if (existingLike) {
      await existingLike.deleteOne();
      return res.status(200).json({ message: "Post unliked" });
    } else {
      const newLike = new Like({ postId, userId });
      await newLike.save();
      return res.status(201).json({ message: "Post liked" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error toggling like", error });
  }
};

module.exports = {
  getLikesByPost,
  toggleLike,
};
