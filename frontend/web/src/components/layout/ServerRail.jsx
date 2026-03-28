import React from 'react'
import { NavLink } from 'react-router-dom'

import { useServersStore } from '@/features/servers/store'

function getServerBadge(name) {
  const parts = name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    return '??'
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

function railLinkClass({ isActive }) {
  return [
    'flex h-13 w-13 items-center justify-center rounded-[1.35rem] border text-sm font-bold transition',
    isActive
      ? 'border-concord-accent bg-concord-accent text-slate-950 shadow-[0_0_20px_rgba(90,209,178,0.28)]'
      : 'border-concord-border bg-concord-panel-alt text-concord-text hover:-translate-y-0.5 hover:border-concord-accent/60 hover:bg-concord-panel-soft',
  ].join(' ')
}

export function ServerRail() {
  const servers = useServersStore((state) => state.servers)
  const isLoading = useServersStore((state) => state.isLoading)
  const errorMessage = useServersStore((state) => state.errorMessage)

  return (
    <aside className="flex w-full flex-row items-center gap-3 overflow-x-auto border-b border-concord-border/60 bg-concord-panel px-4 py-4 md:w-24 md:flex-col md:items-center md:gap-4 md:overflow-visible md:border-b-0 md:border-r md:px-4 md:py-5">
      <div className="hidden md:block">
        <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-concord-muted">
          Rail
        </p>
      </div>
      <NavLink
        to="/app/dm"
        className={({ isActive }) =>
          [
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.6rem] border transition',
            isActive
              ? 'border-concord-accent bg-concord-accent text-slate-950'
              : 'border-concord-border bg-concord-night text-concord-text hover:border-concord-accent/60 hover:bg-concord-panel-soft',
          ].join(' ')
        }
      >
        DM
      </NavLink>

      <div className="hidden h-px w-10 bg-concord-border md:block" />

      <nav className="flex flex-row gap-3 md:flex-col">
        {isLoading ? (
          <div className="rounded-2xl border border-concord-border bg-concord-panel-alt px-3 py-2 text-xs uppercase tracking-[0.24em] text-concord-muted">
            Loading
          </div>
        ) : null}
        {!isLoading &&
          servers.map((server) => (
            <NavLink
              key={server.id}
              to={`/app/servers/${server.id}/channels/general`}
              className={railLinkClass}
              title={server.name}
            >
              {getServerBadge(server.name)}
            </NavLink>
          ))}
        {!isLoading && servers.length === 0 ? (
          <div className="max-w-[9rem] rounded-2xl border border-concord-border bg-concord-panel-alt px-3 py-2 text-xs leading-5 text-concord-muted md:max-w-none md:text-center">
            No servers yet
          </div>
        ) : null}
      </nav>

      <div className="ml-auto flex flex-row items-center gap-3 md:ml-0 md:mt-auto md:flex-col">
        <button
          type="button"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-concord-border bg-concord-panel-alt text-xl text-concord-muted transition hover:border-concord-accent hover:text-concord-text"
        >
          +
        </button>
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            [
              'flex h-12 w-12 items-center justify-center rounded-full border transition',
              isActive
                ? 'border-concord-accent bg-concord-panel-soft text-concord-accent'
                : 'border-concord-border bg-concord-panel-alt text-concord-muted hover:border-concord-accent/60 hover:text-concord-text',
            ].join(' ')
          }
        >
          S
        </NavLink>
      </div>
      {errorMessage ? (
        <div className="hidden max-w-[9rem] rounded-2xl border border-concord-danger/30 bg-concord-danger/10 px-3 py-2 text-xs leading-5 text-concord-danger md:block">
          {errorMessage}
        </div>
      ) : null}
    </aside>
  )
}
