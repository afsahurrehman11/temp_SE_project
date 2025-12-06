'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { MatchesAnalytics } from '@/lib/api'

interface MatchQualityChartProps {
    data: MatchesAnalytics | null
}

export function MatchQualityChart({ data }: MatchQualityChartProps) {
    if (!data || data.total_matches === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
                No match data available
            </div>
        )
    }

    const chartData = [
        { name: 'High (>70%)', value: data.high_matches, color: '#22c55e' },
        { name: 'Medium (40-70%)', value: data.medium_matches, color: '#eab308' },
        { name: 'Low (<40%)', value: data.low_matches, color: '#ef4444' },
    ].filter(item => item.value > 0)

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                />
                <Legend verticalAlign="bottom" height={36} />
            </PieChart>
        </ResponsiveContainer>
    )
}
