import { apiClient } from '@/lib/apiClient'

export async function listChannelsRequest(serverId) {
  const response = await apiClient.get('/api/channels', {
    params: {
      server_id: serverId,
    },
  })

  return response.data
}

export async function createChannelRequest(payload) {
  const response = await apiClient.post('/api/channels', payload)
  return response.data
}
