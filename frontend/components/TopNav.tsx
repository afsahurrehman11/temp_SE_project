'use client'

import { Search } from 'lucide-react'
import { NotificationPanel } from '@/components/NotificationPanel'
import { ProfileDropdown } from '@/components/ProfileDropdown'

export function TopNav() {
  return (
    <header className="flex items-center justify-between h-16 px-8 border-b border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark flex-shrink-0">
      <div className="flex-1 max-w-sm">
        <label className="relative text-gray-400 focus-within:text-gray-600 block">
          <Search className="absolute top-1/2 -translate-y-1/2 left-3 w-5 h-5" />
          <input
            className="form-input w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50 border-none bg-black/5 dark:bg-white/5 h-10 placeholder:text-gray-500 px-4 pl-10 text-sm font-normal"
            placeholder="Search for jobs, candidates..."
          />
        </label>
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationPanel />
        <ProfileDropdown />
      </div>
    </header>
  )
}
