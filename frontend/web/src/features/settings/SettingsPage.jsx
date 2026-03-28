import React from 'react'

import { PlaceholderPanel } from '@/features/shared/PlaceholderPanel'

export function SettingsPage() {
  return (
    <PlaceholderPanel
      eyebrow="Settings Placeholder"
      title="User settings will live here"
      description="We are reserving a first-class route for account and profile settings early so the shell does not need redesign later."
      actions={[
        'Likely future fields include full name, avatar, and nickname.',
        'Settings are a route, not only a modal concept.',
        'Sprint 1 keeps this surface intentionally simple.',
      ]}
    />
  )
}
