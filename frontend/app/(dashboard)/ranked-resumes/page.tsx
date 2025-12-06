'use client'

import { useState } from 'react'
import { rankedResumesApi, RankedResumeItem, RankedResumesResponse } from '@/lib/api'
import ResumeCard from '@/components/ResumeCard'

export default function RankedResumesPage() {
    const [jobDescription, setJobDescription] = useState('')
    const [topK, setTopK] = useState(50)
    const [topN, setTopN] = useState(5)
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<RankedResumesResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    const sampleJobs = [
        "Senior Data Engineer: 4+ years, Spark, Snowflake, AWS. Build ETL and data models.",
        "Backend Developer: Python/Django, REST APIs, PostgreSQL, Docker, Kubernetes.",
        "ML Engineer: NLP, transformers, PyTorch, model deployment and monitoring."
    ]

    const handleMatch = async () => {
        if (!jobDescription.trim()) {
            setError('Please enter a job description')
            return
        }

        setLoading(true)
        setError(null)
        setResults(null)

        try {
            const response = await rankedResumesApi.matchResumes({
                job_description: jobDescription,
                top_k: topK,
                top_n: topN
            })
            setResults(response.data)
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to match resumes. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Screening RAG Pipeline</h1>
                <p className="text-gray-600">
                    Find the best candidates using AI-powered semantic search, reranking, and explanations
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Input Section */}
                <div className="lg:col-span-2 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Job Description
                        </label>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste job description here..."
                            className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Examples */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Examples (click to use):</p>
                        <div className="space-y-2">
                            {sampleJobs.map((job, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setJobDescription(job)}
                                    className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                                >
                                    {job}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                FAISS top-k: {topK}
                            </label>
                            <input
                                type="range"
                                min="5"
                                max="100"
                                step="5"
                                value={topK}
                                onChange={(e) => setTopK(Number(e.target.value))}
                                className="w-full"
                            />
                            <p className="text-xs text-gray-500 mt-1">How many resumes to fetch first</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Show top-N: {topN}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                step="1"
                                value={topN}
                                onChange={(e) => setTopN(Number(e.target.value))}
                                className="w-full"
                            />
                            <p className="text-xs text-gray-500 mt-1">How many best results to display</p>
                        </div>
                    </div>

                    <button
                        onClick={handleMatch}
                        disabled={loading || !jobDescription.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                        {loading ? 'Finding Candidates...' : 'Find Candidates'}
                    </button>
                </div>

                {/* Tips Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips</h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li>• Upload resumes before using this tool</li>
                        <li>• FAISS top-k: initial candidates from semantic search</li>
                        <li>• Top-N: final results after reranking</li>
                        <li>• Check console for pipeline stage logs</li>
                        <li>• LLM generates explanations for each match</li>
                    </ul>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Results */}
            {results && (
                <div>
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="text-lg font-semibold text-green-900 mb-2">✅ Pipeline Complete</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-green-700 font-medium">Total Candidates</p>
                                <p className="text-2xl font-bold text-green-900">{results.ranked_resumes.length}</p>
                            </div>
                            <div>
                                <p className="text-green-700 font-medium">FAISS Search</p>
                                <p className="text-2xl font-bold text-green-900">{results.pipeline_config.top_k}</p>
                            </div>
                            <div>
                                <p className="text-green-700 font-medium">Reranker</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {results.pipeline_config.reranker_used ? '✓' : '✗'}
                                </p>
                            </div>
                            <div>
                                <p className="text-green-700 font-medium">LLM</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {results.pipeline_config.llm_used ? '✓' : '✗'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Top {results.ranked_resumes.length} Candidates
                    </h2>
                    <div className="space-y-4">
                        {results.ranked_resumes.map((resume, idx) => (
                            <ResumeCard key={resume.resume_id} resume={resume} rank={idx + 1} />
                        ))}
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Running pipeline stages...</p>
                    <p className="text-sm text-gray-500 mt-2">Check console for detailed logs</p>
                </div>
            )}
        </div>
    )
}
