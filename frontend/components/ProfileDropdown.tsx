'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Camera, 
  Edit3,
  Mail,
  Briefcase,
  Building2,
  X,
  Check,
  Loader2
} from 'lucide-react'
import Image from 'next/image'
import { authApi, User } from '@/lib/api'

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load user from localStorage or fetch from API
    const loadUser = async () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      } else {
        try {
          const response = await authApi.getCurrentUser()
          setUser(response.data)
        } catch (error) {
          console.error('Failed to load user:', error)
        }
      }
    }

    loadUser()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = () => {
    authApi.logout()
    window.location.href = '/'
  }

  const getInitials = (name?: string, username?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return username?.slice(0, 2).toUpperCase() || 'U'
  }

  const getAvatarUrl = () => {
    if (user?.avatar_url) {
      // If it's a full URL, return it
      if (user.avatar_url.startsWith('http')) {
        return user.avatar_url
      }
      // Otherwise, construct the URL from the backend
      return `${process.env.NEXT_PUBLIC_API_BASE_URL}/${user.avatar_url}`
    }
    return null
  }

  if (!user) {
    return (
      <div className="bg-gray-200 dark:bg-gray-700 rounded-full size-10 animate-pulse" />
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <div className="relative">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-offset-2 ring-offset-card-light dark:ring-offset-card-dark ring-primary/50 relative overflow-hidden">
            {getAvatarUrl() ? (
              <Image
                src={getAvatarUrl()!}
                alt={user.full_name || user.username}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-sm">
                {getInitials(user.full_name, user.username)}
              </div>
            )}
          </div>
          {/* Online indicator */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
        </div>

        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {user.full_name || user.username}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {user.role || user.email}
          </p>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-scale-in">
          {/* User Info Header */}
          <div className="p-4 bg-gradient-to-br from-primary to-blue-600 text-white">
            <div className="flex items-start gap-3">
              <div className="relative">
                {getAvatarUrl() ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-white/30">
                    <Image
                      src={getAvatarUrl()!}
                      alt={user.full_name || user.username}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm ring-4 ring-white/30 text-white font-bold text-xl">
                    {getInitials(user.full_name, user.username)}
                  </div>
                )}
                <button
                  onClick={() => setShowEditModal(true)}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-white text-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">
                  {user.full_name || user.username}
                </h3>
                <p className="text-sm text-white/80 truncate">@{user.username}</p>
                {user.bio && (
                  <p className="text-xs text-white/70 mt-1 line-clamp-2">{user.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4" />
              <span className="truncate">{user.email}</span>
            </div>
            {user.role && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Briefcase className="w-4 h-4" />
                <span>{user.role}</span>
              </div>
            )}
            {user.company && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Building2 className="w-4 h-4" />
                <span>{user.company}</span>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <button
              onClick={() => {
                setShowEditModal(true)
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => {
                window.location.href = '/settings'
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updatedUser) => {
            setUser(updatedUser)
            setShowEditModal(false)
          }}
        />
      )}
    </div>
  )
}

// Edit Profile Modal Component
function EditProfileModal({ 
  user, 
  onClose, 
  onSuccess 
}: { 
  user: User
  onClose: () => void
  onSuccess: (user: User) => void
}) {
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    email: user.email,
    bio: user.bio || '',
    company: user.company || '',
    role: user.role || '',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cleanup avatar preview URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('Avatar file selected:', file.name, file.size, file.type)
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Avatar image must be less than 5MB')
        e.target.value = '' // Reset file input
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (JPG, PNG, GIF, etc.)')
        e.target.value = '' // Reset file input
        return
      }

      setAvatarFile(file)
      const previewUrl = URL.createObjectURL(file)
      setAvatarPreview(previewUrl)
      setError(null)
      
      console.log('Avatar preview created:', previewUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let updatedUser = user

      // Upload avatar first if changed
      if (avatarFile) {
        console.log('Uploading avatar...')
        const avatarResponse = await authApi.uploadAvatar(avatarFile)
        updatedUser = avatarResponse.data
        console.log('Avatar uploaded successfully:', avatarResponse.data.avatar_url)
        setSuccess('Avatar uploaded successfully!')
      }

      // Update profile with form data
      console.log('Updating profile...', formData)
      const profileResponse = await authApi.updateProfile(formData)
      updatedUser = profileResponse.data
      
      // Update localStorage with the latest user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }

      console.log('Profile updated successfully:', updatedUser)
      setSuccess('Profile updated successfully!')
      
      // Call success callback with updated user after a short delay
      setTimeout(() => {
        onSuccess(updatedUser)
      }, 1000)
    } catch (err: any) {
      console.error('Failed to update profile:', err)
      console.error('Error details:', err.response?.data)
      
      // More specific error messages
      if (err.response?.status === 400) {
        setError(err.response?.data?.detail || 'Invalid data provided')
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.')
        setTimeout(() => {
          authApi.logout()
          window.location.href = '/'
        }, 2000)
      } else if (err.response?.status === 413) {
        setError('File too large. Please upload an image smaller than 5MB')
      } else if (err.message === 'Network Error') {
        setError('Cannot connect to server. Please check if backend is running.')
      } else {
        setError(err.response?.data?.detail || 'Failed to update profile. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 pb-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Profile
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
              <Check className="w-4 h-4" />
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : user.avatar_url ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${user.avatar_url}`}
                    alt="Current avatar"
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-2xl">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Click the camera icon to upload new avatar (max 5MB)
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="john@example.com"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Job Title / Role
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="HR Manager"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Acme Corp"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
