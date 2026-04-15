<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal">
          <div class="modal-header">
            <h2>⭐ Favorite Cities</h2>
            <button class="close-btn" @click="$emit('close')">✕</button>
          </div>

          <div class="modal-body">
            <div v-if="cities.length" class="city-list">
              <TransitionGroup name="fav">
                <div v-for="city in cities" :key="city" class="city-item">
                  <span class="city-name">{{ city }}</span>
                  <div class="city-actions">
                    <button class="action-btn load-btn" @click="select(city)" title="Load weather">
                      🌤 Load
                    </button>
                    <button class="action-btn remove-btn" @click="remove(city)" title="Remove">
                      ✕
                    </button>
                  </div>
                </div>
              </TransitionGroup>
            </div>

            <div v-else class="empty">
              <span class="empty-icon">☆</span>
              <p>No favorite cities yet.</p>
              <p class="empty-hint">Click the ★ on a weather card to save a city.</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ open: Boolean })
const emit = defineEmits(['close', 'select'])

const STORAGE_KEY = 'weather_favorites'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
  catch { return [] }
}

const cities = ref(load())

function remove(city) {
  cities.value = cities.value.filter(c => c !== city)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cities.value))
}

function select(city) {
  emit('select', city)
  emit('close')
}

// Refresh list every time modal opens
import { watch } from 'vue'
watch(() => props.open, (val) => { if (val) cities.value = load() })
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
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
  max-width: 420px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0,0,0,0.5);
}

.app.light .modal {
  background: #ffffff;
  border-color: #d0d7de;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #373e47;
  background: #161b22;
  flex-shrink: 0;
}

.modal-header h2 {
  color: #e6edf3;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.close-btn {
  background: #21262d;
  border: 1px solid #373e47;
  border-radius: 8px;
  color: #8b949e;
  font-size: 0.85rem;
  padding: 5px 10px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.close-btn:hover {
  border-color: #f85149;
  color: #f85149;
}

.modal-body {
  overflow-y: auto;
  flex: 1;
  padding: 12px 0;
  background: #1c2128;
}

.city-list {
  display: flex;
  flex-direction: column;
}

.city-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-bottom: 1px solid #30363d;
  transition: background 0.15s;
}

.city-item:last-child { border-bottom: none; }
.city-item:hover { background: rgba(88,166,255,0.05); }

.city-name {
  color: #e6edf3;
  font-size: 1rem;
  font-weight: 500;
}

.city-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-btn {
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: opacity 0.2s, transform 0.15s;
}

.action-btn:hover { opacity: 0.85; transform: scale(1.05); }

.load-btn {
  background: #238636;
  color: #fff;
}

.remove-btn {
  background: rgba(248,81,73,0.15);
  color: #f85149;
  border: 1px solid rgba(248,81,73,0.3);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 48px 24px;
  color: #484f58;
}

.empty-icon { font-size: 2.5rem; }
.empty p { font-size: 0.95rem; }
.empty-hint { font-size: 0.8rem; color: #373e47; }

/* Transitions */
.fav-enter-active { transition: opacity 0.25s, transform 0.25s; }
.fav-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fav-enter-from, .fav-leave-to { opacity: 0; transform: translateX(-10px); }
.fav-move { transition: transform 0.25s; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-active .modal, .modal-leave-active .modal {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal { transform: scale(0.95) translateY(12px); }
.modal-leave-to .modal   { transform: scale(0.95) translateY(12px); }
</style>
