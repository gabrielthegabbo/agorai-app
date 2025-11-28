'use client'

import { useState, useEffect } from 'react'
import { getPosts, deletePost } from '@/actions/posts'
import { Post } from '@/types/post'

type PostListProps = {
    onEdit: (post: Post) => void
    refreshTrigger?: number
}

export default function PostList({ onEdit, refreshTrigger }: PostListProps) {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchPosts = async () => {
        try {
            setLoading(true)
            const result = await getPosts()

            if (result.success && result.data) {
                setPosts(result.data)
                setError(null)
            } else {
                setError(result.error || 'Failed to fetch posts')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [refreshTrigger])

    const handleDelete = async (id: number) => {
        console.log('Delete button clicked for post ID:', id)

        // Temporarily removed confirm dialog for debugging
        // if (!confirm('Are you sure you want to delete this post?')) return

        try {
            console.log('Calling deletePost action...')
            const result = await deletePost(id)
            console.log('Delete result:', result)

            if (result.success) {
                setPosts(posts.filter((post) => post.id !== id))
                console.log('Post removed from state')
            } else {
                alert(result.error || 'Failed to delete post')
            }
        } catch (err) {
            console.error('Delete error:', err)
            alert(err instanceof Error ? err.message : 'Failed to delete post')
        }
    }

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">Loading posts...</p>
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

    if (posts.length === 0) {
        return (
            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                No posts yet. Create your first post!
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <div
                    key={post.id}
                    className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                                    {post.title}
                                </h3>
                                <span
                                    className={`rounded px-2 py-1 text-xs font-medium ${post.published
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        }`}
                                >
                                    {post.published ? 'Published' : 'Draft'}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                                {post.content || 'No content'}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500">
                                By {post.author.name || post.author.email}
                            </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                            <button
                                onClick={() => onEdit(post)}
                                className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(post.id)}
                                className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
