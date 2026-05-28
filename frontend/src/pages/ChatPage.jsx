// frontend/src/pages/ChatPage.jsx

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const API = "http://localhost:5000/api"

function ChatPage() {
  // ── State ────────────────────────────────────────────────
  const [messages, setMessages]       = useState([])       // current chat messages
  const [input, setInput]             = useState("")       // input box value
  const [language, setLanguage]       = useState("English")
  const [isLoading, setIsLoading]     = useState(false)    // spinner flag
  const [chatHistory, setChatHistory] = useState([])       // sidebar list
  const [currentChatId, setCurrentChatId] = useState(null) // active chat
  const [darkMode, setDarkMode]       = useState(true)

  const bottomRef = useRef(null)   // for auto-scroll
  const navigate  = useNavigate()

  // JWT token stored in localStorage after login
  const token = localStorage.getItem("token")

  // Auth header used in every request
  const authHeader = { headers: { Authorization: `Bearer ${token}` } }

  // ── Auto-scroll whenever messages change ─────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  // ── Load sidebar chat list on mount ──────────────────────
  useEffect(() => {
    if (!token) {
      navigate("/")  // not logged in → redirect to login
      return
    }
    fetchChatHistory()
  }, [])

  const fetchChatHistory = async () => {
    try {
      const res = await axios.get(`${API}/chat/history`, authHeader)
      setChatHistory(res.data)
    } catch (err) {
      console.error("Failed to load history", err)
    }
  }

  // ── Load messages when user clicks a sidebar chat ────────
  const loadChat = async (chatId) => {
    setCurrentChatId(chatId)
    try {
      const res = await axios.get(`${API}/chat/${chatId}/messages`, authHeader)
      setMessages(res.data)  // each message has { role, content }
    } catch (err) {
      console.error("Failed to load messages", err)
    }
  }

  // ── Start a fresh chat ───────────────────────────────────
  const startNewChat = () => {
    setCurrentChatId(null)
    setMessages([])
    setInput("")
  }

  // ── Send message ─────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { role: "user", content: input }

    // Optimistically add user message to screen
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const res = await axios.post(
        `${API}/chat/send`,
        { message: input, language, chatId: currentChatId },
        authHeader
      )

      const aiMessage = { role: "assistant", content: res.data.reply }
      setMessages((prev) => [...prev, aiMessage])

      // If this was a new chat, save the returned chatId and refresh sidebar
      if (!currentChatId) {
        setCurrentChatId(res.data.chatId)
        fetchChatHistory()  // refresh sidebar to show new chat
      }

    } catch (err) {
      console.error("Send failed", err)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Error: Could not get a response." }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Send on Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Logout ───────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/")
  }

  // ── Theme classes ─────────────────────────────────────────
  const theme = {
    bg:         darkMode ? "bg-black text-white"       : "bg-gray-100 text-gray-900",
    sidebar:    darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200",
    header:     darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200",
    input:      darkMode ? "bg-zinc-800 text-white"    : "bg-white text-gray-900 border border-gray-300",
    sidebarBtn: darkMode ? "hover:bg-zinc-700 text-zinc-300" : "hover:bg-gray-100 text-gray-700",
    aiMsg:      darkMode ? "bg-zinc-800"               : "bg-white border border-gray-200",
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className={`h-screen flex ${theme.bg}`}>

      {/* ── Sidebar ── */}
      <div className={`w-72 flex flex-col border-r ${theme.sidebar} shrink-0`}>

        {/* App title + new chat */}
        <div className="p-4 border-b border-inherit">
          <h1 className="text-xl font-bold mb-3">🤖 AI Chat</h1>
          <button
            onClick={startNewChat}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg text-sm font-medium"
          >
            + New Chat
          </button>
        </div>

        {/* Chat history list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chatHistory.length === 0 && (
            <p className="text-xs text-zinc-500 text-center mt-4">No chats yet</p>
          )}
          {chatHistory.map((chat) => (
            <button
              key={chat._id}
              onClick={() => loadChat(chat._id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate ${theme.sidebarBtn} ${
                currentChatId === chat._id ? "bg-blue-600 text-white" : ""
              }`}
            >
              {chat.title || "New Chat"}
            </button>
          ))}
        </div>

        {/* Logout button at bottom of sidebar */}
        <div className="p-3 border-t border-inherit">
          <button
            onClick={handleLogout}
            className="w-full text-sm text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/20"
          >
            🚪 Logout
          </button>
        </div>

      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-3 border-b ${theme.header}`}>
          <h2 className="text-lg font-semibold">Multilingual AI Assistant</h2>

          <div className="flex items-center gap-3">
            {/* Language picker */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`text-sm p-2 rounded-lg ${theme.input}`}
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Kannada</option>
            </select>

            {/* Theme toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-xl"
              title="Toggle theme"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

          {messages.length === 0 && !isLoading && (
            <div className="text-center text-zinc-500 mt-20 text-sm">
              Start a conversation in any language 🌍
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-3 rounded-2xl max-w-[70%] text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : theme.aiMsg
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading spinner */}
          {isLoading && (
            <div className="flex justify-start">
              <div className={`px-4 py-3 rounded-2xl ${theme.aiMsg}`}>
                <div className="flex gap-1 items-center h-4">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                </div>
              </div>
            </div>
          )}

          {/* Invisible div at bottom — scroll target */}
          <div ref={bottomRef} />

        </div>

        {/* Input bar */}
        <div className={`px-4 py-3 border-t ${theme.header} flex gap-3`}>
          <input
            type="text"
            placeholder="Type your message... (Enter to send)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 rounded-xl text-sm outline-none ${theme.input}`}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-6 rounded-xl text-sm font-medium"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>

      </div>

    </div>
  )
}

export default ChatPage