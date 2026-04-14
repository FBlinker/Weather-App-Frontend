<template>
  <div class="app" :class="{ light: isLight }">
    <div class="container">
      <div class="header">
        <div class="header-left">
          <span class="header-icon">⛅</span>
          <h1>Weather App</h1>
        </div>
        <button class="theme-toggle" @click="isLight = !isLight" :title="isLight ? 'Switch to Dark' : 'Switch to Light'">
          {{ isLight ? '🌙' : '☀️' }}
        </button>
      </div>

      <SearchBar :loading="loading" @search="fetchWeather" />

      <div v-if="error" class="error-msg">⚠ {{ error }}</div>

      <template v-if="weather">
        <WeatherCard :weather="weather" />
        <ForecastCard v-if="forecast.length" :forecast="forecast" />
      </template>

      <div v-if="!weather && !error" class="placeholder">
        <div class="placeholder-icon">🌍</div>
        <p>Enter a city name to get started</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import SearchBar from './components/SearchBar.vue'
import WeatherCard from './components/WeatherCard.vue'
import ForecastCard from './components/ForecastCard.vue'

const API = 'http://localhost:8000'
const isLight = ref(false)

const weather = ref(null)
const forecast = ref([])
const loading = ref(false)
const error = ref('')

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
  } catch (err) {
    error.value = err.response?.data?.detail || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', sans-serif;
}

/* ── Dark (default) ── */
.app {
  --bg:          #0d1117;
  --surface:     #161b22;
  --border:      #30363d;
  --border-sub:  #21262d;
  --text:        #e6edf3;
  --text-muted:  #8b949e;
  --text-dim:    #484f58;
  --accent:      #58a6ff;
  --btn-bg:      #238636;
  --btn-hover:   #2ea043;
  --error-bg:    rgba(248,81,73,0.15);
  --error-border:rgba(248,81,73,0.4);
  --error-text:  #f85149;

  min-height: 100vh;
  background: var(--bg);
  display: flex;
  justify-content: center;
  padding: 48px 16px;
  transition: background 0.3s, color 0.3s;
}

/* ── Light ── */
.app.light {
  --bg:          #f6f8fa;
  --surface:     #ffffff;
  --border:      #d0d7de;
  --border-sub:  #e8ecf0;
  --text:        #1f2328;
  --text-muted:  #57606a;
  --text-dim:    #adb5bd;
  --accent:      #0969da;
  --btn-bg:      #1a7f37;
  --btn-hover:   #218a3c;
  --error-bg:    rgba(207,34,46,0.08);
  --error-border:rgba(207,34,46,0.3);
  --error-text:  #cf222e;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  max-width: 500px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

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
  transition: background 0.2s, border-color 0.2s;
  line-height: 1;
}

.theme-toggle:hover {
  border-color: var(--accent);
}

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

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 60px;
  color: var(--text-dim);
}

.placeholder-icon { font-size: 3rem; }
.placeholder p { font-size: 0.95rem; }
</style>
