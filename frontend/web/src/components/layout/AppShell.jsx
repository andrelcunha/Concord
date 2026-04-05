import React from 'react'
import { Outlet, useLocation, useParams } from 'react-router-dom'

import { ChannelSidebar } from '@/components/layout/ChannelSidebar'
import { useChannelsStore } from '@/features/channels/store'
import { useChatStore } from '@/features/chat/store'
import { useDmStore } from '@/features/dm/store'
import { ServerRail } from '@/components/layout/ServerRail'
import { UserPanel } from '@/components/layout/UserPanel'
import { useServersStore } from '@/features/servers/store'
import { useSessionStore } from '@/lib/sessionStore'

export function AppShell() {
  const location = useLocation()
  const params = useParams()
  const logout = useSessionStore((state) => state.logout)
  const fetchServers = useServersStore((state) => state.fetchServers)
  const servers = useServersStore((state) => state.servers)
  const clearServers = useServersStore((state) => state.clearServers)
  const fetchChannelsForServer = useChannelsStore((state) => state.fetchChannelsForServer)
  const channelsByServerId = useChannelsStore((state) => state.channelsByServerId)
  const loadingByServerId = useChannelsStore((state) => state.loadingByServerId)
  const clearChannels = useChannelsStore((state) => state.clearChannels)
  const fetchMessagesForChannel = useChatStore((state) => state.fetchMessagesForChannel)
  const clearMessages = useChatStore((state) => state.clearMessages)
  const fetchDmConversations = useDmStore((state) => state.fetchConversations)
  const fetchFriends = useDmStore((state) => state.fetchFriends)
  const fetchIncomingRequests = useDmStore((state) => state.fetchIncomingRequests)
  const conversations = useDmStore((state) => state.conversations)
  const conversationsById = useDmStore((state) => state.conversationsById)
  const fetchDmConversation = useDmStore((state) => state.fetchConversation)
  const clearDms = useDmStore((state) => state.clearDms)
  const incomingRequests = useDmStore((state) => state.incomingRequests)
  const isLoadingIncomingRequests = useDmStore((state) => state.isLoadingIncomingRequests)
  const incomingRequestsError = useDmStore((state) => state.incomingRequestsError)
  const requestActionById = useDmStore((state) => state.requestActionById)
  const acceptFriendRequest = useDmStore((state) => state.acceptFriendRequest)
  const rejectFriendRequest = useDmStore((state) => state.rejectFriendRequest)
  const [isInboxOpen, setIsInboxOpen] = React.useState(false)

  React.useEffect(() => {
    fetchServers()
    fetchDmConversations()
    fetchFriends()
    fetchIncomingRequests()
  }, [fetchDmConversations, fetchFriends, fetchIncomingRequests, fetchServers])

  React.useEffect(() => {
    function refreshDmState() {
      if (document.visibilityState !== 'visible') {
        return
      }

      fetchDmConversations()
      fetchFriends()
      fetchIncomingRequests()
    }

    const intervalId = window.setInterval(refreshDmState, 10000)
    document.addEventListener('visibilitychange', refreshDmState)
    window.addEventListener('focus', refreshDmState)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', refreshDmState)
      window.removeEventListener('focus', refreshDmState)
    }
  }, [fetchDmConversations, fetchFriends, fetchIncomingRequests])

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

  React.useEffect(() => {
    if (params.conversationId) {
      fetchDmConversation(params.conversationId)
    }
  }, [fetchDmConversation, params.conversationId])

  React.useEffect(() => {
    if (isInboxOpen) {
      fetchIncomingRequests()
    }
  }, [fetchIncomingRequests, isInboxOpen])

  const handleLogout = React.useCallback(() => {
    clearMessages()
    clearDms()
    clearChannels()
    clearServers()
    logout()
  }, [clearChannels, clearDms, clearMessages, clearServers, logout])

  const isDm = location.pathname.startsWith('/app/dm')
  const isSettings = location.pathname === '/app/settings'
  const activeServer = servers.find((server) => String(server.id) === params.serverId)
  const activeChannels = params.serverId ? channelsByServerId[String(params.serverId)] ?? [] : []
  const isLoadingServerChannels = params.serverId ? loadingByServerId[String(params.serverId)] : false
  const activeChannel = activeChannels.find((channel) => String(channel.id) === params.channelId)
  const activeConversation =
    conversations.find((conversation) => String(conversation.id) === params.conversationId) ??
    conversationsById[String(params.conversationId)]
  const title = isDm
    ? location.pathname === '/app/dm'
      ? 'Friends'
      : params.conversationId
      ? activeConversation?.other_user?.username ?? 'Direct message'
      : 'Direct messages'
    : isSettings
      ? 'Settings'
    : params.channelId
      ? `# ${activeChannel?.name ?? params.channelId}`
    : params.serverId
        ? activeServer?.name ?? (isLoadingServerChannels ? null : 'Server')
        : 'Welcome to Concord'
  const subtitle = isDm
    ? location.pathname === '/app/dm'
      ? null
      : params.conversationId
      ? null
      : 'Pick a friend to continue an existing conversation or start a new one.'
    : isSettings
      ? 'Review your account session and the profile tools we can grow next.'
    : params.channelId
      ? null
    : params.serverId
      ? null
      : 'Pick a server or direct messages to get started.'

  return (
    <div className="h-screen overflow-hidden bg-concord-night text-concord-text">
      <div className="flex h-full flex-col md:flex-row">
        <div className="flex w-full shrink-0 flex-col md:h-full md:w-[26rem] md:min-h-0">
          <div className="flex w-full flex-col md:min-h-0 md:flex-1 md:flex-row">
            <ServerRail />
            <ChannelSidebar />
          </div>
          <UserPanel />
        </div>
        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col border-l border-concord-border/60 bg-concord-night/70">
          <header className="flex flex-col gap-4 border-b border-concord-border/60 bg-concord-panel/80 px-6 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
            <div>
              {title ? <h1 className="text-lg font-semibold">{title}</h1> : null}
              {subtitle ? <p className="mt-1 text-sm text-concord-muted">{subtitle}</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsInboxOpen(true)}
                className="relative rounded-full border border-concord-border bg-concord-panel-alt px-4 py-2 text-sm text-concord-text transition hover:border-concord-accent hover:bg-concord-panel-soft"
              >
                📥 Inbox
                {incomingRequests.length > 0 ? (
                  <span className="ml-2 rounded-full bg-concord-accent px-2 py-0.5 text-xs font-semibold text-slate-950">
                    {incomingRequests.length}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-concord-danger/40 bg-concord-danger/10 px-4 py-2 text-sm text-concord-danger transition hover:bg-concord-danger/20"
              >
                Sign out
              </button>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
      {isInboxOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4">
          <div className="w-full max-w-2xl rounded-[2rem] border border-concord-border bg-concord-panel p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-concord-accent">
                  Inbox
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-concord-text">
                  Incoming friend requests
                </h2>
                <p className="mt-3 text-sm leading-6 text-concord-muted">
                  Review new friendship invitations here.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInboxOpen(false)}
                className="rounded-full bg-concord-panel-alt px-3 py-2 text-sm text-concord-text transition hover:bg-concord-panel-soft"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {isLoadingIncomingRequests ? (
                <p className="text-sm text-concord-muted">Loading requests...</p>
              ) : null}

              {incomingRequestsError ? (
                <p className="rounded-2xl border border-concord-danger/30 bg-concord-danger/10 px-4 py-3 text-sm text-concord-danger">
                  {incomingRequestsError}
                </p>
              ) : null}

              {!isLoadingIncomingRequests && !incomingRequestsError && incomingRequests.length === 0 ? (
                <div className="rounded-2xl border border-concord-border bg-concord-panel-alt/80 px-5 py-6 text-sm leading-6 text-concord-muted">
                  No incoming requests right now.
                </div>
              ) : null}

              {incomingRequests.map((request) => {
                const action = requestActionById[String(request.id)]

                return (
                  <div
                    key={request.id}
                    className="flex items-center gap-4 rounded-2xl border border-concord-border bg-concord-panel-alt/75 px-4 py-3"
                  >
                    {request.user.avatar_url ? (
                      <img
                        src={request.user.avatar_url}
                        alt={request.user.username}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-slate-950"
                        style={{ backgroundColor: request.user.avatar_color || '#5ad1b2' }}
                      >
                        {request.user.username.slice(0, 1).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-concord-text">{request.user.username}</p>
                      <p className="mt-1 text-sm text-concord-muted">Sent you a friend request</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => acceptFriendRequest(request.id)}
                        disabled={Boolean(action)}
                        className="rounded-full bg-concord-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-concord-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {action === 'accepting' ? 'Accepting...' : 'Accept'}
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectFriendRequest(request.id)}
                        disabled={Boolean(action)}
                        className="rounded-full border border-concord-border bg-concord-panel px-4 py-2 text-sm font-semibold text-concord-text transition hover:border-concord-danger hover:text-concord-danger disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {action === 'rejecting' ? 'Rejecting...' : 'Ignore'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
