import React from 'react'
import { NavLink } from 'react-router-dom'

const serverItems = [
  { id: 'atlas', label: 'AT', to: '/app/servers/atlas/channels/general' },
  { id: 'orbit', label: 'OR', to: '/app/servers/orbit/channels/announcements' },
  { id: 'ember', label: 'EM', to: '/app/servers/ember/channels/design-lab' },
]

function railLinkClass({ isActive }) {
  return [
    'flex h-13 w-13 items-center justify-center rounded-[1.35rem] border text-sm font-bold transition',
    isActive
      ? 'border-concord-accent bg-concord-accent text-slate-950 shadow-[0_0_20px_rgba(90,209,178,0.28)]'
      : 'border-concord-border bg-concord-panel-alt text-concord-text hover:-translate-y-0.5 hover:border-concord-accent/60 hover:bg-concord-panel-soft',
  ].join(' ')
}

export function ServerRail() {
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
        {serverItems.map((item) => (
          <NavLink key={item.id} to={item.to} className={railLinkClass}>
            {item.label}
          </NavLink>
        ))}
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
    </aside>
  )
}
