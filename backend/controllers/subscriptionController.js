const User = require("../models/User");
const Blog = require("../models/Post");

// ✅ Check if current user is subscribed to a target user
const checkSubscription = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.id;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isSubscribed = targetUser.subscribers.includes(currentUserId);
    res.status(200).json({ isSubscribed });
  } catch (err) {
    console.error("❌ Subscription check error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Toggle subscribe/unsubscribe
const toggleSubscription = async (req, res) => {
  const currentUserId = req.user.id;
  const targetUserId = req.params.id;

  if (currentUserId === targetUserId) {
    return res.status(400).json({ message: "You cannot subscribe to yourself" });
  }

  try {
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    const isSubscribed = targetUser.subscribers.includes(currentUserId);

    if (isSubscribed) {
      targetUser.subscribers.pull(currentUserId);
      await targetUser.save();
      return res.status(200).json({ message: "Unsubscribed", isSubscribed: false });
    } else {
      targetUser.subscribers.push(currentUserId);
      await targetUser.save();
      return res.status(200).json({ message: "Subscribed", isSubscribed: true });
    }
  } catch (err) {
    console.error("❌ Subscription error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get blogs from users the current user is subscribed to
const getSubscriptionFeed = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Step 1: Find users where this user is a subscriber
    const subscribedUsers = await User.find({
      subscribers: currentUserId
    }).select("_id");

    const subscribedUserIds = subscribedUsers.map(user => user._id);

    // Step 2: Fetch blogs from these users
    const blogs = await Blog.find({ author: { $in: subscribedUserIds } })
      .populate("author", "name avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({ blogs });
  } catch (err) {
    console.error("❌ Feed error:", err.message);
    res.status(500).json({ message: "Failed to fetch feed", error: err.message });
  }
};

module.exports = {
  toggleSubscription,
  checkSubscription,
  getSubscriptionFeed,
};
