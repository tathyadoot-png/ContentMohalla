import express from "express";
import upload from "../config/multer.js";
import { registerUser, logoutUser, getLoggedInUser, createUserByAdmin, login } from "../controller/authController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Registration with avatar upload
router.post("/register", upload.single("avatar"), registerUser);

// Login route
router.post("/login", login);


// router.post("/logout", logoutUser);
router.get("/me", protect, getLoggedInUser);

router.post(
  "/admin/create-user",
  protect,
  upload.single("avatar"),   // ✔ Same as register
  createUserByAdmin
);

export default router;
