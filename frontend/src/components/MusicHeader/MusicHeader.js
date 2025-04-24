import React from 'react';
import './MusicHeader.css';

const MusicHeader = () => {
  return (
    <div className="music-header-container">
      <div className="music-icon">🎶</div>
      <h1 className="music-title">Your Vibe, Your Tunes</h1>
      <p className="music-subtitle">Handpicked songs inspired by your skies</p>
    </div>
  );
};

export default MusicHeader;
