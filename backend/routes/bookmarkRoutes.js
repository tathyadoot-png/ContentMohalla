import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addBookmark, removeBookmark, getBookmarks } from "../controller/bookmarkController.js";

const router = express.Router();

router.post("/add", protect, addBookmark);
router.post("/remove", protect, removeBookmark);
router.get("/my-bookmarks", protect, getBookmarks);

export default router;
