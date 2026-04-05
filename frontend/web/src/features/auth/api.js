import { apiClient } from '@/lib/apiClient'

export async function loginRequest(credentials) {
  const response = await apiClient.post('/login', credentials)
  return response.data
}

export async function registerRequest(credentials) {
  const response = await apiClient.post('/register', credentials)
  return response.data
}

export async function refreshRequest(refreshToken) {
  const response = await apiClient.post('/refresh', {
    refresh_token: refreshToken,
  })
  return response.data
}
