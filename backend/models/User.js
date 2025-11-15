import mongoose from "mongoose";

const socialLinksSchema = new mongoose.Schema({
  twitter: { type: String, default: "" },
  instagram: { type: String, default: "" },
  facebook: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  youtube: { type: String, default: "" },
  github: { type: String, default: "" },
  website: { type: String, default: "" },
});

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    fullName: { type: String, required: true, trim: true },
    penName: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },

    // Profile Info
    bio: { type: String, trim: true },
    tagline: { type: String, trim: true },
    profession: { type: String, trim: true },
    location: { type: String, trim: true },

    // Avatar / Profile Picture
    avatar: { type: String, default: "" }, // store URL or filename

    // Role Management
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // Unique Numeric ID (auto-generated for poem reference)
    uniqueId: {
      type: String,
      unique: true,
      default: () => {
        // Generate random 8-digit number as string
        return Math.floor(10000000 + Math.random() * 90000000).toString();
      },
    },

    // Social Media Links
    socialLinks: { type: socialLinksSchema, default: {} },

    // Bookmark feature
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Poem",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
