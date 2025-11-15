import express from "express";
import { getLanguages, updateLanguage, addLanguage, deleteLanguage } from "../controller/languageController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getLanguages); // public

router.post("/", protect, authorizeRoles("admin"), addLanguage);
router.put("/:id", protect, authorizeRoles("admin"), updateLanguage);
router.delete("/:id", protect, authorizeRoles("admin"), deleteLanguage);

export default router;
