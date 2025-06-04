import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function TestSupabase() {
  const supabase = createClient()
  
  try {
    // Test the connection by trying to select from profiles table
    const { error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <Card className="gaming-card border-destructive/50 bg-destructive/5">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3 text-destructive">
                  <span className="text-3xl">❌</span>
                  Connection Failed
                </CardTitle>
                <CardDescription className="text-lg">
                  Supabase database connection could not be established
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-destructive text-sm font-mono break-all">
                    Error: {error.message}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Troubleshooting Checklist:</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full"></span>
                      Created your .env.local file with correct credentials
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full"></span>
                      Set up the profiles table in Supabase
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full"></span>
                      Enabled Row Level Security
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button asChild variant="outline">
                    <Link href="/">
                      ← Back to Home
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <Card className="gaming-card glow-accent">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3 text-accent">
                <span className="text-3xl">✅</span>
                Connection Successful
              </CardTitle>
              <CardDescription className="text-lg">
                Your Supabase setup is working perfectly
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center gap-2">
                  <Badge variant="outline" className="glow-accent">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full mr-1"></span>
                    Database Connected
                  </Badge>
                  <Badge variant="outline" className="glow-primary">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mr-1"></span>
                    Tables Ready
                  </Badge>
                </div>
                
                <p className="text-muted-foreground">
                  All systems are operational and ready for gaming profiles
                </p>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <Button asChild className="glow-primary">
                  <Link href="/login">
                    <span className="mr-2">🎮</span>
                    Start Gaming
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="glow-accent">
                  <Link href="/dashboard">
                    <span className="mr-2">⚡</span>
                    Go to Dashboard
                  </Link>
                </Button>
              </div>
              
              <div className="text-center">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/">
                    ← Back to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <Card className="gaming-card border-destructive/50 bg-destructive/5">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3 text-destructive">
                <span className="text-3xl">⚠️</span>
                System Error
              </CardTitle>
              <CardDescription className="text-lg">
                An unexpected error occurred during connection test
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-destructive text-sm font-mono break-all">
                  Error: {String(error)}
                </p>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Check your environment variables and Supabase setup.</p>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link href="/">
                    ← Back to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
} 