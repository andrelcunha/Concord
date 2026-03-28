import { apiClient } from '@/lib/apiClient'

export async function listMessagesRequest(channelId) {
  const response = await apiClient.get(`/api/channels/${channelId}/messages`)
  return response.data
}
