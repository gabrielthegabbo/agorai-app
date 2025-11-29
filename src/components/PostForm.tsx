'use client'

import { useState, useEffect } from 'react'
import { createPost, updatePost } from '@/actions/posts'
import { getUsers } from '@/actions/users'
import { Post } from '@/types/post'
import { UserBasic } from '@/types/user'

type PostFormProps = {
    editingPost: Post | null
    onSuccess: () => void
    onCancel: () => void
}

export default function PostForm({ editingPost, onSuccess, onCancel }: PostFormProps) {
    const [users, setUsers] = useState<UserBasic[]>([])
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        published: false,
        authorId: '',
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Fetch users for the dropdown
        getUsers().then((result) => {
            if (result.success && result.data) {
                setUsers(result.data)
            }
        }).catch((err) => console.error('Failed to fetch users:', err))
    }, [])

    useEffect(() => {
        if (editingPost) {
            setFormData({
                title: editingPost.title,
                content: editingPost.content || '',
                published: editingPost.published,
                authorId: editingPost.authorId,
            })
        } else {
            setFormData({
                title: '',
                content: '',
                published: false,
                authorId: '',
            })
        }
    }, [editingPost])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formDataObj = new FormData()
            formDataObj.append('title', formData.title)
            formDataObj.append('content', formData.content)
            formDataObj.append('published', formData.published.toString())
            formDataObj.append('authorId', formData.authorId)

            let result
            if (editingPost) {
                result = await updatePost(editingPost.id, formDataObj)
            } else {
                result = await createPost(formDataObj)
            }

            if (result.success) {
                onSuccess()
                if (!editingPost) {
                    setFormData({ title: '', content: '', published: false, authorId: '' })
                }
            } else {
                alert(result.error || 'Failed to save post')
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save post')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Title *
                </label>
                <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    placeholder="Enter post title"
                />
            </div>

            <div>
                <label htmlFor="content" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Content
                </label>
                <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    placeholder="Enter post content"
                />
            </div>

            {!editingPost && (
                <div>
                    <label htmlFor="authorId" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Author *
                    </label>
                    <select
                        id="authorId"
                        value={formData.authorId}
                        onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                        required
                        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                        <option value="">Select an author</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name || user.email}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-zinc-600"
                />
                <label htmlFor="published" className="ml-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Published
                </label>
            </div>

            <div className="flex gap-2 pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post'}
                </button>
                {editingPost && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg bg-zinc-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    )
}
