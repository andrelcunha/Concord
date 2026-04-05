import React from 'react'
import { Link } from 'react-router-dom'

export function AuthShell({
  title,
  description,
  submitLabel,
  alternateLabel,
  alternateTo,
  onSubmit,
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  isSubmitting,
  errorMessage,
  successMessage,
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-concord-night px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-concord-border bg-concord-panel/90 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-concord-accent">
          Concord
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-concord-text">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-concord-muted">{description}</p>

        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-4"
        >
          <label className="block">
            <span className="mb-2 block text-sm text-concord-muted">Username</span>
            <input
              value={username}
              onChange={(event) => onUsernameChange(event.target.value)}
              className="w-full rounded-2xl border border-concord-border bg-concord-panel-alt px-4 py-3 text-concord-text outline-none transition focus:border-concord-accent"
              placeholder="your-username"
              autoComplete="username"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-concord-muted">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              className="w-full rounded-2xl border border-concord-border bg-concord-panel-alt px-4 py-3 text-concord-text outline-none transition focus:border-concord-accent"
              placeholder="********"
              autoComplete="current-password"
            />
          </label>

          {errorMessage ? (
            <div className="rounded-2xl border border-concord-danger/30 bg-concord-danger/10 px-4 py-3 text-sm text-concord-danger">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-2xl border border-concord-accent/30 bg-concord-accent/10 px-4 py-3 text-sm text-concord-text">
              {successMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-concord-accent px-4 py-3 font-semibold text-slate-950 transition hover:bg-concord-accent-strong"
          >
            {isSubmitting ? 'Working...' : submitLabel}
          </button>
        </form>

        <p className="mt-6 text-sm text-concord-muted">
          {alternateLabel}{' '}
          <Link to={alternateTo} className="font-semibold text-concord-accent hover:text-concord-accent-strong">
            Switch route
          </Link>
        </p>
      </div>
    </div>
  )
}
