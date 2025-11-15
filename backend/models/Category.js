const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: String,      // Agar icon rakhna ho future me
  description: String, // Agar chaho toh
});
module.exports = mongoose.model("Category", categorySchema);
