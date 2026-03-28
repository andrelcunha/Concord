import React from 'react'
import { NavLink, Outlet, useLocation, useParams } from 'react-router-dom'

import { ChannelSidebar } from '@/components/layout/ChannelSidebar'
import { ServerRail } from '@/components/layout/ServerRail'
import { useSessionStore } from '@/lib/sessionStore'

export function AppShell() {
  const location = useLocation()
  const params = useParams()
  const logout = useSessionStore((state) => state.logout)
  const isDm = location.pathname.startsWith('/app/dm')
  const title = isDm
    ? params.conversationId
      ? `DM · ${params.conversationId}`
      : 'Direct messages'
    : params.channelId
      ? `# ${params.channelId}`
      : 'Choose your next conversation'
  const subtitle = isDm
    ? 'Placeholder inbox route with the final shell structure already in place.'
    : params.serverId
      ? `Server context: ${params.serverId}`
      : 'Sprint 1 keeps this screen structural so later slices can focus on integration.'

  return (
    <div className="min-h-screen bg-concord-night text-concord-text">
      <div className="flex min-h-screen flex-col md:flex-row">
        <ServerRail />
        <ChannelSidebar />
        <main className="relative flex min-w-0 flex-1 flex-col border-l border-concord-border/60 bg-concord-night/70">
          <header className="flex flex-col gap-4 border-b border-concord-border/60 bg-concord-panel/80 px-6 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-concord-muted">
                Concord
              </p>
              <h1 className="text-lg font-semibold">{title}</h1>
              <p className="mt-1 text-sm text-concord-muted">{subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <NavLink
                to="/app/settings"
                className="rounded-full border border-concord-border bg-concord-panel-alt px-4 py-2 text-sm text-concord-muted transition hover:border-concord-accent hover:text-concord-text"
              >
                Settings
              </NavLink>
              <div className="rounded-full border border-concord-border bg-concord-panel-alt px-4 py-2 text-sm text-concord-muted">
                Layout-first slice
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-concord-danger/40 bg-concord-danger/10 px-4 py-2 text-sm text-concord-danger transition hover:bg-concord-danger/20"
              >
                Sign out
              </button>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
