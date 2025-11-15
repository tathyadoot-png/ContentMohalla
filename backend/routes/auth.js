import express from "express";
import upload from "../config/multer.js";
import { registerUser, loginUser, logoutUser } from "../controller/authController.js";

const router = express.Router();

// Registration with avatar upload
router.post("/register", upload.single("avatar"), registerUser);

// Login route
router.post("/login", (req, res, next) => {
  console.log("🟢 Hit login route:", req.originalUrl);
  next();
}, loginUser);

router.post("/logout", logoutUser);


export default router;
