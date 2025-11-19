import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  icon: ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

export function StatsCard({ title, value, change, icon, trend = 'neutral' }: StatsCardProps) {
  return (
    <div className="glassmorphism-card rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-text-light dark:text-text-dark mt-2">
            {value}
          </p>
          {change && (
            <p className={cn(
              'text-sm mt-1',
              trend === 'up' && 'text-secondary',
              trend === 'down' && 'text-red-500',
              trend === 'neutral' && 'text-gray-500'
            )}>
              {change}
            </p>
          )}
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  )
}
