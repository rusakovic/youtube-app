// Helper to extract YouTube ID, can be moved to a utils file later if needed
export const getYouTubeIdFromUrl = (url: string): string => {
  const regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
};

export interface VideoData {
  originalUrl: string;
  lastKnownVideoTime: number;
  lastKnownSystemTime: number;
}

/**
 * Saves data for a specific video ID to localStorage.
 * @param videoId - The ID of the YouTube video.
 * @param data - The video data to save.
 */
export const saveVideoData = (videoId: string, data: VideoData): void => {
  if (!videoId) return;
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(videoId, jsonData);
  } catch (error) {
    console.error(`Error saving video data for ID ${videoId}:`, error);
  }
};

/**
 * Retrieves data for a specific video ID from localStorage.
 * @param videoId - The ID of the YouTube video.
 * @returns The stored video data, or null if not found or an error occurs.
 */
export const getVideoData = (videoId: string): VideoData | null => {
  if (!videoId) return null;
  try {
    const jsonData = localStorage.getItem(videoId);
    if (jsonData === null) {
      return null;
    }
    return JSON.parse(jsonData) as VideoData;
  } catch (error) {
    console.error(`Error retrieving video data for ID ${videoId}:`, error);
    return null;
  }
};

/**
 * Clears data for a specific video ID from localStorage.
 * @param videoId - The ID of the YouTube video to clear.
 */
export const clearVideoData = (videoId: string): void => {
  if (!videoId) return;
  try {
    localStorage.removeItem(videoId);
  } catch (error) {
    console.error(`Error clearing video data for ID ${videoId}:`, error);
  }
};
