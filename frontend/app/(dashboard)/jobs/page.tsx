'use client'

import { useEffect, useState } from 'react'
import { jobApi, Job } from '@/lib/api'
import { Briefcase, Plus, Search, Loader2, Trash2, Edit, Users, Calendar, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await jobApi.getJobs()
      setJobs(response.data)
    } catch (err: any) {
      console.error('Error fetching jobs:', err)
      setError(err.response?.data?.detail || 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return

    try {
      await jobApi.deleteJob(jobId)
      setJobs(jobs.filter(job => job.id !== jobId))
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete job')
    }
  }

  const handleMatchAllResumes = async (jobId: number) => {
    try {
      await jobApi.matchAllResumes(jobId)
      alert('Successfully matched all resumes to this job!')
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to match resumes')
    }
  }

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black">Job Postings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create and manage your job openings
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create Job
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold mb-2">No job postings yet</h3>
          <p className="text-gray-500 mb-6">
            Create your first job posting to start matching candidates
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Create Your First Job
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="glass-card rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        📍 {job.location}
                      </span>
                    )}
                    {job.job_type && (
                      <span className="capitalize">{job.job_type}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {job.status === 'active' ? (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                      <XCircle className="w-4 h-4" />
                      {job.status}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {job.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {new Date(job.created_at).toLocaleDateString()}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMatchAllResumes(job.id)}
                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Match all resumes"
                  >
                    <Users className="w-5 h-5 text-blue-600" />
                  </button>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="View details"
                  >
                    <Edit className="w-5 h-5 text-gray-600" />
                  </Link>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Delete job"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Job Modal */}
      {showCreateModal && (
        <CreateJobModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchJobs()
          }}
        />
      )}
    </div>
  )
}

function CreateJobModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    job_type: 'full-time',
    requirements: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description) {
      setError('Title and description are required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Parse requirements as array of strings (one per line)
      const requirements = formData.requirements
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)

      await jobApi.createJob({
        title: formData.title,
        description: formData.description,
        requirements: requirements,
        location: formData.location || undefined,
        job_type: formData.job_type || 'full-time'
      })
      
      onSuccess()
    } catch (err: any) {
      console.error('Error creating job:', err)
      const errorDetail = err.response?.data?.detail
      if (Array.isArray(errorDetail)) {
        setError(errorDetail.map((e: any) => e.msg).join(', '))
      } else {
        setError(errorDetail || err.message || 'Failed to create job')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold">Create Job Posting</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent"
              placeholder="e.g. Senior Frontend Developer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent min-h-[150px]"
              placeholder="Describe the role, responsibilities, and ideal candidate..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Required Skills (one per line)
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent min-h-[100px]"
              placeholder="React&#10;TypeScript&#10;Node.js&#10;GraphQL&#10;5+ years experience"
            />
            <p className="text-xs text-gray-500 mt-1">Enter each requirement on a new line</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent"
                placeholder="e.g. Remote, New York"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Job Type</label>
              <select
                value={formData.job_type}
                onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
