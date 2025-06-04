'use client'

import { useState, useMemo } from 'react'
import { useFortniteStats } from '@/hooks/useFortniteStats'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { forecastPlayerData } from '@/lib/forecasting'

export default function FortniteStats() {
  const [mapCode, setMapCode] = useState('')
  const [showAllDays, setShowAllDays] = useState(false)
  const [showAllMonths, setShowAllMonths] = useState(false)
  const [showForecast, setShowForecast] = useState(true)
  const { stats, loading, error, fetchStats, clearStats } = useFortniteStats()

  // Generate forecast data
  const forecastResult = useMemo(() => {
    if (!stats?.historicalData || stats.historicalData.length < 7) {
      return null
    }
    return forecastPlayerData(stats.historicalData, stats.monthlyData)
  }, [stats?.historicalData, stats?.monthlyData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mapCode.trim()) {
      // Always include all data options for comprehensive analysis
      await fetchStats(mapCode.trim(), true, true)
    }
  }

  const handleClear = () => {
    setMapCode('')
    clearStats()
  }

  const formatPlayerCount = (count: number): string => {
    return count.toLocaleString()
  }

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString()
  }

  const formatGain = (gain: number): string => {
    if (gain > 0) return `+${gain.toLocaleString()}`
    if (gain < 0) return gain.toLocaleString()
    return '-'
  }

  const formatPercent = (percent: number): string => {
    if (percent > 0) return `+${percent.toFixed(1)}%`
    if (percent < 0) return `${percent.toFixed(1)}%`
    return '-'
  }

  const getGainColor = (gain: number): string => {
    if (gain > 0) return 'text-green-400'
    if (gain < 0) return 'text-red-400'
    return 'text-muted-foreground'
  }

  // Prepare daily chart data (reverse to show chronological order)
  const dailyChartData = useMemo(() => {
    if (!stats?.historicalData) return []
    
    const historical = [...stats.historicalData].reverse().map((day, index) => ({
      day: index + 1,
      date: day.date,
      peak: day.peak,
      average: day.average,
      gain: day.gain,
      gainPercent: day.gainPercent,
      avgGain: day.avgGain,
      estimatedEarnings: day.estimatedEarnings,
      shortDate: day.date.split(',')[0],
      isForecasted: false
    }))

    if (showForecast && forecastResult) {
      const forecast = forecastResult.forecastedDays.map((day, index) => ({
        day: historical.length + index + 1,
        date: day.date,
        peak: day.predictedPeak,
        average: day.predictedAverage,
        gain: 0, // Forecast doesn't have gain data
        gainPercent: 0,
        avgGain: 0,
        estimatedEarnings: '', // Forecast doesn't have earnings data
        shortDate: day.date.split(',')[0],
        isForecasted: true,
        confidence: day.confidence
      }))
      
      return [...historical, ...forecast]
    }
    
    return historical
  }, [stats?.historicalData, showForecast, forecastResult])

  // Prepare monthly chart data (reverse to show chronological order)
  const monthlyChartData = useMemo(() => {
    if (!stats?.monthlyData) return []
    
    const historical = [...stats.monthlyData].reverse().map((month, index) => ({
      month: index + 1,
      date: month.month,
      peak: month.peak,
      average: month.average,
      gain: month.gain,
      gainPercent: month.gainPercent,
      avgGain: month.avgGain,
      estimatedEarnings: month.estimatedEarnings,
      shortDate: month.month.split(' ')[0],
      isForecasted: false
    }))

    if (showForecast && forecastResult) {
      const forecast = [{
        month: historical.length + 1,
        date: forecastResult.forecastedMonth.month,
        peak: forecastResult.forecastedMonth.predictedPeak,
        average: forecastResult.forecastedMonth.predictedAverage,
        gain: 0, // Forecast doesn't have gain data
        gainPercent: 0,
        avgGain: 0,
        estimatedEarnings: '', // Forecast doesn't have earnings data
        shortDate: forecastResult.forecastedMonth.month.split(' ')[0],
        isForecasted: true
      }]
      return [...historical, ...forecast]
    }

    return historical
  }, [stats?.monthlyData, forecastResult, showForecast])

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: { 
    active?: boolean; 
    payload?: Array<{ payload: { date: string; peak: number; average: number; isForecasted?: boolean; confidence?: string } }> 
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 shadow-xl">
          <p className="font-semibold text-white mb-2">
            {data.date}
            {data.isForecasted && (
              <Badge variant="outline" className="ml-2 text-xs">
                Forecast
              </Badge>
            )}
          </p>
          <div className="space-y-1">
            <p className="text-purple-400 flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-purple-500 rounded-full"></span>
              Peak: {formatPlayerCount(data.peak)}
            </p>
            <p className="text-cyan-400 flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-cyan-500 rounded-full"></span>
              Average: {formatPlayerCount(data.average)}
            </p>
            {data.isForecasted && data.confidence && (
              <p className="text-yellow-400 text-xs">
                Confidence: {data.confidence}
              </p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  // Debug info
  const isButtonDisabled = loading || !mapCode.trim()

  return (
    <Card className="gaming-card glow-accent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <span className="text-2xl">🎮</span>
          Fortnite Creative Map Insights
        </CardTitle>
        <CardDescription>
          Get real-time player statistics and historical data for any Fortnite Creative map
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mapCode" className="text-base font-medium">
              Map Code
            </Label>
            <div className="flex gap-3">
              <Input
                id="mapCode"
                value={mapCode}
                onChange={(e) => setMapCode(e.target.value)}
                placeholder="e.g., 6155-1398-4059"
                maxLength={14}
                className="gaming-border flex-1"
                pattern="\d{4}-\d{4}-\d{4}"
              />
              <Button
                type="submit"
                disabled={isButtonDisabled}
                className="glow-accent min-w-[120px]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                    Scraping...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>🔍</span>
                    Get Stats
                  </div>
                )}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Enter a Fortnite Creative map code in format XXXX-XXXX-XXXX
            </p>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-destructive text-sm flex items-center gap-2">
              <span>⚠️</span>
              {error.message}
            </p>
          </div>
        )}

        {/* Stats Display */}
        {stats && (
          <div className="space-y-4">
            <Separator />
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span>📊</span>
                  Comprehensive Map Analysis
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="text-xs"
                >
                  Clear
                </Button>
              </div>

              {/* Main Stats Card */}
              <Card className="bg-accent/5 border-accent/20">
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Player Count */}
                    <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {formatPlayerCount(stats.playerCount)}
                      </div>
                      <div className="text-sm text-muted-foreground">Players Right Now</div>
                      {stats.rank && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          Rank {stats.rank}
                        </Badge>
                      )}
                    </div>

                    {/* Map Info */}
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Map Code</Label>
                        <div className="mt-1 p-2 rounded-md bg-muted/50 border">
                          <code className="text-sm font-mono">{stats.mapCode}</code>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                        <div className="mt-1 p-2 rounded-md bg-muted/50 border">
                          <span className="text-sm">{formatTimestamp(stats.scrapedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Map Details Card */}
              {(stats.title || stats.author || (stats.tags && stats.tags.length > 0)) && (
                <Card className="bg-accent/5 border-accent/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span>🗺️</span>
                      Map Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Map Title */}
                    {stats.title && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                        <h2 className="text-xl font-bold text-primary mt-1">{stats.title}</h2>
                      </div>
                    )}

                    {/* Map Author */}
                    {stats.author && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Created By</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-lg">👤</span>
                          <span className="text-base font-medium">{stats.author}</span>
                        </div>
                      </div>
                    )}

                    {/* Map Tags */}
                    {stats.tags && stats.tags.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Tags</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {stats.tags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Historical Data Tabs */}
              {(stats.historicalData || stats.monthlyData) && (
                <Tabs defaultValue="daily" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger 
                      value="daily" 
                      disabled={!stats.historicalData}
                      className="flex items-center gap-2"
                    >
                      <span>📅</span>
                      Daily Trends
                      {stats.historicalData && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {stats.historicalData.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="monthly" 
                      disabled={!stats.monthlyData}
                      className="flex items-center gap-2"
                    >
                      <span>📊</span>
                      Monthly Totals
                      {stats.monthlyData && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {stats.monthlyData.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  {/* Daily View */}
                  <TabsContent value="daily" className="space-y-4">
                    {stats.historicalData && stats.historicalData.length > 0 && (
                      <>
                        {/* Daily Line Chart */}
                        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-white">
                              <span>📈</span>
                              30-Day Player Trends
                            </CardTitle>
                            <CardDescription className="text-slate-300">
                              Peak and average player counts over time
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="h-96 w-full p-4 bg-slate-800/30 rounded-lg">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart 
                                  data={dailyChartData} 
                                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                >
                                  <CartesianGrid 
                                    strokeDasharray="3 3" 
                                    stroke="#334155" 
                                    strokeOpacity={0.3}
                                  />
                                  <XAxis 
                                    dataKey="shortDate" 
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    tick={{ fill: '#94a3b8' }}
                                  />
                                  <YAxis 
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    tick={{ fill: '#94a3b8' }}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                  />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend 
                                    wrapperStyle={{ 
                                      paddingTop: '20px',
                                      color: '#e2e8f0'
                                    }}
                                  />
                                  
                                  {/* Reference line to separate historical from forecast */}
                                  {showForecast && forecastResult && stats?.historicalData && (
                                    <ReferenceLine 
                                      x={stats.historicalData.length} 
                                      stroke="#fbbf24" 
                                      strokeDasharray="5 5"
                                      strokeOpacity={0.6}
                                    />
                                  )}
                                  
                                  {/* Historical data lines */}
                                  <Line 
                                    type="monotone" 
                                    dataKey="peak" 
                                    stroke="#a855f7" 
                                    strokeWidth={3}
                                    dot={{ 
                                      fill: "#a855f7", 
                                      strokeWidth: 2, 
                                      r: 6,
                                      stroke: "#1e293b"
                                    }}
                                    activeDot={{ 
                                      r: 8, 
                                      fill: "#a855f7",
                                      stroke: "#1e293b",
                                      strokeWidth: 2
                                    }}
                                    name="Peak Players"
                                  />
                                  
                                  {/* Forecasted peak line */}
                                  {showForecast && (
                                    <Line 
                                      type="monotone" 
                                      dataKey="peak" 
                                      stroke="#a855f7" 
                                      strokeWidth={2}
                                      strokeDasharray="8 4"
                                      strokeOpacity={0.7}
                                      dot={{ 
                                        fill: "#a855f7", 
                                        strokeWidth: 1, 
                                        r: 4,
                                        stroke: "#1e293b"
                                      }}
                                      name="Forecasted Peak"
                                    />
                                  )}
                                  
                                  <Line 
                                    type="monotone" 
                                    dataKey="average" 
                                    stroke="#06b6d4" 
                                    strokeWidth={3}
                                    dot={{ 
                                      fill: "#06b6d4", 
                                      strokeWidth: 2, 
                                      r: 6,
                                      stroke: "#1e293b"
                                    }}
                                    activeDot={{ 
                                      r: 8, 
                                      fill: "#06b6d4",
                                      stroke: "#1e293b",
                                      strokeWidth: 2
                                    }}
                                    name="Average Players"
                                  />
                                  
                                  {/* Forecasted average line */}
                                  {showForecast && (
                                    <Line 
                                      type="monotone" 
                                      dataKey="average" 
                                      stroke="#06b6d4" 
                                      strokeWidth={2}
                                      strokeDasharray="8 4"
                                      strokeOpacity={0.7}
                                      dot={{ 
                                        fill: "#06b6d4", 
                                        strokeWidth: 1, 
                                        r: 4,
                                        stroke: "#1e293b"
                                      }}
                                      name="Forecasted Average"
                                    />
                                  )}
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                            
                            {/* Daily Chart Legend with Stats */}
                            <div className="mt-6 grid grid-cols-2 gap-4">
                              <div className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                  <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                                  <span className="text-sm font-medium text-purple-400">Peak Players</span>
                                </div>
                                <div className="text-lg font-bold text-white">
                                  {formatPlayerCount(Math.max(...dailyChartData.filter(d => !d.isForecasted).map(d => d.peak)))}
                                </div>
                                <div className="text-xs text-slate-400">Highest recorded</div>
                              </div>
                              
                              <div className="text-center p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                  <span className="w-3 h-3 bg-cyan-500 rounded-full"></span>
                                  <span className="text-sm font-medium text-cyan-400">Average Players</span>
                                </div>
                                <div className="text-lg font-bold text-white">
                                  {formatPlayerCount(Math.round(dailyChartData.filter(d => !d.isForecasted).reduce((sum, d) => sum + d.average, 0) / dailyChartData.filter(d => !d.isForecasted).length))}
                                </div>
                                <div className="text-xs text-slate-400">30-day average</div>
                              </div>
                            </div>

                            {/* Forecast Methodology */}
                            {showForecast && forecastResult && (
                              <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <h4 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                                  <span>🔮</span>
                                  Enhanced Forecast Methodology
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-300">
                                  <div>
                                    <div className="font-medium text-white mb-1">7-Day Base</div>
                                    <div>Peak: {formatPlayerCount(forecastResult.methodology.rollingAverageBase.peak)}</div>
                                    <div>Avg: {formatPlayerCount(forecastResult.methodology.rollingAverageBase.average)}</div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-white mb-1">Monthly Trend</div>
                                    <div>Peak: {forecastResult.methodology.monthlyTrendAdjustment.peakTrendPercent.toFixed(1)}%</div>
                                    <div>Avg: {forecastResult.methodology.monthlyTrendAdjustment.averageTrendPercent.toFixed(1)}%</div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-white mb-1">Weekly Patterns</div>
                                    <div>Variation: {(forecastResult.methodology.cyclicalPatterns.weeklyVariation * 100).toFixed(1)}%</div>
                                    <div className="text-xs text-slate-400">
                                      {forecastResult.methodology.cyclicalPatterns.weeklyVariation > 0.2 ? 'Strong' : 
                                       forecastResult.methodology.cyclicalPatterns.weeklyVariation > 0.1 ? 'Moderate' : 'Weak'} cycles
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-white mb-1">Confidence</div>
                                    <div>{forecastResult.methodology.confidence}</div>
                                  </div>
                                </div>
                                
                                {/* Day of Week Multipliers */}
                                <div className="mt-4 pt-3 border-t border-yellow-500/20">
                                  <div className="font-medium text-white mb-2 text-xs">Day-of-Week Multipliers:</div>
                                  <div className="grid grid-cols-7 gap-1 text-xs">
                                    {Object.entries(forecastResult.methodology.cyclicalPatterns.dayOfWeekMultipliers).map(([day, multipliers]) => (
                                      <div key={day} className="text-center p-1 rounded bg-slate-800/50">
                                        <div className="font-medium text-white text-xs">{day.slice(0, 3)}</div>
                                        <div className="text-purple-400">{multipliers.peak.toFixed(2)}</div>
                                        <div className="text-cyan-400">{multipliers.average.toFixed(2)}</div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="text-xs text-slate-400 mt-1">
                                    Purple: Peak multiplier, Cyan: Average multiplier
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Daily Data Table */}
                        <Card className="bg-accent/5 border-accent/20">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <span>📋</span>
                              Daily Statistics 
                              {stats.historicalData && (
                                <span>
                                  ({stats.historicalData.length} days
                                  {showForecast && forecastResult && (
                                    <span className="text-yellow-400"> + 30 forecasted</span>
                                  )})
                                </span>
                              )}
                            </CardTitle>
                            <CardDescription>
                              Detailed daily player statistics
                              {showForecast && forecastResult && (
                                <span className="text-yellow-400"> with 30-day forecast</span>
                              )}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {/* Show All Toggle */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id="showAllDays"
                                    checked={showAllDays}
                                    onChange={(e) => setShowAllDays(e.target.checked)}
                                    className="rounded border-gray-300"
                                  />
                                  <Label htmlFor="showAllDays" className="text-sm cursor-pointer">
                                    Show all {dailyChartData.length} days
                                  </Label>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {showAllDays ? `All ${dailyChartData.length}` : `Top 10 of ${dailyChartData.length}`} days
                                </Badge>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-border/50">
                                      <th className="text-left p-2 font-medium">Date</th>
                                      <th className="text-right p-2 font-medium">Peak</th>
                                      <th className="text-right p-2 font-medium">Gain</th>
                                      <th className="text-right p-2 font-medium">% Gain</th>
                                      <th className="text-right p-2 font-medium">Average</th>
                                      <th className="text-right p-2 font-medium">Avg Gain</th>
                                      <th className="text-right p-2 font-medium">Earnings</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(showAllDays ? dailyChartData : dailyChartData.slice(0, 10)).map((day, index) => (
                                      <tr 
                                        key={index} 
                                        className={`border-b border-border/20 hover:bg-muted/20 ${
                                          day.isForecasted ? 'bg-yellow-500/5' : ''
                                        }`}
                                      >
                                        <td className="p-2 font-medium">
                                          {day.date}
                                          {day.isForecasted && (
                                            <Badge variant="outline" className="ml-2 text-xs">
                                              Forecast
                                            </Badge>
                                          )}
                                        </td>
                                        <td className="p-2 text-right font-mono">{formatPlayerCount(day.peak)}</td>
                                        <td className={`p-2 text-right font-mono ${day.isForecasted ? 'text-muted-foreground' : getGainColor(day.gain)}`}>
                                          {day.isForecasted ? '-' : formatGain(day.gain)}
                                        </td>
                                        <td className={`p-2 text-right font-mono ${day.isForecasted ? 'text-muted-foreground' : getGainColor(day.gainPercent)}`}>
                                          {day.isForecasted ? '-' : formatPercent(day.gainPercent)}
                                        </td>
                                        <td className="p-2 text-right font-mono">{formatPlayerCount(day.average)}</td>
                                        <td className={`p-2 text-right font-mono ${day.isForecasted ? 'text-muted-foreground' : getGainColor(day.avgGain)}`}>
                                          {day.isForecasted ? '-' : formatGain(day.avgGain)}
                                        </td>
                                        <td className="p-2 text-right text-xs font-mono">
                                          {day.isForecasted ? '-' : (day.estimatedEarnings || '-')}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </TabsContent>

                  {/* Monthly View */}
                  <TabsContent value="monthly" className="space-y-4">
                    {stats.monthlyData && stats.monthlyData.length > 0 && (
                      <>
                        {/* Monthly Line Chart */}
                        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-white">
                              <span>📊</span>
                              Monthly Player Trends
                            </CardTitle>
                            <CardDescription className="text-slate-300">
                              Monthly peak and average player counts
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="h-96 w-full p-4 bg-slate-800/30 rounded-lg">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart 
                                  data={monthlyChartData} 
                                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                >
                                  <CartesianGrid 
                                    strokeDasharray="3 3" 
                                    stroke="#334155" 
                                    strokeOpacity={0.3}
                                  />
                                  <XAxis 
                                    dataKey="shortDate" 
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    tick={{ fill: '#94a3b8' }}
                                  />
                                  <YAxis 
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    tick={{ fill: '#94a3b8' }}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                  />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend 
                                    wrapperStyle={{ 
                                      paddingTop: '20px',
                                      color: '#e2e8f0'
                                    }}
                                  />
                                  
                                  {/* Reference line to separate historical from forecast */}
                                  {showForecast && forecastResult && stats?.monthlyData && (
                                    <ReferenceLine 
                                      x={stats.monthlyData.length} 
                                      stroke="#fbbf24" 
                                      strokeDasharray="5 5"
                                      strokeOpacity={0.6}
                                    />
                                  )}
                                  
                                  <Line 
                                    type="monotone" 
                                    dataKey="peak" 
                                    stroke="#a855f7" 
                                    strokeWidth={3}
                                    dot={{ 
                                      fill: "#a855f7", 
                                      strokeWidth: 2, 
                                      r: 6,
                                      stroke: "#1e293b"
                                    }}
                                    activeDot={{ 
                                      r: 8, 
                                      fill: "#a855f7",
                                      stroke: "#1e293b",
                                      strokeWidth: 2
                                    }}
                                    name="Peak Players"
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="average" 
                                    stroke="#06b6d4" 
                                    strokeWidth={3}
                                    dot={{ 
                                      fill: "#06b6d4", 
                                      strokeWidth: 2, 
                                      r: 6,
                                      stroke: "#1e293b"
                                    }}
                                    activeDot={{ 
                                      r: 8, 
                                      fill: "#06b6d4",
                                      stroke: "#1e293b",
                                      strokeWidth: 2
                                    }}
                                    name="Average Players"
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                            
                            {/* Monthly Chart Legend with Stats */}
                            <div className="mt-6 grid grid-cols-2 gap-4">
                              <div className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                  <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                                  <span className="text-sm font-medium text-purple-400">Peak Players</span>
                                </div>
                                <div className="text-lg font-bold text-white">
                                  {formatPlayerCount(Math.max(...monthlyChartData.filter(d => !d.isForecasted).map(d => d.peak)))}
                                </div>
                                <div className="text-xs text-slate-400">Highest monthly peak</div>
                                {showForecast && forecastResult && (
                                  <div className="text-xs text-yellow-400 mt-1">
                                    Next: {formatPlayerCount(forecastResult.forecastedMonth.predictedPeak)}
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-center p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                  <span className="w-3 h-3 bg-cyan-500 rounded-full"></span>
                                  <span className="text-sm font-medium text-cyan-400">Average Players</span>
                                </div>
                                <div className="text-lg font-bold text-white">
                                  {formatPlayerCount(Math.round(monthlyChartData.filter(d => !d.isForecasted).reduce((sum, d) => sum + d.average, 0) / monthlyChartData.filter(d => !d.isForecasted).length))}
                                </div>
                                <div className="text-xs text-slate-400">Overall monthly average</div>
                                {showForecast && forecastResult && (
                                  <div className="text-xs text-yellow-400 mt-1">
                                    Next: {formatPlayerCount(forecastResult.forecastedMonth.predictedAverage)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Monthly Data Table */}
                        <Card className="bg-accent/5 border-accent/20">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <span>📋</span>
                              Monthly Statistics 
                              {stats.monthlyData && (
                                <span>
                                  ({stats.monthlyData.length} months
                                  {showForecast && forecastResult && (
                                    <span className="text-yellow-400"> + 1 forecasted</span>
                                  )})
                                </span>
                              )}
                            </CardTitle>
                            <CardDescription>
                              Detailed monthly player statistics
                              {showForecast && forecastResult && (
                                <span className="text-yellow-400"> with next month forecast</span>
                              )}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {/* Show All Toggle */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id="showAllMonths"
                                    checked={showAllMonths}
                                    onChange={(e) => setShowAllMonths(e.target.checked)}
                                    className="rounded border-gray-300"
                                  />
                                  <Label htmlFor="showAllMonths" className="text-sm cursor-pointer">
                                    Show all {monthlyChartData.length} months
                                  </Label>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {showAllMonths ? `All ${monthlyChartData.length}` : `Recent 6 of ${monthlyChartData.length}`} months
                                </Badge>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-border/50">
                                      <th className="text-left p-2 font-medium">Month</th>
                                      <th className="text-right p-2 font-medium">Peak</th>
                                      <th className="text-right p-2 font-medium">Gain</th>
                                      <th className="text-right p-2 font-medium">% Gain</th>
                                      <th className="text-right p-2 font-medium">Average</th>
                                      <th className="text-right p-2 font-medium">Avg Gain</th>
                                      <th className="text-right p-2 font-medium">Earnings</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(showAllMonths ? monthlyChartData : monthlyChartData.slice(0, 6)).map((month, index) => (
                                      <tr 
                                        key={index} 
                                        className={`border-b border-border/20 hover:bg-muted/20 ${
                                          month.isForecasted ? 'bg-yellow-500/5' : ''
                                        }`}
                                      >
                                        <td className="p-2 font-medium">
                                          {month.date}
                                          {month.isForecasted && (
                                            <Badge variant="outline" className="ml-2 text-xs">
                                              Forecast
                                            </Badge>
                                          )}
                                        </td>
                                        <td className="p-2 text-right font-mono">{formatPlayerCount(month.peak)}</td>
                                        <td className={`p-2 text-right font-mono ${month.isForecasted ? 'text-muted-foreground' : getGainColor(month.gain)}`}>
                                          {month.isForecasted ? '-' : formatGain(month.gain)}
                                        </td>
                                        <td className={`p-2 text-right font-mono ${month.isForecasted ? 'text-muted-foreground' : getGainColor(month.gainPercent)}`}>
                                          {month.isForecasted ? '-' : formatPercent(month.gainPercent)}
                                        </td>
                                        <td className="p-2 text-right font-mono">{formatPlayerCount(month.average)}</td>
                                        <td className={`p-2 text-right font-mono ${month.isForecasted ? 'text-muted-foreground' : getGainColor(month.avgGain)}`}>
                                          {month.isForecasted ? '-' : formatGain(month.avgGain)}
                                        </td>
                                        <td className="p-2 text-right text-xs font-mono">
                                          {month.isForecasted ? '-' : (month.estimatedEarnings || '-')}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2 pt-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchStats(stats.mapCode, true, true)}
                  disabled={loading}
                  className="text-xs"
                >
                  <span className="mr-1">🔄</span>
                  Refresh Analysis
                </Button>
                {forecastResult && (
                  <Button
                    variant={showForecast ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowForecast(!showForecast)}
                    className="text-xs"
                  >
                    <span className="mr-1">🔮</span>
                    {showForecast ? 'Hide' : 'Show'} Forecast
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = `https://fortnite.gg/island?code=${stats.mapCode}`
                    window.open(url, '_blank')
                  }}
                  className="text-xs"
                >
                  <span className="mr-1">🔗</span>
                  View on Fortnite.gg
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!stats && !loading && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-sm">
              Enter a Fortnite Creative map code above to get comprehensive analysis
            </p>
            <p className="text-xs mt-2 opacity-75">
              Includes real-time stats, 30-day historical data, monthly trends, and forecasting
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 