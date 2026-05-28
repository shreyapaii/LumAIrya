// frontend/src/pages/SignupPage.jsx

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react"
import { registerUser } from "../services/authService"

export default function SignupPage() {
  const [form, setForm]       = useState({ name: "", email: "", password: "" })
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)
  const navigate              = useNavigate()

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await registerUser(form)
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: "name",     icon: User,  type: "text",     placeholder: "Your name",        label: "Full name",       autoComplete: "name" },
    { name: "email",    icon: Mail,  type: "email",    placeholder: "you@example.com",  label: "Email address",   autoComplete: "email" },
    { name: "password", icon: Lock,  type: "password", placeholder: "Min. 8 characters",label: "Password",        autoComplete: "new-password" },
  ]

  return (
    <div className="noise min-h-screen flex items-center justify-center relative overflow-hidden"
         style={{ background: "var(--bg-base)" }}>

      {/* Ambient glows */}
      <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15 blur-[120px]"
           style={{ background: "var(--accent)" }} />
      <div className="absolute bottom-[-20%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]"
           style={{ background: "#38bdf8" }} />

      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.03]"
           style={{
             backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
             backgroundSize: "32px 32px",
           }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div className="rounded-2xl p-8 border"
             style={{
               background: "rgba(15,15,15,0.85)",
               backdropFilter: "blur(24px)",
               borderColor: "var(--border)",
               boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.5)",
             }}>

          {/* Logo mark */}
          <div className="mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                 style={{ background: "var(--accent)", boxShadow: "0 0 24px var(--accent-glow)" }}>
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <h1 className="text-xl font-semibold text-white mb-1">Create account</h1>
            <p className="text-sm" style={{ color: "#71717a" }}>
              Start chatting in any language
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {fields.map(({ name, icon: Icon, type, placeholder, label, autoComplete }) => (
              <div key={name} className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "#a1a1aa" }}>
                  {label}
                </label>
                <div className="relative">
                  <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: "#52525b" }} />
                  <input
                    type={type}
                    name={name}
                    required
                    autoComplete={autoComplete}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all duration-200"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: "#e4e4e7",
                    }}
                    onFocus={e => e.target.style.borderColor = "var(--accent)"}
                    onBlur={e  => e.target.style.borderColor = "var(--border)"}
                  />
                </div>
              </div>
            ))}

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{ color: "#f87171", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)" }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white"
              style={{
                background: loading ? "rgba(99,102,241,0.5)" : "var(--accent)",
                boxShadow: loading ? "none" : "0 0 20px var(--accent-glow)",
              }}
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>Create account <ArrowRight size={14} /></>
              )}
            </motion.button>

          </form>

          <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-xs text-center" style={{ color: "#52525b" }}>
              Already have an account?{" "}
              <Link to="/"
                    className="font-medium transition-colors duration-200"
                    style={{ color: "#a5b4fc" }}
                    onMouseEnter={e => e.target.style.color = "#fff"}
                    onMouseLeave={e => e.target.style.color = "#a5b4fc"}>
                Sign in
              </Link>
            </p>
          </div>

        </div>

        <p className="text-center mt-4 text-xs" style={{ color: "#27272a" }}>
          Multilingual AI Chat Interface
        </p>
      </motion.div>

    </div>
  )
}