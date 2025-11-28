# Prisma Setup Guide

This document outlines how Prisma was configured in this Next.js project with PostgreSQL using Supabase.

## 📋 Prerequisites

- Node.js installed
- A Supabase project with PostgreSQL database
- Database connection string (DATABASE_URL)

## 🔧 Installation

### 1. Install Dependencies

```bash
npm install @prisma/client @prisma/adapter-pg pg prisma dotenv
npm install -D @types/pg tsx ts-node typescript
```

**Key packages:**
- `@prisma/client` - Prisma Client for database queries
- `@prisma/adapter-pg` - PostgreSQL adapter for Prisma
- `pg` - Node.js PostgreSQL client
- `prisma` - Prisma CLI tool
- `dotenv` - Load environment variables from `.env` file
- `tsx` - TypeScript execution engine (for running seed scripts)
- `@types/pg` - TypeScript types for `pg` package

### 2. Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:port/database"
```

> **Note:** When using Supabase with connection pooling:
> - `DATABASE_URL` - Use the pooled connection (with `?pgbouncer=true`)
> - `DIRECT_URL` - Direct connection for migrations

## 📝 Configuration Files

### 1. Prisma Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

// Example models
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

### 2. Prisma Config (`prisma.config.ts`)

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: `tsx prisma/seed.ts`,
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

### 3. Prisma Client Instance (`src/lib/prisma.ts`)

```typescript
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = 
  globalForPrisma.prisma ?? 
  new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

> **Why this pattern?**
> - Uses the PG adapter for better connection pooling with Supabase
> - Prevents multiple Prisma Client instances in development (hot reload)
> - Singleton pattern ensures one database connection pool

### 4. Seed Script (`prisma/seed.ts`)

```typescript
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
```

### 5. Package.json Scripts

Add the following script to `package.json`:

```json
{
  "scripts": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

## 🚀 Usage

### Generate Prisma Client

After creating or modifying the schema, generate the Prisma Client:

```bash
npx prisma generate
```

### Push Schema to Database

Push your schema changes to the database (for development):

```bash
npx prisma db push
```

### Run Migrations (Production)

For production, use migrations:

```bash
npx prisma migrate dev --name init
```

### Seed the Database

Run the seed script to populate the database with initial data:

```bash
npm run seed
```

## 📖 Using Prisma in Next.js

### In Server Components

```typescript
import { prisma } from '@/lib/prisma'

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    include: {
      posts: true,
    },
  })

  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  )
}
```

### In API Routes or Server Actions

```typescript
import { prisma } from '@/lib/prisma'

export async function createUser(formData: FormData) {
  'use server'
  
  const email = formData.get('email') as string
  const name = formData.get('name') as string

  const user = await prisma.user.create({
    data: { email, name },
  })

  return user
}
```

## 🔍 Common Commands

| Command | Description |
|---------|-------------|
| `npx prisma studio` | Open Prisma Studio (GUI for your database) |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma db push` | Push schema changes to database |
| `npx prisma migrate dev` | Create and apply a new migration |
| `npx prisma migrate reset` | Reset database and apply all migrations |
| `npm run seed` | Run the seed script |

## ⚠️ Important Notes

1. **Never commit `.env` file** - Add it to `.gitignore`
2. **Use connection pooling** - The PG adapter handles this automatically
3. **Singleton pattern** - The `globalForPrisma` pattern prevents hot reload issues in development
4. **Type safety** - Prisma generates TypeScript types automatically
5. **Seed script** - Always use `dotenv/config` to load environment variables

## 🐛 Troubleshooting

### Issue: "Cannot find module '@prisma/client'"

**Solution:** Run `npx prisma generate` to generate the Prisma Client

### Issue: "Environment variable not found: DATABASE_URL"

**Solution:** Ensure your `.env` file exists and contains `DATABASE_URL`

### Issue: Seed script fails with "Unknown file extension .ts"

**Solution:** Use `tsx` instead of `ts-node`:
```bash
npm install -D tsx
# Then run: npm run seed
```

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma with Next.js](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices)
- [Supabase with Prisma](https://supabase.com/docs/guides/integrations/prisma)
