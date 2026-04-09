import express from 'express'
import { authenticate } from '../middleware/auth.js'
import prisma from '../lib/prisma.js'

const router = express.Router()

// GET /api/user/stats — dashboard statistics
router.get('/stats', authenticate, async (req, res) => {
  const userId = req.user.id

  const [total, reviews] = await Promise.all([
    prisma.review.count({ where: { userId } }),
    prisma.review.findMany({
      where: { userId, status: 'completed' },
      select: { result: true },
    }),
  ])

  let totalScore = 0
  let bugsFound = 0
  let securityIssues = 0

  for (const r of reviews) {
    const result = r.result
    if (!result) continue
    totalScore += result.quality?.score || 0
    bugsFound += result.bugs?.length || 0
    securityIssues += result.security?.length || 0
  }

  const avgScore = reviews.length > 0 ? Math.round(totalScore / reviews.length) : 0

  res.json({ total, avgScore, bugsFound, securityIssues })
})

// GET /api/user/me — user profile
router.get('/me', authenticate, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar,
    createdAt: req.user.createdAt,
  })
})

export default router
