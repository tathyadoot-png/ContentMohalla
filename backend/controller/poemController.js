import Poem from "../models/Poem.js";
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js"
import Language from "../models/languageModel.js";
import Transliterate from "@sindresorhus/transliterate";
import engToHindi from "../utils/engToHindi.js";


// 🧠 Helper function to validate URLs
const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};


export const createPoem = async (req, res) => {
  try {
    console.log("📂 Files received:", req.files);
    console.log("📄 Body received:", req.body);

    const {
      title,
      content,
      category,
      subcategory,
      languages,
      isAdminPost,
      userUniqueId,
      videoLink,
        date,
    } = req.body;

    const loggedInUser = req.user;
    if (!loggedInUser) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    if (!title || !content || !category || !subcategory) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // ✅ Validate video link (if provided)
    const isValidUrl = (url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };
    if (videoLink && videoLink.trim() !== "" && !isValidUrl(videoLink.trim())) {
      return res.status(400).json({ message: "Invalid video link format" });
    }

    // 🟡 Determine writer & status
    let writerId = loggedInUser._id;
    let poemStatus = req.body.status || "pending";

    if (loggedInUser.role === "admin") {
      if (userUniqueId?.trim()) {
        const targetUser = await User.findOne({ uniqueId: userUniqueId.trim() });
        if (!targetUser) {
          return res.status(404).json({ message: "User with this Unique ID not found" });
        }
        writerId = targetUser._id;
      } else {
        writerId = loggedInUser._id;
      }

      poemStatus = "approved"; // Admin poems are always approved
    }

    // ✅ Parse and validate languages
    let parsedLanguages = [];
    try {
      parsedLanguages = languages ? JSON.parse(languages) : [];
    } catch (error) {
      console.log("❌ Error parsing languages:", error);
      return res.status(400).json({ message: "Invalid languages format" });
    }

    if (!Array.isArray(parsedLanguages) || parsedLanguages.length === 0) {
      return res.status(400).json({ message: "Please select at least one language" });
    }

    // ✅ Ensure mainLanguage and subLanguageName both saved
    const finalLanguages = parsedLanguages.map((lang) => ({
      mainLanguage: lang.mainLanguage || lang.mainCategory || "",
      subLanguageName: lang.subLanguageName || "",
    }));

    // 📦 Build poem data
    const files = req.files || {};
    const poemData = {
      title,
      content,
      category,
      subcategory,
      date,
      writerId,
      languages: finalLanguages,
      isAdminPost: loggedInUser.role === "admin",
      status: poemStatus,
      videoLink: videoLink?.trim() || "",
    };

    // 📤 Upload files to Cloudinary
    if (files.image?.[0]) {
      const imageUpload = await cloudinary.uploader.upload(files.image[0].path, {
        folder: "contentmohalla/images",
      });
      poemData.image = {
        url: imageUpload.secure_url,
        public_id: imageUpload.public_id,
      };
    }

    if (files.audio?.[0]) {
      const audioUpload = await cloudinary.uploader.upload(files.audio[0].path, {
        folder: "contentmohalla/audios",
        resource_type: "video",
      });
      poemData.audio = {
        url: audioUpload.secure_url,
        public_id: audioUpload.public_id,
      };
    }

    if (files.video?.[0]) {
      const videoUpload = await cloudinary.uploader.upload(files.video[0].path, {
        folder: "contentmohalla/videos",
        resource_type: "video",
      });
      poemData.video = {
        url: videoUpload.secure_url,
        public_id: videoUpload.public_id,
      };
    }

    // 💾 Save poem to database
    const newPoem = new Poem(poemData);
    await newPoem.save();

    console.log("✅ Poem saved successfully:", newPoem._id);

    res.status(201).json({
      success: true,
      message:
        loggedInUser.role === "admin"
          ? "✅ Poem posted and approved successfully!"
          : "🕓 Poem submitted for review",
      poem: newPoem,
    });
  } catch (error) {
    console.error("❌ Error creating poem:", error);
    res.status(500).json({ message: "Server error while creating poem" });
  }
};




// ===============================
// 🧾 Get All Approved Poems
// ===============================
export const getAllPoems = async (req, res) => {
  try {
    const poems = await Poem.find({ status: "approved" }).sort({ createdAt: -1 });
    res.status(200).json(poems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching poems" });
  }
};

// ===============================
// 🔍 Get Poem by Slug
// ===============================
export const getPoemBySlug = async (req, res) => {
  try {
    const poem = await Poem.findOne({ slug: req.params.slug })
      .populate("writerId", "fullName penName") // ✅ keep only this for writer
      .populate("comments.userId", "fullName avatar"); // ✅ added to show user image & name in comments

    if (!poem) {
      return res.status(404).json({ message: "Poem not found" });
    }

    // 🟢 Detect if logged-in user has liked/bookmarked
    let userLiked = false;
    let userBookmarked = false;

    if (req.user?._id) {
      const userId = req.user._id.toString();

      userLiked = poem.likes?.some(
        (like) => like.userId?.toString() === userId
      );

      userBookmarked = poem.bookmarks?.some(
        (bm) => bm.userId?.toString() === userId
      );
    }

    // ✅ Send both with poem data
    res.json({
      success: true,
      poem,
      userLiked,
      userBookmarked,
    });
  } catch (error) {
    console.error("❌ getPoemBySlug error:", error);
    res.status(500).json({ message: "Server error" });
  }
};




// ===============================
// 🧾 Admin: Approve or Reject Poem
// ===============================
export const updatePoemStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    console.log("🟢 Update Poem Request:", { id, status });

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const poem = await Poem.findById(id);
    if (!poem) {
      return res.status(404).json({ message: "Poem not found" });
    }

    poem.status = status;
    await poem.save();

    res.status(200).json({
      success: true,
      message: `Poem ${status} successfully`,
      poem,
    });
  } catch (error) {
    console.error("❌ Error updating poem status:", error);
    res.status(500).json({ message: "Error updating poem status" });
  }
};


import mongoose from "mongoose";


export const getPoemsByCategory = async (req, res) => {
  try {
    const { category, subcategory } = req.params;

    // your known Hindi language ObjectId (adjust if different)
    const HINDI_LANGUAGE_ID = new mongoose.Types.ObjectId("6912fd5c34b9b95a0133ab74");
    const HINDI_LANGUAGE_ID_STR = HINDI_LANGUAGE_ID.toString();

    const poems = await Poem.find({
      category: { $regex: new RegExp(category, "i") },
      subcategory: { $regex: new RegExp(subcategory, "i") },
      status: "approved",

      // match if languages array has mainLanguage equal to:
      // 1) the ObjectId, OR
      // 2) the ObjectId stored as string, OR
      // 3) the literal string "Hindi"
      languages: {
        $elemMatch: {
          $or: [
            { mainLanguage: HINDI_LANGUAGE_ID },
            { mainLanguage: HINDI_LANGUAGE_ID_STR },
            { mainLanguage: "Hindi" }
          ]
        }
      }
    })
      .populate("writerId", "fullName penName")
      .sort({ createdAt: -1 });

    if (!poems.length) {
      return res.status(404).json({
        message: "No Hindi poems found for this category/subcategory.",
      });
    }

    res.status(200).json(poems);
  } catch (error) {
    console.error("❌ Error fetching poems by category:", error);
    res.status(500).json({ message: "Error fetching poems" });
  }
};


export const getPoemById = async (req, res) => {
  try {
    const poem = await Poem.findById(req.params.id)
      .populate("writerId", "fullName penName");

    if (!poem) return res.status(404).json({ message: "Poem not found" });

    let isLiked = false;
    if (req.user) {
      isLiked = poem.likes.includes(req.user._id);
    }

    res.status(200).json({
      success: true,
      poem,
      isLiked,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// 💬 Add Comment to Poem
// ===============================
export const addComment = async (req, res) => {
  try {
    const { poemId } = req.params;
    const { commentText } = req.body;
    const user = req.user; // ✅ middleware se milta hai

    if (!user) {
      return res.status(401).json({ message: "Login required to comment" });
    }

    if (!commentText || commentText.trim() === "") {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const poem = await Poem.findById(poemId);
    if (!poem) {
      return res.status(404).json({ message: "Poem not found" });
    }

    // 📝 Add new comment
    const newComment = {
      userId: user._id,
      username: user.fullName || "Anonymous",
      commentText: commentText.trim(),
      date: new Date(),
    };

    poem.comments.push(newComment);

    // ✅ Update comment count before saving
    poem.commentCount = poem.comments.length;

    await poem.save();

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comments: poem.comments,
      commentCount: poem.commentCount, // 👈 optional (frontend use ke liye)
    });
  } catch (error) {
    console.error("❌ Error adding comment:", error);
    res.status(500).json({ message: "Server error while adding comment" });
  }
};





// controller/poemController.js
export const toggleLike = async (req, res) => {
  try {
    const poem = await Poem.findById(req.params.poemId);
    if (!poem) return res.status(404).json({ message: "Poem not found" });

    const userId = req.user._id.toString();

    // ✅ Fix: check using like.userId
    const alreadyLiked = poem.likes.some(
      (like) => like.userId?.toString() === userId
    );

    if (alreadyLiked) {
      // remove like
      poem.likes = poem.likes.filter(
        (like) => like.userId?.toString() !== userId
      );
    } else {
      // add like
      poem.likes.push({ userId });
    }

    poem.likeCount = poem.likes.length; // ✅ update like count
    await poem.save();

    res.json({
      success: true,
      isLiked: !alreadyLiked,
      likeCount: poem.likeCount,
    });
  } catch (error) {
    console.error("❌ toggleLike error:", error);
    res.status(500).json({ message: "Server error" });
  }
};




export const toggleBookmark = async (req, res) => {
  try {
    const { poemId } = req.params;
    const user = req.user;

    if (!user) return res.status(401).json({ message: "Login required" });

    const poem = await Poem.findById(poemId);
    if (!poem) return res.status(404).json({ message: "Poem not found" });

    const alreadyBookmarked = poem.bookmarks.find(
      (b) => b.userId.toString() === user._id.toString()
    );

    if (alreadyBookmarked) {
      poem.bookmarks = poem.bookmarks.filter(
        (b) => b.userId.toString() !== user._id.toString()
      );
    } else {
      poem.bookmarks.push({ userId: user._id });
    }

    poem.bookmarkCount = poem.bookmarks.length;
    await poem.save();

    res.status(200).json({
      success: true,
      message: alreadyBookmarked ? "Bookmark removed" : "Bookmarked",
      bookmarkCount: poem.bookmarkCount,
    });
  } catch (error) {
    console.error("❌ Error toggling bookmark:", error);
    res.status(500).json({ message: "Error toggling bookmark" });
  }
};


export const incrementShareCount = async (req, res) => {
  try {
    const { poemId } = req.params;
    const poem = await Poem.findById(poemId);
    if (!poem) return res.status(404).json({ message: "Poem not found" });

    poem.shareCount += 1;
    await poem.save();

    res.status(200).json({
      success: true,
      message: "Share count incremented",
      shareCount: poem.shareCount,
    });
  } catch (error) {
    console.error("❌ Error updating share count:", error);
    res.status(500).json({ message: "Error updating share count" });
  }
};

export const getPoemsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status type" });
    }

    const poems = await Poem.find({ status })
      .populate("writerId", "fullName phone uniqueId email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, poems });
  } catch (error) {
    console.error("❌ Error fetching poems by status:", error);
    res.status(500).json({ message: "Server error fetching poems" });
  }
};



export const getRelatedPoems = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Poem id required" });

    console.log("🔎 getRelatedPoems requested for id:", id);

    const current = await Poem.findById(id).select("category subcategory");
    if (!current) {
      console.log(" -> poem not found for id:", id);
      return res.status(404).json({ message: "Poem not found" });
    }

    const LIMIT = 6;
    let related = await Poem.find({
      _id: { $ne: current._id },
      category: current.category,
      subcategory: current.subcategory,
      status: "approved",
    })
      .populate("writerId", "fullName penName avatar uniqueId")
      .sort({ createdAt: -1 })
      .limit(LIMIT)
      .lean();

    console.log(" -> found same-subcategory:", related.length);

    if (!related || related.length < LIMIT) {
      const needed = LIMIT - (related ? related.length : 0);
      const excludeIds = [current._id, ...(related.map(r => r._id) || [])];
      const more = await Poem.find({
        _id: { $nin: excludeIds },
        category: current.category,
        status: "approved",
      })
        .populate("writerId", "fullName penName avatar uniqueId")
        .sort({ createdAt: -1 })
        .limit(needed)
        .lean();

      console.log(" -> found fallback same-category:", more.length);
      related = (related || []).concat(more || []);
    }

    console.log(" -> returning related total:", related.length);
    return res.status(200).json({ success: true, related });
  } catch (err) {
    console.error("getRelated error:", err);
    res.status(500).json({ message: "Server error fetching related poems" });
  }
};


export const getMostLiked = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    let poems = await Poem.find({ status: "approved" })
      .sort({ likeCount: -1, createdAt: -1 })
      .limit(limit)
      .populate("writerId", "fullName penName avatar uniqueId")
      .lean();

    // Normalize: add `writer` alias and `writerName` for frontend
    poems = poems.map((p) => {
      const writer = p.writerId || null;
      return {
        ...p,
        writer,
        writerName: writer?.penName || writer?.fullName || writer?.username || null,
      };
    });

    return res.status(200).json({ success: true, poems });
  } catch (error) {
    console.error("getMostLiked error:", error);
    return res.status(500).json({ message: "Server error fetching most liked" });
  }
};

export const getMostBookmarked = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    let poems = await Poem.find({ status: "approved" })
      .sort({ bookmarkCount: -1, createdAt: -1 })
      .limit(limit)
      .populate("writerId", "fullName penName avatar uniqueId")
      .lean();

    poems = poems.map((p) => {
      const writer = p.writerId || null;
      return {
        ...p,
        writer,
        writerName: writer?.penName || writer?.fullName || writer?.username || null,
      };
    });

    return res.status(200).json({ success: true, poems });
  } catch (error) {
    console.error("getMostBookmarked error:", error);
    return res.status(500).json({ message: "Server error fetching most bookmarked" });
  }
};

export const getTrending = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const days = parseInt(req.query.days, 10) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const trending = await Poem.aggregate([
      { $match: { status: "approved" } },
      {
        $project: {
          title: 1,
          slug: 1,
          category: 1,
          subcategory: 1,
          writerId: 1,
          image: 1,
          likeCount: 1,
          bookmarkCount: 1,
          createdAt: 1,
          recentLikes: {
            $size: {
              $filter: {
                input: { $ifNull: ["$likes", []] },
                as: "l",
                cond: { $gte: ["$$l.date", since] },
              },
            },
          },
        },
      },
      { $sort: { recentLikes: -1, createdAt: -1 } },
      { $limit: limit },
    ]);

    // populate writerId (aggregation returned raw docs - let's populate manually)
    const populated = await Poem.populate(trending, {
      path: "writerId",
      select: "fullName penName avatar uniqueId",
    });

    const poems = populated.map((p) => {
      const writer = p.writerId || null;
      return {
        ...p,
        writer,
        writerName: writer?.penName || writer?.fullName || writer?.username || null,
      };
    });

    return res.status(200).json({ success: true, poems });
  } catch (error) {
    console.error("getTrending error:", error);
    return res.status(500).json({ message: "Server error fetching trending" });
  }
};

export const getLatestPoems = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    let poems = await Poem.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("writerId", "fullName penName avatar uniqueId")
      .lean();

    poems = poems.map((p) => {
      const writer = p.writerId || null;
      return {
        ...p,
        writer,
        writerName: writer?.penName || writer?.fullName || writer?.username || null,
      };
    });

    return res.status(200).json({ success: true, poems });
  } catch (error) {
    console.error("getLatestPoems error:", error);
    return res.status(500).json({ message: "Server error fetching latest poems" });
  }
};


// controllers/poemController.js (add this)
export const getBookmarkedByUser = async (req, res) => {
  try {
    // protect middleware ensures req.user exists
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Login required" });

    // optional pagination
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 12);
    const skip = (page - 1) * limit;

    // Query: poems that have this userId in bookmarks
    const filter = { "bookmarks.userId": user._id, status: "approved" };

    // total count (for frontend pagination)
    const total = await Poem.countDocuments(filter);

    // fetch poems, populate writer info and sort by newest
    const poems = await Poem.find(filter)
      .populate("writerId", "fullName penName avatar uniqueId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      poems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ getBookmarkedByUser error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching bookmarks" });
  }
};



export const deletePoem = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.user; // protect middleware must run before this

    if (!requester) return res.status(401).json({ success: false, message: "Login required" });

    const poem = await Poem.findById(id);
    if (!poem) return res.status(404).json({ success: false, message: "Poem not found" });

    // Allow delete if admin OR owner
    const isOwner = poem.writerId?.toString() === requester._id?.toString();
    const isAdmin = requester.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Remove media from Cloudinary if exists
    try {
      if (poem.image?.public_id) {
        await cloudinary.uploader.destroy(poem.image.public_id).catch((e) => {
          console.warn("Cloudinary image destroy failed:", e.message || e);
        });
      }
      if (poem.audio?.public_id) {
        await cloudinary.uploader.destroy(poem.audio.public_id, { resource_type: "video" }).catch((e) => {
          console.warn("Cloudinary audio destroy failed:", e.message || e);
        });
      }
      if (poem.video?.public_id) {
        await cloudinary.uploader.destroy(poem.video.public_id, { resource_type: "video" }).catch((e) => {
          console.warn("Cloudinary video destroy failed:", e.message || e);
        });
      }
    } catch (err) {
      console.warn("Cloudinary cleanup problem:", err.message || err);
      // continue with deletion anyway
    }

    // Delete poem document
    await Poem.deleteOne({ _id: id });

    return res.status(200).json({ success: true, message: "Poem deleted successfully", id });
  } catch (err) {
    console.error("❌ deletePoem error:", err);
    return res.status(500).json({ success: false, message: "Server error while deleting poem" });
  }
};


// Get top poems by likes or bookmarks (default: top 4)
// controllers/poemController.js

export const getTopPoems = async (req, res) => {
  try {
    // window = last 7 days (weekly)
    const periodDays = 7;
    const since = new Date();
    since.setDate(since.getDate() - periodDays);

    const LIMIT = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 4));

    // Aggregation:
    // 1) match approved poems
    // 2) compute recentLikeCount and recentBookmarkCount (where event.date >= since)
    // 3) compute score = recentLikeCount + recentBookmarkCount
    // 4) sort by score desc, date desc
    // 5) limit
    const pipeline = [
      { $match: { status: "approved" } },
      {
        $project: {
          title: 1,
          slug: 1,
          image: 1,
          date: 1,
          writerId: 1,
          likeCount: 1,
          bookmarkCount: 1,
          recentLikeCount: {
            $size: {
              $filter: {
                input: { $ifNull: ["$likes", []] },
                as: "l",
                cond: { $gte: ["$$l.date", since] },
              },
            },
          },
          recentBookmarkCount: {
            $size: {
              $filter: {
                input: { $ifNull: ["$bookmarks", []] },
                as: "b",
                cond: { $gte: ["$$b.date", since] },
              },
            },
          },
        },
      },
      {
        $addFields: {
          score: { $add: ["$recentLikeCount", "$recentBookmarkCount"] },
        },
      },
      { $sort: { score: -1, date: -1 } },
      { $limit: LIMIT },
    ];

    let docs = await Poem.aggregate(pipeline);

    // populate writer (aggregation returns plain docs)
    docs = await Poem.populate(docs, {
      path: "writerId",
      select: "fullName penName avatar uniqueId",
    });

    // normalize shape for frontend
    const poems = docs.map((p) => {
      const writer = p.writerId || null;
      return {
        title: p.title,
        slug: p.slug,
        date: p.date,
        image: p.image?.url || null,
        writerName: writer?.penName || writer?.fullName || null,
        recentLikeCount: p.recentLikeCount ?? 0,
        recentBookmarkCount: p.recentBookmarkCount ?? 0,
        score: p.score ?? 0,
        likeCount: p.likeCount ?? 0,
        bookmarkCount: p.bookmarkCount ?? 0,
      };
    });

    return res.status(200).json({
      success: true,
      periodDays,
      limit: LIMIT,
      poems,
    });
  } catch (error) {
    console.error("getTopWeekly error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching weekly top poems" });
  }
};



export const getPoemsExcludingHindi = async (req, res) => {
  try {
    const HINDI_ID = "6912fd5c34b9b95a0133ab74"; // तुम्हारी Hindi id
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const skip = (page - 1) * limit;

    const filter = {
      status: "approved",
      $nor: [{ languages: { $elemMatch: { mainLanguage: HINDI_ID } } }],
    };

    const total = await Poem.countDocuments(filter);

    const poems = await Poem.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("writerId", "fullName penName")
      .lean();

    // collect all candidate ids from poems (mainLanguage & subLanguageName)
    const idSet = new Set();
    poems.forEach((p) => {
      if (!Array.isArray(p.languages)) return;
      p.languages.forEach((lg) => {
        if (lg?.mainLanguage && typeof lg.mainLanguage === "string") idSet.add(lg.mainLanguage);
        if (lg?.subLanguageName && typeof lg.subLanguageName === "string") idSet.add(lg.subLanguageName);
      });
    });

    const ids = Array.from(idSet).filter((id) => id && id.length === 24);
    const langMap = {}; // map id -> readable name

    if (ids.length) {
      // fetch Language docs which either have _id in ids OR have subLanguages._id in ids
      const langDocs = await Language.find({
        $or: [
          { _id: { $in: ids } },
          { "subLanguages._id": { $in: ids } },
        ],
      }).lean();

      // populate langMap:
      langDocs.forEach((ld) => {
        // top-level mapping (Language _id -> mainCategory)
        if (ld._id) {
          langMap[String(ld._id)] = ld.mainCategory || null;
        }
        // subLanguages: map each subLanguages._id -> subLanguages.name
        if (Array.isArray(ld.subLanguages)) {
          ld.subLanguages.forEach((sl) => {
            if (sl && sl._id) {
              // prefer sub-language name (sl.name), fallback to parent mainCategory if needed
              langMap[String(sl._id)] = sl.name || sl.title || ld.mainCategory || null;
            }
          });
        }
      });
    }

    // build final shaped result attaching languagesResolved
    const result = poems.map((p) => {
      const writer = p.writerId || null;

      const languagesResolved = (p.languages || []).map((lg) => {
        const mainId = lg?.mainLanguage ? String(lg.mainLanguage) : null;
        const subId = lg?.subLanguageName ? String(lg.subLanguageName) : null;
        return {
          mainLanguageId: mainId,
          mainLanguageName: mainId ? (langMap[mainId] || null) : null,
          subLanguageId: subId,
          subLanguageName: subId ? (langMap[subId] || null) : null,
        };
      });

      let desc = p.metaDescription || p.description || "";
      if (!desc && p.content) {
        const txt = String(p.content).replace(/<[^>]+>/g, "").trim();
        desc = txt.length > 120 ? txt.slice(0, 117).trim() + "..." : txt;
      }

      return {
        id: p._id,
        title: p.title,
        slug: p.slug,
        date: p.date,
        image: (p.image && p.image.url) ? p.image.url : null,
        writerName: writer ? (writer.penName || writer.fullName || null) : null,
        description: desc || "",
        likeCount: p.likeCount ?? 0,
        bookmarkCount: p.bookmarkCount ?? 0,
        languagesResolved, // frontend should use this for badge
      };
    });

    return res.status(200).json({
      success: true,
      total,
      page,
      limit,
      poems: result,
    });
  } catch (err) {
    console.error("getPoemsExcludingHindi error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching poems" });
  }
};


export const getMyPoems = async (req, res) => {
  try {
  const poems = await Poem.find({ writerId: req.user._id })
  .select("title slug category subcategory image audio languages writerId createdAt")
  .populate("writerId", "fullName penName avatar")
  .sort({ createdAt: -1 });


    return res.status(200).json({
      success: true,
      data: poems
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};



export const searchPoems = async (req, res) => {
  try {
    let q = req.query.q?.trim().toLowerCase();
    if (!q) {
      return res.json({ success: true, poems: [], writers: [] });
    }

    // English normalize
    const normalizedQ = Transliterate(q).toLowerCase();

    // English → Hindi conversion
    const hindiFromEng = engToHindi(q);

    // all variants to search
    const variants = [q, normalizedQ, hindiFromEng];

    // poems search
    const poems = await Poem.find({
      $or: variants.flatMap((v) => [
        { title: { $regex: v, $options: "i" } },
        { content: { $regex: v, $options: "i" } },
        { keywords: { $regex: v, $options: "i" } },
      ]),
    })
      .limit(6)
      .select("title slug image createdAt");

    // writers search
    const writers = await User.find({
      $or: variants.flatMap((v) => [
        { fullName: { $regex: v, $options: "i" } },
        { penName: { $regex: v, $options: "i" } },
      ]),
    })
      .limit(6)
      .select("fullName penName avatar");

    return res.json({
      success: true,
      poems,
      writers,
    });
  } catch (error) {
    console.log("SEARCH ERROR:", error);
    res.status(500).json({ success: false, message: "Search failed" });
  }
};



// controllers/poemController.js
export const getPoemsWithAudio = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 12);
    const skip = (page - 1) * limit;
    const search = (req.query.search || "").trim();

    // base filter: audio.url exists and not empty, only approved poems
    const filter = {
      "audio.url": { $exists: true, $ne: "" },
      status: "approved",
    };

    // optional search on title/content
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Poem.countDocuments(filter);

    // fetch poems, include writer info
    // NOTE: include category & subcategory in .select so frontend receives them
    const docs = await Poem.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("writerId", "fullName penName avatar uniqueId")
      .select("title content audio likeCount bookmarkCount languages slug createdAt writerId category subcategory")
      .lean();

    // shape result for frontend
   // shape result for frontend
const poems = docs.map((p) => {
  const writer = p.writerId || null;
  const subLanguageName =
    Array.isArray(p.languages) && p.languages.length > 0 ? p.languages[0].subLanguageName || null : null;

  return {
    id: p._id,
    title: p.title,
    content: p.content,
    slug: p.slug,
    audio: p.audio || { url: "", public_id: "" },
    likeCount: p.likeCount ?? 0,
    bookmarkCount: p.bookmarkCount ?? 0,
    subLanguageName,
    // provide writer as flat fields for frontend convenience
    writerId: writer ? writer._id : null,
    writerName: writer ? (writer.penName || writer.fullName || null) : null,
    writerAvatar: writer ? (writer.avatar || "") : "",
    createdAt: p.createdAt,
    category: p.category || "",
    subcategory: p.subcategory || "",
  };
});


    return res.status(200).json({
      success: true,
      total,
      page,
      limit,
      poems,
    });
  } catch (err) {
    console.error("getPoemsWithAudio error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching audio poems" });
  }
};

