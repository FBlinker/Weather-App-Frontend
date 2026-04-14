<template>
  <div class="map-card">
    <h3 class="map-title">📍 Location Map</h3>
    <div ref="mapEl" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon paths broken by Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const props = defineProps({
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  city: { type: String, required: true },
  isLight: { type: Boolean, default: false },
})

const mapEl = ref(null)
let map = null
let marker = null

const DARK_TILE  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const LIGHT_TILE = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const ATTRIBUTION = '&copy; <a href="https://carto.com/">CARTO</a>'

let tileLayer = null

function initMap() {
  map = L.map(mapEl.value, { zoomControl: true, scrollWheelZoom: false }).setView(
    [props.lat, props.lon], 10
  )
  tileLayer = L.tileLayer(props.isLight ? LIGHT_TILE : DARK_TILE, {
    attribution: ATTRIBUTION,
    maxZoom: 19,
  }).addTo(map)

  marker = L.marker([props.lat, props.lon])
    .addTo(map)
    .bindPopup(`<b>${props.city}</b>`)
    .openPopup()
}

onMounted(() => initMap())

onUnmounted(() => {
  if (map) { map.remove(); map = null }
})

// Re-center when city changes
watch(() => [props.lat, props.lon], ([lat, lon]) => {
  if (!map) return
  map.setView([lat, lon], 10)
  marker.setLatLng([lat, lon]).bindPopup(`<b>${props.city}</b>`).openPopup()
})

// Swap tiles on theme change
watch(() => props.isLight, (light) => {
  if (!map || !tileLayer) return
  tileLayer.setUrl(light ? LIGHT_TILE : DARK_TILE)
})
</script>

<style scoped>
.map-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px 24px;
  width: 100%;
  transition: background 0.3s, border-color 0.3s;
}

.map-title {
  color: var(--text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 14px;
}

.map-container {
  height: 100%;
  min-height: 280px;
  border-radius: 10px;
  overflow: hidden;
  z-index: 0;
}
</style>
