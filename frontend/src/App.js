import React, { useState } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRecommendations = async () => {
    if (!city) {
      setError('Please enter a city name.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:5000/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch recommendations.');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
      setWeather(data.weather);
    } catch (err) {
      console.error("Error in handleRecommendations:", err);
      setError(err.message || 'Error fetching recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherEmoji = (weatherCondition) => {
    switch (weatherCondition.toLowerCase()) {
      case 'sunny':
        return '☀️';
      case 'rainy':
        return '🌧️';
      case 'cloudy':
        return '☁️';
      case 'snowy':
        return '❄️';
      default:
        return '🌤️';
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="app-title">SkyStream</h1>
      </div>

      <div className="top-right">
        <div className="city-input-container">
          <input
            type="text"
            placeholder="Enter your city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button onClick={handleRecommendations} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Get Recommendations'}
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {weather && (
          <div className="weather-display">
            <h2>
              {weather.city}: {weather.condition} {getWeatherEmoji(weather.condition)}
            </h2>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="recommendations-list">
            {recommendations.map((song, index) => (
              <div key={index} className="song-item">
                <p className="song-title">{song.track_name}</p>
                <p className="song-artist">{song.artist_name}</p>
                <button className="play-button">▶</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Empty space for future music player */}
      <div className="main-content">
        {/* Future content will go here */}
      </div>
    </div>
  );
}

export default App;