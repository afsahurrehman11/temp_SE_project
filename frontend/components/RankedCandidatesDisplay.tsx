'use client'

import { Trophy, Star, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { favoritesApi } from '@/lib/api'

interface RankedCandidate {
    rank: number
    candidate_name: string
    resume_id: number
    match_score: number
    matched_skills: string[]
    summary: string
    status: string
}

interface RankedCandidatesDisplayProps {
    candidates: RankedCandidate[]
    scoreDistribution: Array<{ candidate: string; score: number }>
}

export default function RankedCandidatesDisplay({ candidates, scoreDistribution }: RankedCandidatesDisplayProps) {
    const [favoritedIds, setFavoritedIds] = useState<Set<number>>(new Set())
    const [loading, setLoading] = useState<number | null>(null)

    // Load favorite status for all candidates
    useEffect(() => {
        const loadFavorites = async () => {
            if (candidates.length === 0) return

            try {
                const resumeIds = candidates.map(c => c.resume_id)
                const response = await favoritesApi.bulkCheckFavorites(resumeIds)
                setFavoritedIds(new Set(response.data.favorited_ids))
            } catch (error) {
                console.error('Failed to load favorites:', error)
            }
        }

        loadFavorites()
    }, [candidates])

    const toggleFavorite = async (resumeId: number) => {
        setLoading(resumeId)
        const isFavorited = favoritedIds.has(resumeId)

        // Optimistic update
        const newFavorites = new Set(favoritedIds)
        if (isFavorited) {
            newFavorites.delete(resumeId)
        } else {
            newFavorites.add(resumeId)
        }
        setFavoritedIds(newFavorites)

        try {
            if (isFavorited) {
                await favoritesApi.removeFavorite(resumeId)
            } else {
                await favoritesApi.addFavorite(resumeId)
            }
        } catch (error) {
            // Revert on error
            setFavoritedIds(favoritedIds)
            console.error('Failed to toggle favorite:', error)
            alert('Failed to update favorite. Please try again.')
        } finally {
            setLoading(null)
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-green-600 bg-green-50 dark:bg-green-900/20'
        if (score >= 50) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
        return 'text-red-600 bg-red-50 dark:bg-red-900/20'
    }

    const getRankBadge = (rank: number) => {
        if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
        if (rank === 2) return <Star className="w-5 h-5 text-gray-400" />
        if (rank === 3) return <Star className="w-5 h-5 text-amber-600" />
        return <CheckCircle className="w-5 h-5 text-blue-500" />
    }

    if (!candidates || candidates.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>No ranked candidates yet. Upload resumes to see rankings.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Score Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold mb-4 text-text-light dark:text-white">Score Distribution</h3>
                <div className="space-y-3">
                    {scoreDistribution.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-32 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                {item.candidate}
                            </div>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${item.score >= 70 ? 'bg-green-500' : item.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${item.score}%` }}
                                />
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white">
                                    {item.score}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ranked Candidates */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold mb-4 text-text-light dark:text-white">
                    Top Ranked Candidates
                </h3>
                <div className="space-y-4">
                    {candidates.map((candidate) => (
                        <div
                            key={candidate.resume_id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                {/* Rank Badge */}
                                <div className="flex-shrink-0 flex flex-col items-center">
                                    {getRankBadge(candidate.rank)}
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 mt-1">
                                        #{candidate.rank}
                                    </span>
                                </div>

                                {/* Candidate Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">
                                            {candidate.candidate_name}
                                        </h4>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {/* Star Button */}
                                            <button
                                                onClick={() => toggleFavorite(candidate.resume_id)}
                                                disabled={loading === candidate.resume_id}
                                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                                                title={favoritedIds.has(candidate.resume_id) ? 'Remove from favorites' : 'Add to favorites'}
                                            >
                                                <Star
                                                    className={`w-5 h-5 transition-all ${favoritedIds.has(candidate.resume_id)
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-400 hover:text-yellow-400'
                                                        }`}
                                                />
                                            </button>

                                            {/* Score Badge */}
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(
                                                    candidate.match_score
                                                )}`}
                                            >
                                                {candidate.match_score}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* LLM Summary */}
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                                        {candidate.summary}
                                    </p>

                                    {/* Matched Skills */}
                                    {candidate.matched_skills && candidate.matched_skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {candidate.matched_skills.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
