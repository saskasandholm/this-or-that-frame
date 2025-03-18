import { prisma } from '../lib/prisma';

// No need to create a new instance, use the one from lib/prisma
const prismaClient = prisma;

type NotificationType =
  | 'NEW_TOPIC'
  | 'STREAK_REMINDER'
  | 'FRIEND_VOTED_DIFFERENTLY'
  | 'ACHIEVEMENT_UNLOCKED';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * Service for managing Farcaster notifications
 *
 * Note: This service is a placeholder for future implementation.
 * The current schema doesn't include notification-specific fields.
 */
const NotificationService = {
  /**
   * Store a notification token for a user
   * @param fid - Farcaster ID
   * @param token - Notification token from Frame SDK
   */
  storeToken: async (fid: number, token: string): Promise<void> => {
    try {
      // Since we don't have a User model with notification fields,
      // we'll log this for now and implement later when schema is updated
      console.log(`[Placeholder] Token ${token} stored for user ${fid}`);
    } catch (error) {
      console.error('Error storing notification token:', error);
      throw error;
    }
  },

  /**
   * Disable notifications for a user
   * @param fid - Farcaster ID
   */
  disableNotifications: async (fid: number): Promise<void> => {
    try {
      // Since we don't have a User model with notification fields,
      // we'll log this for now and implement later when schema is updated
      console.log(`[Placeholder] Notifications disabled for user ${fid}`);
    } catch (error) {
      console.error('Error disabling notifications:', error);
      throw error;
    }
  },

  /**
   * Send a notification to a specific user
   * @param fid - Farcaster ID
   * @param type - Type of notification
   * @param payload - Content of the notification
   */
  sendToUser: async (
    fid: number,
    type: NotificationType,
    payload: NotificationPayload
  ): Promise<boolean> => {
    try {
      // Check if user exists
      const userStreak = await prismaClient.userStreak.findUnique({
        where: { fid },
      });

      if (!userStreak) {
        console.log(`User ${fid} not found`);
        return false;
      }

      // Log the notification (actual sending would be implemented when API is available)
      console.log(`[Placeholder] Notification sent to user ${fid}:`, {
        type,
        title: payload.title,
        body: payload.body,
        data: payload.data,
      });

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  },

  /**
   * Send a new topic notification to all subscribed users
   * @param topicTitle - Title of the new topic
   * @param topicId - ID of the topic
   */
  sendNewTopicNotification: async (topicTitle: string, _topicId: string): Promise<void> => {
    try {
      // Get all users
      const users = await prismaClient.userStreak.findMany();

      // Log what would happen (actual implementation would come later)
      console.log(
        `[Placeholder] New topic notification for "${topicTitle}" would be sent to ${users.length} users`
      );
    } catch (error) {
      console.error('Error sending new topic notifications:', error);
    }
  },

  /**
   * Send a streak reminder notification to users who haven't voted today
   */
  sendStreakReminders: async (): Promise<void> => {
    try {
      // Get current date (start of day for comparison)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find users with streaks who might need reminders
      const usersWithStreaks = await prismaClient.userStreak.findMany({
        where: {
          currentStreak: { gt: 0 },
        },
      });

      console.log(
        `[Placeholder] Streak reminders would be sent to ${usersWithStreaks.length} eligible users`
      );
    } catch (error) {
      console.error('Error sending streak reminders:', error);
    }
  },

  /**
   * Notify users when their friends voted differently than them
   * @param topicId - ID of the topic to check
   */
  sendFriendVotedDifferently: async (_topicId: string): Promise<void> => {
    try {
      // This would require integration with Farcaster's social graph
      console.log(`[Placeholder] Friend voted differently notifications for topic ${_topicId}`);
    } catch (error) {
      console.error('Error sending friend voted differently notifications:', error);
    }
  },

  /**
   * Send achievement unlocked notification
   * @param fid - Farcaster ID
   * @param achievementName - Name of the achievement
   * @param achievementId - ID of the achievement
   */
  sendAchievementUnlocked: async (
    fid: number,
    achievementName: string,
    achievementId: string
  ): Promise<boolean> => {
    return NotificationService.sendToUser(fid, 'ACHIEVEMENT_UNLOCKED', {
      title: 'Achievement Unlocked! 🏆',
      body: `You earned the "${achievementName}" achievement!`,
      data: { achievementId },
    });
  },
};

export default NotificationService;
