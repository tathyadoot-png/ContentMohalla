import express from "express";
import upload from "../config/multer.js";
import Poem from "../models/Poem.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import { protect, authorizeRoles, optionalAuth } from "../middleware/authMiddleware.js";
import {
  addComment,
  createPoem,
  deletePoem,
  getAllPoems,
  getBookmarkedByUser,
  getLatestPoems,
  getMostBookmarked,
  getMostLiked,
  getMyPoems,
  getPoemById,
  getPoemBySlug,
  getPoemsByCategory,
  getPoemsByStatus,
  getPoemsExcludingHindi,
  getRelatedPoems,
  getTopPoems,
  getTrending,
  incrementShareCount,
  searchPoems,
  toggleBookmark,
  toggleLike,
  updatePoemStatus,
} from "../controller/poemController.js";

const router = express.Router();

// 🎭 Create new poem (user/admin)
router.post(
  "/create",
  protect,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  createPoem
);

// 📜 Get all approved poems
router.get("/", getAllPoems);

// GET /api/poems/no-hindi?page=1&limit=12
router.get("/no-hindi", getPoemsExcludingHindi);

// 🔍 Get single poem by slug
router.get("/slug/:slug",optionalAuth, getPoemBySlug);

// 🧑‍💼 Admin approve/reject poem
router.put("/:id/status", protect, authorizeRoles("admin"), updatePoemStatus);

// 📚 Get poems by category/subcategory
router.get("/category/:category/:subcategory", getPoemsByCategory);

router.get("/my-poems", protect, getMyPoems);

router.get("/search", searchPoems);

// 💬 Comment on poem
router.post("/:poemId/comment", protect, addComment);

// ❤️ Like / Unlike poem
router.post("/:poemId/like", protect, toggleLike);

// 🔖 Bookmark / Unbookmark poem
router.post("/:poemId/bookmark", protect, toggleBookmark);

// 📤 Increment share count
router.post("/:poemId/share", incrementShareCount);

router.get(
  "/admin/poems/:status",
  protect,
  authorizeRoles("admin"),
  getPoemsByStatus
);

// inside your poems router (PUT /admin/update/:id)
router.put(
  "/admin/update/:id",
  protect,
  authorizeRoles("admin"),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const poem = await Poem.findById(req.params.id);
      if (!poem) return res.status(404).json({ message: "Poem not found" });

      // ------------------- ownership change via uniqueId -------------------
      if (req.body.userUniqueId && String(req.body.userUniqueId).trim() !== "") {
        const newUnique = String(req.body.userUniqueId).trim();
        const newOwner = await User.findOne({ uniqueId: newUnique });
        if (!newOwner) {
          // fail fast so admin knows the uniqueId is invalid
          return res.status(404).json({ message: `User with Unique ID ${newUnique} not found` });
        }

        // change only if different
        const currentWriterId = poem.writerId ? String(poem.writerId) : null;
        if (!currentWriterId || currentWriterId !== String(newOwner._id)) {
          poem.writerId = newOwner._id;
          // optional: maintain postsCount on users if you have that field
          // (update previous owner and new owner counts here)
        }
      }
      // --------------------------------------------------------------------

      // Update other fields as you already do
      poem.title = req.body.title ?? poem.title;
      poem.content = req.body.content ?? poem.content;
      poem.category = req.body.category ?? poem.category;
      poem.subcategory = req.body.subcategory ?? poem.subcategory;
      poem.date = req.body.date ?? poem.date;

      // languages
      if (req.body.languages) {
        try {
          const parsed = JSON.parse(req.body.languages);
          if (Array.isArray(parsed) && parsed.length > 0) {
            poem.languages = parsed.map((lang) => ({
              mainLanguage: lang.mainLanguage || lang.mainCategory || "",
              subLanguageName: lang.subLanguageName || "",
            }));
          }
        } catch (e) {
          console.warn("languages parse failed on update:", e);
        }
      }

      const files = req.files || {};
      // handle files (image/audio/video) same as you already have (upload to Cloudinary etc.)
      if (files.image && files.image[0]) {
        const img = files.image[0];
        const uploadRes = await cloudinary.uploader.upload(img.path, { folder: "contentmohalla/images" });
        poem.image = { url: uploadRes.secure_url, public_id: uploadRes.public_id };
      }
      if (files.audio && files.audio[0]) {
        const aud = files.audio[0];
        const uploadRes = await cloudinary.uploader.upload(aud.path, { folder: "contentmohalla/audios", resource_type: "video" });
        poem.audio = { url: uploadRes.secure_url, public_id: uploadRes.public_id };
      }
      if (files.video && files.video[0]) {
        const vid = files.video[0];
        const uploadRes = await cloudinary.uploader.upload(vid.path, { folder: "contentmohalla/videos", resource_type: "video" });
        poem.video = { url: uploadRes.secure_url, public_id: uploadRes.public_id };
      }

      await poem.save();
      return res.json({ message: "Poem updated successfully", poem });
    } catch (error) {
      console.error("Update Error:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);



// GET /poems/sections/most-liked?limit=8
router.get("/sections/most-liked", getMostLiked);

// GET /poems/sections/most-bookmarked?limit=8
router.get("/sections/most-bookmarked", getMostBookmarked);

// GET /poems/sections/trending?limit=8&days=7
router.get("/sections/trending", getTrending);

// GET /poems/sections/latest?limit=8
router.get("/sections/latest", getLatestPoems);

router.get("/bookmarks/mine", protect, getBookmarkedByUser);


router.get("/:id/related", getRelatedPoems);


router.get("/top", getTopPoems);


router.delete("/:id", protect, deletePoem);


// 📖 Get poem by ID
router.get("/:id", getPoemById);


export default router;
