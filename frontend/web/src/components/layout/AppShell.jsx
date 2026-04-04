import React from 'react'
import { Outlet, useLocation, useParams } from 'react-router-dom'

import { ChannelSidebar } from '@/components/layout/ChannelSidebar'
import { useChannelsStore } from '@/features/channels/store'
import { useChatStore } from '@/features/chat/store'
import { ServerRail } from '@/components/layout/ServerRail'
import { UserPanel } from '@/components/layout/UserPanel'
import { useServersStore } from '@/features/servers/store'
import { useSessionStore } from '@/lib/sessionStore'

export function AppShell() {
  const location = useLocation()
  const params = useParams()
  const logout = useSessionStore((state) => state.logout)
  const fetchServers = useServersStore((state) => state.fetchServers)
  const clearServers = useServersStore((state) => state.clearServers)
  const fetchChannelsForServer = useChannelsStore((state) => state.fetchChannelsForServer)
  const clearChannels = useChannelsStore((state) => state.clearChannels)
  const fetchMessagesForChannel = useChatStore((state) => state.fetchMessagesForChannel)
  const clearMessages = useChatStore((state) => state.clearMessages)

  React.useEffect(() => {
    fetchServers()
  }, [fetchServers])

  React.useEffect(() => {
    if (params.serverId) {
      fetchChannelsForServer(params.serverId)
    }
  }, [fetchChannelsForServer, params.serverId])

  React.useEffect(() => {
    if (params.channelId) {
      fetchMessagesForChannel(params.channelId)
    }
  }, [fetchMessagesForChannel, params.channelId])

  const handleLogout = React.useCallback(() => {
    clearMessages()
    clearChannels()
    clearServers()
    logout()
  }, [clearChannels, clearMessages, clearServers, logout])

  const isDm = location.pathname.startsWith('/app/dm')
  const isSettings = location.pathname === '/app/settings'
  const title = isDm
    ? params.conversationId
      ? `DM · ${params.conversationId}`
      : 'Direct messages'
    : isSettings
          ? 'Settings'
    : params.channelId
      ? `# ${params.channelId}`
      : params.serverId
        ? 'Choose a channel'
        : 'Welcome to Concord'
  const subtitle = isDm
    ? 'Select a conversation from the sidebar.'
    : isSettings
      ? 'Review your account session and the profile tools we can grow next.'
    : params.serverId
      ? 'Use the sidebar to enter a channel.'
      : 'Pick a server or direct messages to get started.'

  return (
    <div className="min-h-screen bg-concord-night text-concord-text">
      <div className="flex min-h-screen flex-col md:flex-row">
        <div className="flex w-full shrink-0 flex-col md:w-[26rem]">
          <div className="flex w-full flex-col md:flex-1 md:flex-row">
            <ServerRail />
            <ChannelSidebar />
          </div>
          <UserPanel />
        </div>
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
              <button
                type="button"
                onClick={handleLogout}
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
