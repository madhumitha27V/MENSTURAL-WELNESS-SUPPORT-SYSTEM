import React, { useState } from 'react';

const VideoPlayer = ({ videoId, thumbnail, title }) => {
  const [loaded, setLoaded] = useState(false);

  if (!videoId) return null;

  return (
    <div className="video-player">
      {!loaded && thumbnail && (
        <div className="video-player__thumbnail">
          <img src={thumbnail} alt={title || 'YouTube preview'} />
        </div>
      )}
      <iframe
        title={title || 'YouTube music player'}
        src={`https://www.youtube.com/embed/${videoId}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

export default VideoPlayer;
