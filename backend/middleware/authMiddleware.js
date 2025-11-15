// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const extractTokenFromReq = (req) => {
  // Prefer Authorization header
  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  // fallback to cookies
  return req.cookies?.adminToken || req.cookies?.userToken || req.cookies?.token || null;
};

export const protect = async (req, res, next) => {
  try {
    const token = extractTokenFromReq(req);
    if (!token) return res.status(401).json({ success: false, message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    if (!userId) return res.status(401).json({ success: false, message: "Invalid token payload" });

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Auth error:", err.message || err);
    res.status(401).json({ success: false, message: "Unauthorized or invalid token" });
  }
};

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  next();
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromReq(req);
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    if (!userId) return next();
    // include uniqueId, fullName, avatar for UI use
    req.user = await User.findById(userId).select("_id fullName penName uniqueId avatar role");
  } catch (err) {
    // ignore invalid token (do not block request)
  }
  next();
};



export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
