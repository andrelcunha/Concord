import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { ChannelSidebar } from '@/components/layout/ChannelSidebar'
import { ServerRail } from '@/components/layout/ServerRail'
import { useSessionStore } from '@/lib/sessionStore'

export function AppShell() {
  const logout = useSessionStore((state) => state.logout)

  return (
    <div className="min-h-screen bg-concord-night text-concord-text">
      <div className="flex min-h-screen">
        <ServerRail />
        <ChannelSidebar />
        <main className="relative flex min-w-0 flex-1 flex-col border-l border-concord-border/60 bg-concord-night/70">
          <header className="flex items-center justify-between border-b border-concord-border/60 bg-concord-panel/80 px-6 py-4 backdrop-blur">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-concord-muted">
                Concord
              </p>
              <h1 className="text-lg font-semibold">React shell placeholder</h1>
            </div>
            <div className="flex items-center gap-3">
              <NavLink
                to="/app/settings"
                className="rounded-full border border-concord-border bg-concord-panel-alt px-4 py-2 text-sm text-concord-muted transition hover:border-concord-accent hover:text-concord-text"
              >
                Settings
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-concord-danger/40 bg-concord-danger/10 px-4 py-2 text-sm text-concord-danger transition hover:bg-concord-danger/20"
              >
                Sign out
              </button>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
