import React from 'react';
import './WeatherDisplay.css';  // Importing the CSS file

function WeatherDisplay({ weather, getWeatherEmoji }) {
  return weather ? (
    <div className="weather-display">
      <h2>
      It's {weather.condition.toLowerCase()}<span>{getWeatherEmoji(weather.condition)}</span>  in {weather.city} 
        
      </h2>
    </div>
  ) : null;
}

export default WeatherDisplay;
