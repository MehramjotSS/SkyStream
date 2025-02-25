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

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Load dataset
dataset_path = "spotify_data.csv"
try:
    df = pd.read_csv(dataset_path)
    print("Dataset loaded successfully.")  # Debug statement
except Exception as e:
    print("Error loading dataset:", e)  # Debug statement
    raise

# Define a list of popular artists
POPULAR_ARTISTS = [
    "The Weeknd", "Justin Bieber", "Taylor Swift", "Bruno Mars",
    "Ed Sheeran", "Ariana Grande", "Drake", "Billie Eilish",
    "Dua Lipa", "Post Malone", "Shawn Mendes", "Adele"
]

# Filter the dataset to include only songs from popular artists
df = df[df['artist_name'].isin(POPULAR_ARTISTS)]
print("Filtered dataset to include only popular artists.")  # Debug statement

# Select features and preprocess data
selected_features = ['track_name', 'artist_name', 'danceability', 'energy', 'loudness', 'tempo', 'valence', 'acousticness']
df = df[selected_features].dropna()
scaler = StandardScaler()
df[selected_features[2:]] = scaler.fit_transform(df[selected_features[2:]])

# Train GMM model
gmm = GaussianMixture(n_components=10, random_state=42)
df['cluster'] = gmm.fit_predict(df[selected_features[2:]])
print("GMM model trained successfully.")  # Debug statement

def get_weather(city):
    """Fetch real-time weather data."""
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    print("Fetching weather data for city:", city)  # Debug statement
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        print("Weather data fetched successfully:", data)  # Debug statement
        return {
            'temperature': data['main']['temp'],
            'humidity': data['main']['humidity'],
            'rainfall': data.get('rain', {}).get('1h', 0)
        }
    print("Failed to fetch weather data. Status code:", response.status_code)  # Debug statement
    return None

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        # Log the incoming request data
        print("Incoming request data:", request.json)  # Debug statement

        city = request.json.get('city')
        if not city:
            print("City name is missing in the request.")  # Debug statement
            return jsonify({"error": "City name is required"}), 400

        print("Received city:", city)  # Debug statement

        weather_data = get_weather(city)
        if not weather_data:
            print("Failed to fetch weather data for city:", city)  # Debug statement
            return jsonify({"error": "Invalid city or API issue"}), 400

        # Convert weather to features
        weather_df = pd.DataFrame([weather_data])
        print("Weather DataFrame:", weather_df)  # Debug statement

        weather_df['danceability'] = np.clip((100 - weather_df['humidity']) / 100, 0, 1)
        weather_df['energy'] = np.clip(weather_df['temperature'] / 50, 0, 1)
        weather_df['loudness'] = -10 + (weather_df['rainfall'] * -5)
        weather_df['tempo'] = 100 + (weather_df['temperature'] * 2)
        weather_df['valence'] = np.clip(weather_df['temperature'] / 40, 0, 1)
        weather_df['acousticness'] = np.clip(weather_df['humidity'] / 100, 0, 1)

        print("Weather Features:", weather_df)  # Debug statement

        # Scale weather features
        weather_scaled = scaler.transform(weather_df[['danceability', 'energy', 'loudness', 'tempo', 'valence', 'acousticness']])
        print("Scaled Weather Features:", weather_scaled)  # Debug statement

        # Predict cluster
        cluster_label = gmm.predict(weather_scaled)[0]
        print("Predicted Cluster:", cluster_label)  # Debug statement

        # Get recommendations
        recommended_songs = df[df['cluster'] == cluster_label].sample(n=5, random_state=42)
        print("Recommended Songs:", recommended_songs)  # Debug statement

        return jsonify(recommended_songs[['track_name', 'artist_name']].to_dict(orient="records"))
    except Exception as e:
        print("Error in recommend function:", e)  # Debug statement
        return jsonify({"error": "An internal server error occurred"}), 500

if __name__ == '__main__':
    app.run(debug=True)