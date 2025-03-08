const axios = require('axios');
const API_KEY = process.env.API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

const getLatestVideo = async (channelId = CHANNEL_ID) => {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&order=date&part=snippet&type=video&maxResults=1`;
    
    try {
        const response = await axios.get(url);
        const latestVideo = response.data.items[0];
        
        if (latestVideo) {
            const videoId = latestVideo.id.videoId;
            return `https://www.youtube.com/embed/${videoId}`;
        } else {
            throw new Error('No videos found for this channel.');
        }
    } catch (error) {
        console.error('Error fetching latest video:', error);
        throw error;
    }
};

const getFeaturedVideo = async (channelId = CHANNEL_ID) => {
    // Get the channel's branding settings which contains the featured video
    const url = `https://www.googleapis.com/youtube/v3/channels?key=${API_KEY}&id=${channelId}&part=brandingSettings`;
    
    try {
        const response = await axios.get(url);
        const channelData = response.data.items[0];
        
        if (channelData && 
            channelData.brandingSettings && 
            channelData.brandingSettings.channel && 
            channelData.brandingSettings.channel.unsubscribedTrailer) {
            
            const videoId = channelData.brandingSettings.channel.unsubscribedTrailer;
            return `https://www.youtube.com/embed/${videoId}`;
        } else {
            // If no featured video is set, fall back to latest video
            console.log('No featured video found, falling back to latest video');
            return getLatestVideo(channelId);
        }
    } catch (error) {
        console.error('Error fetching featured video:', error);
        throw error;
    }
};

module.exports = { getLatestVideo, getFeaturedVideo };