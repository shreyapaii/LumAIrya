// frontend/src/pages/LoginPage.jsx
// Full-screen split hero layout with animated background paths + glassmorphism auth card
// Preserves all original auth logic: loginUser(), localStorage, navigate("/chat")

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, useAnimationFrame, AnimatePresence } from "framer-motion"
import { loginUser } from "../services/authService"

// ─── Animated SVG path component ────────────────────────────────────────────
// Draws a single flowing bezier path that drifts along its stroke
function FloatingPath({ d, duration, delay, opacity, strokeWidth = 0.5 }) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="white"
      strokeOpacity={opacity}
      strokeWidth={strokeWidth}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration, delay, ease: "easeInOut" }}
    />
  )
}

// ─── Background canvas: organic flowing paths ────────────────────────────────
function BackgroundPaths() {
  // A set of long organic bezier curves that sweep across the viewport
  const paths = [
    { d: "M -100 200 C 200 100, 400 300, 800 150 S 1200 50, 1600 200", dur: 3.5, del: 0,    op: 0.07 },
    { d: "M -100 400 C 150 300, 350 500, 750 350 S 1150 250, 1600 400", dur: 4,   del: 0.3,  op: 0.05 },
    { d: "M -100 600 C 200 500, 500 700, 900 550 S 1300 450, 1600 600", dur: 4.5, del: 0.6,  op: 0.06 },
    { d: "M 0 100 C 300 0, 600 200, 1000 80 S 1400 -20, 1600 100",      dur: 3.8, del: 0.9,  op: 0.04 },
    { d: "M 0 750 C 250 650, 600 850, 1000 700 S 1400 600, 1600 750",   dur: 5,   del: 1.2,  op: 0.05 },
    { d: "M 100 300 C 400 180, 700 420, 1100 280 S 1500 160, 1700 300", dur: 4.2, del: 0.4,  op: 0.04 },
    { d: "M -200 500 C 100 380, 500 600, 900 460 S 1300 360, 1700 500", dur: 5.5, del: 1.5,  op: 0.03 },
    { d: "M 0 850 C 350 750, 750 950, 1150 800 S 1550 700, 1800 850",   dur: 4.8, del: 0.8,  op: 0.04 },
    // Diagonal sweeps
    { d: "M -100 900 C 300 600, 700 800, 1100 400 S 1400 200, 1700 100", dur: 6, del: 2, op: 0.035 },
    { d: "M 1700 0 C 1400 300, 1000 100, 600 500 S 200 700, -100 900",   dur: 6, del: 2.5, op: 0.03 },
    // Fine thin lines
    { d: "M -100 250 C 300 150, 700 350, 1100 200 S 1500 100, 1700 250", dur: 7, del: 1, op: 0.025, sw: 0.3 },
    { d: "M -100 650 C 200 550, 600 750, 1000 600 S 1400 500, 1700 650", dur: 7, del: 1.4, op: 0.025, sw: 0.3 },
  ]

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      style={{ pointerEvents: "none" }}
    >
      <defs>
        <radialGradient id="leftGlow" cx="20%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rightGlow" cx="80%" cy="50%" r="45%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#leftGlow)" />
      <rect width="1600" height="900" fill="url(#rightGlow)" />
      {paths.map((p, i) => (
        <FloatingPath
          key={i}
          d={p.d}
          duration={p.dur}
          delay={p.del}
          opacity={p.op}
          strokeWidth={p.sw || 0.5}
        />
      ))}
    </svg>
  )
}

// ─── Floating label that gently bobs ────────────────────────────────────────
function FloatItem({ children, delay = 0, y = 8 }) {
  return (
    <motion.div
      animate={{ y: [0, -y, 0] }}
      transition={{ duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  )
}

// ─── Single styled input ─────────────────────────────────────────────────────
function AuthInput({ type, name, placeholder, onChange, autoComplete }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      onChange={onChange}
      autoComplete={autoComplete}
      required
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        display: "block",
        width: "100%",
        padding: "11px 16px",
        borderRadius: "10px",
        background: "rgba(255,255,255,0.05)",
        border: `1px solid ${focused ? "rgba(99,102,241,0.7)" : "rgba(255,255,255,0.1)"}`,
        color: "#f4f4f5",
        fontSize: "14px",
        outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
        fontFamily: "inherit",
      }}
    />
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)
  const [tab, setTab]           = useState("login") // "login" | "signup"
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" })
  const getGreeting = () => {
  const hour = new Date().getHours()

  if (hour < 12) {
    return "Good morning ✨"
  }

  if (hour < 18) {
    return "Good afternoon 🌤️"
  }

  if (hour < 22) {
    return "Good evening 🌙"
  }

  return "Late night thoughts again? 🌌"
}

const greeting = getGreeting()
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSignupChange = (e) =>
    setSignupData({ ...signupData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const data = await loginUser(formData)
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user || {}))
      navigate("/chat")
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  // For signup, import registerUser if your authService has it
  // We keep it behind a dynamic import so this file stays self-contained
  const handleSignup = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { registerUser } = await import("../services/authService")
      await registerUser(signupData)
      setTab("login")
      setError("")
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#080808",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* ── Full-viewport animated background ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <BackgroundPaths />
      </div>

      {/* ── Vignette overlay ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 70% at 20% 50%, transparent 40%, rgba(8,8,8,0.7) 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* ── Split layout wrapper ── */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          width: "100%",
          minHeight: "100vh",
          alignItems: "stretch",
        }}
      >

        {/* ══════════════════════════════════════
            LEFT SIDE — Hero / Brand
        ══════════════════════════════════════ */}
        <div
          style={{
            flex: "1 1 0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "80px 64px",
            maxWidth: "56%",
          }}
        >
          {/* Top badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ marginBottom: "48px" }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "99px",
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.25)",
                color: "#a5b4fc",
                fontSize: "12px",
                fontWeight: 500,
                letterSpacing: "0.04em",
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#6366f1",
                boxShadow: "0 0 8px #6366f1",
                display: "inline-block",
              }} />
              NOW IN PUBLIC BETA
            </div>
          </motion.div>

          {/* Giant headline */}
          <FloatItem delay={0} y={6}>
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
            >
              <h1
                style={{
                  fontSize: "clamp(52px, 6vw, 88px)",
                  fontWeight: 700,
                  lineHeight: 1.04,
                  letterSpacing: "-0.03em",
                  margin: 0,
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "#f4f4f5" }}>Think in</span>
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #a5b4fc 0%, #6366f1 45%, #818cf8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                   AIris.
                </span>
              </h1>
            </motion.div>
          </FloatItem>
      <motion.p
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.7, delay: 0.35 }}
  style={{
    color: "#a1a1aa",
    fontSize: "14px",
    marginTop: "18px",
    marginBottom: "-10px",
    fontWeight: 500,
    letterSpacing: "0.01em",
  }}
>
  {greeting}
</motion.p>
          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 1, 0.5, 1] }}
            style={{
              marginTop: "28px",
              fontSize: "clamp(15px, 1.4vw, 18px)",
              color: "#71717a",
              lineHeight: 1.65,
              maxWidth: "440px",
              fontWeight: 400,
            }}
          >
            A multilingual AI assistant that understands context across
            English, Hindi, and Kannada — with memory that persists.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            style={{
              marginTop: "44px",
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            {["Groq-powered", "Multilingual", "Persistent memory", "JWT secured"].map((label) => (
              <span
                key={label}
                style={{
                  padding: "5px 13px",
                  borderRadius: "6px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#a1a1aa",
                  fontSize: "12.5px",
                  fontWeight: 500,
                }}
              >
                {label}
              </span>
            ))}
          </motion.div>

          {/* Floating stat cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{ display: "flex", gap: "16px", marginTop: "56px" }}
          >
            {[
              { num: "3",      label: "Languages" },
              { num: "< 1s",   label: "Response time" },
              { num: "∞",      label: "Chat history" },
            ].map(({ num, label }, i) => (
              <FloatItem key={label} delay={i * 0.8} y={5}>
                <div
                  style={{
                    padding: "16px 20px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    backdropFilter: "blur(8px)",
                    minWidth: "90px",
                  }}
                >
                  <div style={{ fontSize: "22px", fontWeight: 600, color: "#f4f4f5", lineHeight: 1 }}>
                    {num}
                  </div>
                  <div style={{ fontSize: "11px", color: "#52525b", marginTop: "6px", fontWeight: 500, letterSpacing: "0.03em" }}>
                    {label.toUpperCase()}
                  </div>
                </div>
              </FloatItem>
            ))}
          </motion.div>
        </div>

        {/* ══════════════════════════════════════
            RIGHT SIDE — Auth card
        ══════════════════════════════════════ */}
        <div
          style={{
            flex: "0 0 auto",
            width: "clamp(340px, 38%, 480px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 48px 48px 24px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: 32, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
            style={{ width: "100%", maxWidth: "400px" }}
          >
            {/* Glass card */}
            <div
              style={{
                borderRadius: "20px",
                padding: "36px",
                background: "rgba(13,13,13,0.75)",
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              {/* Logo mark */}
              <div style={{ marginBottom: "28px" }}>
                <div
                  style={{
                    width: "36px", height: "36px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #6366f1, #818cf8)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: 700, color: "white",
                    marginBottom: "20px",
                    boxShadow: "0 0 20px rgba(99,102,241,0.4)",
                  }}
                >
                  AI
                </div>

                {/* Tab switcher */}
                <div
                  style={{
                    display: "flex",
                    gap: "2px",
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "10px",
                    padding: "3px",
                    border: "1px solid rgba(255,255,255,0.07)",
                    marginBottom: "28px",
                  }}
                >
                  {["login", "signup"].map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTab(t); setError("") }}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 500,
                        fontFamily: "inherit",
                        transition: "all 0.18s",
                        background: tab === t ? "rgba(99,102,241,0.2)" : "transparent",
                        color: tab === t ? "#a5b4fc" : "#52525b",
                        boxShadow: tab === t ? "0 0 0 1px rgba(99,102,241,0.3)" : "none",
                      }}
                    >
                      {t === "login" ? "Sign in" : "Create account"}
                    </button>
                  ))}
                </div>

                <div>
                  <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: "#f4f4f5" }}>
                    {tab === "login" ? "Welcome back" : "Get started"}
                  </h2>
                  <p style={{ margin: "6px 0 0", fontSize: "13.5px", color: "#52525b" }}>
                    {tab === "login"
                      ? "Sign in to your workspace"
                      : "Create your free account"}
                  </p>
                </div>
              </div>

              {/* ── Login form ── */}
              <AnimatePresence mode="wait">
                {tab === "login" && (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSubmit}
                    style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                  >
                    <div>
                      <label style={labelStyle}>Email address</label>
                      <AuthInput
                        type="email" name="email"
                        placeholder="you@example.com"
                        onChange={handleChange}
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Password</label>
                      <AuthInput
                        type="password" name="password"
                        placeholder="••••••••"
                        onChange={handleChange}
                        autoComplete="current-password"
                      />
                    </div>

                    <ErrorBanner error={error} />

                    <SubmitButton loading={loading} label="Sign in" />
                  </motion.form>
                )}

                {/* ── Signup form ── */}
                {tab === "signup" && (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSignup}
                    style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                  >
                    <div>
                      <label style={labelStyle}>Full name</label>
                      <AuthInput
                        type="text" name="name"
                        placeholder="Your name"
                        onChange={handleSignupChange}
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Email address</label>
                      <AuthInput
                        type="email" name="email"
                        placeholder="you@example.com"
                        onChange={handleSignupChange}
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Password</label>
                      <AuthInput
                        type="password" name="password"
                        placeholder="Min. 8 characters"
                        onChange={handleSignupChange}
                        autoComplete="new-password"
                      />
                    </div>

                    <ErrorBanner error={error} />

                    <SubmitButton loading={loading} label="Create account" />
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Footer */}
              <p
                style={{
                  marginTop: "24px",
                  fontSize: "11.5px",
                  textAlign: "center",
                  color: "#3f3f46",
                  lineHeight: 1.5,
                }}
              >
                By continuing you agree to our{" "}
                <span style={{ color: "#52525b", cursor: "pointer" }}>Terms</span>
                {" & "}
                <span style={{ color: "#52525b", cursor: "pointer" }}>Privacy Policy</span>
              </p>
            </div>

            {/* Below-card note */}
            <p style={{
              textAlign: "center", marginTop: "20px",
              fontSize: "12px", color: "#27272a",
            }}>
              Multilingual AI Chat Interface · React + Groq
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Responsive: collapse left on small screens ── */}
      <style>{`
        @media (max-width: 768px) {
          .hero-left  { display: none !important; }
          .hero-right { width: 100% !important; max-width: 100% !important; padding: 32px 20px !important; }
        }
      `}</style>
    </div>
  )
}

// ─── Shared micro-components ─────────────────────────────────────────────────
const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: 500,
  color: "#71717a",
  marginBottom: "6px",
  letterSpacing: "0.01em",
}

function ErrorBanner({ error }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            padding: "9px 12px",
            borderRadius: "8px",
            background: "rgba(239,68,68,0.07)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#fca5a5",
            fontSize: "12.5px",
          }}
        >
          {error}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function SubmitButton({ loading, label }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.015 }}
      whileTap={{ scale: loading ? 1 : 0.985 }}
      style={{
        width: "100%",
        padding: "11px",
        borderRadius: "10px",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        fontSize: "14px",
        fontWeight: 600,
        color: "white",
        background: loading
          ? "rgba(99,102,241,0.35)"
          : "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
        boxShadow: loading ? "none" : "0 0 24px rgba(99,102,241,0.35)",
        transition: "background 0.2s, box-shadow 0.2s",
        marginTop: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}
    >
      {loading ? <Spinner /> : label}
    </motion.button>
  )
}

function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      style={{
        width: 16, height: 16,
        borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.2)",
        borderTopColor: "white",
      }}
    />
  )
}