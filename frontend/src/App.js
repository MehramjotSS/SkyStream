import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/SideBar/SideBar';
import CityInput from './components/CityInput/CityInput';
import WeatherDisplay from './components/WeatherDisplay/WeatherDisplay';
import RecommendationsList from './components/ReccomendationsList/RecommendationsList';
import Weather from './Weather/Weather';
import Home from './Home/Home';
import MusicHeader from './components/MusicHeader/MusicHeader';
import Title from './components/Title/Title';

function App() {
  const [city, setCity] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [currentView, setCurrentView] = useState('home');  // View state

  const handleRecommendations = async () => {
    if (!city) {
      setError('Please enter a city name.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Fetch recommendations from backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/recommend`, {
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
      setWeather(data.weather); // Assuming backend sends weather data too
    } catch (err) {
      setError(err.message || 'Error fetching recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherEmoji = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return '☀️';
      case 'rainy': return '🌧️';
      case 'cloudy': return '☁️';
      case 'snowy': return '❄️';
      default: return '🌤️';
    }
  };

  const handleSongClick = (song) => {
    setSelectedSong(song);
  };

  return (
    <div className="app-container">
      
      <Sidebar setCurrentView={setCurrentView} />

      <main className="main-content">
        {/* Home view */}
        {currentView === 'home' && (
        <div>
          <Home />
        </div>
        )}


        {/* Music view */}
        {currentView === 'music' && (
          <div>
            <Title/>
            <MusicHeader/>

            <CityInput
              city={city}
              setCity={setCity}
              handleRecommendations={handleRecommendations}
              isLoading={isLoading}
            />

            {weather && (
              <WeatherDisplay
                weather={weather}
                getWeatherEmoji={getWeatherEmoji}
              />
            )}

            {recommendations.length > 0 && (
              <RecommendationsList
                recommendations={recommendations}
                handleSongClick={handleSongClick}
                selectedSong={selectedSong}
              />
            )}

            {error && <p className="error">{error}</p>}
          </div>
        )}

        {/* Weather view */}
        {currentView === 'weather' && (
          <div>
          
          <Weather city= 'delhi' />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
