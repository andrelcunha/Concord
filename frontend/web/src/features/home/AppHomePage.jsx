import React from 'react'
import { Link } from 'react-router-dom'

import { PlaceholderPanel } from '@/features/shared/PlaceholderPanel'
import { useServersStore } from '@/features/servers/store'
import { getServerRoute } from '@/lib/navigation'

export function AppHomePage() {
  const servers = useServersStore((state) => state.servers)
  const isLoading = useServersStore((state) => state.isLoading)
  const errorMessage = useServersStore((state) => state.errorMessage)
  const discoverableServers = useServersStore((state) => state.discoverableServers)
  const isDiscovering = useServersStore((state) => state.isDiscovering)
  const joiningServerId = useServersStore((state) => state.joiningServerId)
  const discoverErrorMessage = useServersStore((state) => state.discoverErrorMessage)
  const discoverServers = useServersStore((state) => state.discoverServers)
  const joinServer = useServersStore((state) => state.joinServer)
  const [searchQuery, setSearchQuery] = React.useState('')

  React.useEffect(() => {
    discoverServers('')
  }, [discoverServers])

  async function handleDiscoverSubmit(event) {
    event.preventDefault()
    discoverServers(searchQuery.trim())
  }

  async function handleJoinServer(server) {
    const joined = await joinServer(server)
    if (joined) {
      window.location.assign(getServerRoute(server.id))
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PlaceholderPanel
        eyebrow="Shell"
        title="Choose a server or direct messages"
        description="Pick where you want to chat. Your servers appear below, and direct messages are available from the left rail."
        actions={[
          'Open a server to browse its channels.',
          'Use direct messages for one-to-one conversation.',
          'Settings stay available from the top bar.',
        ]}
      />

      <section className="rounded-[2rem] border border-concord-border bg-concord-panel/70 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-concord-accent">
          Available Servers
        </p>
        {isLoading ? (
          <p className="mt-4 text-sm text-concord-muted">Loading your servers...</p>
        ) : null}
        {errorMessage ? (
          <p className="mt-4 text-sm text-concord-danger">{errorMessage}</p>
        ) : null}
        {!isLoading && !errorMessage && servers.length === 0 ? (
          <p className="mt-4 text-sm text-concord-muted">
            No servers were returned for this account yet. Once a server exists, it will appear here
            and in the left rail.
          </p>
        ) : null}
        {!isLoading && servers.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {servers.map((server) => (
              <Link
                key={server.id}
                to={getServerRoute(server.id)}
                className="rounded-[1.5rem] border border-concord-border bg-concord-panel-alt/80 p-5 transition hover:border-concord-accent/60 hover:bg-concord-panel-soft"
              >
                <p className="text-lg font-semibold text-concord-text">{server.name}</p>
                <p className="mt-2 text-sm text-concord-muted">
                  Creator ID: {server.creator_id} · Route context uses server {server.id}
                </p>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-[2rem] border border-concord-border bg-concord-panel/70 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-concord-accent">
          Discover Public Servers
        </p>
        <form className="mt-4 flex flex-col gap-3 md:flex-row" onSubmit={handleDiscoverSubmit}>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by server name"
            className="min-w-0 flex-1 rounded-2xl border border-concord-border bg-concord-panel-alt px-4 py-3 text-sm text-concord-text outline-none transition focus:border-concord-accent"
          />
          <button
            type="submit"
            className="rounded-2xl border border-concord-border bg-concord-panel-alt px-5 py-3 text-sm font-semibold text-concord-text transition hover:border-concord-accent"
          >
            Search
          </button>
        </form>

        {isDiscovering ? (
          <p className="mt-4 text-sm text-concord-muted">Looking for public servers...</p>
        ) : null}

        {discoverErrorMessage ? (
          <p className="mt-4 text-sm text-concord-danger">{discoverErrorMessage}</p>
        ) : null}

        {!isDiscovering && !discoverErrorMessage && discoverableServers.length === 0 ? (
          <p className="mt-4 text-sm text-concord-muted">
            No public servers matched your search right now.
          </p>
        ) : null}

        {!isDiscovering && discoverableServers.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {discoverableServers.map((server) => (
              <div
                key={server.id}
                className="rounded-[1.5rem] border border-concord-border bg-concord-panel-alt/80 p-5"
              >
                <p className="text-lg font-semibold text-concord-text">{server.name}</p>
                <p className="mt-2 text-sm text-concord-muted">
                  Public server · ID {server.id}
                </p>
                <button
                  type="button"
                  onClick={() => handleJoinServer(server)}
                  disabled={joiningServerId === server.id}
                  className="mt-4 rounded-2xl bg-concord-accent px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-concord-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {joiningServerId === server.id ? 'Joining...' : 'Join server'}
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}
