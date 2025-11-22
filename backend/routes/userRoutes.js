import express from "express";
import { authorizeRoles, protect, verifyToken } from "../middleware/authMiddleware.js";
import { getAllUsers, getUserById, getUserProfile, updateUserProfile } from "../controller/userController.js";
import upload from "../config/multer.js";

const router = express.Router();

// 🟢 Get user profile (protected route)
router.get("/profile", protect, getUserProfile);
// const upload = multer({ dest: "uploads/avatars/" });

// 🟣 Update user profile (protected route)
router.put("/update", protect, upload.single("avatar"), updateUserProfile);


// routes/userRoutes.js (or admin route)
router.get("/", protect, authorizeRoles("admin"), getAllUsers); 

router.get("/:id", protect, authorizeRoles("admin"), getUserById);

export default router;
