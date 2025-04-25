import React, { useState, useEffect, useRef } from 'react';
import './Weather.css';

const apiKey = 'ab01a959371c6df124a30abc8159667e';

const weatherConditions = {
  Clear: {
    image: '/img/clear.jpg',
    sound: '/sound/clear.mp3',
    emoji: '☀️',
    color: 'rgba(255, 215, 0, 0.3)'
  },
  Rain: {
    image: '/img/Rainy.jpg',
    sound: '/sound/rain.mp3',
    emoji: '🌧️',
    color: 'rgba(70, 130, 180, 0.3)'
  },
  Snow: {
    image: '/img/Snowy.jpg',
    sound: '/sound/snow.mp3',
    emoji: '❄️',
    color: 'rgba(230, 230, 250, 0.3)'
  },
  Clouds: {
    image: '/img/Cloudy.jpg',
    sound: '/sound/cloudy.mp3',
    emoji: '☁️',
    color: 'rgba(119, 136, 153, 0.3)'
  },
  Thunderstorm: {
    image: '/img/thunderstorm.jpg',
    sound: '/sound/cloudy.mp3',
    emoji: '⛈️',
    color: 'rgba(72, 61, 139, 0.3)'
  },
  Drizzle: {
    image: '/img/drizzle.jpg',
    sound: '/sound/rain.mp3',
    emoji: '🌦️',
    color: 'rgba(135, 206, 235, 0.3)'
  },
  Mist: {
    image: '/img/mist.jpg',
    sound: '/sound/rain.mp3',
    emoji: '🌫️',
    color: 'rgba(211, 211, 211, 0.3)'
  },
  default: {
    image: '/img/clear.jpg',
    sound: '/sound/clear.mp3',
    emoji: '🌈',
    color: 'rgba(147, 112, 219, 0.3)'
  }
};

const getInitialCity = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('city') || 'Ludhiana';
};

const WeatherPage = () => {
  const [city, setCity] = useState(getInitialCity());
  const [inputCity, setInputCity] = useState(city);
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [requiresInteraction, setRequiresInteraction] = useState(true);
  const audioRef = useRef(null);
  const containerRef = useRef(null);

  const fetchCurrentWeather = async (lat, lon) => {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    return await response.json();
  };

  const fetchForecast = async (lat, lon) => {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    return await response.json();
  };

  const getCoordinates = async () => {
    if (!city) {
      setError('Please enter a city name');
      return null;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
      );
      const data = await response.json();

      if (data.cod === '404') {
        throw new Error('City not found');
      }

      return data.coord;
    } catch (err) {
      throw new Error('Failed to get coordinates: ' + err.message);
    }
  };

  const updateWeatherTheme = (condition) => {
    const conditionData = weatherConditions[condition] || weatherConditions.default;

    if (containerRef.current) {
      containerRef.current.style.backgroundImage = `url(${conditionData.image})`;
    }

    if (audioRef.current) {
      audioRef.current.src = conditionData.sound;
      if (!isMuted && !requiresInteraction) {
        audioRef.current.play().catch(err => {
          console.warn('Audio playback failed:', err);
          setRequiresInteraction(true);
        });
      }
    }

    return conditionData;
  };

  const handleUserInteraction = () => {
    if (requiresInteraction && audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setRequiresInteraction(false);
          setIsMuted(false);
        })
        .catch(err => console.warn('Audio playback failed:', err));
    }
  };

  const fetchWeatherData = async () => {
    setLoading(true);
    setError('');
    try {
      const coords = await getCoordinates();
      if (!coords) return;

      const [current, forecastData] = await Promise.all([
        fetchCurrentWeather(coords.lat, coords.lon),
        fetchForecast(coords.lat, coords.lon)
      ]);

      setWeatherData(current);
      setForecast(forecastData.list);

      const condition = current.weather[0].main;
      updateWeatherTheme(condition);
    } catch (err) {
      setError(err.message);
      updateWeatherTheme('default');
    } finally {
      setLoading(false);
    }
  };

  const handleCitySubmit = (e) => {
    if (e.key === 'Enter') {
      setCity(inputCity);
    }
  };

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    fetchWeatherData();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [city]);

  const toggleMute = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(e => console.warn("Playback failed:", e));
        setIsMuted(false);
      } else {
        audioRef.current.pause();
        setIsMuted(true);
      }
    }
  };

  if (loading) {
    return (
      <div className="weather-container">
        <div className="loading-spinner"></div>
        <p>Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-container error">
        <h2>Error</h2>
        <p>{error}</p>
        <p>Showing default weather theme</p>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  const currentCondition = weatherData.weather[0].main;
  const conditionData = weatherConditions[currentCondition] || weatherConditions.default;

  return (
    <div
      ref={containerRef}
      className="weather-container"
      style={{
        backgroundColor: conditionData.color,
        backgroundImage: `url(${conditionData.image})`
      }}
      onClick={handleUserInteraction}
    >
      <div className="city-input-box">
        <input
          type="text"
          placeholder="Enter city..."
          value={inputCity}
          onChange={(e) => setInputCity(e.target.value)}
          onKeyDown={handleCitySubmit}
        />
      </div>

      <div className="weather-content">
        <div className="current-weather">
          <h1>
            {city} {conditionData.emoji}
          </h1>
          <div className="weather-card">
            <h2>Current Weather</h2>
            <div className="weather-main">
              <span className="temp">{Math.round(weatherData.main.temp)}°C</span>
              <span className="condition">{currentCondition}</span>
            </div>
            <div className="weather-details">
              <p>Feels like: {Math.round(weatherData.main.feels_like)}°C</p>
              <p>Humidity: {weatherData.main.humidity}%</p>
              <p>Wind: {weatherData.wind.speed} m/s</p>
            </div>
          </div>
        </div>

        <div className="forecast">
          <h2>5-Day Forecast</h2>
          <div className="forecast-cards">
            {forecast.filter((_, index) => index % 8 === 0).map((item, index) => {
              const date = new Date(item.dt * 1000);
              const dayCondition = item.weather[0].main;
              const dayData = weatherConditions[dayCondition] || weatherConditions.default;

              return (
                <div key={index} className="forecast-card">
                  <h3>{date.toLocaleDateString('en-US', { weekday: 'short' })}</h3>
                  <p>{dayData.emoji}</p>
                  <p>{Math.round(item.main.temp_max)}° / {Math.round(item.main.temp_min)}°</p>
                  <p>{dayCondition}</p>
                </div>
              );
            })}
          </div>
        </div>

        <button className="sound-toggle" onClick={toggleMute}>
          {isMuted || requiresInteraction ? '🔇 Sound Off' : '🔊 Sound On'}
        </button>

        {requiresInteraction && (
          <div className="interaction-prompt">
            <p>Click anywhere to enable sound</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherPage;
