<template>
  <div class="forecast-card">
    <h3 class="forecast-title">5-Day Forecast</h3>
    <div class="forecast-list">
      <div v-for="day in forecast" :key="day.date" class="forecast-item">
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
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ forecast: { type: Array, required: true } })

function formatDay(dateStr) {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.forecast-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px 24px;
  width: 100%;
  transition: background 0.3s, border-color 0.3s;
}

.forecast-title {
  color: var(--text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 14px;
}

.forecast-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.forecast-item {
  display: flex;
  align-items: center;
  padding: 10px 8px;
  border-radius: 8px;
  transition: background 0.15s;
}

.forecast-item:hover {
  background: var(--border-sub);
}

.day {
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 500;
  width: 130px;
  flex-shrink: 0;
}

.forecast-icon {
  width: 36px;
  height: 36px;
}

.desc {
  color: var(--text-muted);
  font-size: 0.85rem;
  text-transform: capitalize;
  flex: 1;
  margin-left: 4px;
}

.temps {
  display: flex;
  gap: 10px;
  align-items: center;
}

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
</style>
