import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useChannelsStore } from '@/features/channels/store'
import { useServersStore } from '@/features/servers/store'
import { getChannelRoute } from '@/lib/navigation'

export function ServerPage() {
  const navigate = useNavigate()
  const { serverId } = useParams()
  const servers = useServersStore((state) => state.servers)
  const channelsByServerId = useChannelsStore((state) => state.channelsByServerId)
  const loadingByServerId = useChannelsStore((state) => state.loadingByServerId)
  const errorByServerId = useChannelsStore((state) => state.errorByServerId)

  const server = servers.find((item) => String(item.id) === serverId)
  const hasResolvedChannels = Object.prototype.hasOwnProperty.call(
    channelsByServerId,
    String(serverId),
  )
  const channels = channelsByServerId[String(serverId)] ?? []
  const isLoading = loadingByServerId[String(serverId)]
  const errorMessage = errorByServerId[String(serverId)]
  const firstChannel = channels[0]
  const shouldShowSkeleton = !errorMessage && (!hasResolvedChannels || isLoading || Boolean(firstChannel))

  React.useEffect(() => {
    if (!serverId || isLoading || errorMessage || !firstChannel) {
      return
    }

    navigate(getChannelRoute(serverId, firstChannel.id), { replace: true })
  }, [errorMessage, firstChannel, isLoading, navigate, serverId])

  if (shouldShowSkeleton) {
    return (
      <section className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="rounded-[2rem] border border-concord-border bg-concord-panel/70 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
          <div className="h-4 w-20 rounded-full bg-concord-panel-soft/80" />
          <div className="mt-4 h-10 w-64 max-w-full rounded-full bg-concord-panel-soft/80" />
          <div className="mt-5 h-4 w-full max-w-2xl rounded-full bg-concord-panel-soft/70" />
          <div className="mt-3 h-4 w-3/4 max-w-xl rounded-full bg-concord-panel-soft/60" />
        </div>

        <div className="rounded-[2rem] border border-concord-border bg-concord-panel/70 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
          <div className="h-4 w-24 rounded-full bg-concord-panel-soft/80" />
          <div className="mt-5 h-4 w-48 rounded-full bg-concord-panel-soft/70" />
          <div className="mt-3 h-4 w-40 rounded-full bg-concord-panel-soft/60" />
        </div>
      </section>
    )
  }

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
          This server does not have any channels yet. Create the first one from the sidebar to turn
          it into an active space.
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

        {!isLoading && !errorMessage && channels.length === 0 ? (
          <p className="mt-4 text-sm text-concord-muted">
            No channels are available for this server yet.
          </p>
        ) : null}
      </div>
    </section>
  )
}
