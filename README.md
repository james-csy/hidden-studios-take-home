# Hidden Studios User Profile Management App

A full-stack Next.js application with Supabase authentication and Fortnite Creative map analytics, built for the Hidden Studios take-home assignment.

## Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Chrome browser (for web scraping)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://hbaqlfjwmmwcinljwmsj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiYXFsZmp3bW13Y2lubGp3bXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MjI1NjcsImV4cCI6MjA2NDQ5ODU2N30.SOXgS9nGhEtADkVV205dhS_QStKWvkQtdf9n1m5Lj4E
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiYXFsZmp3bW13Y2lubGp3bXNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODkyMjU2NywiZXhwIjoyMDY0NDk4NTY3fQ.hYPUFxeO4J9bYCEsVP-1UkIQEBb83o8llZshxjdm7VI
```

### Installation & Running

```bash
# Clone and navigate to the project
cd user-profile-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── profile/       # Profile CRUD operations
│   │   └── fortnite-stats/ # Fortnite data scraping
│   ├── dashboard/         # Protected dashboard pages
│   ├── login/            # Authentication pages
│   └── layout.tsx        # Root layout with gaming theme
├── components/ui/         # Shadcn UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── supabase/         # Supabase client configuration
│   └── forecasting.ts    # Player count forecasting algorithm
└── middleware.ts         # Route protection middleware
```

## Approach & Assumptions

This application follows a modern full-stack architecture using Next.js 14 with the App Router, Supabase for authentication and database, and Puppeteer for web scraping. The Fortnite analytics feature assumes that fortnite.gg remains accessible and maintains its current HTML structure for scraping. The forecasting algorithm combines multiple data sources (7-day rolling averages, monthly trends, and cyclical patterns) with conservative bounds checking to prevent unrealistic predictions.

All multipliers are capped between 0.5x-2.0x to ensure realistic forecasts, with confidence levels based on data availability and pattern strength. The algorithm prioritizes conservative predictions over dramatic swings to provide actionable insights for map creators.

## License

This project was created for the Hidden Studios take-home assignment.
