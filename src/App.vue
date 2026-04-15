<template>
  <AuthPage v-if="!token" @authenticated="onAuthenticated" />

  <div v-else class="app" :class="{ light: isLight }">
    <div class="container">

      <!-- Header -->
      <header class="header fade-in">
        <div class="header-left">
          <span class="header-icon">⛅</span>
          <h1>Weather App</h1>
        </div>
        <div class="header-right">
          <span class="username">👤 {{ username }}</span>
          <button class="fav-modal-btn" title="Favorite cities" @click="showFavModal = true">⭐</button>
          <button
            class="theme-toggle"
            :title="isLight ? 'Switch to Dark' : 'Switch to Light'"
            @click="isLight = !isLight"
          >
            {{ isLight ? '🌙' : '☀️' }}
          </button>
          <button class="logout-btn" title="Sign out" @click="handleLogout">⏻</button>
        </div>
      </header>

      <!-- Search bar -->
      <div class="fade-in" style="width:100%">
        <SearchBar
          :loading="loading"
          :locating="locating"
          :model-value="searchQuery"
          @update:model-value="searchQuery = $event"
          @search="onSearch"
          @locate="onLocate"
        />
      </div>

      <!-- Error banner -->
      <Transition name="fade">
        <div v-if="error" class="error-msg">⚠ {{ error }}</div>
      </Transition>

      <!-- Loading skeleton -->
      <template v-if="loading">
        <div class="skeleton-card">
          <div class="sk sk-title"></div>
          <div class="sk sk-temp"></div>
          <div class="sk-grid">
            <div v-for="n in 4" :key="n" class="sk sk-box"></div>
          </div>
        </div>
        <div class="skeleton-card">
          <div class="sk sk-title"></div>
          <div v-for="n in 5" :key="n" class="sk sk-row"></div>
        </div>
      </template>

      <!-- Results -->
      <TransitionGroup v-if="!loading && weather" name="slide-up" tag="div" class="results">
        <!-- Top row: Weather + Forecast + Map -->
        <div key="top-row" class="top-row">
          <WeatherCard
            :weather="weather"
            :is-favorited="isFavorited"
            @save="toggleFavorite"
          />
          <ForecastCard
            :forecast="forecast"
            :city="weather.city"
            :lat="weather.lat"
            :lon="weather.lon"
          />
          <MapView
            :lat="weather.lat"
            :lon="weather.lon"
            :city="weather.city"
            :is-light="isLight"
          />
        </div>

        <!-- News section -->
        <div key="news-section" class="news-section">
          <div class="news-tab-header">
            <span class="news-tab-title">📰 Weather News</span>
          </div>
          <NewsCard :articles="news" :loading="newsLoading" :show-title="false" />
        </div>
      </TransitionGroup>

      <!-- Empty state -->
      <Transition name="fade">
        <div v-if="!weather && !error && !loading" class="placeholder">
          <div class="placeholder-icon">🌍</div>
          <p>Enter a city name to get started</p>
        </div>
      </Transition>

    </div>

    <!-- Toast notification -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toastVisible" class="toast">{{ toastMessage }}</div>
      </Transition>
    </Teleport>

    <!-- Favorites modal -->
    <FavoritesModal :open="showFavModal" @close="showFavModal = false" @select="onSearch" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import AuthPage from './components/AuthPage.vue'
import FavoritesModal from './components/FavoritesModal.vue'
import ForecastCard from './components/ForecastCard.vue'
import MapView from './components/MapView.vue'
import NewsCard from './components/NewsCard.vue'
import SearchBar from './components/SearchBar.vue'
import WeatherCard from './components/WeatherCard.vue'

import { useAuth } from './composables/useAuth'
import { useFavorites } from './composables/useFavorites'
import { useGeolocation } from './composables/useGeolocation'
import { useWeather } from './composables/useWeather'

// ── Theme ─────────────────────────────────────────────────────────────────────
const isLight = ref(false)

// ── Auth ──────────────────────────────────────────────────────────────────────
const { token, username, logout, handleAuthenticated } = useAuth()

function onAuthenticated(data) {
  handleAuthenticated(data)
  onLocate()
}

function handleLogout() {
  logout()
  reset()
}

// ── Weather ───────────────────────────────────────────────────────────────────
const { weather, forecast, news, loading, newsLoading, error, fetchByCity, fetchByCoords, reset } =
  useWeather()

const searchQuery = ref('')

async function onSearch(city) {
  if (!city?.trim()) return
  searchQuery.value = city
  await fetchByCity(city)
}

// ── Geolocation ───────────────────────────────────────────────────────────────
const { locating, locate } = useGeolocation()

async function onLocate() {
  try {
    const { lat, lon } = await locate()
    await fetchByCoords(lat, lon)
    if (weather.value) searchQuery.value = weather.value.city
  } catch (err) {
    error.value = err.message
  }
}

// ── Favorites ─────────────────────────────────────────────────────────────────
const { toggle: toggleFav, has } = useFavorites()
const showFavModal = ref(false)

const isFavorited = computed(() => has(weather.value?.city))

function toggleFavorite() {
  if (!weather.value) return
  const wasAdded = !has(weather.value.city)
  toggleFav(weather.value.city)
  showToast(wasAdded ? '⭐ Added to Favorites' : '✕ Removed from Favorites')
}

// ── Toast ─────────────────────────────────────────────────────────────────────
const toastMessage = ref('')
const toastVisible = ref(false)
let toastTimer = null

function showToast(msg) {
  toastMessage.value = msg
  toastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastVisible.value = false
  }, 2500)
}

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(() => {
  if (token.value) onLocate()
})
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

body { font-family: 'Inter', sans-serif; }

/* ── Dark theme (default) ── */
.app {
  --bg:             #0d1117;
  --surface:        #161b22;
  --border:         #30363d;
  --border-sub:     #21262d;
  --text:           #e6edf3;
  --text-muted:     #8b949e;
  --text-dim:       #484f58;
  --accent:         #58a6ff;
  --btn-bg:         #238636;
  --btn-hover:      #2ea043;
  --error-bg:       rgba(248,81,73,0.15);
  --error-border:   rgba(248,81,73,0.4);
  --error-text:     #f85149;
  --skeleton:       #21262d;
  --skeleton-shine: #2d333b;

  min-height: 100vh;
  background: var(--bg);
  display: flex;
  justify-content: center;
  padding: 48px 16px;
  transition: background 0.3s;
}

/* ── Light theme ── */
.app.light {
  --bg:             #f6f8fa;
  --surface:        #ffffff;
  --border:         #d0d7de;
  --border-sub:     #e8ecf0;
  --text:           #1f2328;
  --text-muted:     #57606a;
  --text-dim:       #adb5bd;
  --accent:         #0969da;
  --btn-bg:         #1a7f37;
  --btn-hover:      #218a3c;
  --error-bg:       rgba(207,34,46,0.08);
  --error-border:   rgba(207,34,46,0.3);
  --error-text:     #cf222e;
  --skeleton:       #e8ecf0;
  --skeleton-shine: #f0f3f6;
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
  transition: border-color 0.2s, transform 0.15s;
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

.logout-btn:hover { border-color: var(--error-text); color: var(--error-text); }

.fav-modal-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.15s;
  line-height: 1;
}

.fav-modal-btn:hover { border-color: #f0c040; transform: scale(1.1); }

/* ── Error banner ── */
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

/* ── Empty state ── */
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
  .top-row { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 600px) {
  .top-row { grid-template-columns: 1fr; }
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
  background: linear-gradient(
    90deg,
    var(--skeleton) 25%,
    var(--skeleton-shine) 50%,
    var(--skeleton) 75%
  );
  background-size: 200% 100%;
  border-radius: 8px;
  animation: shimmer 1.4s infinite;
}

.sk-title { height: 16px; width: 40%; }
.sk-temp  { height: 56px; width: 55%; }
.sk-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.sk-box   { height: 64px; }
.sk-row   { height: 36px; }

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

.toast-enter-active,
.toast-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }

.toast-enter-from,
.toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }

/* ── Transitions ── */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.35s ease; }

.fade-enter-from,
.fade-leave-to { opacity: 0; }

.slide-up-enter-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.slide-up-enter-from   { opacity: 0; transform: translateY(24px); }
.slide-up-move         { transition: transform 0.4s ease; }

/* ── Entrance animation ── */
.fade-in { animation: fadeInDown 0.5s ease both; }

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
