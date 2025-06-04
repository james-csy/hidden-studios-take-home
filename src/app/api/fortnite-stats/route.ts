import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

interface DailyStats {
  date: string
  peak: number
  gain: number
  gainPercent: number
  average: number
  avgGain: number
  avgGainPercent: number
  estimatedEarnings: string
}

interface MonthlyStats {
  month: string
  peak: number
  gain: number
  gainPercent: number
  average: number
  avgGain: number
  avgGainPercent: number
  estimatedEarnings: string
}

interface FortniteStats {
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mapCode = searchParams.get('code')
  const includeHistory = searchParams.get('history') === 'true'
  const includeYearly = searchParams.get('yearly') === 'true'

  if (!mapCode) {
    return NextResponse.json(
      { error: 'Map code is required' },
      { status: 400 }
    )
  }

  // Validate map code format (should be like 6155-1398-4059)
  const mapCodeRegex = /^\d{4}-\d{4}-\d{4}$/
  if (!mapCodeRegex.test(mapCode)) {
    return NextResponse.json(
      { error: 'Invalid map code format. Expected format: XXXX-XXXX-XXXX' },
      { status: 400 }
    )
  }

  let browser = null

  try {
    // Launch Puppeteer browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-blink-features=AutomationControlled',
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ],
      defaultViewport: {
        width: 1920,
        height: 1080
      }
    })

    const page = await browser.newPage()

    // Set additional headers to avoid detection
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9'
    })

    // Navigate to the Fortnite.gg page
    const url = `https://fortnite.gg/island?code=${mapCode}`
    console.log(`Scraping URL: ${url}`)
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    })

    // Wait for the chart stats div to be present and extract current data
    try {
      // Wait for the element to appear
      await page.waitForSelector('.chart-stats-div', { timeout: 15000 })

      // Extract current player count data
      const currentStatsData = await page.evaluate(() => {
        const chartStatsDiv = document.querySelector('.chart-stats-div')
        if (!chartStatsDiv) {
          throw new Error('Chart stats div not found')
        }

        const playerCountElement = chartStatsDiv.querySelector('.chart-stats-title[data-n]')
        if (!playerCountElement) {
          throw new Error('Player count element not found')
        }

        const playerCountStr = playerCountElement.getAttribute('data-n')
        if (!playerCountStr) {
          throw new Error('Player count data attribute not found')
        }

        const playerCount = parseInt(playerCountStr, 10)
        if (isNaN(playerCount)) {
          throw new Error('Could not parse player count')
        }

        // Try to extract rank information
        let rank: string | undefined
        try {
          const rankElement = playerCountElement.querySelector('a[href*="rank"]')
          if (rankElement) {
            rank = rankElement.textContent?.trim()
          }
        } catch {
          // Rank element not found, that's okay
        }

        // Extract title from h1 element
        let title: string | undefined
        try {
          const titleElement = document.querySelector('h1')
          if (titleElement) {
            title = titleElement.textContent?.trim()
          }
        } catch {
          // Title element not found, that's okay
        }

        // Extract author information
        let author: string | undefined
        try {
          // Look for the specific author pattern: "By <a href="/creator?name=...">"
          const authorLink = document.querySelector('a[href*="/creator?name="]')
          if (authorLink) {
            author = authorLink.textContent?.trim()
          } else {
            // Fallback: look for "By [author]" pattern in a more targeted way
            const byElements = document.querySelectorAll('*')
            for (const element of byElements) {
              const text = element.textContent?.trim() || ''
              // Look for "By " followed by a link or text, but exclude unwanted patterns
              if (text.startsWith('By ') && 
                  !text.includes('Fortnite Creative Map Code') && 
                  !text.includes('Fortnite.GG') &&
                  !text.includes('IsLogged') &&
                  text.length < 50) { // Reasonable length limit
                const match = text.match(/^By\s+(.+)$/i)
                if (match) {
                  author = match[1].trim()
                  break
                }
              }
            }
          }
        } catch {
          // Author element not found, that's okay
        }

        // Extract tags from island-tags div
        let tags: string[] = []
        try {
          const tagsContainer = document.querySelector('.island-tags')
          if (tagsContainer) {
            const tagElements = tagsContainer.querySelectorAll('.island-tag')
            tags = Array.from(tagElements).map(tag => tag.textContent?.trim() || '').filter(tag => tag.length > 0)
          }
        } catch {
          // Tags not found, that's okay
        }

        return {
          playerCount,
          rank,
          title,
          author,
          tags
        }
      })

      let historicalData: DailyStats[] | undefined
      let monthlyData: MonthlyStats[] | undefined

      // If history is requested, click the 1M button and scrape the table
      if (includeHistory) {
        try {
          console.log('Attempting to scrape daily historical data...')
          
          // Wait for the chart range buttons to be available
          await page.waitForSelector('.chart-range', { timeout: 10000 })
          
          // Check if 1M button exists and click it
          const oneMButton = await page.$('.chart-range[data-range="1m"]')
          if (!oneMButton) {
            throw new Error('1M button not found')
          }
          
          console.log('Clicking 1M button to switch to monthly view...')
          await oneMButton.click()
          
          // Wait a moment for the view to change
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // Wait for the monthly table to appear and be populated
          console.log('Waiting for monthly table to load...')
          await page.waitForSelector('#chart-month-table tbody tr', { timeout: 15000 })
          
          // Additional wait to ensure table is fully populated
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Extract historical data from the table
          historicalData = await page.evaluate(() => {
            const table = document.querySelector('#chart-month-table tbody')
            if (!table) {
              throw new Error('Monthly table not found')
            }

            // Get all rows except the totals row (which has class 'no-sort' or is the last row with bold styling)
            const allRows = table.querySelectorAll('tr')
            const dataRows = Array.from(allRows).filter(row => {
              // Exclude rows with 'no-sort' class (totals row)
              if (row.classList.contains('no-sort')) return false
              
              // Exclude rows with bold styling (totals row)
              const style = window.getComputedStyle(row)
              if (style.fontWeight === 'bold' || style.fontWeight === '700') return false
              
              // Exclude rows that don't have proper date data
              const firstCell = row.querySelector('td')
              if (!firstCell || !firstCell.textContent?.trim()) return false
              
              return true
            })
            
            const data: DailyStats[] = []

            console.log(`Found ${allRows.length} total rows, ${dataRows.length} data rows (excluding totals)`)

            dataRows.forEach((row, index) => {
              const cells = row.querySelectorAll('td')
              if (cells.length >= 8) {
                // Parse the data from each cell
                const dateText = cells[0].textContent?.trim() || ''
                const peakText = cells[1].getAttribute('data-sort') || '0'
                const gainText = cells[2].getAttribute('data-sort') || '0'
                const gainPercentText = cells[3].getAttribute('data-sort') || '0'
                const averageText = cells[4].getAttribute('data-sort') || '0'
                const avgGainText = cells[5].getAttribute('data-sort') || '0'
                const avgGainPercentText = cells[6].getAttribute('data-sort') || '0'
                const earningsText = cells[7].textContent?.trim() || ''

                // Skip if this looks like a totals row (no proper date)
                if (!dateText || dateText.includes('Total') || dateText.includes('Sum')) {
                  console.log(`Skipping row ${index}: appears to be totals (${dateText})`)
                  return
                }

                console.log(`Row ${index}: ${dateText} - Peak: ${peakText}`)

                data.push({
                  date: dateText,
                  peak: parseInt(peakText, 10) || 0,
                  gain: parseInt(gainText, 10) || 0,
                  gainPercent: parseFloat(gainPercentText) || 0,
                  average: parseInt(averageText, 10) || 0,
                  avgGain: parseInt(avgGainText, 10) || 0,
                  avgGainPercent: parseFloat(avgGainPercentText) || 0,
                  estimatedEarnings: earningsText
                })
              }
            })

            return data
          })

          console.log(`Successfully scraped ${historicalData.length} days of historical data`)

          // Verify we got meaningful data
          if (historicalData.length === 0) {
            throw new Error('No historical data found in table')
          }

        } catch (historyError) {
          console.error('Error scraping historical data:', historyError)
          // Continue without historical data if it fails
          historicalData = undefined
        }
      }

      // If yearly data is requested, click the 1Y button and scrape the yearly table
      if (includeYearly) {
        try {
          console.log('Attempting to scrape yearly data...')
          
          // Wait for the chart range buttons to be available
          await page.waitForSelector('.chart-range', { timeout: 10000 })
          
          // Check if 1Y button exists and click it
          const oneYButton = await page.$('.chart-range[data-range="1y"]')
          if (!oneYButton) {
            throw new Error('1Y button not found')
          }
          
          console.log('Clicking 1Y button to switch to yearly view...')
          await oneYButton.click()
          
          // Wait a moment for the view to change
          await new Promise(resolve => setTimeout(resolve, 3000))
          
          // Wait for the yearly table to appear and be populated
          console.log('Waiting for yearly table to load...')
          await page.waitForSelector('#chart-month-table tbody tr', { timeout: 15000 })
          
          // Additional wait to ensure table is fully populated
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Extract yearly data from the table
          monthlyData = await page.evaluate(() => {
            const table = document.querySelector('#chart-month-table tbody')
            if (!table) {
              throw new Error('Yearly table not found')
            }

            // Get all rows except the totals row
            const allRows = table.querySelectorAll('tr')
            const dataRows = Array.from(allRows).filter(row => {
              // Exclude rows with 'no-sort' class (totals row)
              if (row.classList.contains('no-sort')) return false
              
              // Exclude rows with bold styling (totals row)
              const style = window.getComputedStyle(row)
              if (style.fontWeight === 'bold' || style.fontWeight === '700') return false
              
              // Exclude rows that don't have proper date data
              const firstCell = row.querySelector('td')
              if (!firstCell || !firstCell.textContent?.trim()) return false
              
              return true
            })
            
            const data: MonthlyStats[] = []

            console.log(`Found ${allRows.length} total yearly rows, ${dataRows.length} data rows (excluding totals)`)

            dataRows.forEach((row, index) => {
              const cells = row.querySelectorAll('td')
              if (cells.length >= 8) {
                // Parse the data from each cell
                const monthText = cells[0].textContent?.trim() || ''
                const peakText = cells[1].getAttribute('data-sort') || '0'
                const gainText = cells[2].getAttribute('data-sort') || '0'
                const gainPercentText = cells[3].getAttribute('data-sort') || '0'
                const averageText = cells[4].getAttribute('data-sort') || '0'
                const avgGainText = cells[5].getAttribute('data-sort') || '0'
                const avgGainPercentText = cells[6].getAttribute('data-sort') || '0'
                const earningsText = cells[7].textContent?.trim() || ''

                // Skip if this looks like a totals row (no proper month)
                if (!monthText || monthText.includes('Total') || monthText.includes('Sum')) {
                  console.log(`Skipping yearly row ${index}: appears to be totals (${monthText})`)
                  return
                }

                console.log(`Yearly Row ${index}: ${monthText} - Peak: ${peakText}`)

                data.push({
                  month: monthText,
                  peak: parseInt(peakText, 10) || 0,
                  gain: parseInt(gainText, 10) || 0,
                  gainPercent: parseFloat(gainPercentText) || 0,
                  average: parseInt(averageText, 10) || 0,
                  avgGain: parseInt(avgGainText, 10) || 0,
                  avgGainPercent: parseFloat(avgGainPercentText) || 0,
                  estimatedEarnings: earningsText
                })
              }
            })

            return data
          })

          console.log(`Successfully scraped ${monthlyData.length} months of yearly data`)

          // Verify we got meaningful data
          if (monthlyData.length === 0) {
            throw new Error('No yearly data found in table')
          }

        } catch (yearlyError) {
          console.error('Error scraping yearly data:', yearlyError)
          // Continue without yearly data if it fails
          monthlyData = undefined
        }
      }

      const stats: FortniteStats = {
        mapCode,
        playerCount: currentStatsData.playerCount,
        rank: currentStatsData.rank,
        title: currentStatsData.title,
        author: currentStatsData.author,
        tags: currentStatsData.tags,
        scrapedAt: new Date().toISOString(),
        historicalData,
        monthlyData
      }

      console.log('Successfully scraped stats:', {
        ...stats,
        historicalData: stats.historicalData ? `${stats.historicalData.length} days` : 'none',
        monthlyData: stats.monthlyData ? `${stats.monthlyData.length} months` : 'none'
      })
      return NextResponse.json(stats)

    } catch (elementError) {
      console.error('Element finding error:', elementError)
      
      // Check if the page exists but has no stats
      const pageTitle = await page.title()
      console.log('Page title:', pageTitle)
      
      if (pageTitle.includes('404') || pageTitle.includes('Not Found')) {
        return NextResponse.json(
          { error: 'Map not found. Please check the map code.' },
          { status: 404 }
        )
      }

      // Get page content for debugging
      const pageContent = await page.content()
      console.log('Page content length:', pageContent.length)

      throw new Error('Could not find player count data on the page')
    }

  } catch (error) {
    console.error('Fortnite scraping error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Could not find player count')) {
        return NextResponse.json(
          { error: 'Could not find player count data. The map might not have current statistics.' },
          { status: 404 }
        )
      }
      
      if (error.message.includes('timeout') || error.message.includes('TimeoutError')) {
        return NextResponse.json(
          { error: 'Request timeout. The website might be slow or unavailable.' },
          { status: 408 }
        )
      }

      if (error.message.includes('Navigation') || error.message.includes('net::')) {
        return NextResponse.json(
          { error: 'Network error. Please check your internet connection and try again.' },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to scrape Fortnite data. Please try again later.' },
      { status: 500 }
    )

  } finally {
    // Always close the browser
    if (browser) {
      try {
        await browser.close()
      } catch (closeError) {
        console.error('Error closing browser:', closeError)
      }
    }
  }
} 