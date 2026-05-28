// backend/server.js

require("dotenv").config()
const express = require("express")
const cors = require("cors")

const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const chatRoutes = require("./routes/chatRoutes")

const app = express()

// Connect to MongoDB
connectDB()

// Allow frontend to send Authorization header (needed for JWT)
app.use(cors({
  origin: "http://localhost:5173",  // Vite dev server
  allowedHeaders: ["Content-Type", "Authorization"],
}))

app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/chat", chatRoutes)   // All chat routes live under /api/chat

app.get("/", (req, res) => {
  res.send("Backend is running ✅")
})

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})