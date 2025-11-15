import User from "../models/User.js";
import Poem from "../models/Poem.js";

export const getWriterProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const writer = await User.findById(userId).select("-password");
    if (!writer) {
      return res.status(404).json({ message: "Writer not found" });
    }

    // 🔥 CORRECT FIELD → writerId
    const poems = await Poem.find({ writerId: userId, status: "approved" }).sort({ createdAt: -1 });

    res.json({
      writer,
      poems,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};


export const getPoemsByWriter = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔥 CORRECT FIELD → writerId
    const poems = await Poem.find({ writerId: id,status: "approved",  })
      .sort({ createdAt: -1 })
      .populate("writerId"); // optional

    return res.status(200).json(poems);
  } catch (error) {
    console.log("Error fetching writer poems:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
