import express from "express";
import { authorizeRoles, protect, verifyToken } from "../middleware/authMiddleware.js";
import { getAllUsers, getUserById, getUserProfile, updateUserProfile } from "../controller/userController.js";

const router = express.Router();

// 🟢 Get user profile (protected route)
router.get("/profile", protect, getUserProfile);

// 🟣 Update user profile (protected route)
router.put("/update", protect, updateUserProfile);


// routes/userRoutes.js (or admin route)
router.get("/", protect, authorizeRoles("admin"), getAllUsers); // returns id + fullName + penName

router.get("/:id", protect, authorizeRoles("admin"), getUserById);

export default router;
