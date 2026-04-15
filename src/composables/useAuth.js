/**
 * useAuth — authentication state, login, logout, and token management.
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { login as apiLogin, register as apiRegister } from '../services/api'

const TOKEN_KEY = 'auth_token'
const USERNAME_KEY = 'auth_username'

export function useAuth() {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const username = ref(localStorage.getItem(USERNAME_KEY) || '')

  // Handle Google OAuth redirect — parse token from URL on load
  const urlParams = new URLSearchParams(window.location.search)
  const urlToken = urlParams.get('token')
  const urlUsername = urlParams.get('username')
  if (urlToken && urlUsername) {
    token.value = urlToken
    username.value = urlUsername
    localStorage.setItem(TOKEN_KEY, urlToken)
    localStorage.setItem(USERNAME_KEY, urlUsername)
    window.history.replaceState({}, '', '/')
  }

  function persist(t, u) {
    token.value = t
    username.value = u
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(USERNAME_KEY, u)
  }

  function logout() {
    token.value = ''
    username.value = ''
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USERNAME_KEY)
  }

  /** Called after a successful login or register response. */
  function handleAuthenticated(data) {
    persist(data.token, data.username)
  }

  async function login(u, p) {
    const data = await apiLogin(u, p)
    persist(data.access_token, data.username)
  }

  async function register(u, p) {
    const data = await apiRegister(u, p)
    persist(data.access_token, data.username)
  }

  // Auto-logout when the API interceptor fires a 401 event
  function onForceLogout() { logout() }
  onMounted(() => window.addEventListener('auth:logout', onForceLogout))
  onUnmounted(() => window.removeEventListener('auth:logout', onForceLogout))

  return { token, username, login, register, logout, handleAuthenticated }
}
