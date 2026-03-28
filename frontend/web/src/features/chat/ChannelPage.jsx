import React from 'react'
import { useParams } from 'react-router-dom'

import { PlaceholderPanel } from '@/features/shared/PlaceholderPanel'

export function ChannelPage() {
  const { serverId, channelId } = useParams()

  return (
    <PlaceholderPanel
      eyebrow="Channel Placeholder"
      title={`Server ${serverId} · Channel ${channelId}`}
      description="This route proves the shell and URL model. Message history, WebSocket lifecycle, and chat interactions will be wired in later sprints."
      actions={[
        'The URL is the source of truth for selected server and channel.',
        'The shell remains stable while content swaps inside it.',
        'This page will later become the real chat surface.',
      ]}
    />
  )
}
