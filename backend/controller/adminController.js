import User from "../models/User.js";
import Poem from "../models/Poem.js";

// ✅ Get all pending vendors
export const getPendingVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor", vendorStatus: "pending" });
    res.json(vendors);
  } catch (err) {
    console.error("❌ Error in getPendingVendors:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all approved vendors
export const getApprovedVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor", vendorStatus: "approved" });
    res.json(vendors);
  } catch (err) {
    console.error("❌ Error in getApprovedVendors:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Approve vendor
export const approveVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await User.findByIdAndUpdate(
      id,
      { vendorStatus: "approved" },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    res.json({ message: "Vendor approved", vendor });
  } catch (err) {
    console.error("❌ Error in approveVendor:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Reject vendor
export const rejectVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await User.findByIdAndUpdate(
      id,
      { vendorStatus: "rejected" },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    res.json({ message: "Vendor rejected", vendor });
  } catch (err) {
    console.error("❌ Error in rejectVendor:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalVendorRequests = await User.countDocuments({
      role: "vendor",
      vendorStatus: "pending",
    });
    const approvedVendorCount = await User.countDocuments({
      role: "vendor",
      vendorStatus: "approved",
    });
    const rejectedVendorCount = await User.countDocuments({
      role: "vendor",
      vendorStatus: "rejected",
    });
    const totalUserCount = await User.countDocuments({ role: "customer" });

    res.json({
      totalVendorRequests,
      approvedVendorCount,
      rejectedVendorCount,
      totalUserCount,
    });
  } catch (err) {
    console.error("❌ Error in getDashboardStats:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};



export const adminDashboardStats = async (req, res) => {
  try {
    // total users
    const totalUsers = await User.countDocuments({});

    // Main aggregation: totals, categories, bookmarks, likes
    const mainAgg = [
      {
        $group: {
          _id: null,
          totalPoems: { $sum: 1 },
          totalBookmarks: {
            $sum: {
              $ifNull: ["$bookmarkCount", { $size: { $ifNull: ["$bookmarks", []] } }],
            },
          },
          totalLikes: {
            $sum: { $ifNull: ["$likeCount", { $size: { $ifNull: ["$likes", []] } }] },
          },
          gadhyaCount: { $sum: { $cond: [{ $eq: ["$category", "Gadhya"] }, 1, 0] } },
          kavyaCount: { $sum: { $cond: [{ $eq: ["$category", "Kavya"] }, 1, 0] } },
        },
      },
    ];

    const mainRes = await Poem.aggregate(mainAgg).allowDiskUse(true);
    const mainStats = mainRes && mainRes[0] ? mainRes[0] : {
      totalPoems: 0,
      totalBookmarks: 0,
      totalLikes: 0,
      gadhyaCount: 0,
      kavyaCount: 0,
    };

    // Status aggregation: grouped by status (handles unexpected status values too)
    const statusAgg = [
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ];
    const statusRes = await Poem.aggregate(statusAgg).allowDiskUse(true);
    // statusRes like [{ _id: "approved", count: 10 }, { _id: "pending", count: 2 }, ...]

    // map to known keys, normalize keys to lowercase & trimmed
    const statusMap = { approved: 0, pending: 0, rejected: 0 };
    for (const r of statusRes) {
      if (!r || typeof r._id === "undefined") continue;
      const key = String(r._id).trim().toLowerCase();
      if (key === "approved") statusMap.approved = r.count;
      else if (key === "pending") statusMap.pending = r.count;
      else if (key === "rejected") statusMap.rejected = r.count;
      else {
        // unknown status — log for debugging but ignore
        console.warn("adminDashboardStats: unknown poem status found:", r._id, r.count);
      }
    }

    // final payload
    const payload = {
      totalUsers,
      totalPoems: mainStats.totalPoems || 0,
      gadhyaCount: mainStats.gadhyaCount || 0,
      kavyaCount: mainStats.kavyaCount || 0,
      totalBookmarks: mainStats.totalBookmarks || 0,
      totalLikes: mainStats.totalLikes || 0,
      approvedPoems: statusMap.approved || 0,
      pendingPoems: statusMap.pending || 0,
      rejectedPoems: statusMap.rejected || 0,
    };

    // Debug log (remove in production if noisy)
    console.log("adminDashboardStats payload:", payload);

    return res.status(200).json({ success: true, data: payload });
  } catch (err) {
    console.error("adminDashboardStats error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching dashboard stats" });
  }
};