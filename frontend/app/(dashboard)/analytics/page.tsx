'use client'

import { Download, TrendingUp, Users, Briefcase, FileText, Target } from 'lucide-react'
import { useEffect, useState } from 'react'
import { analyticsApi, jobApi, DashboardStats } from '@/lib/api'

interface SkillDistribution {
  skill: string
  count: number
  category: string
}

interface MatchesAnalytics {
  total_matches: number
  average_score: number
  high_matches: number
  medium_matches: number
  low_matches: number
  score_distribution: Record<string, number>
}

interface Job {
  id: number
  title: string
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [skills, setSkills] = useState<SkillDistribution[]>([])
  const [matchesData, setMatchesData] = useState<MatchesAnalytics | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<number | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
    fetchJobs()
    fetchMatchesData() // Fetch matches data on initial load
  }, [])

  useEffect(() => {
    if (selectedJob !== undefined) {
      fetchMatchesData(selectedJob)
    } else {
      fetchMatchesData() // Fetch all matches when no job is selected
    }
  }, [selectedJob])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const statsResponse = await analyticsApi.getDashboardStats()
      setStats(statsResponse.data)

      const skillsResponse = await analyticsApi.getSkillsDistribution(10)
      setSkills(skillsResponse.data)

    } catch (err: any) {
      console.error('Error fetching analytics:', err)
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load analytics data.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const fetchJobs = async () => {
    try {
      const response = await jobApi.getJobs()
      setJobs(response.data)
    } catch (err) {
      console.error('Error fetching jobs:', err)
    }
  }

  const fetchMatchesData = async (jobId?: number) => {
    try {
      const response = await analyticsApi.getMatchesAnalytics(jobId)
      setMatchesData(response.data)
    } catch (err) {
      console.error('Error fetching matches data:', err)
    }
  }

  const exportData = async () => {
    try {
      const response = await analyticsApi.exportAnalytics('json')
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exporting data:', err)
      alert('Failed to export data')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!stats) return <div>No data available</div>

  const maxSkillCount = Math.max(...skills.map(s => s.count), 1)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black">Analytics Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            View key metrics and performance for your recruitment pipeline.
          </p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          <Download className="w-5 h-5" />
          <span className="font-bold text-sm">Export Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-black">{stats?.total_jobs ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Available positions</p>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Resumes</p>
            <FileText className="w-5 h-5 text-secondary" />
          </div>
          <p className="text-3xl font-black">{stats?.total_resumes ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">{stats?.pending_reviews ?? 0} pending review</p>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Matches</p>
            <Users className="w-5 h-5 text-accent" />
          </div>
          <p className="text-3xl font-black">{stats?.total_matches ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">{stats?.shortlisted ?? 0} shortlisted</p>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Match Score</p>
            <Target className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-black">{stats?.avg_match_score ? Math.round(stats.avg_match_score) : 0}%</p>
          <p className="text-sm text-gray-500 mt-1">
            {stats && stats.avg_match_score >= 70 ? (
              <span className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                Excellent
              </span>
            ) : (
              <span className="text-gray-500">Fair quality</span>
            )}
          </p>
        </div>
      </div>

      {jobs.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Filter by Job:
            </label>
            <select
              value={selectedJob || ''}
              onChange={(e) => setSelectedJob(e.target.value ? Number(e.target.value) : undefined)}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Top Skills Distribution</h3>
          {skills.length > 0 ? (
            <div className="space-y-3">
              {skills.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.skill}</span>
                    <span className="text-gray-600 dark:text-gray-400">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${(item.count / maxSkillCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No skills data. Upload resumes to see insights.</p>
          )}
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Match Quality Distribution</h3>
          {matchesData && matchesData.total_matches > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High (70-100%)</p>
                  <p className="text-2xl font-black text-green-600">{matchesData.high_matches}</p>
                </div>
                <div className="text-5xl">🎯</div>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Medium (40-69%)</p>
                  <p className="text-2xl font-black text-yellow-600">{matchesData.medium_matches}</p>
                </div>
                <div className="text-5xl">📊</div>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low (0-39%)</p>
                  <p className="text-2xl font-black text-red-600">{matchesData.low_matches}</p>
                </div>
                <div className="text-5xl">📉</div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Match Score</p>
                <p className="text-3xl font-black text-blue-600">{matchesData.average_score}%</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No matches yet. Process resumes first.</p>
          )}
        </div>
      </div>

      {matchesData && Object.keys(matchesData.score_distribution).length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Score Distribution</h3>
          <div className="space-y-2">
            {Object.entries(matchesData.score_distribution).sort(([a], [b]) => {
              const aStart = parseInt(a.split('-')[0])
              const bStart = parseInt(b.split('-')[0])
              return bStart - aStart
            }).map(([range, count]) => {
              const maxCount = Math.max(...Object.values(matchesData.score_distribution))
              const percentage = (count / maxCount) * 100
              return (
                <div key={range} className="flex items-center gap-4">
                  <span className="text-sm font-medium w-20">{range}%</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                    <div className="bg-gradient-to-r from-primary to-secondary h-6 rounded-full flex items-center justify-end pr-2" style={{ width: `${percentage}%` }}>
                      {count > 0 && <span className="text-xs font-bold text-white">{count}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {stats.total_resumes === 0 && (
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-bold mb-2">No Data Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start by uploading resumes and creating job postings to see analytics.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/upload" className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90">
              Upload Resumes
            </a>
            <a href="/dashboard" className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600">
              Create Job
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
