import React from 'react'
import { NavLink, useLocation, useParams } from 'react-router-dom'

import { useChannelsStore } from '@/features/channels/store'
import { useServersStore } from '@/features/servers/store'

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
  const location = useLocation()
  const params = useParams()
  const servers = useServersStore((state) => state.servers)
  const channelsByServerId = useChannelsStore((state) => state.channelsByServerId)
  const loadingByServerId = useChannelsStore((state) => state.loadingByServerId)
  const errorByServerId = useChannelsStore((state) => state.errorByServerId)
  const isDmRoute = location.pathname.startsWith('/app/dm')
  const activeServer = servers.find((server) => String(server.id) === params.serverId)
  const activeServerLabel = isDmRoute
    ? 'Direct Messages'
    : activeServer?.name ?? 'No server selected'
  const activeChannels = params.serverId ? channelsByServerId[String(params.serverId)] ?? [] : []
  const isLoadingChannels = params.serverId ? loadingByServerId[String(params.serverId)] : false
  const channelError = params.serverId ? errorByServerId[String(params.serverId)] : ''

  return (
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
                  to={`/app/servers/${params.serverId}/channels/${channel.id}`}
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
        <div className="rounded-2xl border border-concord-border bg-concord-panel/80 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-concord-muted">
            Soon
          </p>
          <p className="mt-2 text-sm leading-6 text-concord-muted">
            Channel tools and member details will appear here as Concord grows.
          </p>
        </div>
      </div>
    </aside>
  )
}
