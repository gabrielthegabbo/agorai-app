import type { Prisma } from '@prisma/client'

// This type is automatically generated from your Prisma schema
// When you update the schema and run `npx prisma generate`, this type will update automatically
export type User = Prisma.UserGetPayload<{
    include: {
        posts: true
    }
}>

// User without posts relation
export type UserWithoutRelations = Prisma.UserGetPayload<{}>

// User with only basic info (for dropdown selections, etc.)
export type UserBasic = {
    id: string
    name: string | null
    email: string
}
