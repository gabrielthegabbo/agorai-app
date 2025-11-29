# Type System Workflow

## Overview
This project uses **Prisma-generated types** instead of manually maintained TypeScript types. This ensures your types automatically stay in sync with your database schema.

## How It Works

### 1. Database Schema (Source of Truth)
All types originate from `prisma/schema.prisma`:
```prisma
model User {
  id    String  @id @default(uuid())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        String  @id @default(uuid())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  String
}
```

### 2. Type Definitions in `src/types/`
Instead of manually writing types, we use `Prisma.ModelGetPayload` to automatically generate them:

**`src/types/post.ts`:**
```typescript
import type { Prisma } from '@prisma/client'

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
```

**`src/types/user.ts`:**
```typescript
import type { Prisma } from '@prisma/client'

export type User = Prisma.UserGetPayload<{
    include: { posts: true }
}>

export type UserBasic = {
    id: string
    name: string | null
    email: string
}
```

### 3. Workflow for Schema Updates

When you need to update the database schema:

1. **Update the Prisma schema:**
   ```bash
   # Edit prisma/schema.prisma
   ```

2. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```
   This regenerates the Prisma client and all its TypeScript types.

3. **Push changes to database:**
   ```bash
   npx prisma db push
   ```

4. **Types automatically update!**
   All types in `src/types/` that use `Prisma.ModelGetPayload` will automatically reflect your schema changes.

## Benefits

✅ **Single source of truth** - Schema is the only place you define your data structure  
✅ **No type drift** - Types can't get out of sync with your database  
✅ **Automatic updates** - Running `prisma generate` updates all types  
✅ **IntelliSense support** - Full TypeScript autocompletion based on your actual schema  
✅ **Type safety** - Prisma ensures your queries match your schema exactly

## Example: Adding a New Field

Let's say you want to add a `createdAt` field to the Post model:

1. Update `prisma/schema.prisma`:
   ```prisma
   model Post {
     id        String   @id @default(uuid())
     title     String
     content   String?
     published Boolean  @default(false)
     createdAt DateTime @default(now())  // NEW FIELD
     author    User     @relation(fields: [authorId], references: [id])
     authorId  String
   }
   ```

2. Run:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. The `Post` type in `src/types/post.ts` automatically includes `createdAt: Date` - no manual updates needed!

## Type Variants

You can create different variants of the same model:

```typescript
// With all relations
export type Post = Prisma.PostGetPayload<{
    include: { author: true }
}>

// Without relations (lighter)
export type PostWithoutRelations = Prisma.PostGetPayload<{}>

// With specific fields only
export type PostPreview = Prisma.PostGetPayload<{
    select: {
        id: true
        title: true
        createdAt: true
    }
}>
```
