// RecommendationsList.js
import React from 'react';
import SongItem from '../SongItem/SongItem';
import './recommendationsList.css';

function RecommendationsList({ recommendations, selectedSong, handleSongClick }) {
  return recommendations.length > 0 ? (
    <div className="recommendations-list">
      {recommendations.map((song, index) => (
        <SongItem
          key={index}
          song={song}
          selectedSong={selectedSong}
          handleSongClick={handleSongClick}
        />
      ))}
    </div>
  ) : null;
}

export default RecommendationsList;
