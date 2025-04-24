import React from 'react';
import './SongItem.css';

function SongItem({ song, selectedSong, handleSongClick }) {
  const isSelected = selectedSong === song;

  // Validate youtube_url: check if it contains a YouTube link.
  const isYouTubeAvailable = song.youtube_url && song.youtube_url.includes('youtube.com/watch');

  return (
    <div className={`song-card ${isSelected ? 'active' : ''}`}>
      <div className="song-details">
        <div className="song-text">
          <h3 className="song-title">{song.track_name}</h3>
          <p className="song-artist">by {song.artist_name}</p>
          <button className="play-button" onClick={() => handleSongClick(song)}>
            ▶ Play
          </button>

          {isSelected && !isYouTubeAvailable && (
            <p className="no-video">🎬 No video found</p>
          )}
        </div>

        {isSelected && isYouTubeAvailable && (
          <div className="video-container">
            <iframe
              width="320"
              height="180"
              src={song.youtube_url.replace('watch?v=', 'embed/') + '?autoplay=1'}
              title={`YouTube video player for ${song.track_name}`}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
}

export default SongItem;
