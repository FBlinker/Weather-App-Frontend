/**
 * useFavorites — favorites list backed by localStorage.
 */

import { ref } from 'vue'

const STORAGE_KEY = 'weather_favorites'

export function useFavorites() {
  const cities = ref(loadFromStorage())

  function loadFromStorage() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    } catch {
      return []
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cities.value))
  }

  /** Add a city to the top of the list (no-op if already present). */
  function add(city) {
    const name = city?.trim()
    if (!name || cities.value.includes(name)) return
    cities.value.unshift(name)
    persist()
  }

  /** Remove a city from the list. */
  function remove(city) {
    cities.value = cities.value.filter((c) => c !== city)
    persist()
  }

  /** Add the city if absent, remove it if present. */
  function toggle(city) {
    const name = city?.trim()
    if (!name) return
    if (cities.value.includes(name)) {
      cities.value = cities.value.filter((c) => c !== name)
    } else {
      cities.value.unshift(name)
    }
    persist()
  }

  /** Return true if the city is in the favorites list. */
  function has(city) {
    return cities.value.includes(city?.trim())
  }

  /** Re-read the list from localStorage (useful when the modal opens). */
  function reload() {
    cities.value = loadFromStorage()
  }

  return { cities, add, remove, toggle, has, reload }
}
