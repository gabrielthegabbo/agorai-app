# Quick Reference: Updating Database Schema

## Step-by-Step Guide

### When You Want to Add/Modify Database Tables

1. **Edit Schema**
   ```bash
   # Edit prisma/schema.prisma
   # Make your changes to models, fields, etc.
   ```

2. **Regenerate Prisma Client** (Updates TypeScript types)
   ```bash
   npx prisma generate
   ```

3. **Push to Database**
   ```bash
   npx prisma db push
   ```

That's it! Your types in `src/types/` automatically update! ✨

---

## Common Tasks

### Adding a New Field
```prisma
model Post {
  id        String   @id @default(uuid())
  title     String
  content   String?
  published Boolean  @default(false)
  createdAt DateTime @default(now())  // ← NEW FIELD
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
}
```

Then run:
```bash
npx prisma generate && npx prisma db push
```

### Adding a New Model
```prisma
model Comment {
  id        String   @id @default(uuid())
  text      String
  postId    String
  post      Post     @relation(fields: [postId], references: [id])
  createdAt DateTime @default(now())
}
```

Create type file `src/types/comment.ts`:
```typescript
import type { Prisma } from '@prisma/client'

export type Comment = Prisma.CommentGetPayload<{
    include: { post: true }
}>
```

Then run:
```bash
npx prisma generate && npx prisma db push
```

---

## Important Notes

⚠️ **Always run `npx prisma generate` after schema changes**  
⚠️ **Types in `src/types/` should use `Prisma.ModelGetPayload`**  
⚠️ **Never manually define types that match your schema**  
✅ **Schema is the single source of truth**

---

## Troubleshooting

**Problem:** Types not updating after schema change  
**Solution:** Make sure you ran `npx prisma generate`

**Problem:** Type errors after running generate  
**Solution:** Restart your TypeScript server or dev server

**Problem:** Database not updating  
**Solution:** Run `npx prisma db push` after `npx prisma generate`
