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
