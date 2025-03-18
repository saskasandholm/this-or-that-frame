import { prisma } from '../lib/prisma';

/**
 * Service for managing user data and experience
 *
 * Note: This is a simplified implementation using the UserStreak model.
 * Full implementation would require additional models and fields.
 */
const UserService = {
  /**
   * Check if a user is new (first time using the app)
   * @param fid - Farcaster ID
   * @returns Promise resolving to true if the user is new
   */
  isNewUser: async (fid: number): Promise<boolean> => {
    try {
      const userStreak = await prisma.userStreak.findUnique({
        where: { fid },
      });

      // User is new if they don't exist in our database
      if (!userStreak) return true;

      // Check if they have any votes
      const voteCount = await prisma.vote.count({
        where: { fid },
      });

      return voteCount === 0;
    } catch (error) {
      console.error('Error checking if user is new:', error);
      // Default to false in case of error
      return false;
    }
  },

  /**
   * Track a user's first visit
   * @param fid - Farcaster ID
   */
  trackFirstVisit: async (fid: number): Promise<void> => {
    try {
      // Check if user already exists
      const existingUser = await prisma.userStreak.findUnique({
        where: { fid },
      });

      if (!existingUser) {
        // Create new record if user doesn't exist
        await prisma.userStreak.create({
          data: {
            fid,
            currentStreak: 0,
            longestStreak: 0,
            lastVoteDate: new Date(),
            totalVotes: 0,
          },
        });
      }
    } catch (error) {
      console.error('Error tracking first visit:', error);
    }
  },

  /**
   * Mark a specific feature as introduced to the user
   * @param fid - Farcaster ID
   * @param featureName - Name of the feature that was introduced
   */
  markFeatureIntroduced: async (fid: number, featureName: string): Promise<void> => {
    try {
      // This would ideally store introduced features in a separate model or field
      // For now, just log it as we don't have the schema for it
      console.log(`[Placeholder] Feature "${featureName}" marked as introduced to user ${fid}`);
    } catch (error) {
      console.error(`Error marking feature "${featureName}" as introduced:`, error);
    }
  },

  /**
   * Check if a feature has been introduced to the user
   * @param fid - Farcaster ID
   * @param featureName - Name of the feature to check
   * @returns Promise resolving to true if the feature has been introduced
   */
  isFeatureIntroduced: async (fid: number, featureName: string): Promise<boolean> => {
    try {
      // Since we don't have a place to store introduced features yet,
      // we'll use a simple heuristic based on vote count
      const userStreak = await prisma.userStreak.findUnique({
        where: { fid },
      });

      if (!userStreak) return false;

      // Simplified logic - returning false means the feature will be introduced
      const totalVotes = userStreak.totalVotes;

      switch (featureName) {
        case 'welcome':
          return totalVotes > 0;
        case 'first_vote':
          return totalVotes > 1;
        case 'streaks':
          return totalVotes >= 3;
        case 'achievements':
          return totalVotes >= 5;
        case 'social_sharing':
          return totalVotes >= 10;
        case 'streak_achievements':
          return userStreak.currentStreak >= 3;
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error checking if feature "${featureName}" was introduced:`, error);
      return false;
    }
  },

  /**
   * Get features that should be progressively disclosed to the user
   * based on their usage patterns
   * @param fid - Farcaster ID
   * @returns Promise resolving to an array of feature names to introduce
   */
  getFeaturesToIntroduce: async (fid: number): Promise<string[]> => {
    try {
      const userStreak = await prisma.userStreak.findUnique({
        where: { fid },
      });

      if (!userStreak) return ['welcome'];

      const featuresNeeded: string[] = [];
      const totalVotes = userStreak.totalVotes;

      // Progressive disclosure logic
      if (totalVotes === 0) {
        featuresNeeded.push('welcome');
      }

      if (totalVotes === 1) {
        // After their first vote
        featuresNeeded.push('first_vote');
      }

      if (totalVotes >= 3 && totalVotes < 5) {
        // After 3 votes, introduce streaks
        featuresNeeded.push('streaks');
      }

      if (totalVotes >= 5 && totalVotes < 10) {
        // After 5 votes, introduce achievements
        featuresNeeded.push('achievements');
      }

      if (totalVotes >= 10) {
        // After 10 votes, introduce social sharing
        featuresNeeded.push('social_sharing');
      }

      if (userStreak.currentStreak >= 3) {
        // When they get a 3+ day streak
        featuresNeeded.push('streak_achievements');
      }

      return featuresNeeded;
    } catch (error) {
      console.error('Error getting features to introduce:', error);
      return [];
    }
  },

  /**
   * Track the first vote of a user and handle first-vote experience
   * @param fid - Farcaster ID
   * @returns Promise resolving to true if this was the user's first vote
   */
  trackFirstVote: async (fid: number): Promise<boolean> => {
    try {
      // Get existing user streak or create a new one
      const userStreak = await prisma.userStreak.findUnique({
        where: { fid },
      });

      // This is their first vote if they don't exist or have 0 votes
      const isFirstVote = !userStreak || userStreak.totalVotes === 0;

      if (isFirstVote) {
        if (!userStreak) {
          // Create new record if user doesn't exist
          await prisma.userStreak.create({
            data: {
              fid,
              currentStreak: 1,
              longestStreak: 1,
              lastVoteDate: new Date(),
              totalVotes: 1,
            },
          });
        } else {
          // Update existing record
          await prisma.userStreak.update({
            where: { fid },
            data: {
              currentStreak: 1,
              lastVoteDate: new Date(),
              totalVotes: 1,
            },
          });
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error tracking first vote:', error);
      return false;
    }
  },
};

export default UserService;
