import React from 'react'
import { useParams } from 'react-router-dom'

import { useChannelsStore } from '@/features/channels/store'
import { PlaceholderPanel } from '@/features/shared/PlaceholderPanel'
import { useServersStore } from '@/features/servers/store'

export function ChannelPage() {
  const { serverId, channelId } = useParams()
  const servers = useServersStore((state) => state.servers)
  const channelsByServerId = useChannelsStore((state) => state.channelsByServerId)
  const server = servers.find((item) => String(item.id) === serverId)
  const channels = channelsByServerId[String(serverId)] ?? []
  const channel = channels.find((item) => String(item.id) === channelId)

  return (
    <PlaceholderPanel
      eyebrow="Channel Placeholder"
      title={channel ? `${server?.name ?? `Server ${serverId}`} · #${channel.name}` : `Server ${serverId} · Channel ${channelId}`}
      description={
        channel
          ? 'The selected server and channel now both come from real backend-backed navigation. This page still stops short of fetching message history so the next sprint can focus on chat behavior.'
          : 'This route does not match any channel currently loaded for the selected server. Once channel defaults are smarter, these dead-end URLs should become less likely.'
      }
      actions={[
        channel
          ? 'The URL is the source of truth for selected server and channel.'
          : 'The shell still handles invalid route state gracefully.',
        channel
          ? 'The sidebar now uses the same backend-backed server context.'
          : 'The sidebar remains the place to recover to a valid channel.',
        'This page will later become the real chat surface.',
      ]}
    />
  )
}
