import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { reviewCode } from '../services/aiService.js'
import { fetchGithubFile } from '../services/githubService.js'
import prisma from '../lib/prisma.js'

const router = express.Router()

// POST /api/review — create new review
router.post('/', authenticate, async (req, res) => {
  try {
    let { code, language = 'javascript', githubUrl } = req.body

    // Validate input
    if (!code && !githubUrl) {
      return res.status(400).json({ error: 'Provide either code or a githubUrl' })
    }

    // Fetch from GitHub if URL provided
    if (githubUrl) {
      const fetched = await fetchGithubFile(githubUrl)
      code = fetched.code
      language = fetched.language
    }

    if (!code?.trim()) {
      return res.status(400).json({ error: 'Code is empty' })
    }

    // Call AI
    const result = await reviewCode({ code, language })

    // Save to DB
    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        language,
        code: code.slice(0, 50000), // cap stored size
        githubUrl: githubUrl || null,
        result,
        status: 'completed',
      },
    })

    res.status(201).json({
      id: review.id,
      language: review.language,
      code: review.code,
      githubUrl: review.githubUrl,
      createdAt: review.createdAt,
      ...result,
    })
  } catch (err) {
    const isAdmin = ['imthiranu@gmail.com', 'goatbotcrowx@gmail.com', 'knowledgetest013@gmail.com', 'noorirafi.nr@gmail.com'].includes(req.user?.email)
    console.error('[REVIEW ERROR]', err.message)
    
    // Provide more specific error for admins
    const errorMsg = isAdmin ? `[Admin Debug] ${err.message}` : (err.message || 'Review failed')
    res.status(500).json({ error: errorMsg })
  }
})

// GET /api/review/history — paginated history
router.get('/history', authenticate, async (req, res) => {
  const { page = 1, limit = 10, search, language } = req.query
  const take = Math.min(parseInt(limit), 50)
  const skip = (parseInt(page) - 1) * take

  const where = {
    userId: req.user.id,
    ...(language && { language }),
    ...(search && {
      OR: [
        { code: { contains: search, mode: 'insensitive' } },
        { githubUrl: { contains: search, mode: 'insensitive' } },
      ],
    }),
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      select: {
        id: true,
        language: true,
        code: true,
        githubUrl: true,
        result: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.review.count({ where }),
  ])

  res.json({ reviews, total, page: parseInt(page), limit: take })
})

// GET /api/review/:id — single review
router.get('/:id', authenticate, async (req, res) => {
  const review = await prisma.review.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  })
  if (!review) return res.status(404).json({ error: 'Review not found' })

  res.json({
    id: review.id,
    language: review.language,
    code: review.code,
    githubUrl: review.githubUrl,
    createdAt: review.createdAt,
    ...(review.result || {}),
  })
})

// DELETE /api/review/:id
router.delete('/:id', authenticate, async (req, res) => {
  const review = await prisma.review.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  })
  if (!review) return res.status(404).json({ error: 'Review not found' })

  await prisma.review.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted successfully' })
})

export default router
