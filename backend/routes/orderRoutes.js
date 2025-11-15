import express from "express";
const router = express.Router();

import {
  createOrder,
  getAllOrders,
  getVendorOrders,
  getMyOrders,
} from "../controller/orderController.js";

import { protect } from "../middleware/authMiddleware.js";

// POST /api/order/create
router.post("/create", protect, createOrder);
router.get("/all", protect, getAllOrders);
router.get("/vendor", protect, getVendorOrders);
router.get("/my", protect, getMyOrders);

export default router;
