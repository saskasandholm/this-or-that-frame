# Future Improvements for "This or That" Frame

This document outlines potential future improvements to enhance the "This or That" frame application. These features are prioritized based on potential impact on user engagement and viral growth.

## 1. Weekly Insight Reports & Personal Stats Dashboard

Create a personalized analytics experience showing voting patterns and achievements over time.

### Overview

A personal stats dashboard would provide users with insights into their voting patterns, how they compare to others, and track their progress over time. This creates a sense of investment in their voting history and encourages continued engagement.

### Implementation Details

#### Database Schema Extensions

```prisma
model UserStats {
  id                  Int      @id @default(autoincrement())
  fid                 Int      @unique
  totalVotes          Int      @default(0)
  majorityAgreement   Float    @default(0) // Percentage of votes where user agreed with majority
  categoryPreferences Json?    // Stored as JSON with category preferences
  mostUnusualVotes    Json?    // Array of topics where user was in smallest minority
  weeklyActivity      Json?    // JSON object tracking votes by week
  lastUpdated         DateTime @default(now())
  createdAt           DateTime @default(now())

  @@index([fid])
}

model WeeklyReport {
  id          Int      @id @default(autoincrement())
  weekOf      DateTime // Start date of the week
  topTopics   Json     // Most voted topics that week
  trends      Json?    // Trending opinions that week
  userCount   Int      // Number of active users that week
  voteCount   Int      // Total votes that week
  createdAt   DateTime @default(now())
}
```

#### New API Endpoints

1. `/api/user/[fid]/stats` - Get comprehensive user statistics
2. `/api/reports/weekly/[date]` - Get weekly community report
3. `/api/user/[fid]/insights` - Get personalized insights based on voting patterns

#### Data Visualization Components

1. **Opinion Alignment Chart**: Radar chart showing how often user agrees with majority across categories
2. **Category Preference Chart**: Bar chart showing distribution of votes by category
3. **Voting Timeline**: Line chart tracking voting activity over time
4. **Opinion Map**: Visual representation of where the user stands compared to others

#### Backend Processing

1. **Weekly Stats Calculator**: Scheduled job that runs once per week to:

   - Update user statistics
   - Generate community reports
   - Calculate trending topics and shifting opinions
   - Identify unusual voting patterns

2. **Insight Generator**: Algorithm to identify interesting patterns like:
   - Categories where user is most contrarian
   - Topics where user's opinion shifted with community over time
   - Correlations between different topic choices

#### Frontend Implementation

1. **Personal Dashboard Page**: `/stats/[fid]` route with:

   - Summary statistics at the top
   - Interactive charts and visualizations
   - Achievement progression
   - Weekly report section

2. **Weekly Email/Notification**: Opt-in digest of:

   - User's voting activity that week
   - How opinions compared to community
   - Newly unlocked achievements
   - Recommendation for upcoming topics

3. **Sharing Options**:
   - "Share my voting profile" with custom OG image
   - "Challenge friends to compare stats"
   - Export stats as image/PDF

## 2. Themed Topic Collections & Weekly Tournaments

Organize topics into special collections and create friendly tournaments with leaderboards.

### Overview

Themed collections and tournaments add a game-like structure to voting, encouraging users to complete sets of related topics and compete with others, driving both retention and viral sharing.

### Implementation Details

#### Database Schema Extensions

```prisma
model Collection {
  id          Int       @id @default(autoincrement())
  name        String
  description String?
  imageUrl    String?
  topics      Topic[]
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  tournaments Tournament[]
}

model Tournament {
  id            Int       @id @default(autoincrement())
  name          String
  description   String?
  collectionId  Int?
  collection    Collection? @relation(fields: [collectionId], references: [id])
  topics        Topic[]
  startDate     DateTime
  endDate       DateTime
  isActive      Boolean   @default(true)
  participants  TournamentParticipant[]
  createdAt     DateTime  @default(now())

  @@index([startDate, endDate])
  @@index([isActive])
}

model TournamentParticipant {
  id            Int       @id @default(autoincrement())
  tournamentId  Int
  tournament    Tournament @relation(fields: [tournamentId], references: [id])
  fid           Int
  completedTopics Int      @default(0)
  score         Int       @default(0)
  rank          Int?
  joinedAt      DateTime  @default(now())

  @@unique([tournamentId, fid])
  @@index([tournamentId])
  @@index([fid])
}
```

#### New API Endpoints

1. `/api/collections` - List all active collections
2. `/api/collections/[id]` - Get details of a specific collection
3. `/api/tournaments/active` - Get currently active tournaments
4. `/api/tournaments/[id]` - Get details of a specific tournament
5. `/api/tournaments/[id]/leaderboard` - Get tournament leaderboard
6. `/api/tournaments/[id]/join` - Join a tournament
7. `/api/tournaments/[id]/progress` - Get user's progress in tournament

#### Tournament System Components

1. **Tournament Manager**:

   - Scheduled job to activate/deactivate tournaments
   - Score calculator for participant rankings
   - Notification system for tournament events

2. **Leaderboard Generator**:

   - Real-time rankings
   - Position change indicators
   - Score breakdowns

3. **Tournament Completion Certificate**:
   - Dynamic image generation for winners/participants
   - Social share integration
   - Achievement unlocks

#### Frontend Implementation

1. **Tournament Hub Page**: `/tournaments` route with:

   - Active tournaments with progress indicators
   - Upcoming tournaments with countdown timers
   - Past tournaments with results
   - Featured collections

2. **Tournament Detail Page**: `/tournaments/[id]` with:

   - Topic list with completion indicators
   - Live leaderboard
   - Share progress button
   - Tournament stats and timer

3. **Collection Browser**: `/collections` route with:

   - Categorized collections
   - Completion percentages
   - Related tournaments

4. **Tournament Notifications**:
   - Starting soon reminders
   - New topics available alerts
   - Ranking change updates
   - Tournament completion summaries

## Implementation Priority

These features should be implemented in the following order:

1. **Interactive Result Animations & Audio Elements** (Currently being implemented)
2. **Weekly Insight Reports & Personal Stats Dashboard**
3. **Themed Topic Collections & Weekly Tournaments**

This sequence allows us to first enhance the core experience (voting and results), then build user investment through personalized insights, and finally add competitive and completionist elements to drive long-term engagement.

## Changelog

- **v1.0.0** (Initial Documentation): Created document outlining future improvement ideas for the "This or That" frame
