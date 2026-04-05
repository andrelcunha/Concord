import React from 'react'

import { PlaceholderPanel } from '@/features/shared/PlaceholderPanel'

export function DmIndexPage() {
  return (
    <PlaceholderPanel
      eyebrow="DM Placeholder"
      title="Direct messages live here later"
      description="The DM entry point is intentionally present in Sprint 1, but conversation behavior is deferred until the server and channel loop is stable."
      actions={[
        'DMs already have a first-class route branch.',
        'The shell keeps the product shape visible.',
        'Real DM conversation architecture comes in a later sprint.',
      ]}
    />
  )
}
