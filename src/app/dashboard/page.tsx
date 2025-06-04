import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'
import ProfileForm from './ProfileForm'
import FortniteStats from './FortniteStats'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default async function DashboardPage() {
  const supabase = createClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Card className="gaming-card glow-accent mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold flex items-center gap-3">
                  <span className="text-3xl">⚡</span>
                  Dashboard
                </CardTitle>
                <CardDescription className="text-lg">
                  Welcome back, <span className="text-accent font-semibold">{session.user.email}</span>
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                  <span className="text-sm text-muted-foreground">System Online</span>
                </div>
              </div>
              <LogoutButton />
            </div>
          </CardHeader>
        </Card>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Management - Takes 2 columns */}
          <div className="lg:col-span-2">
            <ProfileForm />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="gaming-card border-accent/50 bg-accent/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-xl">✅</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-accent">System Status: Operational</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Authentication & Profile Management are fully functional
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <span className="w-1.5 h-1.5 bg-accent rounded-full mr-1"></span>
                        Auth Active
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-1"></span>
                        DB Connected
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Fortnite Stats Section - Full Width */}
        <div className="mt-8">
          <FortniteStats />
        </div>
      </div>
    </div>
  )
}

// Helper component for labels
function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`block text-sm font-medium ${className}`}>{children}</div>
} 