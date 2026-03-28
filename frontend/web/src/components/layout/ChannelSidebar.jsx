import React from 'react'
import { NavLink, useLocation, useParams } from 'react-router-dom'

import { useServersStore } from '@/features/servers/store'

const serverDefinitions = {
  default: [
    {
      label: 'Text Channels',
      items: [
        { id: 'general', name: 'general' },
        { id: 'announcements', name: 'announcements' },
        { id: 'product-notes', name: 'product-notes' },
      ],
    },
    {
      label: 'Planning',
      items: [
        { id: 'ideas', name: 'ideas' },
        { id: 'design-lab', name: 'design-lab' },
      ],
    },
  ],
}

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
  const isDmRoute = location.pathname.startsWith('/app/dm')
  const activeServer = servers.find((server) => String(server.id) === params.serverId)
  const activeServerLabel = isDmRoute
    ? 'Direct Messages'
    : activeServer?.name ?? 'Choose a server'
  const groups = isDmRoute ? dmGroups : serverDefinitions.default

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-concord-border/60 bg-concord-panel-alt/90 md:w-80 md:border-b-0 md:border-r">
      <div className="border-b border-concord-border/60 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-concord-muted">
          {activeServerLabel}
        </p>
        <h2 className="mt-2 text-xl font-semibold">Channels</h2>
        <p className="mt-2 text-sm leading-6 text-concord-muted">
          {isDmRoute
            ? 'The DM branch already has its own route model. Real conversation data lands in a later slice.'
            : 'Servers are now real backend data. Channels remain a placeholder list until the next navigation slice.'}
        </p>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4">
        {groups.map((group) => (
          <section key={group.label} className="mb-6">
            <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.28em] text-concord-muted">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map((channel) => (
                <NavLink
                  key={channel.id}
                  to={
                    isDmRoute
                      ? `/app/dm/${channel.id}`
                      : `/app/servers/${params.serverId ?? 'placeholder'}/channels/${channel.id}`
                  }
                  className={({ isActive }) =>
                    [
                      'flex items-center rounded-xl px-3 py-2 text-sm transition',
                      isActive
                        ? 'bg-concord-panel-soft text-concord-text'
                        : 'text-concord-muted hover:bg-concord-panel-soft/70 hover:text-concord-text',
                    ].join(' ')
                  }
                >
                  <span className="mr-3 text-base text-concord-accent">{isDmRoute ? '@' : '#'}</span>
                  {channel.name}
                </NavLink>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="border-t border-concord-border/60 px-4 py-4">
        <div className="rounded-2xl border border-concord-border bg-concord-panel/80 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-concord-muted">
            Planned
          </p>
          <p className="mt-2 text-sm leading-6 text-concord-muted">
            Real channel fetching, selection defaults, unread badges, and member-aware sections land in later slices.
          </p>
        </div>
      </div>
    </aside>
  )
}
