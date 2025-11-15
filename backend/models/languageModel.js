import mongoose from "mongoose";
const languageSchema = new mongoose.Schema(
  {
    mainCategory: {
      type: String,
      required: true, // ✅ Make it required
      trim: true,
    },
    subLanguages: [
      {
        name: { type: String, required: true },
        description: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);


const Language = mongoose.model("Language", languageSchema);
export default Language;
