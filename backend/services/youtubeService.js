const axios = require('axios');

const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

const searchYouTubeVideo = async (query) => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn('YOUTUBE_API_KEY is not configured. Skipping YouTube search.');
    return null;
  }

  try {
    const response = await axios.get(YOUTUBE_BASE_URL, {
      params: {
        key: apiKey,
        q: query,
        part: 'snippet',
        type: 'video',
        maxResults: 1,
      },
      timeout: 10000,
    });

    const items = response.data?.items;
    if (!items || items.length === 0) {
      return null;
    }

    const video = items[0];
    if (!video || !video.id?.videoId || !video.snippet) {
      return null;
    }

    return {
      type: 'youtube',
      videoId: video.id.videoId,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url || '',
      channel: video.snippet.channelTitle,
    };
  } catch (error) {
    console.error('YouTube search error:', error.message || error);
    return null;
  }
};

module.exports = { searchYouTubeVideo };
