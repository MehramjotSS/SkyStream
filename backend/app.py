from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import requests
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
API_KEY = os.getenv("OPENWEATHER_API_KEY")

# Create a Flask app
app = Flask(__name__)
CORS(app)  # Allow frontend to communicate with backend

# Load the Spotify dataset
try:
    df = pd.read_csv("rspotify_data.csv")
    print("Dataset loaded successfully.")
except Exception as e:
    print("Error loading dataset:", e)
    raise

# List of popular artists to filter the dataset
POPULAR_ARTISTS = [
    "The Weeknd", "Justin Bieber", "Taylor Swift", "Bruno Mars",
    "Ed Sheeran", "Ariana Grande", "Drake", "Billie Eilish",
    "Dua Lipa", "Post Malone", "Shawn Mendes", "Adele"
]

# Filter the dataset to include only songs from popular artists
df = df[df['artist_name'].isin(POPULAR_ARTISTS)]
print("Filtered dataset to include only popular artists.")

# Select the features we need for the model
selected_features = [
    'track_name', 'artist_name', 'danceability', 'energy',
    'loudness', 'tempo', 'valence', 'acousticness'
]

# Remove rows with missing values
df = df[selected_features].dropna()

# Scale the features (normalize them for the model)
scaler = StandardScaler()
df[selected_features[2:]] = scaler.fit_transform(df[selected_features[2:]])

# Train the Gaussian Mixture Model (GMM)
gmm = GaussianMixture(n_components=10, random_state=42)
df['cluster'] = gmm.fit_predict(df[selected_features[2:]])
print("GMM model trained successfully.")

def get_weather(city):
    """Fetch weather data for a given city using the OpenWeather API."""
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        print(f"Weather data fetched successfully for {city}.")
        return {
            'temperature': data['main']['temp'],
            'humidity': data['main']['humidity'],
            'rainfall': data.get('rain', {}).get('1h', 0)
        }
    else:
        print(f"Failed to fetch weather data for {city}. Status code: {response.status_code}")
        return None

def convert_weather_to_features(weather_data):
    """Convert weather data into features for the model."""
    if not weather_data:
        print("Weather data is missing.")
        return None

    # Create a DataFrame with a single row
    weather_df = pd.DataFrame([weather_data])

    # Extract single values from the DataFrame
    humidity = weather_df['humidity'].iloc[0]  # Get the first (and only) value
    temperature = weather_df['temperature'].iloc[0]
    rainfall = weather_df['rainfall'].iloc[0]

    # Calculate features based on weather data
    weather_df['danceability'] = max(0, min(1, (100 - humidity) / 100))
    weather_df['energy'] = max(0, min(1, temperature / 50))
    weather_df['loudness'] = -10 + (rainfall * -5)
    weather_df['tempo'] = 100 + (temperature * 2)
    weather_df['valence'] = max(0, min(1, temperature / 40))
    weather_df['acousticness'] = max(0, min(1, humidity / 100))

    print("Weather features calculated:", weather_df)
    return weather_df

@app.route('/recommend', methods=['POST'])
def recommend():
    """Handle POST requests to recommend songs based on weather."""
    try:
        # Get the city name from the request
        city = request.json.get('city')
        if not city:
            print("City name is missing in the request.")
            return jsonify({"error": "City name is required"}), 400

        print(f"Received request for city: {city}")

        # Fetch weather data for the city
        weather_data = get_weather(city)
        if not weather_data:
            print(f"Failed to fetch weather data for {city}.")
            return jsonify({"error": "Invalid city or API issue"}), 400

        # Convert weather data into features
        weather_df = convert_weather_to_features(weather_data)
        if weather_df is None:
            print("Failed to convert weather data to features.")
            return jsonify({"error": "Failed to process weather data"}), 500

        # Scale the weather features
        weather_scaled = scaler.transform(weather_df[['danceability', 'energy', 'loudness', 'tempo', 'valence', 'acousticness']])
        print("Scaled weather features:", weather_scaled)

        # Predict the cluster for the weather features
        cluster_label = gmm.predict(weather_scaled)[0]
        print(f"Predicted cluster: {cluster_label}")

        # Get 5 random songs from the predicted cluster
        recommended_songs = df[df['cluster'] == cluster_label].sample(n=5, random_state=42)
        print("Recommended songs:", recommended_songs)

        # Return the recommended songs as JSON
        return jsonify(recommended_songs[['track_name', 'artist_name']].to_dict(orient="records"))
    except Exception as e:
        print("Error in recommend function:", e)
        return jsonify({"error": "An internal server error occurred"}), 500
    
if __name__ == '__main__':
    app.run(debug=True)