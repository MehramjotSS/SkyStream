import React, { useEffect, useState } from 'react';
import './Home.css'; // Custom styling for the Home component
import backgroundImage from '../Home/HomeBackground2.jpg';

import Signature from '../components/Signature/Signature';


const Home = () => {
  const [homeData, setHomeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Static data instead of a real API call
        const data = {
          welcomeMessage: "Welcome to SkyStream – your personalized weather & music station!",
          description: "Enjoy curated music based on your current weather mood.",
          additionalInfo: "More features coming soon! Stay tuned."
        };
        
        setHomeData(data);
      } catch (err) {
        setError("Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHomeData();
  }, []);

  return (
    <div
      className="home-container"
      style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="header-container">
        <div className="emoji-left">🎶</div>  {/* Music Emoji on Left */}
        <h2>Welcome to SkyStream</h2>
        <div className="emoji-right">☁️</div> {/* Cloud Emoji on Right */}
      </div>

      {isLoading && <p>Loading home data...</p>}
      
      {error && <p className="error">{error}</p>}
      
      {homeData && (
        <div className="home-content">
          <p>{homeData.welcomeMessage}</p>
          <p>{homeData.description}</p>
          <p>{homeData.additionalInfo}</p>
        </div>
      )}
      
      {!homeData && !isLoading && !error && (
        <div className="home-placeholder">
          <p>This is the home section. You can add your content or fetch data here.</p>
        </div>
      )}

      {/* Signature widget at bottom right */}
      
      <Signature/>

    </div>
  );
};

export default Home;
