import Product from "../models/Product.js";

// ✅ Get trending products
export const getTrendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ isTrending: true }).limit(10);
    res.json(products);
  } catch (e) {
    console.error("Error fetching trending products:", e);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get new arrival products
export const getNewArrivalProducts = async (req, res) => {
  try {
    const products = await Product.find({ isNewArrival: true })
      .sort({ releaseDate: -1 })
      .limit(10);
    res.json(products);
  } catch (e) {
    console.error("Error fetching new arrivals:", e);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get best seller products
export const getBestSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ isBestSeller: true }).limit(10);
    res.json(products);
  } catch (e) {
    console.error("Error fetching best sellers:", e);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate(
      "vendor",
      "name businessName email"
    );
    res.json(products);
  } catch (error) {
    console.error("Error fetching all products:", error);
    res
      .status(500)
      .json({ message: "Server error: failed to fetch products." });
  }
};

// ✅ Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "vendor",
      "name businessName email"
    );
    if (!product)
      return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};
