<template>
  <div class="forecast-card">
    <h3 class="forecast-title">5-Day Forecast</h3>
    <div class="forecast-list">
      <div
        v-for="day in forecast"
        :key="day.date"
        class="forecast-item"
        @click="openDetail(day)"
      >
        <span class="day">{{ formatDay(day.date) }}</span>
        <img :src="`https://openweathermap.org/img/wn/${day.icon}.png`" :alt="day.description" class="forecast-icon" />
        <span class="desc">{{ day.description }}</span>
        <div class="temps">
          <span class="t-max">{{ Math.round(day.temp_max) }}°</span>
          <span class="t-min">{{ Math.round(day.temp_min) }}°</span>
        </div>
        <span class="chevron">›</span>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <div class="modal-title">
              <img
                v-if="selectedDay"
                :src="`https://openweathermap.org/img/wn/${selectedDay.icon}.png`"
                class="modal-day-icon"
              />
              <div>
                <h2>{{ selectedDay ? formatDayFull(selectedDay.date) : '' }}</h2>
                <p class="modal-subtitle">Hourly Forecast</p>
              </div>
            </div>
            <button class="modal-close" @click="closeModal">✕</button>
          </div>

          <div class="modal-body">
            <!-- Loading -->
            <div v-if="detailLoading" class="timeline-skeleton">
              <div v-for="n in 5" :key="n" class="sk-slot">
                <div class="sk sk-time"></div>
                <div class="sk sk-circle"></div>
                <div class="sk sk-line"></div>
                <div class="sk sk-line short"></div>
              </div>
            </div>

            <!-- Timeline -->
            <div v-else-if="detail && detail.slots.length" class="timeline">
              <div v-for="(slot, i) in detail.slots" :key="slot.time" class="timeline-slot">
                <!-- Connector line -->
                <div class="connector">
                  <div class="connector-line" :class="{ hidden: i === 0 }"></div>
                  <div class="connector-dot"></div>
                  <div class="connector-line" :class="{ hidden: i === detail.slots.length - 1 }"></div>
                </div>
                <!-- Card -->
                <div class="slot-card">
                  <span class="slot-time">{{ slot.time }}</span>
                  <img
                    :src="`https://openweathermap.org/img/wn/${slot.icon}@2x.png`"
                    :alt="slot.description"
                    class="slot-icon"
                  />
                  <span class="slot-temp">{{ Math.round(slot.temp) }}°C</span>
                  <span class="slot-desc">{{ slot.description }}</span>
                  <div class="slot-stats">
                    <div class="stat">
                      <span class="stat-icon">🤔</span>
                      <span class="stat-val">{{ Math.round(slot.feels_like) }}°</span>
                      <span class="stat-label">Feels</span>
                    </div>
                    <div class="stat">
                      <span class="stat-icon">💧</span>
                      <span class="stat-val">{{ slot.humidity }}%</span>
                      <span class="stat-label">Humidity</span>
                    </div>
                    <div class="stat">
                      <span class="stat-icon">💨</span>
                      <span class="stat-val">{{ slot.wind_speed }}</span>
                      <span class="stat-label">m/s</span>
                    </div>
                    <div class="stat">
                      <span class="stat-icon">🌧</span>
                      <span class="stat-val">{{ slot.pop }}%</span>
                      <span class="stat-label">Rain</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p v-else class="no-data">No hourly data available for this date.</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const props = defineProps({
  forecast: { type: Array, required: true },
  city: { type: String, default: null },
  lat: { type: Number, default: null },
  lon: { type: Number, default: null },
})

const API = 'http://localhost:8000'
const modalOpen = ref(false)
const selectedDay = ref(null)
const detail = ref(null)
const detailLoading = ref(false)

async function openDetail(day) {
  selectedDay.value = day
  modalOpen.value = true
  detailLoading.value = true
  detail.value = null
  document.body.style.overflow = 'hidden'

  try {
    const params = { date: day.date }
    if (props.lat !== null && props.lon !== null) {
      params.lat = props.lat
      params.lon = props.lon
    } else if (props.city) {
      params.city = props.city
    }
    const res = await axios.get(`${API}/weather/forecast/detail`, { params })
    detail.value = res.data
  } catch {
    detail.value = { slots: [] }
  } finally {
    detailLoading.value = false
  }
}

function closeModal() {
  modalOpen.value = false
  document.body.style.overflow = ''
}

function formatDay(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

function formatDayFull(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}
</script>

<style scoped>
/* ── Forecast card ── */
.forecast-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px 24px;
  width: 100%;
  transition: background 0.3s, border-color 0.3s, transform 0.2s, box-shadow 0.2s;
}

.forecast-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.forecast-title {
  color: var(--text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 14px;
}

.forecast-list { display: flex; flex-direction: column; gap: 2px; }

.forecast-item {
  display: flex;
  align-items: center;
  padding: 10px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;
}

.forecast-item:hover { background: var(--border-sub); }

.day {
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 500;
  width: 130px;
  flex-shrink: 0;
}

.forecast-icon { width: 36px; height: 36px; }

.desc {
  color: var(--text-muted);
  font-size: 0.85rem;
  text-transform: capitalize;
  flex: 1;
  margin-left: 4px;
}

.temps { display: flex; gap: 10px; align-items: center; }

.t-max {
  color: var(--text);
  font-weight: 600;
  font-size: 0.95rem;
  min-width: 36px;
  text-align: right;
}

.t-min {
  color: var(--text-dim);
  font-size: 0.9rem;
  min-width: 36px;
  text-align: right;
}

.chevron {
  color: var(--text-dim);
  font-size: 1.2rem;
  margin-left: 8px;
  transition: transform 0.2s;
}

.forecast-item:hover .chevron { transform: translateX(3px); }

/* ── Modal overlay ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  width: 100%;
  max-width: 860px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0,0,0,0.4);
}

/* ── Modal header ── */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-day-icon { width: 52px; height: 52px; }

.modal-title h2 {
  color: var(--text);
  font-size: 1.3rem;
  font-weight: 700;
}

.modal-subtitle {
  color: var(--text-muted);
  font-size: 0.82rem;
  margin-top: 2px;
}

.modal-close {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 0.9rem;
  padding: 6px 10px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.modal-close:hover {
  border-color: var(--error-text);
  color: var(--error-text);
}

/* ── Modal body ── */
.modal-body {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 28px 24px;
  flex: 1;
}

/* ── Horizontal timeline ── */
.timeline {
  display: flex;
  gap: 0;
  align-items: flex-start;
  min-width: max-content;
}

.timeline-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 140px;
}

.connector {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 12px;
}

.connector-line {
  flex: 1;
  height: 2px;
  background: var(--border);
}

.connector-line.hidden { background: transparent; }

.connector-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(88,166,255,0.2);
}

/* ── Slot card ── */
.slot-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 10px;
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: border-color 0.2s, transform 0.2s;
}

.slot-card:hover {
  border-color: var(--accent);
  transform: translateY(-4px);
}

.slot-time {
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 700;
}

.slot-icon { width: 48px; height: 48px; }

.slot-temp {
  color: var(--text);
  font-size: 1.3rem;
  font-weight: 700;
}

.slot-desc {
  color: var(--text-muted);
  font-size: 0.72rem;
  text-transform: capitalize;
  text-align: center;
  line-height: 1.3;
}

.slot-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  width: 100%;
  margin-top: 4px;
}

.stat {
  background: var(--surface);
  border: 1px solid var(--border-sub);
  border-radius: 8px;
  padding: 5px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.stat-icon { font-size: 0.75rem; }
.stat-val  { color: var(--text); font-size: 0.78rem; font-weight: 600; }
.stat-label{ color: var(--text-dim); font-size: 0.62rem; }

/* ── Skeleton ── */
.timeline-skeleton {
  display: flex;
  gap: 16px;
}

.sk-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 120px;
}

.sk {
  background: linear-gradient(90deg, var(--skeleton) 25%, var(--skeleton-shine) 50%, var(--skeleton) 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 1.4s infinite;
}

.sk-time   { width: 40px; height: 14px; }
.sk-circle { width: 48px; height: 48px; border-radius: 50%; }
.sk-line   { width: 80px; height: 12px; }
.sk-line.short { width: 55px; }

.no-data {
  color: var(--text-dim);
  text-align: center;
  padding: 40px 0;
}

/* ── Modal transition ── */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-active .modal, .modal-leave-active .modal {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal { transform: scale(0.95) translateY(16px); }
.modal-leave-to .modal   { transform: scale(0.95) translateY(16px); }

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
