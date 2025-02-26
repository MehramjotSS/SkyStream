import React, { useState } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');

  const handleRecommendations = async () => {
    if (!city) {
      setError('Please enter a city name.');
      return;
    }

    try {
      console.log("Sending request to backend with city:", city); // Debug statement

      const response = await fetch('http://127.0.0.1:5000/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city }),
      });

      console.log("Response status:", response.status); // Debug statement

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData); // Debug statement
        throw new Error(errorData.error || 'Failed to fetch recommendations.');
      }

      const data = await response.json();
      console.log("Received recommendations:", data); // Debug statement

      setRecommendations(data);
      setError('');
    } catch (err) {
      console.error("Error in handleRecommendations:", err); // Debug statement
      setError(err.message || 'Error fetching recommendations. Please try again.');
    }
  };

  return (
    <div className="App">
      <h1>Weather-Based Music Recommendations</h1>
      <div className="input-container">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={handleRecommendations}>Get Recommendations</button>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="recommendations">
        {recommendations.length > 0 ? (
          recommendations.map((song, index) => (
            <div key={index} className="song">
              <p><strong>Track:</strong> {song.track_name}</p>
              <p><strong>Artist:</strong> {song.artist_name}</p>
            </div>
          ))
        ) : (
          <p>No recommendations yet. Enter a city to get started!</p>
        )}
      </div>
    </div>
  );
}

export default App;