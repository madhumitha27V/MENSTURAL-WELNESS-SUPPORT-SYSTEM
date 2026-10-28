require('dotenv').config();
const { searchYouTubeVideo } = require('./services/youtubeService');

(async () => {
  try {
    console.log('Testing YouTube service with sample query...');
    const result = await searchYouTubeVideo('Play Believer');
    console.log('Result:', result);
  } catch (err) {
    console.error('Error:', err);
  }
})();
