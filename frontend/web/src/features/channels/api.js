import { apiClient } from '@/lib/apiClient'

export async function listChannelsRequest(serverId) {
  const response = await apiClient.get('/api/channels', {
    params: {
      server_id: serverId,
    },
  })

  return response.data
}
