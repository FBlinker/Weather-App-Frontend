<template>
  <div v-if="cities.length" class="favorites">
    <h3 class="fav-title">⭐ Favorite Cities</h3>
    <div class="fav-list">
      <TransitionGroup name="fav">
        <div
          v-for="city in cities"
          :key="city"
          class="fav-item"
          @click="$emit('select', city)"
        >
          <span class="fav-name">{{ city }}</span>
          <button class="fav-remove" title="Remove" @click.stop="remove(city)">✕</button>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { useFavorites } from '../composables/useFavorites'

/** Emitted when the user clicks a city chip. */
defineEmits(['select'])

const { cities, remove } = useFavorites()
</script>

<style scoped>
.favorites { width: 100%; }

.fav-title {
  color: var(--text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
}

.fav-list { display: flex; flex-wrap: wrap; gap: 8px; }

.fav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 6px 12px 6px 14px;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.15s, box-shadow 0.15s;
  animation: popIn 0.25s ease both;
}

.fav-item:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.fav-name {
  color: var(--text);
  font-size: 0.88rem;
  font-weight: 500;
}

.fav-remove {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 0.7rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.15s, transform 0.15s;
}

.fav-remove:hover { color: var(--error-text); transform: scale(1.3); }

/* TransitionGroup */
.fav-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fav-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fav-enter-from,
.fav-leave-to { opacity: 0; transform: scale(0.8); }
.fav-move { transition: transform 0.3s ease; }

@keyframes popIn {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}
</style>
