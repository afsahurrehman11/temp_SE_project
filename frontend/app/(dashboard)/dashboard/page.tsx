'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { StatsCard } from '@/components/StatsCard'
import { FileText, Briefcase, CheckCircle, TrendingUp, Loader2, Code } from 'lucide-react'
import { analyticsApi, resumeApi, DashboardStats } from '@/lib/api'

interface RecentResume {
  id: number
  file_name: string
  created_at: string
  extracted_skills?: string[]
}

interface SkillData {
  skill: string
  count: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentResumes, setRecentResumes] = useState<RecentResume[]>([])
  const [topSkills, setTopSkills] = useState<SkillData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch dashboard stats
      const statsResponse = await analyticsApi.getDashboardStats()
      setStats(statsResponse.data)

      // Fetch top skills
      const skillsResponse = await analyticsApi.getSkillsDistribution(4)
      setTopSkills(skillsResponse.data)

      // Fetch recent resumes - get all resumes ordered by most recent
      const resumesResponse = await resumeApi.getResumes(0, 100)
      setRecentResumes(resumesResponse.data)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  const handleResumeClick = async (resumeId: number) => {
    try {
      // Fetch PDF with authentication
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const response = await fetch(`${apiUrl}/api/v1/resumes/${resumeId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load resume')
      }

      // Create blob and open in new tab
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')

      // Clean up blob URL after a short delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100)
    } catch (error) {
      console.error('Error opening resume:', error)
      alert('Failed to open resume. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
          Welcome back! Here's an overview of your recruitment activities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatsCard
          title="Total Resumes"
          value={stats?.total_resumes.toString() || '0'}
          change={`${stats?.pending_reviews || 0} pending review`}
          icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6" />}
          trend="neutral"
        />
        <StatsCard
          title="Total Matches"
          value={stats?.total_matches.toString() || '0'}
          change={`${stats?.shortlisted || 0} shortlisted`}
          icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
          trend="neutral"
        />
        <StatsCard
          title="Avg Match Score"
          value={`${stats?.avg_match_score.toFixed(0) || 0}%`}
          change="Overall performance"
          icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />}
          trend={stats?.avg_match_score && stats.avg_match_score > 50 ? "up" : "neutral"}
        />
      </div>

      {/* Recent Activity */}
      <div className="glassmorphism-card rounded-xl p-4 sm:p-6 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Recently Uploaded Resumes</h2>
          {recentResumes.length > 0 && (
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {recentResumes.length} resume{recentResumes.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="max-h-[32rem] overflow-y-auto space-y-3 sm:space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
          {recentResumes.length > 0 ? (
            recentResumes.map((resume, index) => (
              <div
                key={resume.id}
                onClick={() => handleResumeClick(resume.id)}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-md gap-3 sm:gap-0 border border-transparent hover:border-primary/20"
              >
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base truncate">{resume.file_name}</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                      {resume.extracted_skills?.slice(0, 3).join(', ') || 'Processing...'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <p className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                    {formatTimeAgo(resume.created_at)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No resumes uploaded yet</p>
              <Link href="/upload" className="text-primary hover:underline text-sm">
                Upload your first resume
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="glassmorphism-card rounded-xl p-4 sm:p-6 transition-all duration-300">
          <h3 className="text-base sm:text-lg font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/upload"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              Upload New Resumes
            </Link>
            <Link
              href="/analytics"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 hover:scale-105 active:scale-95 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
              View Analytics
            </Link>
          </div>
        </div>

        <div className="glassmorphism-card rounded-xl p-4 sm:p-6 transition-all duration-300">
          <h3 className="text-base sm:text-lg font-bold mb-4">Top Skills in Demand</h3>
          <div className="space-y-2.5 sm:space-y-3">
            {topSkills.length > 0 ? (
              topSkills.map((item, index) => (
                <div key={index} className="flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded transition-colors duration-200">
                  <span className="text-xs sm:text-sm font-medium">{item.skill}</span>
                  <span className="text-xs sm:text-sm font-semibold text-primary">{item.count}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No skill data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
