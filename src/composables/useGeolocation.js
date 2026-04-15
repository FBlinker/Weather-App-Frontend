/**
 * useGeolocation — wraps the browser Geolocation API.
 *
 * Exposes a `locate` function that resolves with {lat, lon} or
 * rejects with a human-readable error message.
 */

import { ref } from 'vue'

export function useGeolocation() {
  const locating = ref(false)

  /** @returns {Promise<{lat: number, lon: number}>} */
  function locate() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'))
        return
      }

      locating.value = true

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          locating.value = false
          resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        },
        () => {
          locating.value = false
          reject(new Error('Location access denied. Please search for a city manually.'))
        },
      )
    })
  }

  return { locating, locate }
}
