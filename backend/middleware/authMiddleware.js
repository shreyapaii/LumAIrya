const jwt = require("jsonwebtoken")
const User = require("../models/User")

// This middleware runs BEFORE any protected route handler.
// It reads the JWT from the Authorization header, verifies it,
// and attaches req.user so controllers know who is making the request.
//
// Usage: router.get("/protected", protect, myController)
const protect = async (req, res, next) => {
  let token

  // JWT is sent as: Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]

      // jwt.verify throws if the token is expired or tampered with
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Attach the user (without password) to the request object
      req.user = await User.findById(decoded.id).select("-password")

      next() // hand off to the actual route handler
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token invalid" })
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" })
  }
}

module.exports = { protect }