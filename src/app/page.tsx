import { prisma } from "@/lib/prisma";

export default async function Home() {
  // Fetch all users with their posts
  const users = await prisma.user.findMany({
    include: {
      posts: true,
    },
  });

  // Fetch published posts count
  const publishedPostsCount = await prisma.post.count({
    where: { published: true },
  });

  return (
    <div className="min-h-screen bg-zinc-50 p-8 font-sans dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          Agorai Database Test Page
        </h1>

        <div className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
          <h2 className="mb-2 text-2xl font-semibold text-zinc-800 dark:text-zinc-200">
            Stats
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Total Users: <span className="font-bold text-zinc-900 dark:text-zinc-100">{users.length}</span>
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            Published Posts: <span className="font-bold text-zinc-900 dark:text-zinc-100">{publishedPostsCount}</span>
          </p>
        </div>

        <div className="space-y-6">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900"
            >
              <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {user.name}
              </h3>
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                {user.email}
              </p>

              {user.posts.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-zinc-800 dark:text-zinc-200">
                    Posts ({user.posts.length}):
                  </h4>
                  {user.posts.map((post) => (
                    <div
                      key={post.id}
                      className="rounded border border-zinc-200 p-3 dark:border-zinc-700"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <h5 className="font-medium text-zinc-900 dark:text-zinc-100">
                          {post.title}
                        </h5>
                        <span
                          className={`rounded px-2 py-1 text-xs ${post.published
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                        >
                          {post.published ? "Published" : "Draft"}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {post.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-zinc-500 dark:text-zinc-500">
                  No posts yet
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
