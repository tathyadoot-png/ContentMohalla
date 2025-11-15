import User from "../models/User.js";
import Poem from "../models/Poem.js";

// Add bookmark
export const addBookmark = async (req, res) => {
  try {
    const userId = req.user._id;
    const { poemId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.bookmarks.includes(poemId))
      return res.status(400).json({ message: "Already bookmarked" });

    user.bookmarks.push(poemId);
    await user.save();

    res.json({ message: "Poem bookmarked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove bookmark
export const removeBookmark = async (req, res) => {
  try {
    const userId = req.user._id;
    const { poemId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.bookmarks = user.bookmarks.filter(id => id.toString() !== poemId);
    await user.save();

    res.json({ message: "Poem removed from bookmarks" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user bookmarks
export const getBookmarks = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("bookmarks");

    res.json({ bookmarks: user.bookmarks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
