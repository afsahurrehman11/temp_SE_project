'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Upload, 
  Briefcase, 
  BarChart3, 
  Settings,
  Search,
  Star,
  HelpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

function Logo() {
  return (
    <div className="size-6 text-primary">
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
  )
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Search', href: '/jobs', icon: Search },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Favorites', href: '/favorites', icon: Star },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex-shrink-0 bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark flex flex-col">
      <div className="flex items-center gap-2 h-16 px-6 border-b border-border-light dark:border-border-dark">
        <Logo />
        <h1 className="text-lg font-bold text-text-light dark:text-text-dark">
          ResumeMatch AI
        </h1>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="flex flex-col gap-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
