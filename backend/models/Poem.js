import mongoose from "mongoose";
import slugify from "slugify";

const poemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true, lowercase: true },
    writerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: { type: String, enum: ["Gadhya", "Kavya"], required: true },
    subcategory: { type: String, required: true },
    content: { type: String, required: true },
    image: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    audio: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    video: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    videoLink: { type: String, default: "", trim: true },
    date: { type: Date, default: Date.now },
    // 🟢 CONNECTED LANGUAGE FIELD
    languages: [
      {
        mainLanguage: { type: String, required: true },
        subLanguageName: { type: String, required: true },
      },
    ],

    // 🔖 Bookmarks
    bookmarks: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: { type: Date, default: Date.now },
      },
    ],
    bookmarkCount: { type: Number, default: 0 },

    // 💬 Comments
    // 💬 Comments
    // 💬 Comments section
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        username: { type: String, required: true }, // comment karne wale ka naam dikhane ke liye
        commentText: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    likes: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: { type: Date, default: Date.now },
      },
    ],
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: { type: Number, default: 0 },

    // 🔗 Shares
    shareCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isAdminPost: { type: Boolean, default: false },
  },
  { timestamps: true }
);

poemSchema.pre("save", function (next) {
  if (this.isModified("title") || !this.slug) {
    let generatedSlug = slugify(this.title, {
      lower: true,
      strict: false,
      locale: "hi",
      trim: true,
    });
    if (!generatedSlug || generatedSlug.trim() === "") {
      generatedSlug = this.title.trim().replace(/\s+/g, "-");
    }
    this.slug = generatedSlug;
  }

  // 🧮 auto-update counts
  this.bookmarkCount = this.bookmarks.length;
  this.commentCount = this.comments.length;
  next();
});

// ⭐ FULL TEXT INDEX (everything you want to search)
poemSchema.index(
  {
    title: "text",
    content: "text",
    category: "text",
    subcategory: "text",
    description: "text",      // If you add description field
    // Writer fields → via lookup
    "writer.fullName": "text",
    "writer.penName": "text"
  },
  {
    default_language: "none",  // Important for Hindi
    language_override: "none"
  }
);


const Poem = mongoose.model("Poem", poemSchema);
export default Poem;
