'use client'

import { RankedResumeItem } from '@/lib/api'
import { useState } from 'react'

interface ResumeCardProps {
    resume: RankedResumeItem
    rank: number
}

export default function ResumeCard({ resume, rank }: ResumeCardProps) {
    const [expanded, setExpanded] = useState(false)

    const getScoreColor = (score: number) => {
        if (score >= 0.7) return 'text-green-600 bg-green-50'
        if (score >= 0.4) return 'text-yellow-600 bg-yellow-50'
        return 'text-red-600 bg-red-50'
    }

    return (
        <div className="border border-gray-200 rounded-lg p-6 mb-4 hover:shadow-md transition-shadow bg-white">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold">
                        #{rank}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{resume.candidate_name}</h3>
                        <p className="text-sm text-gray-500">Resume ID: {resume.resume_id}</p>
                    </div>
                </div>

                {/* Scores */}
                <div className="flex gap-3">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Embedding</p>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(resume.embedding_score)}`}>
                            {resume.embedding_score.toFixed(3)}
                        </span>
                    </div>
                    {resume.rerank_score !== undefined && (
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Rerank</p>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(resume.rerank_score)}`}>
                                {resume.rerank_score.toFixed(3)}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Matched Skills:</p>
                <div className="flex flex-wrap gap-2">
                    {resume.skills.length > 0 ? (
                        resume.skills.map((skill, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                            >
                                {skill}
                            </span>
                        ))
                    ) : (
                        <span className="text-sm text-gray-500 italic">No skills matched</span>
                    )}
                </div>
            </div>

            {/* Explanation */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-blue-900 mb-2">💡 Why this candidate matches:</p>
                <p className="text-sm text-blue-800 leading-relaxed">{resume.explanation}</p>
            </div>

            {/* Summary (Expandable) */}
            <div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                    {expanded ? '▼' : '▶'} {expanded ? 'Hide' : 'Show'} Summary
                </button>
                {expanded && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 leading-relaxed">{resume.summary}</p>
                        {resume.text && (
                            <div className="mt-3 pt-3 border-t border-gray-300">
                                <p className="text-xs font-medium text-gray-600 mb-2">Resume Preview:</p>
                                <p className="text-xs text-gray-600 leading-relaxed">{resume.text}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
