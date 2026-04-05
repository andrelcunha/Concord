import { apiClient } from '@/lib/apiClient'

export async function listDmConversationsRequest() {
  const response = await apiClient.get('/api/dms')
  return response.data
}

export async function getDmConversationRequest(conversationId) {
  const response = await apiClient.get(`/api/dms/${conversationId}`)
  return response.data
}

export async function createOrGetDmConversationRequest(otherUserId) {
  const response = await apiClient.post('/api/dms', {
    other_user_id: Number(otherUserId),
  })
  return response.data
}

export async function hideDmConversationRequest(conversationId) {
  await apiClient.delete(`/api/dms/${conversationId}`)
}

export async function listDmMessagesRequest(conversationId) {
  const response = await apiClient.get(`/api/dms/${conversationId}/messages`)
  return response.data
}

export async function listFriendsRequest() {
  const response = await apiClient.get('/api/friends')
  return response.data
}

export async function searchUsersRequest(query) {
  const response = await apiClient.get('/api/friends/search', {
    params: {
      query,
    },
  })
  return response.data
}

export async function sendFriendRequestRequest(targetUserId) {
  const response = await apiClient.post('/api/friends/requests', {
    target_user_id: Number(targetUserId),
  })
  return response.data
}

export async function listIncomingFriendRequestsRequest() {
  const response = await apiClient.get('/api/friends/requests/incoming')
  return response.data
}

export async function acceptFriendRequestRequest(friendshipId) {
  const response = await apiClient.post(`/api/friends/requests/${friendshipId}/accept`)
  return response.data
}

export async function rejectFriendRequestRequest(friendshipId) {
  await apiClient.post(`/api/friends/requests/${friendshipId}/reject`)
}
