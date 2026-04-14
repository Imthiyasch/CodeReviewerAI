import express from 'express'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

const ADMIN_EMAILS = [
  'imthiranu@gmail.com',
  'goatbotcrowx@gmail.com',
  'knowledgetest013@gmail.com',
  'noorirafi.nr@gmail.com'
].map(e => e.toLowerCase())

const requireAdmin = (req, res, next) => {
  const userEmail = req.user?.email?.toLowerCase()
  const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail)
  console.log(`[ADMIN ACCESS] Attempt by: ${userEmail}, Allowed: ${isAdmin}`)
  if (!isAdmin) {
    return res.status(403).json({ error: 'Access forbidden: Admin only' })
  }
  next()
}

// GET /api/admin/stats
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const [totalUsers, totalReviews, failedReviews, recentReviews, allUsers] = await Promise.all([
      prisma.user.count(),
      prisma.review.count(),
      prisma.review.count({ where: { status: 'failed' } }),
      prisma.review.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, avatar: true, email: true } }
        }
      }),
      prisma.user.findMany({
        select: { id: true, name: true, email: true, avatar: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
      })
    ])

    res.json({
      totalUsers,
      totalReviews,
      failedReviews,
      completedReviews: totalReviews - failedReviews,
      recentReviews,
      allUsers,
    })
  } catch (err) {
    console.error('[ADMIN STATS ERROR]', err)
    res.status(500).json({ error: 'Failed to fetch admin stats' })
  }
})

// DELETE /api/admin/review/:id
router.delete('/review/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.review.delete({ where: { id: req.params.id } })
    res.json({ message: 'Review deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' })
  }
})

export default router
