'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Get all users
export async function getUsers() {
    try {
        const users = await prisma.user.findMany({
            include: {
                posts: true,
            },
            orderBy: {
                id: 'desc',
            },
        })
        return { success: true, data: users }
    } catch (error) {
        console.error('Error fetching users:', error)
        return { success: false, error: 'Failed to fetch users' }
    }
}

// Get a single user
export async function getUser(id: number) {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                posts: true,
            },
        })

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        return { success: true, data: user }
    } catch (error) {
        console.error('Error fetching user:', error)
        return { success: false, error: 'Failed to fetch user' }
    }
}

// Create a new user
export async function createUser(formData: FormData) {
    try {
        const email = formData.get('email') as string
        const name = formData.get('name') as string

        if (!email) {
            return { success: false, error: 'Email is required' }
        }

        const user = await prisma.user.create({
            data: {
                email,
                name: name || null,
            },
            include: {
                posts: true,
            },
        })

        revalidatePath('/crud')
        return { success: true, data: user }
    } catch (error) {
        console.error('Error creating user:', error)
        return { success: false, error: 'Failed to create user' }
    }
}

// Update a user
export async function updateUser(id: number, formData: FormData) {
    try {
        const email = formData.get('email') as string
        const name = formData.get('name') as string

        const user = await prisma.user.update({
            where: { id },
            data: {
                ...(email && { email }),
                ...(name !== undefined && { name }),
            },
            include: {
                posts: true,
            },
        })

        revalidatePath('/crud')
        return { success: true, data: user }
    } catch (error) {
        console.error('Error updating user:', error)
        return { success: false, error: 'Failed to update user' }
    }
}

// Delete a user
export async function deleteUser(id: number) {
    try {
        // First delete all posts by this user
        await prisma.post.deleteMany({
            where: { authorId: id },
        })

        // Then delete the user
        await prisma.user.delete({
            where: { id },
        })

        revalidatePath('/crud')
        return { success: true, message: 'User deleted' }
    } catch (error) {
        console.error('Error deleting user:', error)
        return { success: false, error: 'Failed to delete user' }
    }
}
