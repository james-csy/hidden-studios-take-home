'use client'

import { useState, useEffect } from 'react'
import { useProfile, type ProfileUpdateData } from '@/hooks/useProfile'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export default function ProfileForm() {
  const { profile, loading, error, updateProfile } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
      })
    }
  }, [profile])

  const handleEdit = () => {
    setIsEditing(true)
    setSubmitError(null)
    setSubmitSuccess(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSubmitError(null)
    setSubmitSuccess(false)
    // Reset form data to original profile values
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    const updateData: ProfileUpdateData = {}
    
    // Only include fields that have changed
    if (formData.displayName !== (profile?.displayName || '')) {
      updateData.displayName = formData.displayName || undefined
    }
    if (formData.bio !== (profile?.bio || '')) {
      updateData.bio = formData.bio || undefined
    }

    // If nothing changed, just exit edit mode
    if (Object.keys(updateData).length === 0) {
      setIsSubmitting(false)
      setIsEditing(false)
      return
    }

    const success = await updateProfile(updateData)
    
    if (success) {
      setSubmitSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSubmitSuccess(false), 3000)
    } else {
      setSubmitError('Failed to update profile. Please try again.')
    }
    
    setIsSubmitting(false)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear errors when user starts typing
    if (submitError) setSubmitError(null)
  }

  if (loading) {
    return (
      <Card className="gaming-card">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-24 bg-muted rounded"></div>
            </div>
            <div className="h-10 bg-muted rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="gaming-card glow-primary">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <span className="text-2xl">👤</span>
              Profile Information
            </CardTitle>
            <CardDescription>
              {isEditing ? 'Edit your profile information' : 'Your profile details'}
            </CardDescription>
          </div>
          {!isEditing && (
            <Button onClick={handleEdit} variant="outline" size="sm">
              <span className="mr-2">✏️</span>
              Edit
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-6 p-4 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-destructive text-sm flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </p>
          </div>
        )}

        {submitSuccess && (
          <div className="mb-6 p-4 rounded-md bg-accent/10 border border-accent/20">
            <p className="text-accent text-sm flex items-center gap-2">
              <span>✅</span>
              Profile updated successfully!
            </p>
          </div>
        )}

        {isEditing ? (
          // Edit Mode
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-base font-medium">
                Display Name
              </Label>
              <Input
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                maxLength={50}
                placeholder="Enter your display name"
                className="gaming-border"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Your public display name
                </p>
                <Badge variant="outline" className="text-xs">
                  {formData.displayName.length}/50
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-base font-medium">
                Bio
              </Label>
              <Textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleInputChange}
                maxLength={200}
                placeholder="Tell others about yourself..."
                className="gaming-border resize-none"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Share your story and interests
                </p>
                <Badge variant="outline" className="text-xs">
                  {formData.bio.length}/200
                </Badge>
              </div>
            </div>

            {submitError && (
              <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-destructive text-sm flex items-center gap-2">
                  <span>⚠️</span>
                  {submitError}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="glow-primary"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>💾</span>
                    Save Changes
                  </div>
                )}
              </Button>
            </div>
          </form>
        ) : (
          // Display Mode
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-medium">Display Name</Label>
              <div className="p-3 rounded-md bg-muted/50 border min-h-[2.5rem] flex items-center">
                {profile?.displayName ? (
                  <span className="text-foreground">{profile.displayName}</span>
                ) : (
                  <span className="text-muted-foreground italic">No display name set</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Bio</Label>
              <div className="p-3 rounded-md bg-muted/50 border min-h-[6rem] flex items-start">
                {profile?.bio ? (
                  <span className="text-foreground whitespace-pre-wrap">{profile.bio}</span>
                ) : (
                  <span className="text-muted-foreground italic">No bio added yet</span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {profile ? (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                    Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full"></span>
                    No profile created yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 