<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">⛅</div>
      <h1 class="auth-title">Weather App</h1>
      <p class="auth-subtitle">{{ isLogin ? 'Sign in to continue' : 'Create your account' }}</p>

      <form class="auth-form" @submit.prevent="submit">
        <div class="field">
          <label>Username</label>
          <input v-model="username" type="text" placeholder="Enter username" autocomplete="username" :disabled="loading" />
        </div>
        <div class="field">
          <label>Password</label>
          <div class="password-wrap">
            <input
              v-model="password"
              :type="showPass ? 'text' : 'password'"
              placeholder="Enter password"
              autocomplete="current-password"
              :disabled="loading"
            />
            <button type="button" class="toggle-pass" @click="showPass = !showPass">
              {{ showPass ? '🙈' : '👁' }}
            </button>
          </div>
          <span v-if="!isLogin" class="hint">Minimum 6 characters</span>
        </div>

        <div v-if="error" class="auth-error">⚠ {{ error }}</div>

        <button type="submit" class="auth-btn" :disabled="loading || !username || !password">
          <span v-if="loading" class="spinner"></span>
          <span v-else>{{ isLogin ? 'Sign In' : 'Create Account' }}</span>
        </button>
      </form>

      <div class="divider"><span>or</span></div>

      <button class="google-btn" @click="loginWithGoogle" :disabled="loading">
        <svg class="google-icon" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <p class="auth-switch">
        {{ isLogin ? "Don't have an account?" : 'Already have an account?' }}
        <button class="switch-btn" @click="toggle">{{ isLogin ? 'Register' : 'Sign In' }}</button>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const emit = defineEmits(['authenticated'])

const API = 'http://localhost:8000'
const isLogin = ref(true)
const username = ref('')
const password = ref('')
const showPass = ref(false)
const loading = ref(false)
const error = ref('')

function loginWithGoogle() {
  window.location.href = `${API}/auth/google`
}

function toggle() {
  isLogin.value = !isLogin.value
  error.value = ''
}

async function submit() {
  error.value = ''
  loading.value = true
  try {
    let res
    if (isLogin.value) {
      const form = new URLSearchParams()
      form.append('username', username.value)
      form.append('password', password.value)
      res = await axios.post(`${API}/auth/login`, form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    } else {
      res = await axios.post(`${API}/auth/register`, {
        username: username.value,
        password: password.value,
      })
    }
    emit('authenticated', { token: res.data.access_token, username: res.data.username })
  } catch (err) {
    error.value = err.response?.data?.detail || 'Something went wrong.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: #0d1117;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 20px;
  padding: 40px 36px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.4);
  animation: fadeInUp 0.4s ease both;
}

.auth-logo { font-size: 3rem; }

.auth-title {
  color: #e6edf3;
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
}

.auth-subtitle {
  color: #8b949e;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.auth-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  color: #8b949e;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field input {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 10px;
  padding: 12px 14px;
  color: #e6edf3;
  font-size: 0.95rem;
  font-family: 'Inter', sans-serif;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.field input:focus { border-color: #58a6ff; }
.field input::placeholder { color: #484f58; }

.password-wrap {
  position: relative;
}

.password-wrap input { padding-right: 44px; }

.toggle-pass {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  line-height: 1;
}

.hint {
  color: #484f58;
  font-size: 0.75rem;
}

.auth-error {
  background: rgba(248,81,73,0.15);
  border: 1px solid rgba(248,81,73,0.4);
  color: #f85149;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  text-align: center;
}

.auth-btn {
  background: #238636;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 13px;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  margin-top: 4px;
  width: 100%;
}

.auth-btn:hover:not(:disabled) { background: #2ea043; }
.auth-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.auth-switch {
  color: #8b949e;
  font-size: 0.85rem;
  margin-top: 8px;
}

.switch-btn {
  background: none;
  border: none;
  color: #58a6ff;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0 0 0 4px;
  font-family: 'Inter', sans-serif;
}

.switch-btn:hover { text-decoration: underline; }

.divider {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #30363d;
}

.divider span {
  color: #484f58;
  font-size: 0.8rem;
}

.google-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #ffffff;
  color: #1f2328;
  border: 1px solid #d0d7de;
  border-radius: 10px;
  padding: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}

.google-btn:hover:not(:disabled) {
  background: #f6f8fa;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.google-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.google-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
