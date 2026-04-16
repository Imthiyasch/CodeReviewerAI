
import prisma from './src/lib/prisma.js'

async function test() {
  console.log('Testing Database Connection...')
  try {
    const count = await prisma.user.count()
    console.log('SUCCESS!')
    console.log('Total users in DB:', count)
  } catch (err) {
    console.error('FAILED!')
    console.error('Error:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

test()
