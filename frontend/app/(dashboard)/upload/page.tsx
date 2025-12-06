'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, X, Loader2, CheckCircle2, ArrowRight } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { resumeApi } from '@/lib/api'
import Link from 'next/link'

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [jobRequirements, setJobRequirements] = useState('')
  const [topN, setTopN] = useState(10)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles])
    setError(null) // Clear any previous errors
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true,
    noClick: false,
    noKeyboard: false
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleProcess = async () => {
    if (files.length === 0 || !jobTitle.trim() || !jobDescription.trim()) {
      return
    }

    setIsProcessing(true)
    setError(null)
    setShowSuccessNotification(false)

    try {
      console.log('🚀 Starting resume upload and matching...')
      console.log(`📄 Files: ${files.length}`)
      console.log(`💼 Job: ${jobTitle}`)
      console.log(`🎯 Top N: ${topN}`)

      // Upload resumes with job description for automatic matching
      const response = await resumeApi.uploadResumesWithJob(files, {
        job_title: jobTitle,
        job_description: jobDescription,
        job_requirements: jobRequirements,
        top_n: topN
      })

      console.log('✅ Upload and matching complete:', response.data)

      // Set uploaded files from response
      setUploadedFiles(files.map(f => f.name))

      // Show success notification
      setShowSuccessNotification(true)

      // Clear form after successful upload
      setFiles([])
      setJobTitle('')
      setJobDescription('')
      setJobRequirements('')

      // Auto-hide notification after 10 seconds
      setTimeout(() => {
        setShowSuccessNotification(false)
      }, 10000)

    } catch (err: any) {
      console.error('❌ Upload error:', err)
      setError(err.response?.data?.detail || 'Failed to upload resumes. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const canProcess = files.length > 0 && jobTitle.trim().length > 0 && jobDescription.trim().length > 0

  return (
    <div className="space-y min-h-screen p-8 lg:p-12">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-black text-text-light dark:text-text-dark">Upload and Match</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-base">
          Upload resumes and provide job details to automatically rank the best candidates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upload & Job Description */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Upload Area */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <div
                {...getRootProps()}
                className={`relative flex flex-col items-center gap-6 rounded-xl border-2 border-dashed transition-all duration-200 px-6 py-12 cursor-pointer ${isDragActive
                    ? 'border-primary bg-primary/5 scale-[0.98]'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
              >
                <input {...getInputProps()} />
                <div className="flex items-center justify-center w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full text-primary">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-lg font-bold text-text-light dark:text-white">
                    {isDragActive ? 'Drop files here' : 'Upload Resumes'}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
                    {isDragActive
                      ? 'Release to upload your files'
                      : 'Drag & drop your PDF files here, or click to browse'}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <FileText className="w-4 h-4" />
                    <span>PDF files only • Max 50 files</span>
                  </div>
                </div>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                      Uploaded Files ({files.length})
                    </p>
                    <button
                      onClick={() => setFiles([])}
                      className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(index)
                          }}
                          className="flex-shrink-0 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors group-hover:opacity-100 opacity-60"
                          aria-label="Remove file"
                        >
                          <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Job Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h3 className="text-lg font-bold text-text-light dark:text-white">Job Details</h3>

            {/* Job Title */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-text-light dark:text-white">
                Job Title *
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Data Engineer"
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-text-light dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
              />
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-text-light dark:text-white">
                Job Description *
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here. Include responsibilities, required skills, and qualifications..."
                className="w-full h-32 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-text-light dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {jobDescription.length} characters
              </p>
            </div>

            {/* Job Requirements */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-text-light dark:text-white">
                Key Requirements (Optional)
              </label>
              <textarea
                value={jobRequirements}
                onChange={(e) => setJobRequirements(e.target.value)}
                placeholder="Python, AWS, 5+ years experience&#10;Machine Learning, TensorFlow&#10;SQL, Data Modeling"
                className="w-full h-24 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-text-light dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                One requirement per line
              </p>
            </div>

            {/* Top N Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-text-light dark:text-white">
                Number of Top Candidates to Rank
              </label>
              <select
                value={topN}
                onChange={(e) => setTopN(Number(e.target.value))}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-text-light dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
              >
                <option value={5}>Top 5 Candidates</option>
                <option value={10}>Top 10 Candidates</option>
                <option value={15}>Top 15 Candidates</option>
                <option value={20}>Top 20 Candidates</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                System will rank the best {topN} resumes out of all uploaded
              </p>
            </div>
          </div>

          {/* Process Button */}
          <button
            onClick={handleProcess}
            disabled={!canProcess || isProcessing}
            className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-base shadow-lg transition-all duration-200 ${canProcess && !isProcessing
                ? 'bg-primary hover:bg-blue-700 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing & Ranking Resumes...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Process & Rank Resumes
              </>
            )}
          </button>

          {!canProcess && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  Please complete the following:
                </p>
                <ul className="mt-1 text-xs text-yellow-700 dark:text-yellow-400 list-disc list-inside space-y-0.5">
                  {files.length === 0 && <li>Upload at least one resume</li>}
                  {!jobTitle.trim() && <li>Provide a job title</li>}
                  {!jobDescription.trim() && <li>Provide a job description</li>}
                </ul>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-red-600 dark:text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Upload Failed
                </p>
                <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Instructions & Tips */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold mb-4 text-text-light dark:text-text-dark">How It Works</h3>
            <ol className="space-y-4 text-sm">
              {[
                { num: 1, text: 'Upload one or more resumes in PDF format' },
                { num: 2, text: 'Paste or type the job description' },
                { num: 3, text: 'Click "Process Documents" to analyze' },
                { num: 4, text: 'Get AI-powered match scores and insights' }
              ].map((step) => (
                <li key={step.num} className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                    {step.num}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 pt-0.5">{step.text}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold mb-4 text-text-light dark:text-text-dark">Pro Tips</h3>
            <ul className="space-y-3 text-sm">
              {[
                'Ensure resumes are in PDF format for best results',
                'Include detailed job requirements for accurate matching',
                'You can upload up to 50 resumes at once',
                'Processing typically takes 1-2 minutes'
              ].map((tip, index) => (
                <li key={index} className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 dark:from-secondary/20 dark:to-secondary/10 rounded-xl shadow-sm border-2 border-secondary/30 p-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-secondary mb-1">Processing Complete!</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Successfully processed <strong>{uploadedFiles.length}</strong> resume{uploadedFiles.length > 1 ? 's' : ''}.
                    View detailed insights and analytics.
                  </p>
                  <Link
                    href="/analytics"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Go to Analytics
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification - Fixed position */}
      {showSuccessNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-green-500 p-6 max-w-md">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-600 dark:text-green-400 mb-2">
                  🎉 Resumes Processed Successfully!
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  <strong>{uploadedFiles.length}</strong> resume{uploadedFiles.length > 1 ? 's' : ''} uploaded and analyzed.
                  View detailed insights and analytics now.
                </p>
                <div className="flex gap-3">
                  <Link
                    href="/analytics"
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    View Analytics
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setShowSuccessNotification(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowSuccessNotification(false)}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
