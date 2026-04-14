import express from 'express'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const CALLBACK_URL = process.env.NODE_ENV === 'production'
  ? 'https://code-reviewer-ai-opal.vercel.app/auth/google/callback'
  : 'http://localhost:5000/auth/google/callback'

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  CALLBACK_URL
)

// Step 1: Redirect user to Google
router.get('/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })
  res.redirect(authUrl)
})

// Step 2: Handle Google callback, exchange code for user info
router.get('/google/callback', async (req, res) => {
  try {
    const { code, error } = req.query

    if (error) {
      return res.redirect(`${FRONTEND_URL}/?error=auth_failed`)
    }

    if (!code) {
      return res.redirect(`${FRONTEND_URL}/?error=no_code`)
    }

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Get user profile from Google
    const userInfoResponse = await oauth2Client.request({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    })

    const profile = userInfoResponse.data
    const email = profile.email
    const avatar = profile.picture
    const googleId = String(profile.id)

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { googleId },
      update: { name: profile.name, avatar, email },
      create: {
        googleId,
        email: email || '',
        name: profile.name || 'User',
        avatar,
      },
    })

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    // Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}/login/success?token=${token}`)
  } catch (err) {
    console.error('[AUTH ERROR]', err.message)
    res.redirect(`${FRONTEND_URL}/?error=auth_failed`)
  }
})

// Get current user (JWT protected)
router.get('/me', authenticate, (req, res) => {
  const adminEmails = ['imthiranu@gmail.com', 'goatbotcrowx@gmail.com', 'knowledgetest013@gmail.com', 'noorirafi.nr@gmail.com'].map(e => e.toLowerCase())
  const userEmail = req.user.email?.toLowerCase()
  const isAdmin = userEmail && adminEmails.includes(userEmail)
  console.log(`[AUTH ME] User: ${userEmail}, IsAdmin: ${isAdmin}`)
  
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      isAdmin,
    },
  })
})

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out' })
})

// Diagnostic route
router.get('/verify-config', (req, res) => {
  res.json({
    callback_url: CALLBACK_URL,
    frontend_url: FRONTEND_URL,
    node_env: process.env.NODE_ENV,
  })
})

export default router
