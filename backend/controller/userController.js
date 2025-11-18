// controllers/userController.js
import User from "../models/User.js";

import mongoose from "mongoose";
import Poem from "../models/Poem.js";



export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("bookmarks", "title slug createdAt")
      .lean();

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    // Counts
    const poemCount = await Poem.countDocuments({ author: req.user._id, category: "poem" });
    const gadhyaCount = await Poem.countDocuments({ author: req.user._id, category: "gadhya" });
    const kavyaCount = await Poem.countDocuments({ author: req.user._id, category: "kavya" });
    const audioCount = await Poem.countDocuments({ author: req.user._id, type: "audio" });

    user.stats = {
      poems: poemCount,
      gadhya: gadhyaCount,
      kavya: kavyaCount,
      audio: audioCount,
      followers: user.followers?.length || 0,
    };

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};



export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let updates = { ...req.body };

    // ❌ These should NEVER be updated
    delete updates.password;
    delete updates.email;
    delete updates.role;
    delete updates._id;

    // ❌ FIX → remove bookmarks (causing CastError)
    delete updates.bookmarks;
    delete updates.favourites;
    delete updates.savedPosts;

    // Convert social links
    if (updates.socialLinks && typeof updates.socialLinks === "string") {
      try {
        updates.socialLinks = JSON.parse(updates.socialLinks);
      } catch (e) {}
    }

    // Avatar upload (if file provided)
    if (req.file) {
      updates.avatar = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });

  } catch (err) {
    console.log("❌ Update error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};



export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("_id fullName penName email role").limit(500);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};



export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const user = await User.findById(id)
      .select("-password") // never return password
      .populate("bookmarks", "title slug createdAt") // optional: small fields
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // normalize some fields for frontend convenience
    const normalized = {
      ...user,
      writerName: user.penName || user.fullName || user.displayName || null,
      bookmarksCount: Array.isArray(user.bookmarks) ? user.bookmarks.length : 0,
      isAdmin: user.role === "admin",
    };

    return res.status(200).json({ success: true, user: normalized });
  } catch (err) {
    console.error("getUserById error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};



export const adminListUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(200, parseInt(req.query.limit, 10) || 25)); // cap
    const search = (req.query.search || "").trim();

    const filter = {};
    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { fullName: re },
        { penName: re },
        { email: re },
        { uniqueId: re },
      ];
    }

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Fetch paged users (including uniqueId)
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("_id fullName penName email role uniqueId avatar createdAt bookmarks socialLinks")
      .lean();

    // Map users by their uniqueId string for lookup
    const uniqueIds = users.map((u) => u.uniqueId).filter(Boolean);
    const usersMap = {};
    users.forEach((u) => {
      usersMap[String(u.uniqueId)] = { ...u, bookmarksCount: 0 };
      // remove heavy bookmarks array if present to avoid large payload
      if (usersMap[String(u.uniqueId)].bookmarks) delete usersMap[String(u.uniqueId)].bookmarks;
    });

    if (uniqueIds.length > 0) {
      // Aggregate Poem collection where bookmarks contains those uniqueIds (strings)
      const agg = [
        { $match: { bookmarks: { $exists: true, $ne: [] } } },
        { $unwind: "$bookmarks" },                     // produces one doc per bookmark entry
        { $match: { bookmarks: { $in: uniqueIds } } }, // only keep bookmarks for our page users
        { $group: { _id: "$bookmarks", count: { $sum: 1 } } }, // group by uniqueId string
      ];

      const results = await Poem.aggregate(agg).allowDiskUse(true);
      // results like [{ _id: '12345678', count: 5 }, ...]

      results.forEach((r) => {
        const uid = String(r._id);
        if (usersMap[uid]) usersMap[uid].bookmarksCount = r.count;
      });
    }

    const normalized = Object.values(usersMap);

    return res.status(200).json({
      success: true,
      meta: { total, page, totalPages, limit },
      users: normalized,
    });
  } catch (err) {
    console.error("adminListUsers error:", err);
    return res.status(500).json({ success: false, message: "Server error listing users" });
  }
};