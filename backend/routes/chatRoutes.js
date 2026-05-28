// backend/routes/chatRoutes.js

const express = require("express")
const router = express.Router()

const generateAIResponse = require("../services/aiService")
const { protect } = require("../middleware/authMiddleware")
const Chat = require("../models/Chat")
const Message = require("../models/Message")

// ─────────────────────────────────────────────────────────────
// POST /api/chat/send
// Protected route — user must be logged in
// Creates a new chat (if no chatId) or continues an existing one
// Saves user message + AI reply to MongoDB
// ─────────────────────────────────────────────────────────────
router.post("/send", protect, async (req, res) => {
  try {
    const { message, language, chatId } = req.body

    let chat

    if (chatId) {
      // Continue existing chat
      chat = await Chat.findById(chatId)
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" })
      }
    } else {
      // Create a brand new chat session
      // Title = first 40 characters of the user's first message
      chat = await Chat.create({
        userId: req.user._id,
        title: message.slice(0, 40),
        language: language || "English",
      })
    }

    // Save the user's message
    await Message.create({
      chatId: chat._id,
      role: "user",
      content: message,
    })

    // Get AI response
    // Fetch all previous messages from this chat
const previousMessages = await Message.find({
  chatId: chat._id,
}).sort({ createdAt: 1 })
const reply = await generateAIResponse(
  previousMessages,
  message,
  language || "English"
)

    // Save AI's reply
    await Message.create({
      chatId: chat._id,
      role: "assistant",
      content: reply,
    })

    res.json({
      reply,
      chatId: chat._id,
    })

  } catch (error) {
    console.error("Chat send error:", error)
    res.status(500).json({ message: "AI response failed" })
  }
})

// ─────────────────────────────────────────────────────────────
// GET /api/chat/history
// Protected route — returns all chats belonging to logged-in user
// Used to populate the sidebar
// ─────────────────────────────────────────────────────────────
router.get("/history", protect, async (req, res) => {
  try {
    // Find all chats for this user, newest first
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ createdAt: -1 })

    res.json(chats)

  } catch (error) {
    console.error("History fetch error:", error)
    res.status(500).json({ message: "Failed to fetch chat history" })
  }
})

// ─────────────────────────────────────────────────────────────
// GET /api/chat/:chatId/messages
// Protected route — returns all messages inside one chat session
// Used when user clicks a chat in the sidebar
// ─────────────────────────────────────────────────────────────
router.get("/:chatId/messages", protect, async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .sort({ createdAt: 1 }) // oldest first = correct order

    res.json(messages)

  } catch (error) {
    console.error("Message fetch error:", error)
    res.status(500).json({ message: "Failed to fetch messages" })
  }
})

module.exports = router