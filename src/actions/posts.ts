'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Get all posts
export async function getPosts() {
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })
        return { success: true, data: posts }
    } catch (error) {
        console.error('Error fetching posts:', error)
        return { success: false, error: 'Failed to fetch posts' }
    }
}

// Get a single post
export async function getPost(id: string) {
    try {
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })

        if (!post) {
            return { success: false, error: 'Post not found' }
        }

        return { success: true, data: post }
    } catch (error) {
        console.error('Error fetching post:', error)
        return { success: false, error: 'Failed to fetch post' }
    }
}

// Create a new post
export async function createPost(formData: FormData) {
    try {
        const title = formData.get('title') as string
        const content = formData.get('content') as string
        const published = formData.get('published') === 'true'
        const authorId = formData.get('authorId') as string

        if (!title || !authorId) {
            return { success: false, error: 'Title and author are required' }
        }

        const post = await prisma.post.create({
            data: {
                title,
                content: content || '',
                published,
                authorId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })

        revalidatePath('/crud')
        return { success: true, data: post }
    } catch (error) {
        console.error('Error creating post:', error)
        return { success: false, error: 'Failed to create post' }
    }
}

// Update a post
export async function updatePost(id: string, formData: FormData) {
    try {
        const title = formData.get('title') as string
        const content = formData.get('content') as string
        const published = formData.get('published') === 'true'

        const post = await prisma.post.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(content !== undefined && { content }),
                ...(published !== undefined && { published }),
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })

        revalidatePath('/crud')
        return { success: true, data: post }
    } catch (error) {
        console.error('Error updating post:', error)
        return { success: false, error: 'Failed to update post' }
    }
}

// Delete a post
export async function deletePost(id: string) {
    try {
        await prisma.post.delete({
            where: { id },
        })

        revalidatePath('/crud')
        return { success: true, message: 'Post deleted' }
    } catch (error) {
        console.error('Error deleting post:', error)
        return { success: false, error: 'Failed to delete post' }
    }
}
