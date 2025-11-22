import express from "express";
import upload from "../config/multer.js";
import { registerUser, loginUser, logoutUser, getLoggedInUser, createUserByAdmin } from "../controller/authController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Registration with avatar upload
router.post("/register", upload.single("avatar"), registerUser);

// Login route
router.post("/login", (req, res, next) => {
  console.log("🟢 Hit login route:", req.originalUrl);
  next();
}, loginUser);

router.post("/logout", logoutUser);
router.get("/me", protect, getLoggedInUser);

router.post("/admin/create-user", protect, authorizeRoles("admin"), upload.single("avatar"), createUserByAdmin);

export default router;
