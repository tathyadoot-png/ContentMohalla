import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    mrp: Number,
    sellingPrice: Number,
    images: [String],
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    categories: [{ type: String }],

    // ✅ New fields (optional)
    subCategory: { type: String },
    stock: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "inactive", "out-of-stock"],
      default: "active",
    },
    discount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },

    // Flags for display sections
    isTrending: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    releaseDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
