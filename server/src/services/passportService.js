import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import prisma from '../lib/prisma.js'

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
      proxy: true,
      state: false,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        const avatar = profile.photos?.[0]?.value

        const user = await prisma.user.upsert({
          where: { googleId: profile.id },
          update: { name: profile.displayName, avatar, email },
          create: {
            googleId: profile.id,
            email: email || '',
            name: profile.displayName,
            avatar,
          },
        })

        return done(null, user)
      } catch (err) {
        return done(err, null)
      }
    }
  )
)

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})
