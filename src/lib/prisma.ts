import { PrismaClient } from '@prisma/client'
import { withOptimize } from '@prisma/extension-optimize'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

function createPrismaClient() {
  const client = new PrismaClient({ adapter })
  
  if (process.env.OPTIMIZE_API_KEY) {
    return client.$extends(
      withOptimize({ apiKey: process.env.OPTIMIZE_API_KEY })
    )
  }

  return client
}

export const prisma = 
  globalForPrisma.prisma ?? 
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}