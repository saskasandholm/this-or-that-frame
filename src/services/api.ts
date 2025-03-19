/**
 * API service layer for the This or That application
 *
 * This file provides a consistent interface for interacting with the backend API
 * and centralizes error handling and request formatting.
 */

// Types for API responses
export interface Topic {
  id: string;
  name: string;
  optionA: string;
  optionB: string;
  imageA?: string;
  imageB?: string;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
  };
  votesA: number;
  votesB: number;
  totalVotes: number;
}

export interface VoteResult {
  success: boolean;
  topicId: string;
  choice: 'A' | 'B';
  breakdown: {
    A: number;
    B: number;
    totalVotes: number;
    percentA: number;
    percentB: number;
  };
  isRareOpinion: boolean;
  isHighlyContested: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  error?: any;
}

/**
 * Base API request function with error handling
 * @param url API endpoint path
 * @param options Fetch options
 * @returns Promise with typed response data
 */
async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    // Ensure the URL has the correct base
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Make the request
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'An unknown error occurred',
      }));

      const error: ApiError = {
        status: response.status,
        message: errorData.message || `Error: ${response.status} ${response.statusText}`,
        error: errorData,
      };

      throw error;
    }

    // Return successfully parsed data
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);

    // Rethrow with consistent format
    if ((error as ApiError).status) {
      throw error;
    } else {
      throw {
        status: 0,
        message: 'Network error or server unavailable',
        error,
      };
    }
  }
}

/**
 * API functions for topics
 */
export const topicApi = {
  /**
   * Get current active topic
   * @returns Promise with current topic data
   */
  getCurrent: async (): Promise<Topic> => {
    return apiRequest<Topic>('/topics/current');
  },

  /**
   * Get a topic by ID
   * @param id Topic ID
   * @returns Promise with topic data
   */
  getById: async (id: string): Promise<Topic> => {
    return apiRequest<Topic>(`/topics/${id}`);
  },

  /**
   * Get trending topics
   * @param limit Number of topics to return
   * @returns Promise with array of trending topics
   */
  getTrending: async (limit: number = 5): Promise<Topic[]> => {
    return apiRequest<Topic[]>(`/topics/trending?limit=${limit}`);
  },

  /**
   * Get past topics
   * @param limit Number of topics to return
   * @param offset Pagination offset
   * @returns Promise with array of past topics
   */
  getPast: async (limit: number = 10, offset: number = 0): Promise<Topic[]> => {
    return apiRequest<Topic[]>(`/topics/past?limit=${limit}&offset=${offset}`);
  },

  /**
   * Submit a vote for a topic
   * @param topicId Topic ID
   * @param choice Vote choice ('A' or 'B')
   * @returns Promise with vote result
   */
  vote: async (topicId: string, choice: 'A' | 'B'): Promise<VoteResult> => {
    return apiRequest<VoteResult>(`/topics/vote`, {
      method: 'POST',
      body: JSON.stringify({ topicId, choice }),
    });
  },
};

/**
 * API functions for user operations
 */
export const userApi = {
  /**
   * Get user profile data
   * @param fid Farcaster ID
   * @returns Promise with user profile data
   */
  getProfile: async (fid: string): Promise<any> => {
    return apiRequest<any>(`/users/${fid}`);
  },

  /**
   * Save a frame for the user
   * @param frameId Frame ID to save
   * @returns Promise with result
   */
  saveFrame: async (frameId: string): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>('/users/save-frame', {
      method: 'POST',
      body: JSON.stringify({ frameId }),
    });
  },
};

export default {
  topic: topicApi,
  user: userApi,
};
