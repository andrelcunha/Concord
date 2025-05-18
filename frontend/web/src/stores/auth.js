import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    expiresAt: null
  }),
  actions: {
    async login(credentials) {
      try {
        const response = await api.post('/login', credentials)
        console.log('Login response:', response.data)
        this.accessToken = response.data.access_token
        this.refreshToken = response.data.refresh_token
        this.isAuthenticated = true
        this.expiresAt = Date.now() + 900 * 1000 // 15min default
      } catch (error) {
        console.error('Login error:', error.response?.data)
        throw error.response?.data?.error || 'Login failed'
      }
    },
    async register(credentials) {
      try {
        const response = await api.post('/register', credentials)
        console.log('Register response:', response.data)
        return { username: response.data.username }
      } catch (error) {
        console.error('Register error:', error.response?.data)
        throw error.response?.data?.error || 'Registration failed'
      }
    },
    async refresh() {
      try {
        const response = await api.post('/refresh', {
          refresh_token: this.refreshToken
        })
        console.log('Refresh response:', response.data)
        this.accessToken = response.data.access_token
        this.refreshToken = response.data.refresh_token
        this.expiresAt = Date.now() + response.data.expires_in * 1000
        this.isAuthenticated = true
      } catch (error) {
        console.error('Refresh error:', error.response?.data)
        this.logout()
        throw error.response?.data?.error || 'Token refresh failed'
      }
    },
    logout() {
      this.accessToken = null
      this.refreshToken = null
      this.isAuthenticated = false
      this.expiresAt = null
    },
    isTokenExpired() {
      return !this.expiresAt || Date.now() >= this.expiresAt
    }
  }
})