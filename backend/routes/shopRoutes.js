import express from "express";
import {
  getTrendingProducts,
  getNewArrivalProducts,
  getBestSellerProducts,
  getAllProducts,
  getProductById,
} from "../controller/productControllers.js";

import {
  getCart,
  addToCart,
  removeFromCart,
} from "../controller/cartControllers.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Product routes
router.get("/products/trending", getTrendingProducts);
router.get("/products/new-arrival", getNewArrivalProducts);
router.get("/products/best-seller", getBestSellerProducts);

// ⚠️ Fixed missing slash before "products/all"
router.get("/products/all", getAllProducts);

router.get("/products/:id", getProductById);

// ✅ Cart routes (authenticated)
router.get("/cart", protect, getCart);
router.post("/cart/add", protect, addToCart);
router.delete("/cart/remove/:productId", protect, removeFromCart);

export default router;
