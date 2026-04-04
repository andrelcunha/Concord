import { apiClient } from '@/lib/apiClient'

export async function listServersRequest() {
  const response = await apiClient.get('/api/servers')
  return response.data
}

export async function createServerRequest(payload) {
  const response = await apiClient.post('/api/servers', payload)
  return response.data
}

export async function discoverServersRequest(query = '') {
  const response = await apiClient.get('/api/servers/discover', {
    params: {
      query,
    },
  })
  return response.data
}

export async function joinServerRequest(serverId) {
  const response = await apiClient.post(`/api/servers/${serverId}/join`)
  return response.data
}
