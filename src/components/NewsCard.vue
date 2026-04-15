<template>
  <div class="news-card">
    <h3 v-if="showTitle" class="news-title">📰 Weather News</h3>

    <!-- Skeleton loader -->
    <div v-if="loading" class="news-list">
      <div v-for="n in 3" :key="n" class="news-skeleton">
        <div class="sk sk-img"></div>
        <div class="sk-body">
          <div class="sk sk-line wide"></div>
          <div class="sk sk-line medium"></div>
          <div class="sk sk-line short"></div>
        </div>
      </div>
    </div>

    <!-- Article list -->
    <div v-else-if="articles.length" class="news-list">
      <a
        v-for="article in articles"
        :key="article.url"
        :href="article.url"
        target="_blank"
        rel="noopener noreferrer"
        class="news-item"
      >
        <img
          v-if="article.image"
          :src="article.image"
          :alt="article.title"
          class="news-img"
          @error="(e) => (e.target.style.display = 'none')"
        />
        <div v-else class="news-img placeholder-img">🌦</div>

        <div class="news-body">
          <p class="news-headline">{{ article.title }}</p>
          <p v-if="article.description" class="news-desc">{{ truncate(article.description) }}</p>
          <div class="news-meta">
            <span class="news-source">{{ article.source }}</span>
            <span class="news-date">{{ formatDate(article.published_at) }}</span>
          </div>
        </div>
      </a>
    </div>

    <div v-else class="news-empty">No news articles found.</div>
  </div>
</template>

<script setup>
defineProps({
  /** Array of news article objects from the API. */
  articles: { type: Array, default: () => [] },
  /** Whether news is currently loading. */
  loading: { type: Boolean, default: false },
  /** Whether to render the "Weather News" section heading. */
  showTitle: { type: Boolean, default: true },
})

/**
 * Truncate a string to *max* characters, appending an ellipsis if needed.
 * @param {string} text
 * @param {number} [max=100]
 */
function truncate(text, max = 100) {
  return text.length > max ? text.slice(0, max) + '…' : text
}

/**
 * Format an ISO date string as a short locale date.
 * @param {string} iso
 */
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<style scoped>
.news-card { padding: 16px 20px; width: 100%; }

.news-title {
  color: var(--text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 16px;
}

.news-list { display: flex; flex-direction: column; gap: 2px; }

.news-item {
  display: flex;
  gap: 12px;
  padding: 12px 8px;
  border-radius: 10px;
  text-decoration: none;
  transition: background 0.15s;
  align-items: flex-start;
}

.news-item:hover { background: var(--border-sub); }

.news-img {
  width: 72px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.placeholder-img {
  width: 72px;
  height: 56px;
  border-radius: 8px;
  background: var(--border-sub);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.news-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.news-headline {
  color: var(--text);
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-desc {
  color: var(--text-muted);
  font-size: 0.78rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-meta { display: flex; gap: 8px; align-items: center; margin-top: 2px; }

.news-source { color: var(--accent); font-size: 0.72rem; font-weight: 600; }
.news-date   { color: var(--text-dim); font-size: 0.72rem; }

/* Skeleton */
.news-skeleton { display: flex; gap: 12px; padding: 12px 8px; align-items: flex-start; }

.sk {
  background: linear-gradient(
    90deg,
    var(--skeleton) 25%,
    var(--skeleton-shine) 50%,
    var(--skeleton) 75%
  );
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 1.4s infinite;
}

.sk-img  { width: 72px; height: 56px; border-radius: 8px; flex-shrink: 0; }
.sk-body { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.sk-line { height: 12px; }
.wide    { width: 90%; }
.medium  { width: 70%; }
.short   { width: 40%; }

.news-empty {
  color: var(--text-dim);
  font-size: 0.9rem;
  text-align: center;
  padding: 20px 0;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
