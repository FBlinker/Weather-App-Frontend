/**
 * Axios instance with auth interceptors and named API call functions.
 * All components and composables should import from here instead of
 * using axios directly.
 */

import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

export const api = axios.create({ baseURL: BASE_URL })

/**
 * Attach the stored bearer token to every outgoing request.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/**
 * Automatically sign the user out when the server returns 401.
 */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('auth_token')) {
      window.dispatchEvent(new Event('auth:logout'))
    }
    return Promise.reject(err)
  },
)

// ── Auth ──────────────────────────────────────────────────────────────────────

/** @param {string} username @param {string} password */
export function register(username, password) {
  return api.post('/auth/register', { username, password }).then((r) => r.data)
}

/** @param {string} username @param {string} password */
export function login(username, password) {
  const form = new URLSearchParams()
  form.append('username', username)
  form.append('password', password)
  return api
    .post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    .then((r) => r.data)
}

// ── Weather ───────────────────────────────────────────────────────────────────

/** @param {string} city */
export function getCurrentWeatherByCity(city) {
  return api.get('/weather/current', { params: { city } }).then((r) => r.data)
}

/** @param {number} lat @param {number} lon */
export function getCurrentWeatherByCoords(lat, lon) {
  return api.get('/weather/current', { params: { lat, lon } }).then((r) => r.data)
}

/** @param {string} city */
export function getForecastByCity(city) {
  return api.get('/weather/forecast', { params: { city } }).then((r) => r.data)
}

/** @param {number} lat @param {number} lon */
export function getForecastByCoords(lat, lon) {
  return api.get('/weather/forecast', { params: { lat, lon } }).then((r) => r.data)
}

/**
 * @param {string} date — YYYY-MM-DD
 * @param {{ city?: string, lat?: number, lon?: number }} location
 */
export function getForecastDetail(date, { city, lat, lon } = {}) {
  const params = { date }
  if (lat != null && lon != null) {
    params.lat = lat
    params.lon = lon
  } else if (city) {
    params.city = city
  }
  return api.get('/weather/forecast/detail', { params }).then((r) => r.data)
}

/** @param {string} [city] */
export function getWeatherNews(city) {
  return api
    .get('/weather/news', { params: city ? { city } : {} })
    .then((r) => r.data)
}
