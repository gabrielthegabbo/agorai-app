import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
    // Clean existing data (optional - be careful in production!)
    await prisma.post.deleteMany()
    await prisma.user.deleteMany()

    console.log('Seeding database...')

    // Create users with posts
    const user1 = await prisma.user.create({
        data: {
            email: 'alice@example.com',
            name: 'Alice Johnson',
            posts: {
                create: [
                    {
                        title: 'Getting Started with Prisma',
                        content: 'Prisma is an amazing ORM for Node.js and TypeScript...',
                        published: true,
                    },
                    {
                        title: 'My Draft Post',
                        content: 'This is a work in progress...',
                        published: false,
                    },
                ],
            },
        },
    })

    const user2 = await prisma.user.create({
        data: {
            email: 'bob@example.com',
            name: 'Bob Smith',
            posts: {
                create: [
                    {
                        title: 'Next.js Best Practices',
                        content: 'Here are some tips for building great Next.js apps...',
                        published: true,
                    },
                ],
            },
        },
    })

    const user3 = await prisma.user.create({
        data: {
            email: 'charlie@example.com',
            name: 'Charlie Brown',
        },
    })

    console.log('✅ Seed completed!')
    console.log({ user1, user2, user3 })
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })