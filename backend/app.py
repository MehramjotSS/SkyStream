from flask import Flask, request, jsonify, send_from_directory
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
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
CORS(app)

# Load and filter dataset
df = pd.read_csv("spotify_data.csv")
POPULAR_ARTISTS = [
    "The Weeknd", "Justin Bieber", "Taylor Swift", "Bruno Mars",
    "Ed Sheeran", "Ariana Grande", "Drake", "Billie Eilish",
    "Dua Lipa", "Post Malone", "Shawn Mendes", "Adele"
]
df = df[df['artist_name'].isin(POPULAR_ARTISTS)]

selected_features = [
    'track_name', 'artist_name', 'danceability', 'energy',
    'loudness', 'tempo', 'valence', 'acousticness'
]
df = df[selected_features].dropna()

scaler = StandardScaler()
df[selected_features[2:]] = scaler.fit_transform(df[selected_features[2:]])

gmm = GaussianMixture(n_components=10, random_state=42)
df['cluster'] = gmm.fit_predict(df[selected_features[2:]])

def get_weather(city):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return {
            'city': city,
            'temperature': data['main']['temp'],
            'humidity': data['main']['humidity'],
            'rainfall': data.get('rain', {}).get('1h', 0),
            'weather_condition': data['weather'][0]['main'].lower()
        }
    return None

def convert_weather_to_features(weather_data):
    weather_df = pd.DataFrame([weather_data])
    humidity = weather_df['humidity'].iloc[0]
    temperature = weather_df['temperature'].iloc[0]
    rainfall = weather_df['rainfall'].iloc[0]

    weather_df['danceability'] = max(0, min(1, (100 - humidity) / 100))
    weather_df['energy'] = max(0, min(1, temperature / 50))
    weather_df['loudness'] = -10 + (rainfall * -5)
    weather_df['tempo'] = 100 + (temperature * 2)
    weather_df['valence'] = max(0, min(1, temperature / 40))
    weather_df['acousticness'] = max(0, min(1, humidity / 100))

    return weather_df

def get_youtube_link(query):
    search_url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": query,
        "key": YOUTUBE_API_KEY,
        "type": "video",
        "maxResults": 1,
    }
    response = requests.get(search_url, params=params)
    if response.status_code == 200:
        results = response.json()
        if results["items"]:
            video_id = results["items"][0]["id"]["videoId"]
            return f"https://www.youtube.com/watch?v={video_id}"
    return None

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        city = request.json.get('city')
        if not city:
            return jsonify({"error": "City name is required"}), 400

        weather_data = get_weather(city)
        if not weather_data:
            return jsonify({"error": "Invalid city or API issue"}), 400

        weather_df = convert_weather_to_features(weather_data)
        if weather_df is None:
            return jsonify({"error": "Failed to process weather data"}), 500

        weather_scaled = scaler.transform(weather_df[['danceability', 'energy', 'loudness', 'tempo', 'valence', 'acousticness']])
        cluster_label = gmm.predict(weather_scaled)[0]

        recommended_songs = df[df['cluster'] == cluster_label].sample(n=10, random_state=42)

        recommendations = []
        for _, row in recommended_songs.iterrows():
            query = f"{row['track_name']} {row['artist_name']}"
            youtube_link = get_youtube_link(query)
            recommendations.append({
                "track_name": row["track_name"],
                "artist_name": row["artist_name"],
                "youtube_url": youtube_link
            })

        return jsonify({
            "weather": {
                "city": weather_data['city'],
                "condition": weather_data['weather_condition'],
            },
            "recommendations": recommendations
        })
    except Exception as e:
        print("Error in recommend function:", e)
        return jsonify({"error": "An internal server error occurred"}), 500

# Serve React frontend
@app.route('/')
@app.route('/<path:path>')
def serve_react(path=''):
    file_path = os.path.join(app.static_folder, path)
    if path != "" and os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    # Use the PORT environment variable if available, otherwise default to 5001
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True, use_reloader=False)
