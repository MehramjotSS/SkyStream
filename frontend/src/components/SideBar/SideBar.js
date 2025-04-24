import React, { useState } from 'react';
import './SideBar.css';

const Sidebar = ({ setCurrentView }) => {
  const [activeTab, setActiveTab] = useState('home');  // Track the active tab

  const handleTabClick = (view) => {
    setActiveTab(view);  // Set active tab
    setCurrentView(view);  // Change the main view in App.js
  };

  return (
    <div className="sidebar">
      <h2>Contents</h2>
      <nav>
        <ul>
          <li
            className={activeTab === 'home' ? 'active' : ''}
            onClick={() => handleTabClick('home')}
          >
            🏠 Home
          </li>
          <li
            className={activeTab === 'music' ? 'active' : ''}
            onClick={() => handleTabClick('music')}
          >
            🎵 Music
          </li>
          <li
            className={activeTab === 'weather' ? 'active' : ''}
            onClick={() => handleTabClick('weather')}
          >
            🌦 Weather
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
