import React from 'react';
import './CityInput.css';

function CityInput({ city, setCity, handleRecommendations, isLoading }) {
  return (
    <div className="city-input-container">
      <input
        type="text"
        placeholder="🌆 Enter your city"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="city-input"
      />
      <button 
        onClick={handleRecommendations} 
        disabled={isLoading} 
        className="city-button"
      >
        {isLoading ? (
          <div className="spinner-container">
          <div className="spinner"></div>
          <span className="loading-text">Fetching Vibes...</span>
          </div>
          ) : (
          '🎵 Get Recommendations'
)}

      </button>
    </div>
  );
}

export default CityInput;
