const axios = require("axios");
const API_KEY = process.env.API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

// Cache storage
const cache = {
  latestVideo: { data: null, timestamp: 0 },
  featuredVideo: { data: null, timestamp: 0 },
};

const CACHE_EXPIRATION = 15 * 60000;

// Check if cache needs refreshing
const isCacheExpired = (cacheEntry) => {
  return (
    !cacheEntry.data || Date.now() - cacheEntry.timestamp > CACHE_EXPIRATION
  );
};

const getLatestVideo = async (channelId = CHANNEL_ID) => {
  // Use cache if available and not expired
  if (!isCacheExpired(cache.latestVideo)) {
    return cache.latestVideo.data;
  }

  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&order=date&part=snippet&type=video&maxResults=1`;

  try {
    const response = await axios.get(url);
    const latestVideo = response.data.items[0];

    if (latestVideo) {
      const videoId = latestVideo.id.videoId;
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;

      // Update cache
      cache.latestVideo = {
        data: embedUrl,
        timestamp: Date.now(),
      };

      return embedUrl;
    } else {
      throw new Error("No videos found for this channel.");
    }
  } catch (error) {
    console.error("Error fetching latest video:", error);
    return cache.latestVideo.data; // Return cached data on error
  }
};

const getFeaturedVideo = async (channelId = CHANNEL_ID) => {
  // Use cache if available and not expired
  if (!isCacheExpired(cache.featuredVideo)) {
    return cache.featuredVideo.data;
  }

  // Get the channel's branding settings which contains the featured video
  const url = `https://www.googleapis.com/youtube/v3/channels?key=${API_KEY}&id=${channelId}&part=brandingSettings`;

  try {
    const response = await axios.get(url);
    const channelData = response.data.items[0];

    if (channelData?.brandingSettings?.channel?.unsubscribedTrailer) {
      const videoId = channelData.brandingSettings.channel.unsubscribedTrailer;
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;

      // Update cache
      cache.featuredVideo = {
        data: embedUrl,
        timestamp: Date.now(),
      };

      return embedUrl;
    } else {
      // If no featured video is set, fall back to latest video
      console.log("No featured video found, falling back to latest video");
      const latestVideoUrl = await getLatestVideo(channelId);

      // Update cache
      cache.featuredVideo = {
        data: latestVideoUrl,
        timestamp: Date.now(),
      };

      return latestVideoUrl;
    }
  } catch (error) {
    console.error("Error fetching featured video:", error);
    return cache.featuredVideo.data; // Return cached data on error
  }
};

// Function to manually refresh cache
const refreshCache = async () => {
  try {
    console.log("Manually refreshing cache...");
    // Reset cache timestamps to force refresh on next request
    cache.latestVideo.timestamp = 0;
    cache.featuredVideo.timestamp = 0;
  } catch (error) {
    console.error("Error refreshing cache:", error);
  }
};

// Refresh cache on module load
refreshCache();

module.exports = { getLatestVideo, getFeaturedVideo, refreshCache };
