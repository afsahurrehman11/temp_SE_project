import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API_V1 = `${API_BASE_URL}/api/v1`

export const api = axios.create({
  baseURL: API_V1,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for auth
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Types
export interface User {
  id: number
  email: string
  username: string
  full_name?: string
  avatar_url?: string
  bio?: string
  company?: string
  role?: string
  is_active: boolean
  created_at: string
}

export interface UserUpdate {
  email?: string
  full_name?: string
  bio?: string
  company?: string
  role?: string
  avatar_url?: string
  password?: string
}

export interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'match' | 'job' | 'resume'
  link?: string
  is_read: boolean
  created_at: string
}

export interface Job {
  id: number
  title: string
  description: string
  requirements: string[]
  location?: string
  job_type?: string
  status: string
  created_at: string
  updated_at?: string
}

export interface Resume {
  id: number
  candidate_name: string
  candidate_email?: string
  file_name: string
  file_size: number
  extracted_skills?: string[]
  extracted_experience?: string
  extracted_education?: string
  status: string
  created_at: string
}

export interface Match {
  id: number
  job_id: number
  resume_id: number
  match_score: number
  skills_match: Record<string, any>
  summary: string
  created_at: string
  resume?: Resume
}

export interface DashboardStats {
  total_resumes: number
  total_jobs: number
  total_matches: number
  avg_match_score: number
  pending_reviews: number
  shortlisted: number
}

export interface MatchesAnalytics {
  total_matches: number
  average_score: number
  high_matches: number
  medium_matches: number
  low_matches: number
  score_distribution: Record<string, number>
}

// Authentication API
export const authApi = {
  register: async (data: { email: string; username: string; password: string; full_name?: string }) => {
    return api.post<User>('/auth/register', data)
  },

  login: async (email: string, password: string) => {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)

    const response = await api.post<{ access_token: string; token_type: string }>(
      '/auth/login',
      formData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.access_token)
    }

    return response
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  getCurrentUser: async () => {
    const response = await api.get<User>('/auth/me')
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.data))
    }
    return response
  },

  updateProfile: async (data: UserUpdate) => {
    const response = await api.put<User>('/auth/me', data)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.data))
    }
    return response
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<User>('/auth/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.data))
    }

    return response
  },
}

// Resume API
export const resumeApi = {
  uploadResumes: async (files: File[], jobId?: number) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    if (jobId) {
      formData.append('job_id', jobId.toString())
    }

    return api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  uploadResumesWithJob: async (files: File[], jobDetails: {
    job_title: string
    job_description: string
    job_requirements?: string
    top_n?: number
  }) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    formData.append('job_title', jobDetails.job_title)
    formData.append('job_description', jobDetails.job_description)
    if (jobDetails.job_requirements) {
      formData.append('job_requirements', jobDetails.job_requirements)
    }
    if (jobDetails.top_n) {
      formData.append('top_n', jobDetails.top_n.toString())
    }

    return api.post('/resumes/upload-and-rank', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getResumes: async (skip = 0, limit = 100, jobId?: number) => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() })
    if (jobId) params.append('job_id', jobId.toString())

    return api.get<Resume[]>(`/resumes?${params}`)
  },

  getResume: async (resumeId: number) => {
    return api.get<Resume>(`/resumes/${resumeId}`)
  },

  deleteResume: async (resumeId: number) => {
    return api.delete(`/resumes/${resumeId}`)
  },

  getResumeMatches: async (resumeId: number) => {
    return api.get<Match[]>(`/resumes/${resumeId}/matches`)
  },
}

// Job API
export const jobApi = {
  // Job creation disabled - jobs must be created manually via database
  // createJob method removed

  getJobs: async (skip = 0, limit = 100, statusFilter?: string) => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() })
    if (statusFilter) params.append('status_filter', statusFilter)

    return api.get<Job[]>(`/jobs?${params}`)
  },

  getJob: async (jobId: number) => {
    return api.get<Job>(`/jobs/${jobId}`)
  },

  updateJob: async (jobId: number, data: Partial<Job>) => {
    return api.put<Job>(`/jobs/${jobId}`, data)
  },

  deleteJob: async (jobId: number) => {
    return api.delete(`/jobs/${jobId}`)
  },

  getJobMatches: async (jobId: number, minScore?: number) => {
    const params = new URLSearchParams()
    if (minScore !== undefined) params.append('min_score', minScore.toString())

    return api.get<Match[]>(`/jobs/${jobId}/matches?${params}`)
  },

  matchResumeToJob: async (jobId: number, resumeId: number) => {
    return api.post<Match>(`/jobs/${jobId}/match/${resumeId}`)
  },

  matchAllResumes: async (jobId: number) => {
    return api.post(`/jobs/${jobId}/match-all`)
  },
}

// Analytics API
export const analyticsApi = {
  getDashboardStats: async () => {
    return api.get<DashboardStats>('/analytics/dashboard')
  },

  getSkillsDistribution: async (limit = 20) => {
    return api.get(`/analytics/skills?limit=${limit}`)
  },

  getMatchesAnalytics: async (jobId?: number, minScore = 0) => {
    const params = new URLSearchParams({ min_score: minScore.toString() })
    if (jobId) params.append('job_id', jobId.toString())

    return api.get<MatchesAnalytics>(`/analytics/matches?${params}`)
  },

  getJobStats: async (jobId: number) => {
    return api.get(`/analytics/jobs/${jobId}/stats`)
  },

  getTrends: async (period = '30d') => {
    return api.get(`/analytics/trends?period=${period}`)
  },

  exportAnalytics: async (format = 'json') => {
    return api.get(`/analytics/export?format=${format}`)
  },

  getRankedOverview: async (jobId?: number, topK = 50, topN = 10) => {
    const params = new URLSearchParams({ top_k: topK.toString(), top_n: topN.toString() })
    if (jobId) params.append('job_id', jobId.toString())

    return api.get(`/analytics/ranked-overview?${params}`)
  },

  getRankedCandidates: async (jobId?: number) => {
    const params = new URLSearchParams()
    if (jobId) params.append('job_id', jobId.toString())

    return api.get(`/analytics/ranked-candidates?${params}`)
  },
}

// Chat API
export const chatApi = {
  query: async (query: string, topK = 3) => {
    return api.post('/chat/query', { query, top_k: topK })
  },

  askResume: async (resumeId: number, query: string, topK = 3) => {
    return api.post(`/chat/ask-resume/${resumeId}`, { query, top_k: topK })
  },

  compareResumes: async (resumeIds: number[], query: string, topK = 3) => {
    return api.post('/chat/compare-resumes', { resume_ids: resumeIds, query, top_k: topK })
  },

  analyzeJob: async (jobId: number, query: string, topK = 3) => {
    return api.post(`/chat/analyze-job/${jobId}`, { query, top_k: topK })
  },

  suggestQuestions: async (resumeId: number) => {
    return api.post(`/chat/suggest-questions/${resumeId}`)
  },

  getConversationHistory: async (limit = 50) => {
    return api.get(`/chat/conversation-history?limit=${limit}`)
  },

  clearConversationHistory: async () => {
    return api.delete('/chat/conversation-history')
  },
}

// Ranked Resumes API
export interface RankedResumeItem {
  resume_id: number
  candidate_name: string
  embedding_score: number
  rerank_score?: number
  skills: string[]
  summary: string
  explanation: string
  text?: string
  metadata?: any
}

export interface RankedResumesRequest {
  job_description: string
  top_k?: number
  top_n?: number
}

export interface RankedResumesResponse {
  ranked_resumes: RankedResumeItem[]
  pipeline_config: {
    top_k: number
    top_n: number
    reranker_used: boolean
    llm_used: boolean
  }
  stages?: any
}

export const rankedResumesApi = {
  matchResumes: async (request: RankedResumesRequest) => {
    return api.post<RankedResumesResponse>('/ranked-resumes/match', request)
  },

  getForJob: async (jobId: number, topK = 50, topN = 5) => {
    return api.get<RankedResumesResponse>(`/ranked-resumes/job/${jobId}?top_k=${topK}&top_n=${topN}`)
  }
}

// Notifications API
export const notificationsApi = {
  getNotifications: async (unreadOnly = false, skip = 0, limit = 50) => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      unread_only: unreadOnly.toString()
    })
    return api.get<Notification[]>(`/notifications?${params}`)
  },

  getUnreadCount: async () => {
    return api.get<{ unread_count: number }>('/notifications/unread-count')
  },

  markAsRead: async (notificationIds: number[]) => {
    return api.post('/notifications/mark-as-read', { notification_ids: notificationIds })
  },

  markAllAsRead: async () => {
    return api.post('/notifications/mark-all-as-read')
  },

  deleteNotification: async (notificationId: number) => {
    return api.delete(`/notifications/${notificationId}`)
  },
}

// Favorites API
export const favoritesApi = {
  addFavorite: async (resumeId: number) => {
    return api.post(`/favorites/${resumeId}`)
  },

  removeFavorite: async (resumeId: number) => {
    return api.delete(`/favorites/${resumeId}`)
  },

  getFavorites: async () => {
    return api.get('/favorites')
  },

  checkFavorite: async (resumeId: number) => {
    return api.get(`/favorites/check/${resumeId}`)
  },

  bulkCheckFavorites: async (resumeIds: number[]) => {
    return api.get(`/favorites/bulk-check?resume_ids=${resumeIds.join(',')}`)
  },
}
