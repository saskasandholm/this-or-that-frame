# "This or That" Decision Maker Implementation Plan

## Overview

The "This or That" frame presents users with binary choices on engaging topics, collects their votes, and shows how they compare with the community. This simple mechanic drives viral sharing as users discover where they stand relative to others.

## Core Features

1. **Binary Choice Interface:** Present two options with clear visuals
2. **Real-time Results:** Show percentage splits after voting
3. **Vote Counts:** Display total participation numbers
4. **Topic Variety:** Categories including crypto, tech, culture, and Farcaster-specific topics
5. **Daily Rotation:** Fresh choices each day to encourage regular returns
6. **Share Results:** Allow users to share their choice and the results
7. **Topic Leaderboard:** Track which topics generate the most engagement

## Technical Architecture

### Backend Components

1. **Database Schema**

   - `topics` table: Stores all binary choice topics
     - `id`: Unique identifier
     - `categoryId`: Reference to topics category
     - `optionA`: First choice text
     - `optionB`: Second choice text
     - `imageA`: Image URL for first choice
     - `imageB`: Image URL for second choice
     - `startDate`: When to start showing this topic
     - `endDate`: When to stop showing this topic
     - `isActive`: Boolean to manually control display
     - `createdAt`: Timestamp
   - `votes` table: Records user votes
     - `id`: Unique identifier
     - `topicId`: Reference to topic
     - `fid`: Farcaster ID of voter
     - `choice`: Which option was selected ('A' or 'B')
     - `timestamp`: When the vote was cast
   - `categories` table: Organizes topics
     - `id`: Unique identifier
     - `name`: Category name (Crypto, Tech, Culture, etc.)
     - `description`: Brief description
     - `isActive`: Boolean to control category availability

2. **API Endpoints**

   - `GET /api/topics/current`: Retrieve the current topic
   - `POST /api/votes`: Record a user's vote
   - `GET /api/results/:topicId`: Get results for a specific topic
   - `GET /api/topics/upcoming`: Preview of upcoming topics (optional)

3. **Scheduled Jobs**
   - Daily topic rotation (midnight UTC)
   - Results aggregation for performance metrics
   - Weekly trends report generation

### Frontend Components

1. **Landing Frame**

   - Clean, minimal design with two clear options
   - Bold typography and contrasting colors
   - Category indicator
   - Simple question formatting: "This or That?"

2. **Voting Interface**

   - Two large, tappable buttons
   - Visual feedback on selection
   - Smooth transition to results

3. **Results Display**

   - Percentage bar showing community split
   - Total vote counter
   - Highlight user's choice
   - "Share Results" button
   - "Next Topic" button (if applicable)

4. **Share Card**
   - Generated image showing the topic, results, and user's choice
   - Farcaster-optimized formatting (aspect ratio, size limits)
   - Branding and call-to-action to try the frame

## Implementation Phases

### Phase 1: MVP (Week 1)

1. **Day 1-2: Setup & Core Development**

   - Set up Next.js project with TypeScript
   - Create database schema and basic API routes
   - Implement basic frame UI components
   - Set up frame metadata rendering

2. **Day 3-4: Core Functionality**

   - Implement voting mechanism
   - Build results calculation and display
   - Create basic topic rotation
   - Set up FID tracking for vote uniqueness

3. **Day 5-7: Polish & Testing**
   - Implement final UI designs
   - Add share functionality
   - Test with various Farcaster clients
   - Optimize performance and response times

### Phase 2: Enhancement (Week 2)

1. **Analytics Integration**

   - Implement detailed vote tracking
   - Set up dashboards for topic performance
   - Create metrics for virality measurement

2. **Content Expansion**

   - Populate topic database with 50+ engaging binary choices
   - Create category system
   - Implement topic scheduling

3. **User Experience Improvements**
   - Add animations and transitions
   - Implement optimized image generation for results
   - Add "previously voted" detection

### Phase 3: Virality Features (Week 3)

1. **Community Insights**

   - Show how your connections voted vs. general population
   - Add comment prompts based on voting patterns
   - Implement controversial topic indicators

2. **Gamification Elements**

   - Add voting streaks
   - Implement "rare opinions" badges
   - Create weekly summaries of where users stand

3. **Integration Features**
   - Allow embedding results in profiles
   - Create API for developers to use results data
   - Build notifications for highly engaging topics

## Content Strategy

### Topic Categories

1. **Crypto Fundamentals**

   - BTC vs ETH
   - Layer 1 vs Layer 2
   - DeFi vs NFTs
   - PoW vs PoS

2. **Tech Philosophy**

   - Web2 vs Web3
   - AI: Beneficial vs Dangerous
   - Mobile vs Desktop
   - iOS vs Android

3. **Trading & Markets**

   - Bull vs Bear
   - HODL vs Trade
   - CEX vs DEX
   - Tokens vs NFTs

4. **Culture & Lifestyle**

   - Remote vs Office
   - Early Bird vs Night Owl
   - Minimalist vs Maximalist
   - City vs Nature

5. **Farcaster-Specific**
   - Short vs Long Casts
   - Many Channels vs Few Channels
   - Public vs Private Likes
   - Following Many vs Following Few

### Topic Scheduling

- **Weekdays:** More technical and crypto-focused topics
- **Weekends:** More cultural and philosophical topics
- **Special Events:** Time topics to coincide with market events, product launches, or Farcaster updates

## Viral Growth Tactics

1. **Initial Launch**

   - Partner with 5-10 influential Farcaster users for simultaneous sharing
   - Start with a controversial but light-hearted topic to drive engagement
   - Create a "founding voters" list for the first 100 participants

2. **Engagement Drivers**

   - Highlight surprising results to encourage sharing ("Only 30% chose X!")
   - Create "hot take" topics that drive discussion
   - Use timely topics related to current events in crypto

3. **Retention Mechanisms**

   - Daily topic refreshes at consistent times
   - Preview "coming tomorrow" topics to drive anticipation
   - Implement voting streaks that users don't want to break

4. **Cross-Promotion**
   - Create a dedicated channel for topic discussion
   - Release weekly "most divisive topics" roundups
   - Allow users to suggest new topics

## Technical Considerations

1. **Performance Optimization**

   - Implement edge caching for results
   - Optimize image generation
   - Use serverless functions for scaling

2. **Security Measures**

   - Implement vote verification to prevent tampering
   - Rate limit API endpoints
   - Validate all user inputs

3. **Monitoring**
   - Set up alerts for unusual voting patterns
   - Track performance metrics
   - Monitor social sharing analytics

## Success Metrics

1. **Primary Metrics**

   - Daily active voters
   - Viral coefficient (shares per vote)
   - Retention rate (returning voters)

2. **Secondary Metrics**

   - Topic engagement variance
   - Category performance
   - Time-of-day engagement patterns

3. **Long-term Metrics**
   - User profile completeness (percentage of all available topics voted on)
   - Community trend analysis
   - Content suggestion quality

## Launch Timeline

- **Day 1:** Soft launch with friends and development community
- **Day 3:** Feature request with key Farcaster influencers
- **Day 7:** Official public launch with high-interest topic
- **Day 14:** First special event topic tied to crypto news
- **Day 30:** Release of community insights features

## Maintenance Plan

- **Daily:** Topic rotation and basic monitoring
- **Weekly:** Content calendar updates and performance review
- **Monthly:** Feature additions and major improvements

## Future Expansion Ideas

1. **Multi-choice Topics**

   - Expand beyond binary choices to 3-4 options for certain topics

2. **Time-based Trends**

   - Show how opinions have changed over time on recurring topics

3. **Frame Embeds**

   - Allow embedding specific "This or That" questions in other websites

4. **Premium Topics**
   - Special topics that require verification or specific actions to unlock

## Changelog

- **v1.0.0** (Initial Documentation): Created implementation plan for "This or That" Decision Maker Frame
