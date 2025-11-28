'use client'

import { useState, useEffect } from 'react'
import { createUser, updateUser } from '@/actions/users'

type User = {
    id: number
    name: string | null
    email: string
}

type UserFormProps = {
    editingUser: User | null
    onSuccess: () => void
    onCancel: () => void
}

export default function UserForm({ editingUser, onSuccess, onCancel }: UserFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (editingUser) {
            setFormData({
                name: editingUser.name || '',
                email: editingUser.email,
            })
        } else {
            setFormData({
                name: '',
                email: '',
            })
        }
    }, [editingUser])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formDataObj = new FormData()
            formDataObj.append('email', formData.email)
            formDataObj.append('name', formData.name)

            let result
            if (editingUser) {
                result = await updateUser(editingUser.id, formDataObj)
            } else {
                result = await createUser(formDataObj)
            }

            if (result.success) {
                onSuccess()
                if (!editingUser) {
                    setFormData({ name: '', email: '' })
                }
            } else {
                alert(result.error || 'Failed to save user')
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save user')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Email *
                </label>
                <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    placeholder="user@example.com"
                />
            </div>

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Name
                </label>
                <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    placeholder="John Doe"
                />
            </div>

            <div className="flex gap-2 pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
                {editingUser && (
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
