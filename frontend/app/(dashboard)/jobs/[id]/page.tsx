'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { jobApi, Job, Match } from '@/lib/api'
import { Loader2, ArrowLeft, Briefcase, MapPin, Calendar, Users, TrendingUp, FileText } from 'lucide-react'
import Link from 'next/link'

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = Number(params.id)

  const [job, setJob] = useState<Job | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [matchingLoading, setMatchingLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (jobId) {
      fetchJobDetails()
      fetchMatches()
    }
  }, [jobId])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      const response = await jobApi.getJob(jobId)
      setJob(response.data)
    } catch (err: any) {
      console.error('Error fetching job:', err)
      setError(err.response?.data?.detail || 'Failed to load job details')
    } finally {
      setLoading(false)
    }
  }

  const fetchMatches = async () => {
    try {
      const response = await jobApi.getJobMatches(jobId)
      setMatches(response.data)
    } catch (err: any) {
      console.error('Error fetching matches:', err)
    }
  }

  const handleMatchAll = async () => {
    if (!confirm('This will match all resumes in the system to this job. Continue?')) return

    try {
      setMatchingLoading(true)
      await jobApi.matchAllResumes(jobId)
      await fetchMatches()
      alert('Successfully matched all resumes!')
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to match resumes')
    } finally {
      setMatchingLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-100 dark:bg-green-900/30'
    if (score >= 50) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
    return 'text-red-600 bg-red-100 dark:bg-red-900/30'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Job</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Job not found'}</p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
        </div>
      </div>
    )
  }

  const avgScore = matches.length > 0
    ? matches.reduce((sum, m) => sum + m.match_score, 0) / matches.length
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/jobs"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex-1">
          <h1 className="text-4xl font-black">{job.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-gray-500">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location}
              </span>
            )}
            {job.job_type && (
              <span className="capitalize">{job.job_type}</span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Candidates</p>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-black">{matches.length}</p>
          <p className="text-sm text-gray-500 mt-1">Matched resumes</p>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Match Score</p>
            <TrendingUp className="w-5 h-5 text-secondary" />
          </div>
          <p className="text-3xl font-black">{Math.round(avgScore)}%</p>
          <p className="text-sm text-gray-500 mt-1">Overall quality</p>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Quality</p>
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-black">{matches.filter(m => m.match_score >= 70).length}</p>
          <p className="text-sm text-gray-500 mt-1">Score ≥ 70%</p>
        </div>
      </div>

      {/* Job Description */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Job Description</h2>
        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{job.description}</p>

        {job.requirements && job.requirements.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-3">Requirements</h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <ul className="space-y-2">
                {job.requirements.map((requirement: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Matched Candidates */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Matched Candidates</h2>
          <button
            onClick={handleMatchAll}
            disabled={matchingLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {matchingLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Matching...
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                Match All Resumes
              </>
            )}
          </button>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold mb-2">No matches yet</h3>
            <p className="text-gray-500 mb-6">
              Click "Match All Resumes" to find candidates for this position
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches
              .sort((a, b) => b.match_score - a.match_score)
              .map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{match.resume?.file_name || 'Unknown Resume'}</h3>
                    {match.resume?.extracted_skills && match.resume.extracted_skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {match.resume.extracted_skills.slice(0, 5).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {match.resume.extracted_skills.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{match.resume.extracted_skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-lg font-bold ${getScoreColor(match.match_score)}`}>
                      {Math.round(match.match_score)}%
                    </div>
                    <Link
                      href={`/resumes/${match.resume_id}`}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                      View Resume
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
