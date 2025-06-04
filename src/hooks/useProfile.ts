'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Profile {
  id: string
  displayName: string | null
  bio: string | null
  createdAt: string
  updatedAt: string
}

export interface ProfileUpdateData {
  displayName?: string
  bio?: string
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Not authenticated')
        return
      }

      const response = await fetch('/api/profile')
      
      if (!response.ok) {
        if (response.status === 404) {
          // Profile doesn't exist yet, that's okay
          setProfile(null)
          return
        }
        throw new Error(`Failed to fetch profile: ${response.status}`)
      }

      const responseData = await response.json()
      setProfile(responseData.profile)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const updateProfile = async (updateData: ProfileUpdateData): Promise<boolean> => {
    try {
      setError(null)

      // Optimistic update
      const previousProfile = profile
      if (profile) {
        setProfile({
          ...profile,
          ...updateData,
          updatedAt: new Date().toISOString(),
        })
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        // Revert optimistic update on error
        setProfile(previousProfile)
        
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to update profile: ${response.status}`)
      }

      const responseData = await response.json()
      setProfile(responseData.profile)
      return true
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      return false
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  }
} 