import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// Initiate Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/?error=auth_failed`, session: false }),
  (req, res) => {
    // Generate JWT
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
    // Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}/login/success?token=${token}`)
  }
)

// Get current user (JWT protected)
router.get('/me', authenticate, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
    },
  })
})

// Logout
router.post('/logout', (req, res) => {
  req.logout?.(() => {})
  res.json({ message: 'Logged out' })
})

// Diagnostic route
router.get('/verify-config', (req, res) => {
  res.json({
    callback_url: process.env.GOOGLE_CALLBACK_URL,
    frontend_url: process.env.FRONTEND_URL,
    node_env: process.env.NODE_ENV
  })
})

export default router
