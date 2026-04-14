<template>
  <div class="app" :class="{ light: isLight }">
    <div class="container">

      <div class="header fade-in">
        <div class="header-left">
          <span class="header-icon">⛅</span>
          <h1>Weather App</h1>
        </div>
        <button class="theme-toggle" @click="isLight = !isLight" :title="isLight ? 'Switch to Dark' : 'Switch to Light'">
          {{ isLight ? '🌙' : '☀️' }}
        </button>
      </div>

      <div class="fade-in" style="width:100%">
        <SearchBar :loading="loading" @search="fetchWeather" />
        <button class="location-btn" @click="useMyLocation" :disabled="locating || loading">
          <span v-if="locating">📡 Detecting location...</span>
          <span v-else>📍 Use my location</span>
        </button>
      </div>

      <Favorites ref="favoritesRef" @select="fetchWeather" />

      <Transition name="fade">
        <div v-if="error" class="error-msg">⚠ {{ error }}</div>
      </Transition>

      <!-- Loading skeleton -->
      <template v-if="loading">
        <div class="skeleton-card">
          <div class="sk sk-title"></div>
          <div class="sk sk-temp"></div>
          <div class="sk-grid">
            <div class="sk sk-box" v-for="n in 4" :key="n"></div>
          </div>
        </div>
        <div class="skeleton-card">
          <div class="sk sk-title"></div>
          <div class="sk sk-row" v-for="n in 5" :key="n"></div>
        </div>
      </template>

      <TransitionGroup name="slide-up" tag="div" class="results" v-if="!loading && weather">
        <WeatherCard key="weather" :weather="weather" @save="saveToFavorites" />
        <ForecastCard key="forecast" v-if="forecast.length" :forecast="forecast" />
        <MapView key="map" :lat="weather.lat" :lon="weather.lon" :city="weather.city" :isLight="isLight" />
        <NewsCard key="news" :articles="news" :loading="newsLoading" />
      </TransitionGroup>

      <Transition name="fade">
        <div v-if="!weather && !error && !loading" class="placeholder">
          <div class="placeholder-icon">🌍</div>
          <p>Enter a city name to get started</p>
        </div>
      </Transition>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import SearchBar from './components/SearchBar.vue'
import WeatherCard from './components/WeatherCard.vue'
import ForecastCard from './components/ForecastCard.vue'
import MapView from './components/MapView.vue'
import Favorites from './components/Favorites.vue'
import NewsCard from './components/NewsCard.vue'

const API = 'http://localhost:8000'
const isLight = ref(false)
const weather = ref(null)
const forecast = ref([])
const loading = ref(false)
const error = ref('')
const favoritesRef = ref(null)
const locating = ref(false)
const news = ref([])
const newsLoading = ref(false)

function saveToFavorites() {
  if (weather.value) favoritesRef.value?.add(weather.value.city)
}

async function fetchNews(city) {
  newsLoading.value = true
  news.value = []
  try {
    const res = await axios.get(`${API}/weather/news`, { params: city ? { city } : {} })
    news.value = res.data.articles
  } catch {
    news.value = []
  } finally {
    newsLoading.value = false
  }
}

async function fetchByCoords(lat, lon) {
  loading.value = true
  error.value = ''
  weather.value = null
  forecast.value = []
  try {
    const [currentRes, forecastRes] = await Promise.all([
      axios.get(`${API}/weather/current`, { params: { lat, lon } }),
      axios.get(`${API}/weather/forecast`, { params: { lat, lon } }),
    ])
    weather.value = currentRes.data
    forecast.value = forecastRes.data.forecast
    fetchNews(weather.value.city)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}

function useMyLocation() {
  if (!navigator.geolocation) {
    error.value = 'Geolocation is not supported by your browser.'
    return
  }
  locating.value = true
  error.value = ''
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      locating.value = false
      fetchByCoords(pos.coords.latitude, pos.coords.longitude)
    },
    () => {
      locating.value = false
      error.value = 'Location access denied. Please search for a city manually.'
    }
  )
}

onMounted(() => useMyLocation())

const MOCK_WEATHER = {
  city: 'London', country: 'GB', lat: 51.5074, lon: -0.1278,
  temp: 14, feels_like: 12, humidity: 72, description: 'overcast clouds',
  icon: '04d', wind_speed: 5.1, visibility: 10,
}
const MOCK_FORECAST = [
  { date: '2026-04-15', temp_min: 10, temp_max: 15, description: 'light rain', icon: '10d' },
  { date: '2026-04-16', temp_min: 9,  temp_max: 13, description: 'overcast clouds', icon: '04d' },
  { date: '2026-04-17', temp_min: 11, temp_max: 16, description: 'few clouds', icon: '02d' },
  { date: '2026-04-18', temp_min: 12, temp_max: 18, description: 'clear sky', icon: '01d' },
  { date: '2026-04-19', temp_min: 10, temp_max: 15, description: 'scattered clouds', icon: '03d' },
]

async function fetchWeather(city) {
  if (!city.trim()) return
  loading.value = true
  error.value = ''
  weather.value = null
  forecast.value = []

  try {
    const [currentRes, forecastRes] = await Promise.all([
      axios.get(`${API}/weather/current`, { params: { city } }),
      axios.get(`${API}/weather/forecast`, { params: { city } }),
    ])
    weather.value = currentRes.data
    forecast.value = forecastRes.data.forecast
    fetchNews(city)
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 500) {
      weather.value = { ...MOCK_WEATHER, city: city || MOCK_WEATHER.city }
      forecast.value = MOCK_FORECAST
      error.value = '⚠ API key not active yet — showing mock data for preview'
    } else {
      error.value = err.response?.data?.detail || 'Something went wrong. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

body { font-family: 'Inter', sans-serif; }

/* ── Dark (default) ── */
.app {
  --bg:           #0d1117;
  --surface:      #161b22;
  --border:       #30363d;
  --border-sub:   #21262d;
  --text:         #e6edf3;
  --text-muted:   #8b949e;
  --text-dim:     #484f58;
  --accent:       #58a6ff;
  --btn-bg:       #238636;
  --btn-hover:    #2ea043;
  --error-bg:     rgba(248,81,73,0.15);
  --error-border: rgba(248,81,73,0.4);
  --error-text:   #f85149;
  --skeleton:     #21262d;
  --skeleton-shine:#2d333b;

  min-height: 100vh;
  background: var(--bg);
  display: flex;
  justify-content: center;
  padding: 48px 16px;
  transition: background 0.3s;
}

/* ── Light ── */
.app.light {
  --bg:           #f6f8fa;
  --surface:      #ffffff;
  --border:       #d0d7de;
  --border-sub:   #e8ecf0;
  --text:         #1f2328;
  --text-muted:   #57606a;
  --text-dim:     #adb5bd;
  --accent:       #0969da;
  --btn-bg:       #1a7f37;
  --btn-hover:    #218a3c;
  --error-bg:     rgba(207,34,46,0.08);
  --error-border: rgba(207,34,46,0.3);
  --error-text:   #cf222e;
  --skeleton:     #e8ecf0;
  --skeleton-shine:#f0f3f6;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  max-width: 500px;
}

/* ── Header ── */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 8px;
}
.header-left { display: flex; align-items: center; gap: 10px; }
.header-icon { font-size: 1.8rem; }
.header h1 {
  color: var(--text);
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}
.theme-toggle {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
  line-height: 1;
}
.theme-toggle:hover { border-color: var(--accent); transform: scale(1.1); }

/* ── Location button ── */
.location-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  margin-top: 8px;
  padding: 10px;
  background: transparent;
  border: 1px dashed var(--border);
  border-radius: 10px;
  color: var(--text-muted);
  font-size: 0.88rem;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.location-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(88, 166, 255, 0.05);
}

.location-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Error ── */
.error-msg {
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  color: var(--error-text);
  padding: 12px 20px;
  border-radius: 10px;
  width: 100%;
  text-align: center;
  font-size: 0.9rem;
}

/* ── Placeholder ── */
.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 60px;
  color: var(--text-dim);
}
.placeholder-icon { font-size: 3rem; animation: float 3s ease-in-out infinite; }
.placeholder p { font-size: 0.95rem; }

/* ── Results wrapper ── */
.results {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

/* ── Skeleton loader ── */
.skeleton-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.sk {
  background: linear-gradient(90deg, var(--skeleton) 25%, var(--skeleton-shine) 50%, var(--skeleton) 75%);
  background-size: 200% 100%;
  border-radius: 8px;
  animation: shimmer 1.4s infinite;
}
.sk-title  { height: 16px; width: 40%; }
.sk-temp   { height: 56px; width: 55%; }
.sk-grid   { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.sk-box    { height: 64px; }
.sk-row    { height: 36px; }

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.35s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

.slide-up-enter-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(24px);
}
.slide-up-move {
  transition: transform 0.4s ease;
}

/* ── Entrance animation ── */
.fade-in {
  animation: fadeInDown 0.5s ease both;
}

/* ── Keyframes ── */
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
