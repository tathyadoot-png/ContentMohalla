import express from "express";
import {
  getPendingVendors,
  approveVendor,
  rejectVendor,
  getApprovedVendors,
  getDashboardStats,
  adminDashboardStats,
} from "../controller/adminController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { adminListUsers } from "../controller/userController.js";

const router = express.Router();

// Only admin can access these
router.get("/vendors/pending", protect, authorizeRoles("admin"), getPendingVendors);
router.put("/vendors/approve/:id", protect, authorizeRoles("admin"), approveVendor);
router.put("/vendors/reject/:id", protect, authorizeRoles("admin"), rejectVendor);
router.get("/vendors/approved", protect, authorizeRoles("admin"), getApprovedVendors);
router.get("/dashboard/stats", protect, authorizeRoles("admin"), getDashboardStats);

router.get("/users", protect, authorizeRoles("admin"), adminListUsers);
router.get("/stats", protect, authorizeRoles("admin"), adminDashboardStats);


export default router;
