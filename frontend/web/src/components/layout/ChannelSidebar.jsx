import React from 'react'
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'

import { useChannelsStore } from '@/features/channels/store'
import { useServersStore } from '@/features/servers/store'
import { getChannelRoute } from '@/lib/navigation'

const dmGroups = [
  {
    label: 'Recent',
    items: [
      { id: 'ava-luna', name: 'ava-luna' },
      { id: 'sam-kline', name: 'sam-kline' },
    ],
  },
  {
    label: 'Later',
    items: [
      { id: 'group-prototype', name: 'group-prototype' },
    ],
  },
]

export function ChannelSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const servers = useServersStore((state) => state.servers)
  const channelsByServerId = useChannelsStore((state) => state.channelsByServerId)
  const loadingByServerId = useChannelsStore((state) => state.loadingByServerId)
  const errorByServerId = useChannelsStore((state) => state.errorByServerId)
  const creatingByServerId = useChannelsStore((state) => state.creatingByServerId)
  const createChannel = useChannelsStore((state) => state.createChannel)
  const isDmRoute = location.pathname.startsWith('/app/dm')
  const activeServer = servers.find((server) => String(server.id) === params.serverId)
  const activeServerLabel = isDmRoute
    ? 'Direct Messages'
    : activeServer?.name ?? 'No server selected'
  const activeChannels = params.serverId ? channelsByServerId[String(params.serverId)] ?? [] : []
  const isLoadingChannels = params.serverId ? loadingByServerId[String(params.serverId)] : false
  const channelError = params.serverId ? errorByServerId[String(params.serverId)] : ''
  const isCreatingChannel = params.serverId ? creatingByServerId[String(params.serverId)] : false
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [channelName, setChannelName] = React.useState('')

  async function handleCreateChannel(event) {
    event.preventDefault()

    const trimmedName = channelName.trim()
    if (!trimmedName || !params.serverId) {
      return
    }

    const channel = await createChannel({
      serverId: params.serverId,
      name: trimmedName,
    })

    if (!channel) {
      return
    }

    setChannelName('')
    setIsDialogOpen(false)
    navigate(getChannelRoute(params.serverId, channel.id))
  }

  return (
    <>
    <aside className="flex w-full shrink-0 flex-col border-b border-concord-border/60 bg-concord-panel-alt/90 md:w-80 md:border-b-0 md:border-r">
      <div className="border-b border-concord-border/60 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-concord-muted">
          {activeServerLabel}
        </p>
        <h2 className="mt-2 text-xl font-semibold">Channels</h2>
        <p className="mt-2 text-sm leading-6 text-concord-muted">
          {isDmRoute
            ? 'Private conversations will appear here.'
            : 'Pick a channel to open the conversation.'}
        </p>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4">
        {isDmRoute ? (
          dmGroups.map((group) => (
            <section key={group.label} className="mb-6">
              <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.28em] text-concord-muted">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((channel) => (
                  <NavLink
                    key={channel.id}
                    to={`/app/dm/${channel.id}`}
                    className={({ isActive }) =>
                      [
                        'flex items-center rounded-xl px-3 py-2 text-sm transition',
                        isActive
                          ? 'bg-concord-panel-soft text-concord-text'
                          : 'text-concord-muted hover:bg-concord-panel-soft/70 hover:text-concord-text',
                      ].join(' ')
                    }
                  >
                    <span className="mr-3 text-base text-concord-accent">@</span>
                    {channel.name}
                  </NavLink>
                ))}
              </div>
            </section>
          ))
        ) : (
          <section className="mb-6">
            <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.28em] text-concord-muted">
              Text Channels
            </h3>

            {isLoadingChannels ? (
              <p className="px-2 text-sm text-concord-muted">Loading channels...</p>
            ) : null}

            {channelError ? (
              <p className="px-2 text-sm text-concord-danger">{channelError}</p>
            ) : null}

            {!isLoadingChannels && !channelError && activeChannels.length === 0 ? (
              <p className="px-2 text-sm text-concord-muted">
                No channels were returned for this server yet.
              </p>
            ) : null}

            <div className="space-y-1">
                {activeChannels.map((channel) => (
                  <NavLink
                    key={channel.id}
                    to={getChannelRoute(params.serverId, channel.id)}
                    className={({ isActive }) =>
                      [
                        'flex items-center rounded-xl px-3 py-2 text-sm transition',
                      isActive
                        ? 'bg-concord-panel-soft text-concord-text'
                        : 'text-concord-muted hover:bg-concord-panel-soft/70 hover:text-concord-text',
                    ].join(' ')
                  }
                >
                  <span className="mr-3 text-base text-concord-accent">#</span>
                  {channel.name}
                </NavLink>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="border-t border-concord-border/60 px-4 py-4">
        {isDmRoute ? (
          <div className="rounded-2xl border border-concord-border bg-concord-panel/80 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-concord-muted">
              Soon
            </p>
            <p className="mt-2 text-sm leading-6 text-concord-muted">
              Conversation tools and member details will appear here as Concord grows.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            disabled={!params.serverId}
            className="w-full rounded-2xl border border-concord-accent/40 bg-concord-accent/12 px-4 py-3 text-sm font-semibold text-concord-text transition hover:border-concord-accent hover:bg-concord-accent/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Create channel
          </button>
        )}
      </div>
    </aside>
    {isDialogOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4">
        <div className="w-full max-w-md rounded-[2rem] border border-concord-border bg-concord-panel p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-concord-accent">
            Create Channel
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-concord-text">
            Add a new channel
          </h2>
          <p className="mt-3 text-sm leading-6 text-concord-muted">
            Create a text channel inside {activeServer?.name ?? 'this server'}.
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleCreateChannel}>
            <label className="block">
              <span className="mb-2 block text-sm text-concord-muted">Channel name</span>
              <input
                value={channelName}
                onChange={(event) => setChannelName(event.target.value)}
                className="w-full rounded-2xl border border-concord-border bg-concord-panel-alt px-4 py-3 text-concord-text outline-none transition focus:border-concord-accent"
                placeholder="general"
                autoFocus
              />
            </label>

            {channelError ? (
              <p className="rounded-2xl border border-concord-danger/30 bg-concord-danger/10 px-4 py-3 text-sm text-concord-danger">
                {channelError}
              </p>
            ) : null}

            <div className="mt-2 flex flex-col gap-3 md:flex-row">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-2xl border border-concord-border bg-concord-panel-alt px-5 py-3 text-sm font-semibold text-concord-text transition hover:border-concord-accent"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingChannel || !channelName.trim()}
                className="rounded-2xl bg-concord-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-concord-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreatingChannel ? 'Creating...' : 'Create channel'}
              </button>
            </div>
          </form>
        </div>
      </div>
    ) : null}
    </>
  )
}
