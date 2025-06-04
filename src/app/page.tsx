'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  const [isNavigating, setIsNavigating] = useState(false)
  const [particles, setParticles] = useState<Array<{
    id: number;
    left: string;
    top: string;
    animationDelay: string;
    animationDuration: string;
  }>>([])

  // Generate particles on client side only to avoid hydration mismatch
  useEffect(() => {
    const generatedParticles = [...Array(20)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 2}s`
    }))
    setParticles(generatedParticles)
  }, [])

  const handleDashboardClick = () => {
    setIsNavigating(true)
    // Add a longer delay to show the animation before navigation
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Navigation Overlay */}
      {isNavigating && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-spin mx-auto">
              <span className="text-3xl">⚡</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Entering Dashboard...</h3>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.animationDelay,
              animationDuration: particle.animationDuration
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-16 pb-8">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          
          {/* Hero Section */}
          <div className="space-y-8">
            {/* Logo/Brand */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25 animate-pulse">
                  <span className="text-3xl">⚡</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl blur opacity-30 animate-pulse"></div>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent leading-tight">
                James Chong
                <br />
                <span className="text-4xl md:text-6xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Take-Home Assignment
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Comprehensive Fortnite Creative map analytics with real-time player tracking, 
                historical trends, and predictive modeling
              </p>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Badge variant="outline" className="px-4 py-2 text-sm bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-colors">
                <span className="mr-2">📊</span>
                Real-time Analytics
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-colors">
                <span className="mr-2">📈</span>
                Historical Trends
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm bg-yellow-500/10 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20 transition-colors">
                <span className="mr-2">🔮</span>
                Trend Forecasting
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm bg-green-500/10 border-green-500/30 text-green-300 hover:bg-green-500/20 transition-colors">
                <span className="mr-2">👤</span>
                Profile Management
              </Badge>
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-8">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-2xl max-w-md mx-auto">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <span className="text-2xl">🚀</span>
                    Get Started
                  </h2>
                  <p className="text-slate-300 text-center">
                    Access your personalized dashboard to analyze Fortnite Creative maps and manage your gaming profile
                  </p>
                </div>

                <div className="space-y-4">
                  <Button 
                    size="lg" 
                    onClick={handleDashboardClick}
                    disabled={isNavigating}
                    className={`w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105 glow-accent ${
                      isNavigating ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isNavigating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Launching...
                      </>
                    ) : (
                      <>
                        <span className="mr-2 text-xl">⚡</span>
                        Enter Dashboard
                        <span className="ml-2">→</span>
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-slate-400 text-center">
                    Sign in or create an account to get started
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Feature Preview Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <Card className="bg-slate-800/30 border-slate-700/30 backdrop-blur-sm hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto">
                    <span className="text-2xl">🎮</span>
                  </div>
                  <h3 className="font-semibold text-white">Map Analytics</h3>
                  <p className="text-sm text-slate-400">
                    Get detailed insights into any Fortnite Creative map with player counts and trends
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/30 border-slate-700/30 backdrop-blur-sm hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/10">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="font-semibold text-white">Data Visualization</h3>
                  <p className="text-sm text-slate-400">
                    Beautiful charts and graphs showing 30-day trends and monthly statistics
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/30 border-slate-700/30 backdrop-blur-sm hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/10">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto">
                    <span className="text-2xl">🔮</span>
                  </div>
                  <h3 className="font-semibold text-white">Predictive Analytics</h3>
                  <p className="text-sm text-slate-400">
                    Statistical forecasting based on rolling averages, cyclical patterns, and trend analysis
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-12 pb-8">
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span className="text-sm">System Online & Ready</span>
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
