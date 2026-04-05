import React from 'react'
import { NavLink } from 'react-router-dom'

import { SettingsCogIcon } from '@/components/icons/SettingsCogIcon'
import { useSessionStore } from '@/lib/sessionStore'

function getInitial(username) {
  return username?.slice(0, 1).toUpperCase() || '?'
}

export function UserPanel() {
  const currentUser = useSessionStore((state) => state.currentUser)

  return (
    <div className="border-t border-concord-border/60 bg-concord-panel px-4 py-3">
      <div className="flex items-center gap-3 rounded-[1.4rem] border border-concord-border bg-concord-panel-alt/90 px-3 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
        {currentUser?.avatarUrl ? (
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.username}
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-slate-950"
            style={{ backgroundColor: currentUser?.avatarColor ?? '#5ad1b2' }}
          >
            {getInitial(currentUser?.username)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-concord-text">
            {currentUser?.username ?? 'Concord user'}
          </p>
          <p className="mt-0.5 truncate text-xs text-concord-muted">Online</p>
        </div>

        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            [
              'flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-concord-muted transition',
              isActive
                ? 'text-concord-accent'
                : 'hover:bg-white/6 hover:text-concord-text',
            ].join(' ')
          }
          aria-label="Open settings"
          title="Settings"
        >
          <SettingsCogIcon className="h-7 w-7" />
        </NavLink>
      </div>
    </div>
  )
}
