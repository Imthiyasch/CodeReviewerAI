import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

console.log('Pool type:', typeof Pool)
console.log('PrismaNeon type:', typeof PrismaNeon)
console.log('neonConfig type:', typeof neonConfig)

neonConfig.webSocketConstructor = ws
const pool = new Pool({ connectionString: 'postgresql://test' })
const adapter = new PrismaNeon(pool)
console.log('Adapter created OK:', typeof adapter)
