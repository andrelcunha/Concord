export function getServerRoute(serverId) {
  return `/app/servers/${serverId}`
}

export function getChannelRoute(serverId, channelId) {
  return `/app/servers/${serverId}/channels/${channelId}`
}

export function getDmRoute(conversationId) {
  return `/app/dm/${conversationId}`
}
