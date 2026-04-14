<template>
  <div class="weather-card">
    <div class="card-top">
      <div class="location">
        <h2>{{ weather.city }}</h2>
        <span class="country">{{ weather.country }}</span>
      </div>
      <img
        :src="`https://openweathermap.org/img/wn/${weather.icon}@2x.png`"
        :alt="weather.description"
        class="weather-icon"
      />
    </div>

    <div class="temp-row">
      <span class="temp">{{ Math.round(weather.temp) }}°C</span>
      <span class="description">{{ weather.description }}</span>
    </div>

    <div class="divider"></div>

    <div class="details">
      <div class="detail-item">
        <span class="detail-icon">🌡</span>
        <div>
          <span class="detail-label">Feels like</span>
          <span class="detail-value">{{ Math.round(weather.feels_like) }}°C</span>
        </div>
      </div>
      <div class="detail-item">
        <span class="detail-icon">💧</span>
        <div>
          <span class="detail-label">Humidity</span>
          <span class="detail-value">{{ weather.humidity }}%</span>
        </div>
      </div>
      <div class="detail-item">
        <span class="detail-icon">💨</span>
        <div>
          <span class="detail-label">Wind</span>
          <span class="detail-value">{{ weather.wind_speed }} m/s</span>
        </div>
      </div>
      <div class="detail-item">
        <span class="detail-icon">👁</span>
        <div>
          <span class="detail-label">Visibility</span>
          <span class="detail-value">{{ weather.visibility }} km</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ weather: { type: Object, required: true } })
</script>

<style scoped>
.weather-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  transition: background 0.3s, border-color 0.3s, transform 0.2s, box-shadow 0.2s;
}

.weather-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.location h2 {
  color: var(--text);
  font-size: 1.6rem;
  font-weight: 700;
}

.country {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-top: 2px;
  display: block;
}

.weather-icon {
  width: 72px;
  height: 72px;
  margin-top: -8px;
}

.temp-row {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin: 8px 0 20px;
}

.temp {
  color: var(--accent);
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1;
  animation: countUp 0.6s ease both;
}

@keyframes countUp {
  from { opacity: 0; transform: scale(0.8); }
  to   { opacity: 1; transform: scale(1); }
}

.description {
  color: var(--text-muted);
  font-size: 1rem;
  text-transform: capitalize;
}

.divider {
  height: 1px;
  background: var(--border);
  margin-bottom: 20px;
}

.details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg);
  border: 1px solid var(--border-sub);
  border-radius: 10px;
  padding: 12px 14px;
  transition: background 0.3s;
}

.detail-icon { font-size: 1.2rem; }

.detail-item div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  color: var(--text-muted);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  color: var(--text);
  font-size: 1rem;
  font-weight: 600;
}
</style>
