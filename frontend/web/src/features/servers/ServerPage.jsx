import React from 'react'
import { Link, useParams } from 'react-router-dom'

import { useChannelsStore } from '@/features/channels/store'
import { useServersStore } from '@/features/servers/store'
import { getChannelRoute } from '@/lib/navigation'

export function ServerPage() {
  const { serverId } = useParams()
  const servers = useServersStore((state) => state.servers)
  const channelsByServerId = useChannelsStore((state) => state.channelsByServerId)
  const loadingByServerId = useChannelsStore((state) => state.loadingByServerId)
  const errorByServerId = useChannelsStore((state) => state.errorByServerId)

  const server = servers.find((item) => String(item.id) === serverId)
  const channels = channelsByServerId[String(serverId)] ?? []
  const isLoading = loadingByServerId[String(serverId)]
  const errorMessage = errorByServerId[String(serverId)]
  const firstChannel = channels[0]

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="rounded-[2rem] border border-concord-border bg-concord-panel/70 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-concord-accent">
          Server
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-concord-text">
          {server?.name ?? `Server ${serverId}`}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-concord-muted">
          Choose a channel from the sidebar to start chatting. This fallback route keeps the app
          stable even if a server does not have a default `general` channel.
        </p>
      </div>

      <div className="rounded-[2rem] border border-concord-border bg-concord-panel/70 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-concord-muted">
          Next Step
        </p>

        {isLoading ? (
          <p className="mt-4 text-sm text-concord-muted">Loading server channels...</p>
        ) : null}

        {errorMessage ? (
          <p className="mt-4 text-sm text-concord-danger">{errorMessage}</p>
        ) : null}

        {!isLoading && !errorMessage && firstChannel ? (
          <div className="mt-4">
            <Link
              to={getChannelRoute(serverId, firstChannel.id)}
              className="inline-flex rounded-2xl bg-concord-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-concord-accent-strong"
            >
              Open #{firstChannel.name}
            </Link>
          </div>
        ) : null}

        {!isLoading && !errorMessage && channels.length === 0 ? (
          <p className="mt-4 text-sm text-concord-muted">
            No channels are available for this server yet.
          </p>
        ) : null}
      </div>
    </section>
  )
}
