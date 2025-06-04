import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for profile updates
const profileUpdateSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(200).optional(),
})

// GET /api/profile - Fetch user's profile
export async function GET() {
  try {
    const supabase = createClient()
    
    // Get the current user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      // If profile doesn't exist, return 404
      if (profileError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        )
      }
      
      // Other database errors
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        displayName: profile.display_name,
        bio: profile.bio,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      }
    })

  } catch (error) {
    console.error('GET /api/profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/profile - Create or update user's profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Validate the input data
    const validationResult = profileUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    const { displayName, bio } = validationResult.data

    // Prepare the data for upsert
    const profileData = {
      id: session.user.id,
      ...(displayName !== undefined && { display_name: displayName }),
      ...(bio !== undefined && { bio }),
    }

    // Upsert the profile (insert or update)
    const { data: profile, error: upsertError } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id',
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (upsertError) {
      console.error('Profile upsert error:', upsertError)
      
      // Handle specific constraint violations
      if (upsertError.code === '23514') {
        return NextResponse.json(
          { error: 'Bio must be 200 characters or less' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to save profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        displayName: profile.display_name,
        bio: profile.bio,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      }
    })

  } catch (error) {
    console.error('PUT /api/profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 