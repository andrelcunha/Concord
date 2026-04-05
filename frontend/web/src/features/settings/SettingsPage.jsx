import React from 'react'

import { useSessionStore } from '@/lib/sessionStore'

function formatSessionExpiry(expiresAt) {
  if (!expiresAt) {
    return 'Session expiration is not available yet.'
  }

  const expiresAtDate = new Date(expiresAt)
  if (Number.isNaN(expiresAtDate.getTime())) {
    return 'Session expiration is not available yet.'
  }

  const millisecondsRemaining = expiresAtDate.getTime() - Date.now()
  if (millisecondsRemaining <= 0) {
    return 'The current access token has expired.'
  }

  const remainingMinutes = Math.floor(millisecondsRemaining / 60000)
  if (remainingMinutes < 1) {
    return 'The current access token expires in under a minute.'
  }

  if (remainingMinutes === 1) {
    return 'The current access token expires in about 1 minute.'
  }

  return `The current access token expires in about ${remainingMinutes} minutes.`
}

function formatDateTime(value) {
  if (!value) {
    return 'Unavailable'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Unavailable'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function maskToken(token) {
  if (!token) {
    return 'Not available'
  }

  if (token.length <= 16) {
    return token
  }

  return `${token.slice(0, 8)}...${token.slice(-8)}`
}

function getInitial(username) {
  return username?.slice(0, 1).toUpperCase() || '?'
}

function SettingsCard({ eyebrow, title, children }) {
  return (
    <section className="rounded-[2rem] border border-concord-border bg-concord-panel/70 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-concord-accent">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-concord-text">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}

export function SettingsPage() {
  const currentUser = useSessionStore((state) => state.currentUser)
  const expiresAt = useSessionStore((state) => state.expiresAt)
  const accessToken = useSessionStore((state) => state.accessToken)
  const refreshToken = useSessionStore((state) => state.refreshToken)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <SettingsCard eyebrow="Account" title="Your account at a glance">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="flex items-center gap-4">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.username}
                className="h-20 w-20 rounded-[1.5rem] object-cover shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
              />
            ) : (
              <div
                className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] text-2xl font-semibold text-slate-950 shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
                style={{ backgroundColor: currentUser?.avatarColor ?? '#5ad1b2' }}
              >
                {getInitial(currentUser?.username)}
              </div>
            )}
            <div>
              <p className="text-lg font-semibold text-concord-text">
                {currentUser?.username ?? 'Signed-in user'}
              </p>
              <p className="mt-1 text-sm text-concord-muted">
                User ID: {currentUser?.userId ?? 'Unavailable'}
              </p>
            </div>
          </div>

          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-concord-border bg-concord-panel-alt/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-concord-muted">
                Username
              </p>
              <p className="mt-2 text-base font-medium text-concord-text">
                {currentUser?.username ?? 'Unavailable'}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-concord-border bg-concord-panel-alt/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-concord-muted">
                Avatar Color
              </p>
              <div className="mt-2 flex items-center gap-3">
                <span
                  className="h-4 w-4 rounded-full border border-white/10"
                  style={{ backgroundColor: currentUser?.avatarColor ?? '#5ad1b2' }}
                />
                <p className="text-base font-medium text-concord-text">
                  {currentUser?.avatarColor ?? '#5ad1b2'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-concord-muted">
          This page is now a real account surface. Editable profile fields such as display name,
          avatar upload, and server-specific nicknames can land here once the backend model is
          ready for them.
        </p>
      </SettingsCard>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SettingsCard eyebrow="Session" title="Current session health">
          <div className="grid gap-3">
            <div className="rounded-[1.5rem] border border-concord-border bg-concord-panel-alt/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-concord-muted">
                Access Token
              </p>
              <p className="mt-2 break-all font-mono text-sm text-concord-text">
                {maskToken(accessToken)}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-concord-border bg-concord-panel-alt/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-concord-muted">
                Refresh Token
              </p>
              <p className="mt-2 break-all font-mono text-sm text-concord-text">
                {maskToken(refreshToken)}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-concord-border bg-concord-panel-alt/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-concord-muted">
                Expires At
              </p>
              <p className="mt-2 text-sm text-concord-text">{formatDateTime(expiresAt)}</p>
              <p className="mt-2 text-sm text-concord-muted">{formatSessionExpiry(expiresAt)}</p>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard eyebrow="Coming Next" title="Profile controls we can add later">
          <div className="grid gap-3">
            <div className="rounded-[1.5rem] border border-concord-border bg-concord-panel-alt/80 p-4">
              <p className="text-sm font-semibold text-concord-text">Profile identity</p>
              <p className="mt-2 text-sm leading-6 text-concord-muted">
                Full name, display name, and avatar upload are the most natural first edits once the
                backend supports profile updates.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-concord-border bg-concord-panel-alt/80 p-4">
              <p className="text-sm font-semibold text-concord-text">Server-specific nicknames</p>
              <p className="mt-2 text-sm leading-6 text-concord-muted">
                A nickname layer can come after the base account profile so each server can keep its
                own social identity without changing the global username.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-concord-border bg-concord-panel-alt/80 p-4">
              <p className="text-sm font-semibold text-concord-text">Client preferences</p>
              <p className="mt-2 text-sm leading-6 text-concord-muted">
                Notification preferences, compact message density, and theme experiments would fit
                naturally in this area later.
              </p>
            </div>
          </div>
        </SettingsCard>
      </div>
    </div>
  )
}
