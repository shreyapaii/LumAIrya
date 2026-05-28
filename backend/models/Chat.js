const mongoose = require("mongoose")

// A "Chat" is one conversation session (like a tab in ChatGPT)
// It belongs to a user and has a language preference
const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",        // links back to the User model
      required: true,
    },
    title: {
      type: String,
      default: "New Chat",  // auto-updated to first message text
    },
    language: {
      type: String,
      enum: ["English", "Hindi", "Kannada"],
      default: "English",
    },
  },
  { timestamps: true }  // adds createdAt and updatedAt automatically
)

module.exports = mongoose.model("Chat", chatSchema)