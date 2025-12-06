'use client'

import { useState, useEffect } from 'react'
import { Star, FileText, Trash2 } from 'lucide-react'
import { favoritesApi } from '@/lib/api'

interface FavoriteResume {
  favorite_id: number
  resume_id: number
  candidate_name: string
  file_name: string
  skills: string[]
  match_score: number | null
  created_at: string
  resume_created_at: string
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteResume[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<number | null>(null)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      const response = await favoritesApi.getFavorites()
      setFavorites(response.data.favorites || [])
    } catch (error) {
      console.error('Failed to load favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (resumeId: number) => {
    setRemovingId(resumeId)
    try {
      await favoritesApi.removeFavorite(resumeId)
      setFavorites(favorites.filter(f => f.resume_id !== resumeId))
    } catch (error) {
      console.error('Failed to remove favorite:', error)
      alert('Failed to remove favorite. Please try again.')
    } finally {
      setRemovingId(null)
    }
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
    if (score >= 70) return 'text-green-600 bg-green-50 dark:bg-green-900/20'
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    return 'text-red-600 bg-red-50 dark:bg-red-900/20'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">
          Favorites
        </h1>
        <p className="text-text-light/70 dark:text-text-dark/70 mt-2">
          Your starred resumes
        </p>
      </div>

      {loading ? (
        <div className="bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark p-12 text-center">
          <p className="text-text-light/70 dark:text-text-dark/70">Loading favorites...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark p-12 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <div className="text-6xl">⭐</div>
            <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">
              No Favorites Yet
            </h2>
            <p className="text-text-light/70 dark:text-text-dark/70">
              Star your favorite resumes to access them quickly from this page.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {favorites.map((favorite) => (
            <div
              key={favorite.favorite_id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* File Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                {/* Candidate Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {favorite.candidate_name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {favorite.file_name}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Match Score */}
                      {favorite.match_score !== null && (
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(favorite.match_score)}`}
                        >
                          {favorite.match_score}%
                        </span>
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFavorite(favorite.resume_id)}
                        disabled={removingId === favorite.resume_id}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50"
                        title="Remove from favorites"
                      >
                        {removingId === favorite.resume_id ? (
                          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Skills */}
                  {favorite.skills && favorite.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {favorite.skills.slice(0, 8).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {favorite.skills.length > 8 && (
                        <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs font-medium">
                          +{favorite.skills.length - 8} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>Favorited: {new Date(favorite.created_at).toLocaleDateString()}</span>
                    {favorite.resume_created_at && (
                      <span>Uploaded: {new Date(favorite.resume_created_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
