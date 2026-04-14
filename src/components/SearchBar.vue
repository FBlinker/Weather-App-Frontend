<template>
  <form class="search-bar" @submit.prevent="$emit('search', query)">
    <div class="input-wrapper">
      <span class="search-icon">🔍</span>
      <input
        v-model="query"
        type="text"
        placeholder="Search for a city..."
        class="search-input"
        :disabled="loading"
      />
    </div>
    <button
      type="button"
      class="location-btn"
      :disabled="locating || loading"
      @click="$emit('locate')"
      title="Use my location"
    >
      <span v-if="locating">📡</span>
      <span v-else>📍</span>
    </button>
    <button type="submit" class="search-btn" :disabled="loading || !query.trim()">
      <span v-if="loading" class="spinner"></span>
      <template v-else>
        <span class="btn-text">Search</span>
        <span class="btn-icon">→</span>
      </template>
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
defineProps({ loading: Boolean, locating: Boolean })
defineEmits(['search', 'locate'])
const query = ref('')
</script>

<style scoped>
.search-bar {
  display: flex;
  gap: 8px;
  width: 100%;
}

.input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0 14px;
  transition: border-color 0.2s;
}

.input-wrapper:focus-within {
  border-color: var(--accent);
}

.search-icon {
  font-size: 0.9rem;
  margin-right: 8px;
  opacity: 0.4;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 0.95rem;
  padding: 13px 0;
  font-family: 'Inter', sans-serif;
}

.search-input::placeholder {
  color: var(--text-dim);
}

.location-btn {
  padding: 13px 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  line-height: 1;
  flex-shrink: 0;
}

.location-btn:hover:not(:disabled) {
  border-color: var(--accent);
  background: rgba(88, 166, 255, 0.08);
}

.location-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.search-btn {
  padding: 13px 22px;
  background: var(--btn-bg);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
  flex-shrink: 0;
}

.search-btn:hover:not(:disabled) {
  background: var(--btn-hover);
}

.search-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-icon { display: none; }

@media (max-width: 480px) {
  .search-bar { gap: 6px; }

  .btn-text { display: none; }
  .btn-icon { display: inline; font-size: 1rem; }

  .search-btn { padding: 13px 14px; }

  .search-input { font-size: 0.88rem; }
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
