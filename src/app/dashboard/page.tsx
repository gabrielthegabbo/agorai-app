'use client'

import { useState } from 'react'
import PostList from '@/components/PostList'
import PostForm from '@/components/PostForm'
import UserList from '@/components/UserList'
import UserForm from '@/components/UserForm'
import { Post } from '@/types/post'

type Tab = 'posts' | 'users'

type User = {
    id: string
    name: string | null
    email: string
    posts: any[]
}

export default function CRUDPage() {
    const [activeTab, setActiveTab] = useState<Tab>('posts')
    const [editingPost, setEditingPost] = useState<Post | null>(null)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const handlePostSuccess = () => {
        setEditingPost(null)
        setRefreshTrigger((prev) => prev + 1)
    }

    const handleUserSuccess = () => {
        setEditingUser(null)
        setRefreshTrigger((prev) => prev + 1)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                        CRUD Demo
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Create, Read, Update, and Delete Posts and Users
                    </p>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-zinc-200 dark:border-zinc-700">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium transition-colors ${activeTab === 'posts'
                                ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                                : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300'
                                }`}
                        >
                            Posts
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium transition-colors ${activeTab === 'users'
                                ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                                : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300'
                                }`}
                        >
                            Users
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Form Section */}
                    <div className="lg:col-span-1">
                        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                                {activeTab === 'posts'
                                    ? editingPost
                                        ? 'Edit Post'
                                        : 'Create New Post'
                                    : editingUser
                                        ? 'Edit User'
                                        : 'Create New User'}
                            </h2>
                            {activeTab === 'posts' ? (
                                <PostForm
                                    editingPost={editingPost}
                                    onSuccess={handlePostSuccess}
                                    onCancel={() => setEditingPost(null)}
                                />
                            ) : (
                                <UserForm
                                    editingUser={editingUser}
                                    onSuccess={handleUserSuccess}
                                    onCancel={() => setEditingUser(null)}
                                />
                            )}
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="lg:col-span-2">
                        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                                {activeTab === 'posts' ? 'All Posts' : 'All Users'}
                            </h2>
                            {activeTab === 'posts' ? (
                                <PostList
                                    onEdit={setEditingPost}
                                    refreshTrigger={refreshTrigger}
                                />
                            ) : (
                                <UserList
                                    onEdit={setEditingUser}
                                    refreshTrigger={refreshTrigger}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                            ✅ Create
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Fill the form and submit to create new records
                        </p>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                            ✏️ Update
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Click "Edit" to modify existing records
                        </p>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                            🗑️ Delete
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Click "Delete" to remove records permanently
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
