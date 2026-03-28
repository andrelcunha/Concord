import React from 'react'

import { PlaceholderPanel } from '@/features/shared/PlaceholderPanel'

export function AppHomePage() {
  return (
    <PlaceholderPanel
      eyebrow="Shell"
      title="Choose a server or direct messages"
      description="Sprint 1 establishes the React layout and route model first. Real backend-backed navigation arrives in later sprints."
      actions={[
        'Left rail is now the canonical place for servers and DMs.',
        'Channel sidebar is structural for now.',
        'This empty state is the safe default for /app.',
      ]}
    />
  )
}
