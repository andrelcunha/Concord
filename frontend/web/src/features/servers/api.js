import { apiClient } from '@/lib/apiClient'

export async function listServersRequest() {
  const response = await apiClient.get('/api/servers')
  return response.data
}
