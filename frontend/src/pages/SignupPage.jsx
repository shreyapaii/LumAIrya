import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { registerUser } from "../services/authService"

function SignupPage() {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {

      await registerUser(formData)

      alert("Account created successfully")

      navigate("/")

    } catch (error) {

      console.log(error)

      alert("Signup failed")

    }
  }

  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="bg-zinc-900 p-8 rounded-2xl w-[350px]">

        <h1 className="text-white text-3xl font-bold text-center mb-6">
          Sign Up
        </h1>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            className="w-full p-3 mb-4 rounded-lg bg-zinc-800 text-white outline-none"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-3 mb-4 rounded-lg bg-zinc-800 text-white outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full p-3 mb-6 rounded-lg bg-zinc-800 text-white outline-none"
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg"
          >
            Create Account
          </button>

        </form>

        <p className="text-zinc-400 text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-green-500">
            Login
          </Link>
        </p>

      </div>
    </div>
  )
}

export default SignupPage