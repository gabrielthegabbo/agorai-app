'use client'

import { useState, useEffect } from 'react'
import { getUsers, deleteUser } from '@/actions/users'

type User = {
    id: string
    name: string | null
    email: string
    posts: any[]
}

type UserListProps = {
    onEdit: (user: User) => void
    refreshTrigger?: number
}

export default function UserList({ onEdit, refreshTrigger }: UserListProps) {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const result = await getUsers()

            if (result.success && result.data) {
                setUsers(result.data)
                setError(null)
            } else {
                setError(result.error || 'Failed to fetch users')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [refreshTrigger])

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user? This will also delete all their posts.')) return

        try {
            const result = await deleteUser(id)

            if (result.success) {
                setUsers(users.filter((user) => user.id !== id))
            } else {
                alert(result.error || 'Failed to delete user')
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete user')
        }
    }

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">Loading users...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                <p className="text-red-800 dark:text-red-200">Error: {error}</p>
            </div>
        )
    }

    if (users.length === 0) {
        return (
            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                No users yet. Create your first user!
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {users.map((user) => (
                <div
                    key={user.id}
                    className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                {user.name || 'Unnamed User'}
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {user.posts.length} {user.posts.length === 1 ? 'post' : 'posts'}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(user)}
                            className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(user.id)}
                            className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
