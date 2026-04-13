import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import authRouter from './routes/auth.js'
import reviewRouter from './routes/review.js'
import userRouter from './routes/user.js'
import githubRouter from './routes/github.js'

const app = express()
app.set('trust proxy', 1)
const PORT = process.env.PORT || 5000

// Security
app.use(helmet({ contentSecurityPolicy: false }))

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})
const reviewLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 10,
  message: { error: 'Too many review requests. Please wait a minute.' },
})

app.use(limiter)

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// Body parsing
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// Routes
app.use('/auth', authRouter)
app.use('/api/review', reviewLimiter, reviewRouter)
app.use('/api/user', userRouter)
app.use('/api/github', githubRouter)

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message, err.stack)
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  })
})

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 CR42 server running on http://localhost:${PORT}`)
  })
}

export default app
