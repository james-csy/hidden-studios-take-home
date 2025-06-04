import { DailyStats, MonthlyStats } from '@/hooks/useFortniteStats'

export interface ForecastedDay {
  date: string
  predictedPeak: number
  predictedAverage: number
  confidence: 'high' | 'medium' | 'low'
  isForecasted: true
}

export interface ForecastResult {
  forecastedDays: ForecastedDay[]
  forecastedMonth: {
    month: string
    predictedPeak: number
    predictedAverage: number
    totalDays: number
  }
  methodology: {
    rollingAverageBase: {
      peak: number
      average: number
    }
    monthlyTrendAdjustment: {
      peakTrendPercent: number
      averageTrendPercent: number
    }
    cyclicalPatterns: {
      dayOfWeekMultipliers: Record<string, { peak: number; average: number }>
      weeklyVariation: number
    }
    confidence: string
  }
}

/**
 * Analyzes day-of-week patterns from historical data
 */
function analyzeCyclicalPatterns(dailyData: DailyStats[]) {
  const dayOfWeekData: Record<string, { peaks: number[]; averages: number[] }> = {
    'Sunday': { peaks: [], averages: [] },
    'Monday': { peaks: [], averages: [] },
    'Tuesday': { peaks: [], averages: [] },
    'Wednesday': { peaks: [], averages: [] },
    'Thursday': { peaks: [], averages: [] },
    'Friday': { peaks: [], averages: [] },
    'Saturday': { peaks: [], averages: [] }
  }

  // Group data by day of week
  dailyData.forEach(day => {
    const date = new Date(day.date)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    
    if (dayOfWeekData[dayName]) {
      dayOfWeekData[dayName].peaks.push(day.peak)
      dayOfWeekData[dayName].averages.push(day.average)
    }
  })

  // Calculate overall averages
  const allPeaks = dailyData.map(d => d.peak)
  const allAverages = dailyData.map(d => d.average)
  const overallPeakAvg = allPeaks.reduce((sum, val) => sum + val, 0) / allPeaks.length
  const overallAvgAvg = allAverages.reduce((sum, val) => sum + val, 0) / allAverages.length

  // Calculate day-of-week multipliers
  const dayOfWeekMultipliers: Record<string, { peak: number; average: number }> = {}
  let totalVariation = 0

  Object.entries(dayOfWeekData).forEach(([dayName, data]) => {
    if (data.peaks.length > 0) {
      const dayPeakAvg = data.peaks.reduce((sum, val) => sum + val, 0) / data.peaks.length
      const dayAvgAvg = data.averages.reduce((sum, val) => sum + val, 0) / data.averages.length
      
      const peakMultiplier = dayPeakAvg / overallPeakAvg
      const avgMultiplier = dayAvgAvg / overallAvgAvg
      
      dayOfWeekMultipliers[dayName] = {
        peak: peakMultiplier,
        average: avgMultiplier
      }
      
      // Calculate variation for confidence
      totalVariation += Math.abs(peakMultiplier - 1) + Math.abs(avgMultiplier - 1)
    } else {
      // Default to 1.0 if no data for this day
      dayOfWeekMultipliers[dayName] = { peak: 1.0, average: 1.0 }
    }
  })

  const weeklyVariation = totalVariation / 14 // 7 days * 2 metrics

  return { dayOfWeekMultipliers, weeklyVariation }
}

/**
 * Applies trend decay - recent trends have more influence than older ones
 */
function calculateTrendWithDecay(dailyData: DailyStats[], days: number = 14) {
  if (dailyData.length < days) return { peakTrend: 0, averageTrend: 0 }

  const recent = dailyData.slice(0, days)
  let peakTrendSum = 0
  let avgTrendSum = 0
  let weightSum = 0

  for (let i = 1; i < recent.length; i++) {
    const weight = 1 / i // More recent days have higher weight
    
    // Prevent division by zero and extreme values
    const prevPeak = recent[i].peak || 1
    const prevAvg = recent[i].average || 1
    
    const peakChange = (recent[i-1].peak - recent[i].peak) / prevPeak
    const avgChange = (recent[i-1].average - recent[i].average) / prevAvg
    
    // Cap extreme changes to prevent unrealistic forecasts
    const cappedPeakChange = Math.max(-0.5, Math.min(0.5, peakChange))
    const cappedAvgChange = Math.max(-0.5, Math.min(0.5, avgChange))
    
    peakTrendSum += cappedPeakChange * weight
    avgTrendSum += cappedAvgChange * weight
    weightSum += weight
  }

  return {
    peakTrend: peakTrendSum / weightSum,
    averageTrend: avgTrendSum / weightSum
  }
}

/**
 * Improved forecasting with cyclical pattern recognition
 */
export function forecastPlayerData(
  dailyData: DailyStats[],
  monthlyData?: MonthlyStats[]
): ForecastResult | null {
  if (!dailyData || dailyData.length < 7) {
    return null // Need at least 7 days for rolling average
  }

  // Sort daily data by date (most recent first)
  const sortedDailyData = [...dailyData].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Analyze cyclical patterns
  const cyclicalPatterns = analyzeCyclicalPatterns(sortedDailyData)

  // Calculate 7-day rolling average from most recent data
  const last7Days = sortedDailyData.slice(0, 7)
  const rollingAverageBase = {
    peak: Math.round(last7Days.reduce((sum, day) => sum + day.peak, 0) / 7),
    average: Math.round(last7Days.reduce((sum, day) => sum + day.average, 0) / 7)
  }

  // Debug: Log the base values to understand what we're working with
  console.log('Forecasting Debug:', {
    totalDays: sortedDailyData.length,
    last7Days: last7Days.map(d => ({ date: d.date, peak: d.peak, average: d.average })),
    rollingAverageBase,
    monthlyDataAvailable: monthlyData ? monthlyData.length : 0
  })

  // Calculate recent trend with decay
  const recentTrend = calculateTrendWithDecay(sortedDailyData, 14)

  // Calculate monthly trend adjustment
  const monthlyTrendAdjustment = {
    peakTrendPercent: 0,
    averageTrendPercent: 0
  }

  let confidence: 'high' | 'medium' | 'low' = 'medium'
  let finalMonthlyTrendAdjustment = monthlyTrendAdjustment

  if (monthlyData && monthlyData.length >= 2) {
    // Sort monthly data by date (most recent first)
    const sortedMonthlyData = [...monthlyData].sort((a, b) => 
      new Date(b.month).getTime() - new Date(a.month).getTime()
    )

    const lastMonth = sortedMonthlyData[0]
    const previousMonth = sortedMonthlyData[1]

    // Calculate percent change between last two months
    if (previousMonth.peak > 0 && previousMonth.average > 0) {
      const rawPeakTrend = ((lastMonth.peak - previousMonth.peak) / previousMonth.peak) * 100
      const rawAvgTrend = ((lastMonth.average - previousMonth.average) / previousMonth.average) * 100
      
      // Cap monthly trends to prevent extreme forecasts (max ±50% change)
      finalMonthlyTrendAdjustment = {
        peakTrendPercent: Math.max(-50, Math.min(50, rawPeakTrend)),
        averageTrendPercent: Math.max(-50, Math.min(50, rawAvgTrend))
      }
      
      confidence = 'high' // We have monthly trend data
    }
  } else {
    confidence = 'low' // No monthly trend data available
  }

  // Adjust confidence based on cyclical pattern strength
  if (cyclicalPatterns.weeklyVariation > 0.3) {
    confidence = confidence === 'high' ? 'high' : 'medium' // Strong patterns increase confidence
  } else if (cyclicalPatterns.weeklyVariation < 0.1) {
    confidence = confidence === 'high' ? 'medium' : 'low' // Weak patterns decrease confidence
  }

  // Generate forecasted days
  const forecastedDays: ForecastedDay[] = []
  const today = new Date()
  
  for (let i = 1; i <= 30; i++) {
    const forecastDate = new Date(today)
    forecastDate.setDate(today.getDate() + i)
    
    // Get day of week for cyclical adjustment
    const dayName = forecastDate.toLocaleDateString('en-US', { weekday: 'long' })
    const dayMultipliers = cyclicalPatterns.dayOfWeekMultipliers[dayName] || { peak: 1.0, average: 1.0 }
    
    // Apply monthly trend to rolling average base (make it more conservative)
    const monthlyTrendMultiplierPeak = 1 + (finalMonthlyTrendAdjustment.peakTrendPercent / 100) * 0.3 // Reduce impact to 30%
    const monthlyTrendMultiplierAverage = 1 + (finalMonthlyTrendAdjustment.averageTrendPercent / 100) * 0.3
    
    // Apply recent trend with diminishing effect over time (make it more conservative)
    const trendDecayFactor = Math.exp(-i / 21) // Trend effect decays over 3 weeks
    const recentTrendMultiplierPeak = 1 + (recentTrend.peakTrend * trendDecayFactor * 0.2) // Reduce impact to 20%
    const recentTrendMultiplierAverage = 1 + (recentTrend.averageTrend * trendDecayFactor * 0.2)
    
    // Add some controlled randomness (±5% variation) to make it more realistic
    const randomVariationPeak = 0.95 + (Math.random() * 0.1) // 0.95 to 1.05
    const randomVariationAverage = 0.95 + (Math.random() * 0.1)
    
    // Combine all factors with bounds checking
    let predictedPeak = Math.round(
      rollingAverageBase.peak * 
      Math.max(0.5, Math.min(2.0, dayMultipliers.peak)) * // Cap day multipliers
      Math.max(0.5, Math.min(2.0, monthlyTrendMultiplierPeak)) * // Cap monthly trend
      Math.max(0.5, Math.min(2.0, recentTrendMultiplierPeak)) * // Cap recent trend
      randomVariationPeak
    )
    
    let predictedAverage = Math.round(
      rollingAverageBase.average * 
      Math.max(0.5, Math.min(2.0, dayMultipliers.average)) * // Cap day multipliers
      Math.max(0.5, Math.min(2.0, monthlyTrendMultiplierAverage)) * // Cap monthly trend
      Math.max(0.5, Math.min(2.0, recentTrendMultiplierAverage)) * // Cap recent trend
      randomVariationAverage
    )

    // Final bounds check - ensure predictions stay within reasonable range of base values
    const maxReasonablePeak = rollingAverageBase.peak * 3 // Max 3x the rolling average
    const minReasonablePeak = Math.max(1, rollingAverageBase.peak * 0.1) // Min 10% of rolling average
    const maxReasonableAverage = rollingAverageBase.average * 3
    const minReasonableAverage = Math.max(1, rollingAverageBase.average * 0.1)
    
    predictedPeak = Math.max(minReasonablePeak, Math.min(maxReasonablePeak, predictedPeak))
    predictedAverage = Math.max(minReasonableAverage, Math.min(maxReasonableAverage, predictedAverage))

    // Ensure peak is always >= average (logical constraint)
    if (predictedPeak < predictedAverage) {
      // If peak is lower than average, adjust peak to be at least equal to average
      // Add a small buffer (5-15%) to make it more realistic
      const buffer = 1.05 + (Math.random() * 0.1) // 1.05 to 1.15
      predictedPeak = Math.round(predictedAverage * buffer)
    }

    // Determine confidence based on how far into the future we're predicting
    let dayConfidence: 'high' | 'medium' | 'low' = confidence
    if (i > 21) dayConfidence = 'low'
    else if (i > 14) dayConfidence = confidence === 'high' ? 'medium' : 'low'
    else if (i > 7) dayConfidence = confidence

    forecastedDays.push({
      date: forecastDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      predictedPeak,
      predictedAverage,
      confidence: dayConfidence,
      isForecasted: true
    })
  }

  // Calculate forecasted month totals
  const nextMonth = new Date(today)
  nextMonth.setMonth(today.getMonth() + 1)
  
  const forecastedMonth = {
    month: nextMonth.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    }),
    predictedPeak: Math.max(...forecastedDays.map(day => day.predictedPeak)),
    predictedAverage: Math.round(
      forecastedDays.reduce((sum, day) => sum + day.predictedAverage, 0) / forecastedDays.length
    ),
    totalDays: forecastedDays.length
  }

  return {
    forecastedDays,
    forecastedMonth,
    methodology: {
      rollingAverageBase,
      monthlyTrendAdjustment: finalMonthlyTrendAdjustment,
      cyclicalPatterns,
      confidence: `${confidence} confidence based on ${monthlyData ? 'monthly trend data' : 'rolling average only'} and ${cyclicalPatterns.weeklyVariation > 0.2 ? 'strong' : cyclicalPatterns.weeklyVariation > 0.1 ? 'moderate' : 'weak'} cyclical patterns`
    }
  }
}