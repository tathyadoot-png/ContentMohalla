// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🧩 Helper: Extract social links (supports both JSON and FormData)
const buildSocialLinksFromBody = (body) => {
  const social = {};
  Object.keys(body || {}).forEach((key) => {
    const match = key.match(/^socialLinks\[(.+)\]$/);
    if (match) {
      social[match[1]] = body[key];
    }
  });
  // Also handle when socialLinks is directly sent as object (Next.js JSON body)
  if (typeof body.socialLinks === "object") {
    Object.assign(social, body.socialLinks);
  }
  return social;
};

// Add your default Cloudinary avatar URL
const DEFAULT_AVATAR = "https://res.cloudinary.com/dw8ck8ubc/image/upload/v1763451349/Avatar_tpglgf.jpg";

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      penName,
      email,
      password,
      confirmPassword,
      bio,
      phone,
      tagline,
      profession,
      location,
    } = req.body;

    const socialLinks = buildSocialLinksFromBody(req.body);

    // If user uploaded image → use that
    // If not uploaded → use DEFAULT_AVATAR
    const avatarUrl = req.file
      ? req.file.path || req.file.secure_url
      : DEFAULT_AVATAR;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "fullName, email, and password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      penName,
      email,
      password: hashedPassword,
      bio: bio || "",
      phone: phone || "",
      tagline: tagline || "",
      profession: profession || "",
      location: location || "",
      avatar: avatarUrl, // ← always saved
      socialLinks,
      role: "user",
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id,
      uniqueId: newUser.uniqueId,
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error during registration",
      error: err.message,
    });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // decide cookie name
    const cookieName = user.role === "admin" ? "adminToken" : "userToken";

    // set cookie using shared options
    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // clear the other role cookie to avoid stale cookie
    if (cookieName === "adminToken") res.clearCookie("userToken", { path: "/" });
    else res.clearCookie("adminToken", { path: "/" });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        penName: user.penName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        tagline: user.tagline,
        profession: user.profession,
        location: user.location,
        avatar: user.avatar,
        uniqueId: user.uniqueId,
        socialLinks: user.socialLinks,
      },
      token, // frontend can use this if it needs client-side access
    });
  } catch (err) {
    console.error("❌ Login error =>", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const logoutUser = (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  };

  res.clearCookie("userToken", cookieOptions);
  res.clearCookie("adminToken", cookieOptions);
  res.json({ success: true, message: "Logged out successfully" });
};


export const getLoggedInUser = (req, res) => {
  if (!req.user) return res.json({ success: false });

  res.json({
    success: true,
    user: req.user,
  });
};
