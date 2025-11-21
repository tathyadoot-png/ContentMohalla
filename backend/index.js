// app.js (or server.js) - updated with robust CORS & cookie support
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

// ========================
// 1. Port & ENV Variables
// ========================
const PORT = process.env.PORT || 8080;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const ADMIN_URL = process.env.ADMIN_URL || "http://localhost:3001"; // optional admin panel origin

// ========================
// 2. Middlewares
// ========================
app.use(express.json());

// ✅ Use cookie-parser before routes that use cookies
app.use(cookieParser());

// If behind a proxy (Render, Vercel, Cloudflare Workers, etc.), trust it so secure cookies work
if (process.env.NODE_ENV === "production") {
  // trust the first proxy (load balancer)
  app.set("trust proxy", 1);
}

// Build allowed origins list (remove undefined values)
const allowedOrigins = [
  ADMIN_URL,
  CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

// Robust dynamic CORS middleware (allows credentials and sets Vary header)
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Allow same-origin or tools like curl (no origin header)
  if (!origin) {
    res.setHeader("Vary", "Origin");
    return next();
  }

  if (allowedOrigins.includes(origin)) {
    // Explicitly allow exact origin and credentials
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    // Expose headers if needed by client
    res.setHeader("Access-Control-Expose-Headers", "Content-Length, X-Kuma-Revision");
    // Important for CDNs/proxies to cache safely
    res.setHeader("Vary", "Origin");

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    return next();
  } else {
    // Block unknown origins
    return res.status(403).json({ message: "CORS - Origin not allowed" });
  }
});

// Optional: simple logger for incoming origins (helpful during debugging)
app.use((req, res, next) => {
  console.log("Incoming request origin:", req.headers.origin);
  next();
});

// ========================
// 3. Routes (imported routers)
// ========================
import adminRoutes from "./routes/adminRoute.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/productRoutes.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import poemRoutes from "./routes/poemRoutes.js";
import languageRoutes from "./routes/languageRoutes.js";
import writerRoutes from "./routes/writerRoute.js";



app.use("/api/writer", writerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/auth", authRoutes); // cookie-based login route
app.use("/api", productRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/poems", poemRoutes);
app.use("/api/languages", languageRoutes);


// ========================
// 4. Test Route
// ========================
app.get("/", (req, res) => {
  res.send("🚀 API is running with secure cookie & CORS support.");
});

// ========================
// 5. Global Error Handling
// ========================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Server Error",
  });
});

// ========================
// 6. MongoDB Connection & Server Start
// ========================
mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  });

export default app;
