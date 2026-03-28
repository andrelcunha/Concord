import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const channelGroups = [
  {
    label: 'Text Channels',
    items: [
      { id: 'general', name: 'general' },
      { id: 'announcements', name: 'announcements' },
      { id: 'design-lab', name: 'design-lab' },
    ],
  },
  {
    label: 'Placeholder',
    items: [
      { id: 'product-notes', name: 'product-notes' },
      { id: 'ideas', name: 'ideas' },
    ],
  },
]

export function ChannelSidebar() {
  const location = useLocation()
  const activeServerLabel = location.pathname.startsWith('/app/dm')
    ? 'Direct Messages'
    : 'Server Placeholder'

  return (
    <aside className="flex w-80 shrink-0 flex-col border-r border-concord-border/60 bg-concord-panel-alt/90">
      <div className="border-b border-concord-border/60 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-concord-muted">
          {activeServerLabel}
        </p>
        <h2 className="mt-2 text-xl font-semibold">Channels</h2>
        <p className="mt-2 text-sm leading-6 text-concord-muted">
          Sprint 1 keeps this sidebar structural. Real server and channel data will arrive in later
          sprints.
        </p>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4">
        {channelGroups.map((group) => (
          <section key={group.label} className="mb-6">
            <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.28em] text-concord-muted">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map((channel) => (
                <NavLink
                  key={channel.id}
                  to={`/app/servers/atlas/channels/${channel.id}`}
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
        ))}
      </div>

      <div className="border-t border-concord-border/60 px-4 py-4">
        <button
          type="button"
          className="w-full rounded-2xl border border-concord-accent/40 bg-concord-accent/12 px-4 py-3 text-sm font-semibold text-concord-text transition hover:border-concord-accent hover:bg-concord-accent/18"
        >
          Create channel later
        </button>
      </div>
    </aside>
  )
}
