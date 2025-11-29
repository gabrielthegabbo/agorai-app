import type { Prisma } from '@prisma/client'

// This type is automatically generated from your Prisma schema
// When you update the schema and run `npx prisma generate`, this type will update automatically
export type Post = Prisma.PostGetPayload<{
    include: {
        author: {
            select: {
                id: true
                name: true
                email: true
            }
        }
    }
}>

// You can also export the simpler Post type without relations if needed
export type PostWithoutRelations = Prisma.PostGetPayload<{}>
