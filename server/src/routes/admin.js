import express from 'express'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Admin constraint middleware
const isAdmin = (req, res, next) => {
  if (req.user?.email !== 'imthiranu@gmail.com') {
    return res.status(403).json({ error: 'Access forbidden: Admin clearance required.' })
  }
  next()
}

router.get('/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count()
    const totalReviews = await prisma.review.count()
    const failedReviews = await prisma.review.count({ where: { status: 'failed' } })
    
    const recentReviews = await prisma.review.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, avatar: true, email: true } }
      }
    })

    res.json({
      totalUsers,
      totalReviews,
      failedReviews,
      recentReviews,
    })
  } catch (err) {
    console.error('[ADMIN STATS ERROR]', err)
    res.status(500).json({ error: 'Failed to fetch admin telemetrics' })
  }
})

export default router
