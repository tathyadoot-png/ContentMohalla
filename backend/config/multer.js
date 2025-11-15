// backend/config/multer.js
import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ Step 1: Ensure "uploads" folder exists
const uploadDir = path.join(process.cwd(), "uploads"); // absolute path
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Created uploads folder at:", uploadDir);
}

// ✅ Step 2: Set up local disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// ✅ Step 3: Export multer instance
const upload = multer({ storage });
console.log("✅ Multer storage initialized using local uploads folder");

export default upload;
