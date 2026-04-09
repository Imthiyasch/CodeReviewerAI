import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { fetchGithubTree } from '../services/githubService.js'

const router = express.Router()

// GET /api/github/tree?url=...
router.get('/tree', authenticate, async (req, res) => {
  try {
    const { url } = req.query
    if (!url) {
      return res.status(400).json({ error: 'Repository URL is required' })
    }

    const files = await fetchGithubTree(url)
    res.json({ files })
  } catch (err) {
    console.error('[GITHUB TREE ERROR]', err.message)
    res.status(500).json({ error: err.message || 'Failed to fetch repository tree' })
  }
})

export default router
