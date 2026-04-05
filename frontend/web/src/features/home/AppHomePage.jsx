import React from 'react'
import { Link } from 'react-router-dom'

import { PlaceholderPanel } from '@/features/shared/PlaceholderPanel'
import { useServersStore } from '@/features/servers/store'
import { getServerRoute } from '@/lib/navigation'

export function AppHomePage() {
  const servers = useServersStore((state) => state.servers)
  const isLoading = useServersStore((state) => state.isLoading)
  const errorMessage = useServersStore((state) => state.errorMessage)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PlaceholderPanel
        eyebrow="Shell"
        title="Choose a server or direct messages"
        description="Pick where you want to chat. Your servers appear below, and direct messages are available from the left rail."
        actions={[
          'Open a server to browse its channels.',
          'Use direct messages for one-to-one conversation.',
          'Settings stay available from the top bar.',
        ]}
      />

      <section className="rounded-[2rem] border border-concord-border bg-concord-panel/70 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-concord-accent">
          Available Servers
        </p>
        {isLoading ? (
          <p className="mt-4 text-sm text-concord-muted">Loading your servers...</p>
        ) : null}
        {errorMessage ? (
          <p className="mt-4 text-sm text-concord-danger">{errorMessage}</p>
        ) : null}
        {!isLoading && !errorMessage && servers.length === 0 ? (
          <p className="mt-4 text-sm text-concord-muted">
            No servers were returned for this account yet. Once a server exists, it will appear here
            and in the left rail.
          </p>
        ) : null}
        {!isLoading && servers.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {servers.map((server) => (
              <Link
                key={server.id}
                to={getServerRoute(server.id)}
                className="rounded-[1.5rem] border border-concord-border bg-concord-panel-alt/80 p-5 transition hover:border-concord-accent/60 hover:bg-concord-panel-soft"
              >
                <p className="text-lg font-semibold text-concord-text">{server.name}</p>
                <p className="mt-2 text-sm text-concord-muted">
                  Creator ID: {server.creator_id} · Route context uses server {server.id}
                </p>
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}
