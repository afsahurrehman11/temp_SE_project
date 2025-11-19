'use client'

export default function FavoritesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">
          Favorites
        </h1>
        <p className="text-text-light/70 dark:text-text-dark/70 mt-2">
          Your starred jobs and resumes
        </p>
      </div>

      <div className="bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark p-12 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div className="text-6xl">⭐</div>
          <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">
            No Favorites Yet
          </h2>
          <p className="text-text-light/70 dark:text-text-dark/70">
            Star your favorite jobs and resumes to access them quickly from this page.
          </p>
        </div>
      </div>
    </div>
  )
}
