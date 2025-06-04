'use client'

import { useState, useCallback } from 'react'

export interface DailyStats {
  date: string
  peak: number
  gain: number
  gainPercent: number
  average: number
  avgGain: number
  avgGainPercent: number
  estimatedEarnings: string
}

export interface MonthlyStats {
  month: string
  peak: number
  gain: number
  gainPercent: number
  average: number
  avgGain: number
  avgGainPercent: number
  estimatedEarnings: string
}

export interface FortniteStats {
  mapCode: string
  playerCount: number
  rank?: string
  title?: string
  author?: string
  tags?: string[]
  scrapedAt: string
  historicalData?: DailyStats[]
  monthlyData?: MonthlyStats[]
}

export interface FortniteStatsError {
  message: string
  status?: number
}

export function useFortniteStats() {
  const [stats, setStats] = useState<FortniteStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<FortniteStatsError | null>(null)

  const fetchStats = useCallback(async (
    mapCode: string, 
    includeHistory: boolean = false, 
    includeYearly: boolean = false
  ): Promise<boolean> => {
    if (!mapCode.trim()) {
      setError({ message: 'Map code is required' })
      return false
    }

    setLoading(true)
    setError(null)
    setStats(null)

    try {
      const historyParam = includeHistory ? '&history=true' : ''
      const yearlyParam = includeYearly ? '&yearly=true' : ''
      const response = await fetch(`/api/fortnite-stats?code=${encodeURIComponent(mapCode.trim())}${historyParam}${yearlyParam}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Request failed with status ${response.status}`)
      }

      const statsData: FortniteStats = await response.json()
      setStats(statsData)
      return true

    } catch (err) {
      console.error('Error fetching Fortnite stats:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats'
      setError({
        message: errorMessage,
        status: undefined
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const clearStats = useCallback(() => {
    setStats(null)
    setError(null)
  }, [])

  return {
    stats,
    loading,
    error,
    fetchStats,
    clearStats,
  }
} 