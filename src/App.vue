<template>
  <AuthPage v-if="!token" @authenticated="onAuthenticated" />
  <div v-else class="app" :class="{ light: isLight }">
    <div class="container">

      <div class="header fade-in">
        <div class="header-left">
          <span class="header-icon">⛅</span>
          <h1>Weather App</h1>
        </div>
        <div class="header-right">
          <span class="username">👤 {{ username }}</span>
          <button class="theme-toggle" @click="isLight = !isLight" :title="isLight ? 'Switch to Dark' : 'Switch to Light'">
            {{ isLight ? '🌙' : '☀️' }}
          </button>
          <button class="logout-btn" @click="logout" title="Sign out">⏻</button>
        </div>
      </div>

      <div class="fade-in" style="width:100%">
        <SearchBar :loading="loading" :locating="locating" :modelValue="searchQuery" @update:modelValue="searchQuery = $event" @search="fetchWeather" @locate="useMyLocation" />
      </div>

      <Favorites ref="favoritesRef" style="display:none" />      <Transition name="fade">
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

        <!-- Top row: Weather + Forecast + Map side by side -->
        <div key="top-row" class="top-row">
          <WeatherCard :weather="weather" :is-favorited="isFavorited" @save="saveToFavorites" />
          <ForecastCard :forecast="forecast" :city="weather.city" :lat="weather.lat" :lon="weather.lon" />
          <MapView :lat="weather.lat" :lon="weather.lon" :city="weather.city" :isLight="isLight" />
        </div>

        <!-- News section with tab header -->
        <div key="news-section" class="news-section">
          <div class="news-tab-header">
            <span class="news-tab-title">📰 Weather News</span>
          </div>
          <NewsCard :articles="news" :loading="newsLoading" :show-title="false" />
        </div>

      </TransitionGroup>

      <Transition name="fade">
        <div v-if="!weather && !error && !loading" class="placeholder">
          <div class="placeholder-icon">🌍</div>
          <p>Enter a city name to get started</p>
        </div>
      </Transition>

    </div>

    <!-- Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toastVisible" class="toast">{{ toast }}</div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import SearchBar from './components/SearchBar.vue'
import WeatherCard from './components/WeatherCard.vue'
import ForecastCard from './components/ForecastCard.vue'
import MapView from './components/MapView.vue'
import Favorites from './components/Favorites.vue'
import NewsCard from './components/NewsCard.vue'
import AuthPage from './components/AuthPage.vue'

const API = 'http://localhost:8000'
const isLight = ref(false)

// ── Auth ──
// Check for Google OAuth redirect token in URL first
const urlParams = new URLSearchParams(window.location.search)
const urlToken = urlParams.get('token')
const urlUsername = urlParams.get('username')
if (urlToken && urlUsername) {
  localStorage.setItem('auth_token', urlToken)
  localStorage.setItem('auth_username', urlUsername)
  window.history.replaceState({}, '', '/')
}

const token = ref(localStorage.getItem('auth_token') || '')
const username = ref(localStorage.getItem('auth_username') || '')

// Attach token to every axios request
axios.interceptors.request.use(config => {
  if (token.value) config.headers.Authorization = `Bearer ${token.value}`
  return config
})

// Auto-logout on 401
axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && token.value) logout()
    return Promise.reject(err)
  }
)

function onAuthenticated({ token: t, username: u }) {
  token.value = t
  username.value = u
  localStorage.setItem('auth_token', t)
  localStorage.setItem('auth_username', u)
}

function logout() {
  token.value = ''
  username.value = ''
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_username')
  weather.value = null
  forecast.value = []
  news.value = []
  error.value = ''
}
const weather = ref(null)
const forecast = ref([])
const loading = ref(false)
const error = ref('')
const favoritesRef = ref(null)
const locating = ref(false)
const news = ref([])
const newsLoading = ref(false)
const searchQuery = ref('')
const activeTab = ref('weather')
const tabs = [
  { id: 'weather',  icon: '🌡', label: 'Weather'  },
  { id: 'forecast', icon: '📅', label: 'Forecast' },
  { id: 'map',      icon: '🗺',  label: 'Map'      },
  { id: 'news',     icon: '📰', label: 'News'     },
]

function saveToFavorites() {
  if (!weather.value) return
  const wasAdded = !favoritesRef.value?.has(weather.value.city)
  favoritesRef.value?.toggle(weather.value.city)
  showToast(wasAdded ? '⭐ Added to Favorites' : '✕ Removed from Favorites')
}

const isFavorited = computed(() => favoritesRef.value?.has(weather.value?.city) ?? false)

const toast = ref('')
const toastVisible = ref(false)
let toastTimer = null

function showToast(msg) {
  toast.value = msg
  toastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastVisible.value = false }, 2500)
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
  activeTab.value = 'weather'
  try {
    const [currentRes, forecastRes] = await Promise.all([
      axios.get(`${API}/weather/current`, { params: { lat, lon } }),
      axios.get(`${API}/weather/forecast`, { params: { lat, lon } }),
    ])
    weather.value = currentRes.data
    forecast.value = forecastRes.data.forecast
    searchQuery.value = currentRes.data.city
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
  activeTab.value = 'weather'

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
  max-width: 1200px;
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

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 500;
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

.logout-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
  color: var(--text-muted);
  line-height: 1;
}
.logout-btn:hover {
  border-color: var(--error-text);
  color: var(--error-text);
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

/* ── Top row: 3 columns ── */
.top-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  width: 100%;
  align-items: start;
}

@media (max-width: 900px) {
  .top-row {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 600px) {
  .top-row {
    grid-template-columns: 1fr;
  }
}

/* ── News section ── */
.news-section {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  transition: background 0.3s, border-color 0.3s;
}

.news-tab-header {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}

.news-tab-title {
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 600;
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

/* ── Tabs ── */
.tab-bar {
  display: flex;
  gap: 4px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 4px;
  width: 100%;
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 4px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  font-family: 'Inter', sans-serif;
}

.tab-btn:hover:not(.active) {
  background: var(--border-sub);
}

.tab-btn.active {
  background: var(--accent);
}

.tab-icon {
  font-size: 1.1rem;
  line-height: 1;
}

.tab-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.02em;
}

.tab-btn.active .tab-label {
  color: #fff;
}

.tab-content {
  width: 100%;
}

/* Tab transition */
.tab-fade-enter-active, .tab-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Toast ── */
.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: #238636;
  color: #fff;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  z-index: 9999;
  white-space: nowrap;
  pointer-events: none;
}

.toast-enter-active, .toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

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
