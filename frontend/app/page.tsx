'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthModal from '@/components/AuthModal'

export default function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const router = useRouter()

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false)
    router.push('/dashboard')
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Navigation */}
      <div className="sticky top-0 z-50 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm transition-all duration-300">
        <div className="mx-auto flex max-w-6xl items-center justify-between whitespace-nowrap border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="size-5 sm:size-6 text-primary transition-transform duration-300 hover:scale-110">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_6_319)">
                  <path
                    d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"
                    fill="currentColor"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_6_319">
                    <rect fill="white" height="48" width="48" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">ResumeMatch AI</h2>
          </div>

          <div className="hidden items-center gap-6 md:flex lg:gap-8">
            <a className="text-sm font-medium hover:text-primary dark:hover:text-blue-400 transition-colors duration-200" href="#">
              Features
            </a>
            <a className="text-sm font-medium hover:text-primary dark:hover:text-blue-400 transition-colors duration-200" href="#">
              Pricing
            </a>
            <a className="text-sm font-medium hover:text-primary dark:hover:text-blue-400 transition-colors duration-200" href="#">
              Blog
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="hidden text-sm font-medium hover:text-primary dark:hover:text-blue-400 sm:block transition-colors duration-200"
            >
              Login
            </button>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex h-9 sm:h-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-3 sm:px-4 text-xs sm:text-sm font-bold text-white transition-all duration-200 hover:bg-blue-800 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <span className="truncate">Start Free Trial</span>
            </button>
          </div>
        </div>
      </div>

      <main className="flex flex-1 flex-col">
        {/* Hero Section */}
        <section className="w-full py-12 sm:py-16 md:py-20 lg:py-32 fade-in">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:gap-8 px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex flex-col gap-3 sm:gap-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter">
                The Smarter Way to Screen Resumes
              </h1>
              <h2 className="mx-auto max-w-3xl text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400">
                Leverage the power of AI to find the perfect candidate, faster. Our intelligent platform automates
                screening, matches skills with precision, and provides insightful analytics to streamline your hiring
                process.
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto flex h-11 sm:h-12 min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-sm sm:text-base font-bold text-white transition-all duration-200 hover:bg-blue-800 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <span className="truncate">Start Free Trial</span>
              </button>
              <button className="w-full sm:w-auto flex h-11 sm:h-12 min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-gray-300 bg-background-light px-6 text-sm sm:text-base font-bold text-text-light transition-all duration-200 hover:bg-gray-100 dark:border-gray-700 dark:bg-background-dark dark:text-text-dark dark:hover:bg-gray-800 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
                <span className="truncate">See Demo</span>
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full bg-background-light py-12 sm:py-16 md:py-20 lg:py-24 dark:bg-background-dark">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:gap-10 lg:gap-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:gap-4 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Why Choose ResumeMatch AI?</h2>
              <p className="mx-auto max-w-3xl text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400">
                Our platform is built to eliminate manual work, reduce bias, and help you make data-driven hiring
                decisions with confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="glassmorphism-card flex flex-1 flex-col gap-4 rounded-xl p-5 sm:p-6 group cursor-pointer">
                <div className="flex size-10 sm:size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <svg className="size-5 sm:size-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-4.41 0-8-3.59-8-8V8.3l8-4.36 8 4.36V12c0 4.41-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1 sm:gap-2">
                  <h3 className="text-base sm:text-lg font-bold">AI-Powered Matching</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Our advanced algorithms analyze resumes for skills, experience, and qualifications with unparalleled
                    accuracy and speed.
                  </p>
                </div>
              </div>

              <div className="glassmorphism-card flex flex-1 flex-col gap-4 rounded-xl p-5 sm:p-6 group cursor-pointer">
                <div className="flex size-10 sm:size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <svg className="size-5 sm:size-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1 sm:gap-2">
                  <h3 className="text-base sm:text-lg font-bold">Bulk Resume Screening</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Process hundreds of resumes in minutes, not hours. Save valuable time and focus on interviewing top
                    candidates.
                  </p>
                </div>
              </div>

              <div className="glassmorphism-card flex flex-1 flex-col gap-4 rounded-xl p-5 sm:p-6 group cursor-pointer sm:col-span-2 lg:col-span-1">
                <div className="flex size-10 sm:size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <svg className="size-5 sm:size-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1 sm:gap-2">
                  <h3 className="text-base sm:text-lg font-bold">Insightful Analytics</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Gain a deeper understanding of your talent pipeline with comprehensive analytics and reporting tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Testimonials Section */}
        <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:gap-10 px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
              Trusted by Leading Recruiters
            </h2>

            <div className="relative">
              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-[280px] sm:min-w-[300px] flex-1 flex-col gap-4 rounded-xl border border-gray-200 bg-background-light p-5 sm:p-6 dark:border-gray-800 dark:bg-gray-900/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 snap-center">
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    "ResumeMatch AI has transformed our hiring process. We've cut our screening time by 75% and the quality of candidates has improved dramatically."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="size-9 sm:size-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-semibold">Jane Doe</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Senior Recruiter, TechCorp</p>
                    </div>
                  </div>
                </div>

                <div className="flex min-w-[280px] sm:min-w-[300px] flex-1 flex-col gap-4 rounded-xl border border-gray-200 bg-background-light p-5 sm:p-6 dark:border-gray-800 dark:bg-gray-900/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 snap-center">
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    "The analytics are a game-changer. We can now make truly data-driven decisions and have a much clearer view of our recruitment funnel."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="size-9 sm:size-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-semibold">John Smith</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">HR Manager, Innovate Ltd.</p>
                    </div>
                  </div>
                </div>

                <div className="flex min-w-[280px] sm:min-w-[300px] flex-1 flex-col gap-4 rounded-xl border border-gray-200 bg-background-light p-5 sm:p-6 dark:border-gray-800 dark:bg-gray-900/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 snap-center">
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    "An essential tool for any modern HR department. It's intuitive, powerful, and has significantly improved our team's efficiency."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="size-9 sm:size-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-semibold">Emily Jones</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Talent Acquisition Lead, Solutions Inc.</p>
                    </div>
                  </div>
                </div>

                <div className="flex min-w-[280px] sm:min-w-[300px] flex-1 flex-col gap-4 rounded-xl border border-gray-200 bg-background-light p-5 sm:p-6 dark:border-gray-800 dark:bg-gray-900/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 snap-center">
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    "The accuracy of the AI matching is incredible. It finds candidates we would have otherwise missed, saving us countless hours."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="size-9 sm:size-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-semibold">Michael Chen</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Recruitment Director, Global Solutions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 sm:gap-6 px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Ready to revolutionize your hiring?</h2>
            <p className="max-w-xl text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400">
              Join hundreds of companies finding the best talent faster with ResumeMatch AI.
            </p>
            <Link
              href="/dashboard"
              className="flex h-11 sm:h-12 min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-sm sm:text-base font-bold text-white transition-all duration-200 hover:bg-blue-800 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <span className="truncate">Start Your Free Trial Now</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/50 bg-background-light dark:border-gray-700/50 dark:bg-background-dark">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="size-4 sm:size-5 text-primary">
                <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"></path>
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-semibold">ResumeMatch AI</span>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">© 2024 ResumeMatch AI. All rights reserved.</p>

            <div className="flex items-center gap-3 sm:gap-4">
              <a className="text-xs sm:text-sm text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-200" href="#">
                Terms
              </a>
              <a className="text-xs sm:text-sm text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-200" href="#">
                Privacy
              </a>
              <a className="text-xs sm:text-sm text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-200" href="#">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
