import React from 'react'
import { Navigate } from 'react-router-dom'

import { useDmStore } from '@/features/dm/store'

function ConversationSkeleton() {
  return (
    <div className="space-y-3 rounded-[2rem] border border-concord-border bg-concord-panel/70 p-6">
      <div className="h-4 w-28 rounded-full bg-concord-panel-soft/80" />
      <div className="h-8 w-60 rounded-full bg-concord-panel-soft/70" />
      <div className="h-4 w-80 max-w-full rounded-full bg-concord-panel-soft/60" />
    </div>
  )
}

export function DmIndexPage() {
  const conversations = useDmStore((state) => state.conversations)
  const isLoadingConversations = useDmStore((state) => state.isLoadingConversations)
  const conversationsError = useDmStore((state) => state.conversationsError)

  if (!isLoadingConversations && conversations.length > 0) {
    return <Navigate to={`/app/dm/${conversations[0].id}`} replace />
  }

  if (isLoadingConversations) {
    return (
      <section className="mx-auto flex max-w-4xl flex-col gap-4">
        <ConversationSkeleton />
        <ConversationSkeleton />
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-4xl rounded-[2rem] border border-concord-border bg-concord-panel/70 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-concord-accent">
        Direct Messages
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-concord-text">
        {conversationsError ? 'We could not load your conversations' : 'Pick a conversation or start a new one'}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-concord-muted">
        {conversationsError
          ? conversationsError
          : 'Your direct messages live in the sidebar. Use the + button to start a new conversation with one of your friends.'}
      </p>
    </section>
  )
}
