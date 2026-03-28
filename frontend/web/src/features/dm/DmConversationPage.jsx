import React from 'react'
import { useParams } from 'react-router-dom'

import { PlaceholderPanel } from '@/features/shared/PlaceholderPanel'

export function DmConversationPage() {
  const { conversationId } = useParams()

  return (
    <PlaceholderPanel
      eyebrow="DM Conversation Placeholder"
      title={`Conversation ${conversationId}`}
      description="This route exists now so the URL model is stable before the backend and UI details for direct messages are implemented."
      actions={[
        'DM routing is separate from server routing.',
        'The core chat architecture is still expected to be reusable.',
        'This placeholder will later become a real conversation view.',
      ]}
    />
  )
}
