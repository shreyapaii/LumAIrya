const mongoose = require("mongoose")

// Each Message belongs to a Chat.
// role: "user" = what the human typed
// role: "assistant" = what the AI replied
const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",        // links to the parent Chat
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

// Index speeds up queries like "get all messages in chat X sorted by time"
messageSchema.index({ chatId: 1, createdAt: 1 })

module.exports = mongoose.model("Message", messageSchema)