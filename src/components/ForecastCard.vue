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

          <div v-else-if="detail && detail.slots.length" class="timeline">
            <div v-for="(slot, i) in detail.slots" :key="slot.time" class="timeline-slot">
              <div class="connector">
                <div class="connector-line" :class="{ hidden: i === 0 }"></div>
                <div class="connector-dot"></div>
                <div class="connector-line" :class="{ hidden: i === detail.slots.length - 1 }"></div>
              </div>
              <div class="slot-card">
                <span class="slot-time">{{ slot.time }}</span>
                <img :src="`https://openweathermap.org/img/wn/${slot.icon}@2x.png`" :alt="slot.description" class="slot-icon" />
                <span class="slot-temp">{{ Math.round(slot.temp) }}°C</span>
                <span class="slot-desc">{{ slot.description }}</span>
                <div class="slot-stats">
                  <div class="stat"><span class="stat-icon">🤔</span><span class="stat-val">{{ Math.round(slot.feels_like) }}°C</span><span class="stat-label">Feels like</span></div>
                  <div class="stat"><span class="stat-icon">💧</span><span class="stat-val">{{ slot.humidity }}%</span><span class="stat-label">Humidity</span></div>
                  <div class="stat"><span class="stat-icon">💨</span><span class="stat-val">{{ slot.wind_speed }} m/s</span><span class="stat-label">Wind</span></div>
                  <div class="stat"><span class="stat-icon">🌧</span><span class="stat-val">{{ slot.pop }}%</span><span class="stat-label">Rain</span></div>
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
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  background: #1c2128;
  border: 1px solid #373e47;
  border-radius: 20px;
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0,0,0,0.6);
}

.app.light .modal {
  background: #ffffff;
  border-color: #d0d7de;
  box-shadow: 0 24px 64px rgba(0,0,0,0.15);
}

/* ── Modal header ── */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #373e47;
  flex-shrink: 0;
  background: #161b22;
}

.app.light .modal-header {
  background: #f6f8fa;
  border-bottom-color: #d0d7de;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-day-icon { width: 52px; height: 52px; }

.modal-title h2 {
  color: #e6edf3;
  font-size: 1.3rem;
  font-weight: 700;
}

.app.light .modal-title h2 { color: #1f2328; }

.modal-subtitle {
  color: #8b949e;
  font-size: 0.82rem;
  margin-top: 2px;
}

.modal-close {
  background: #21262d;
  border: 1px solid #373e47;
  border-radius: 8px;
  color: #8b949e;
  font-size: 0.9rem;
  padding: 6px 10px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.app.light .modal-close {
  background: #f6f8fa;
  border-color: #d0d7de;
  color: #57606a;
}

.modal-close:hover {
  border-color: #f85149;
  color: #f85149;
}

/* ── Modal body ── */
.modal-body {
  overflow-x: hidden;
  overflow-y: auto;
  padding: 8px 0;
  flex: 1;
  background: #1c2128;
}

.app.light .modal-body { background: #ffffff; }

/* ── Row layout ── */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-slot {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
  border-bottom: 1px solid #30363d;
  transition: background 0.15s;
}

.app.light .timeline-slot { border-bottom-color: #e8ecf0; }

.timeline-slot:last-child { border-bottom: none; }

.timeline-slot:hover {
  background: rgba(88,166,255,0.05);
}

.connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
}

.connector-line {
  width: 2px;
  height: 14px;
  background: #373e47;
}

.app.light .connector-line { background: #d0d7de; }
.connector-line.hidden { background: transparent; }

.connector-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(88,166,255,0.15);
}

/* ── Slot row content ── */
.slot-card {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.slot-time {
  color: #e6edf3;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  width: 48px;
  flex-shrink: 0;
}

.app.light .slot-time { color: #1f2328; }

.slot-icon { width: 44px; height: 44px; flex-shrink: 0; }

.slot-temp {
  color: #58a6ff;
  font-size: 1.4rem;
  font-weight: 700;
  width: 72px;
  flex-shrink: 0;
}

.app.light .slot-temp { color: #0969da; }

.slot-desc {
  color: #8b949e;
  font-size: 0.85rem;
  text-transform: capitalize;
  flex: 1;
  min-width: 0;
}

.app.light .slot-desc { color: #57606a; }

.slot-stats {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.stat {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 6px 10px;
  white-space: nowrap;
}

.app.light .stat {
  background: #f6f8fa;
  border-color: #d0d7de;
}

.stat-icon { font-size: 0.85rem; }

.stat-val {
  color: #e6edf3;
  font-size: 0.85rem;
  font-weight: 600;
}

.app.light .stat-val { color: #1f2328; }

.stat-label {
  color: #8b949e;
  font-size: 0.75rem;
}

@media (max-width: 600px) {
  .slot-stats { flex-wrap: wrap; gap: 6px; }
  .slot-desc  { display: none; }
}

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
