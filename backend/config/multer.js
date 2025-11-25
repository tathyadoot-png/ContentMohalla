// backend/config/multer.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

// ✔ Cloudinary universal storage (image + audio + video)
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "misc";
    let resourceType = "auto"; // auto handles image, video, raw

    // Detect file type
    if (file.mimetype.startsWith("image")) {
      folder = "avatars";
      resourceType = "image";
    } else if (file.mimetype.startsWith("audio")) {
      folder = "audios";
      resourceType = "raw"; // audio must use raw
    } else if (file.mimetype.startsWith("video")) {
      folder = "videos";
      resourceType = "video";
    }

    return {
      folder,
      resource_type: resourceType,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "mp3", "wav", "mp4", "mkv"],
     transformation:
  resourceType === "image"
    ? [{ width: 1200, crop: "limit" }]
    : undefined

    };
  },
});

export default multer({ storage });
