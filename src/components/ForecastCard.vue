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
        <img
          :src="`https://openweathermap.org/img/wn/${day.icon}.png`"
          :alt="day.description"
          class="forecast-icon"
        />
        <span class="desc">{{ day.description }}</span>
        <div class="temps">
          <span class="t-max">{{ Math.round(day.temp_max) }}°</span>
          <span class="t-min">{{ Math.round(day.temp_min) }}°</span>
        </div>
        <span class="chevron">›</span>
      </div>
    </div>
  </div>

  <!-- Hourly detail modal -->
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
            <!-- Skeleton -->
            <div v-if="detailLoading" class="skeleton-rows">
              <div v-for="n in 5" :key="n" class="sk-row-full">
                <div v-for="c in 7" :key="c" class="sk sk-cell"></div>
              </div>
            </div>

            <!-- Hourly table -->
            <div v-else-if="detail && detail.slots.length" class="slot-table">
              <div class="slot-row header-row">
                <div class="col col-dot"></div>
                <div class="col col-time">Time</div>
                <div class="col col-icon"></div>
                <div class="col col-temp">Temp</div>
                <div class="col col-desc">Condition</div>
                <div class="col col-stat">Feels Like</div>
                <div class="col col-stat">Humidity</div>
                <div class="col col-stat">Wind</div>
                <div class="col col-stat">Rain</div>
              </div>
              <div
                v-for="(slot, i) in detail.slots"
                :key="slot.time"
                class="slot-row data-row"
              >
                <div class="col col-dot">
                  <div class="dot-wrap">
                    <div class="v-line top" :class="{ invisible: i === 0 }"></div>
                    <div class="dot"></div>
                    <div class="v-line bottom" :class="{ invisible: i === detail.slots.length - 1 }"></div>
                  </div>
                </div>
                <div class="col col-time">{{ slot.time }}</div>
                <div class="col col-icon">
                  <img
                    :src="`https://openweathermap.org/img/wn/${slot.icon}@2x.png`"
                    :alt="slot.description"
                  />
                </div>
                <div class="col col-temp">{{ Math.round(slot.temp) }}°C</div>
                <div class="col col-desc">{{ slot.description }}</div>
                <div class="col col-stat">{{ Math.round(slot.feels_like) }}°C</div>
                <div class="col col-stat">{{ slot.humidity }}%</div>
                <div class="col col-stat">{{ slot.wind_speed }} m/s</div>
                <div class="col col-stat">{{ slot.pop }}%</div>
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
import { getForecastDetail } from '../services/api'

const props = defineProps({
  /** Array of daily forecast objects from the API. */
  forecast: { type: Array, required: true },
  /** City name — used as fallback when coordinates are unavailable. */
  city: { type: String, default: null },
  lat: { type: Number, default: null },
  lon: { type: Number, default: null },
})

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
    const location =
      props.lat != null && props.lon != null
        ? { lat: props.lat, lon: props.lon }
        : { city: props.city }
    detail.value = await getForecastDetail(day.date, location)
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
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatDayFull(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
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
  background: rgba(0,0,0,0.7);
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

.modal-title { display: flex; align-items: center; gap: 12px; }
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

.modal-close:hover { border-color: #f85149; color: #f85149; }

/* ── Modal body ── */
.modal-body {
  overflow-x: auto;
  overflow-y: auto;
  flex: 1;
  background: #1c2128;
}

.app.light .modal-body { background: #ffffff; }

/* ── Slot table ── */
.slot-table {
  display: table;
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.slot-row { display: table-row; }

.col {
  display: table-cell;
  padding: 12px 16px;
  vertical-align: middle;
  white-space: nowrap;
  border-bottom: 1px solid #30363d;
}

.app.light .col { border-bottom-color: #e8ecf0; }

.header-row .col {
  background: #161b22;
  color: #8b949e;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: 2px solid #373e47;
}

.app.light .header-row .col {
  background: #f6f8fa;
  border-bottom-color: #d0d7de;
  color: #57606a;
}

.data-row:last-child .col { border-bottom: none; }
.data-row:hover .col { background: rgba(88,166,255,0.05); }

/* Column widths */
.col-dot  { width: 28px; padding: 0 8px; }
.col-time { width: 56px; }
.col-icon { width: 48px; padding: 4px 8px; }
.col-temp { width: 72px; }
.col-desc { width: auto; white-space: normal; }
.col-stat { width: 90px; text-align: center; }

/* Timeline dot */
.dot-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  min-height: 52px;
}

.v-line {
  flex: 1;
  width: 2px;
  background: #373e47;
  min-height: 10px;
}

.app.light .v-line { background: #d0d7de; }
.v-line.invisible { background: transparent; }

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(88,166,255,0.15);
}

/* Cell content */
.col-time {
  color: #e6edf3;
  font-size: 0.95rem;
  font-weight: 700;
}

.app.light .col-time { color: #1f2328; }

.col-icon img { width: 40px; height: 40px; display: block; }

.col-temp {
  color: #58a6ff;
  font-size: 1.1rem;
  font-weight: 700;
}

.app.light .col-temp { color: #0969da; }

.col-desc {
  color: #8b949e;
  font-size: 0.85rem;
  text-transform: capitalize;
}

.app.light .col-desc { color: #57606a; }

.col-stat {
  color: #e6edf3;
  font-size: 0.88rem;
  font-weight: 500;
}

.app.light .col-stat { color: #1f2328; }

/* Skeleton */
.skeleton-rows { display: flex; flex-direction: column; }

.sk-row-full {
  display: flex;
  gap: 12px;
  padding: 14px 24px;
  border-bottom: 1px solid #30363d;
}

.sk {
  background: linear-gradient(90deg, #21262d 25%, #2d333b 50%, #21262d 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 1.4s infinite;
  height: 20px;
}

.sk-cell { flex: 1; }
.sk-cell:first-child  { max-width: 28px; }
.sk-cell:nth-child(2) { max-width: 56px; }
.sk-cell:nth-child(3) { max-width: 40px; }

.no-data { color: #484f58; text-align: center; padding: 40px 0; }

/* ── Modal transition ── */
.modal-enter-active,
.modal-leave-active { transition: opacity 0.25s ease; }

.modal-enter-active .modal,
.modal-leave-active .modal { transition: transform 0.25s ease, opacity 0.25s ease; }

.modal-enter-from,
.modal-leave-to { opacity: 0; }

.modal-enter-from .modal { transform: scale(0.95) translateY(16px); }
.modal-leave-to .modal   { transform: scale(0.95) translateY(16px); }

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
