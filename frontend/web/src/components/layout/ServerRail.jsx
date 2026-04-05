import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import { useServersStore } from '@/features/servers/store'
import { getServerRoute } from '@/lib/navigation'

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
  const navigate = useNavigate()
  const servers = useServersStore((state) => state.servers)
  const isLoading = useServersStore((state) => state.isLoading)
  const isCreating = useServersStore((state) => state.isCreating)
  const createServer = useServersStore((state) => state.createServer)
  const errorMessage = useServersStore((state) => state.errorMessage)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [serverName, setServerName] = React.useState('')
  const [isPublic, setIsPublic] = React.useState(true)

  async function handleCreateServer(event) {
    event.preventDefault()

    const trimmedName = serverName.trim()
    if (!trimmedName) {
      return
    }

    const server = await createServer({
      name: trimmedName,
      isPublic,
    })

    if (!server) {
      return
    }

    setServerName('')
    setIsPublic(true)
    setIsDialogOpen(false)
    navigate(getServerRoute(server.id))
  }

  return (
    <>
    <aside className="flex w-full flex-row items-center gap-3 overflow-x-auto border-b border-concord-border/60 bg-concord-panel px-4 py-4 md:min-h-0 md:w-24 md:flex-col md:items-center md:gap-4 md:overflow-y-auto md:overflow-x-hidden md:border-b-0 md:border-r md:px-4 md:py-5">
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
              to={getServerRoute(server.id)}
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
          onClick={() => setIsDialogOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-concord-border bg-concord-panel-alt text-xl text-concord-muted transition hover:border-concord-accent hover:text-concord-text"
          aria-label="Create server"
        >
          +
        </button>
      </div>
      {errorMessage ? (
        <div className="hidden max-w-[9rem] rounded-2xl border border-concord-danger/30 bg-concord-danger/10 px-3 py-2 text-xs leading-5 text-concord-danger md:block">
          {errorMessage}
        </div>
      ) : null}
    </aside>
    {isDialogOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4">
        <div className="w-full max-w-md rounded-[2rem] border border-concord-border bg-concord-panel p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-concord-accent">
            Create Server
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-concord-text">
            Start a new space
          </h2>
          <p className="mt-3 text-sm leading-6 text-concord-muted">
            Give the server a name. Concord will create a default channel so it is usable right away.
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleCreateServer}>
            <label className="block">
              <span className="mb-2 block text-sm text-concord-muted">Server name</span>
              <input
                value={serverName}
                onChange={(event) => setServerName(event.target.value)}
                className="w-full rounded-2xl border border-concord-border bg-concord-panel-alt px-4 py-3 text-concord-text outline-none transition focus:border-concord-accent"
                placeholder="My server"
                autoFocus
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-concord-border bg-concord-panel-alt px-4 py-3 text-sm text-concord-text">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(event) => setIsPublic(event.target.checked)}
                className="h-4 w-4"
              />
              Public server
            </label>

            {errorMessage ? (
              <p className="rounded-2xl border border-concord-danger/30 bg-concord-danger/10 px-4 py-3 text-sm text-concord-danger">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-2 flex flex-col gap-3 md:flex-row">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-2xl border border-concord-border bg-concord-panel-alt px-5 py-3 text-sm font-semibold text-concord-text transition hover:border-concord-accent"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !serverName.trim()}
                className="rounded-2xl bg-concord-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-concord-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating ? 'Creating...' : 'Create server'}
              </button>
            </div>
          </form>
        </div>
      </div>
    ) : null}
    </>
  )
}
