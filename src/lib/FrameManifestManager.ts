'use client';

/**
 * Manifest information for the Frame v2 specification (.well-known/farcaster.json)
 * Contains metadata about the frame application, including information for discovery and saving
 */
const FrameManifestManager = {
  /**
   * Basic information about the frame app
   */
  frameInfo: {
    name: 'This or That',
    description: 'Daily binary choices that reveal what the Farcaster community thinks',
    category: 'Social/Games',
    iconUrl: '/images/app-icon.png',
    splashImageUrl: '/images/app-splash.png',
    splashBackgroundColor: '#6941C6', // Purple
    homeUrl: 'https://this-or-that.frame.app',
    version: '1',
  },

  /**
   * Information about frame discovery
   */
  discoveryInfo: {
    /**
     * Get the channel information for the official community
     */
    channel: {
      url: 'https://warpcast.com/~/channel/this-or-that',
      name: 'This or That',
      description:
        'Join the official This or That community for discussions, topic suggestions, and more!',
    },

    /**
     * Get text explaining why users should save the frame
     */
    getSaveText: (): string => {
      return 'Save the "This or That" frame to vote daily, maintain your streak, and see how your opinions compare with the Farcaster community!';
    },

    /**
     * Get list of benefits for saving the frame
     */
    getSaveBenefits: (): string[] => {
      return [
        'Easy access to daily voting',
        'Maintain your voting streak',
        'Get notifications about new topics',
        'Compare with friends',
      ];
    },

    /**
     * Get shareable text for the frame
     */
    getShareText: (topic?: string, choice?: string): string => {
      if (topic && choice) {
        return `🤔 I just voted "${choice}" on "${topic}" in This or That! What would YOU choose? Challenge your friends and see where you stand! #ThisOrThat`;
      }
      return '🔥 Daily choices that reveal what the Farcaster community REALLY thinks! Join thousands of users on This or That and see where you stand! #ThisOrThat';
    },
  },

  /**
   * Get manifest info for display in the app
   */
  getManifestInfo: () => {
    return {
      ...FrameManifestManager.frameInfo,
      channel: FrameManifestManager.discoveryInfo.channel,
    };
  },

  /**
   * Get frame save prompt information
   * @param variant - The type of prompt to display
   */
  getSavePromptInfo: (variant: 'modal' | 'inline' | 'tooltip' = 'modal') => {
    const benefits = FrameManifestManager.discoveryInfo.getSaveBenefits();
    const mainText = FrameManifestManager.discoveryInfo.getSaveText();

    return {
      title: `Save ${FrameManifestManager.frameInfo.name}`,
      description: mainText,
      benefits,
      variant,
    };
  },
};

export default FrameManifestManager;
