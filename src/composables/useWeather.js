/**
 * useWeather — all weather and news fetching logic.
 */

import { ref } from 'vue'
import {
  getCurrentWeatherByCity,
  getCurrentWeatherByCoords,
  getForecastByCity,
  getForecastByCoords,
  getWeatherNews,
} from '../services/api'

export function useWeather() {
  const weather = ref(null)
  const forecast = ref([])
  const news = ref([])
  const loading = ref(false)
  const newsLoading = ref(false)
  const error = ref('')

  function reset() {
    weather.value = null
    forecast.value = []
    news.value = []
    error.value = ''
  }

  async function loadNews(city) {
    newsLoading.value = true
    news.value = []
    try {
      const data = await getWeatherNews(city)
      news.value = data.articles
    } catch {
      news.value = []
    } finally {
      newsLoading.value = false
    }
  }

  async function applyResults(currentPromise, forecastPromise) {
    loading.value = true
    error.value = ''
    weather.value = null
    forecast.value = []

    try {
      const [currentData, forecastData] = await Promise.all([currentPromise, forecastPromise])
      weather.value = currentData
      forecast.value = forecastData.forecast
      loadNews(currentData.city)
    } catch (err) {
      error.value = err.response?.data?.detail || 'Something went wrong. Please try again.'
    } finally {
      loading.value = false
    }
  }

  /** Fetch weather and forecast for a city name. */
  async function fetchByCity(city) {
    if (!city?.trim()) return
    await applyResults(getCurrentWeatherByCity(city), getForecastByCity(city))
  }

  /** Fetch weather and forecast for geographic coordinates. */
  async function fetchByCoords(lat, lon) {
    await applyResults(getCurrentWeatherByCoords(lat, lon), getForecastByCoords(lat, lon))
  }

  return { weather, forecast, news, loading, newsLoading, error, fetchByCity, fetchByCoords, reset }
}
