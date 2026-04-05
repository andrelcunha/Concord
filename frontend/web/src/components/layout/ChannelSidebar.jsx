import React from 'react'
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'

import { CollapsibleSidebarGroup } from '@/components/layout/CollapsibleSidebarGroup'
import { useChannelsStore } from '@/features/channels/store'
import { useDmStore } from '@/features/dm/store'
import { useServersStore } from '@/features/servers/store'
import { getChannelRoute, getDmRoute } from '@/lib/navigation'

export function ChannelSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const servers = useServersStore((state) => state.servers)
  const channelsByServerId = useChannelsStore((state) => state.channelsByServerId)
  const loadingByServerId = useChannelsStore((state) => state.loadingByServerId)
  const errorByServerId = useChannelsStore((state) => state.errorByServerId)
  const creatingByServerId = useChannelsStore((state) => state.creatingByServerId)
  const createChannel = useChannelsStore((state) => state.createChannel)
  const conversations = useDmStore((state) => state.conversations)
  const isLoadingConversations = useDmStore((state) => state.isLoadingConversations)
  const conversationsError = useDmStore((state) => state.conversationsError)
  const fetchConversations = useDmStore((state) => state.fetchConversations)
  const hideConversation = useDmStore((state) => state.hideConversation)
  const hidingConversationId = useDmStore((state) => state.hidingConversationId)
  const friends = useDmStore((state) => state.friends)
  const isLoadingFriends = useDmStore((state) => state.isLoadingFriends)
  const friendsError = useDmStore((state) => state.friendsError)
  const fetchFriends = useDmStore((state) => state.fetchFriends)
  const createOrGetConversation = useDmStore((state) => state.createOrGetConversation)
  const isCreatingConversation = useDmStore((state) => state.isCreatingConversation)
  const isDmRoute = location.pathname.startsWith('/app/dm')
  const activeServer = servers.find((server) => String(server.id) === params.serverId)
  const activeServerLabel = isDmRoute
    ? 'Direct Messages'
    : activeServer?.name ?? 'No server selected'
  const activeChannels = params.serverId ? channelsByServerId[String(params.serverId)] ?? [] : []
  const isLoadingChannels = params.serverId ? loadingByServerId[String(params.serverId)] : false
  const channelError = params.serverId ? errorByServerId[String(params.serverId)] : ''
  const isCreatingChannel = params.serverId ? creatingByServerId[String(params.serverId)] : false
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [channelName, setChannelName] = React.useState('')
  const [isTextChannelsExpanded, setIsTextChannelsExpanded] = React.useState(true)
  const [dmSearch, setDmSearch] = React.useState('')

  const selectedChannel = activeChannels.find((channel) => String(channel.id) === params.channelId)
  const selectedConversation = conversations.find(
    (conversation) => String(conversation.id) === params.conversationId,
  )

  React.useEffect(() => {
    if (isDmRoute) {
      fetchConversations()
    }
  }, [fetchConversations, isDmRoute])

  React.useEffect(() => {
    if (isDialogOpen && isDmRoute) {
      fetchFriends()
    }
  }, [fetchFriends, isDialogOpen, isDmRoute])

  async function handleCreateChannel(event) {
    event.preventDefault()

    const trimmedName = channelName.trim()
    if (!trimmedName || !params.serverId) {
      return
    }

    const channel = await createChannel({
      serverId: params.serverId,
      name: trimmedName,
    })

    if (!channel) {
      return
    }

    setChannelName('')
    setIsDialogOpen(false)
    navigate(getChannelRoute(params.serverId, channel.id))
  }

  async function handleStartConversation(friend) {
    const conversation = await createOrGetConversation(friend.user_id)
    if (!conversation) {
      return
    }

    setDmSearch('')
    setIsDialogOpen(false)
    navigate(getDmRoute(conversation.id))
  }

  async function handleHideConversation(event, conversationId) {
    event.preventDefault()
    event.stopPropagation()

    const shouldNavigateAway = String(conversationId) === params.conversationId
    const hidden = await hideConversation(conversationId)
    if (hidden && shouldNavigateAway) {
      navigate('/app/dm')
    }
  }

  const activeConversationUserIds = new Set(
    conversations.map((conversation) => conversation.other_user?.user_id).filter(Boolean),
  )
  const availableFriends = friends.filter((friend) => !activeConversationUserIds.has(friend.user_id))
  const filteredFriends = availableFriends.filter((friend) =>
    friend.username.toLowerCase().includes(dmSearch.trim().toLowerCase()),
  )

  return (
    <>
    <aside className="flex w-full shrink-0 flex-col border-b border-concord-border/60 bg-concord-panel-alt/90 md:min-h-0 md:w-80 md:border-b-0 md:border-r">
      {isDmRoute ? (
        <div className="border-b border-concord-border/60 px-4 py-4">
          <NavLink
            to="/app/dm"
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-concord-panel-soft text-concord-text'
                  : 'text-concord-muted hover:bg-concord-panel-soft/70 hover:text-concord-text',
              ].join(' ')
            }
          >
            <span className="text-base">Friends</span>
          </NavLink>
        </div>
      ) : null}

      <div className="border-b border-concord-border/60 px-5 py-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-concord-text">
            {activeServerLabel}
          </h2>
          {isDmRoute ? (
            <button
              type="button"
              onClick={() => setIsDialogOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-concord-panel text-lg text-concord-text transition hover:bg-concord-panel-soft"
              aria-label="Start direct message"
            >
              +
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4 md:min-h-0">
        {isDmRoute ? (
          <section>
            {isLoadingConversations ? (
              <p className="px-2 text-sm text-concord-muted">Loading conversations...</p>
            ) : null}

            {conversationsError ? (
              <p className="px-2 text-sm text-concord-danger">{conversationsError}</p>
            ) : null}

            {!isLoadingConversations && !conversationsError && conversations.length === 0 ? (
              <p className="px-2 text-sm leading-6 text-concord-muted">
                No direct messages yet. Use the <span className="font-semibold text-concord-text">+</span> button to start one with a friend.
              </p>
            ) : null}

            <div className="space-y-1">
              {conversations.map((conversation) => (
                <NavLink
                  key={conversation.id}
                  to={getDmRoute(conversation.id)}
                  className={({ isActive }) =>
                    [
                      'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition',
                      isActive
                        ? 'bg-concord-panel-soft text-concord-text'
                        : 'text-concord-muted hover:bg-concord-panel-soft/70 hover:text-concord-text',
                    ].join(' ')
                  }
                >
                  {conversation.other_user.avatar_url ? (
                    <img
                      src={conversation.other_user.avatar_url}
                      alt={conversation.other_user.username}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-slate-950"
                      style={{ backgroundColor: conversation.other_user.avatar_color || '#5ad1b2' }}
                    >
                      {conversation.other_user.username.slice(0, 1).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{conversation.other_user.username}</p>
                    {conversation.last_message ? (
                      <p className="truncate text-xs text-concord-muted">{conversation.last_message}</p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={(event) => handleHideConversation(event, conversation.id)}
                    disabled={hidingConversationId === conversation.id}
                    className="rounded-full px-2 py-1 text-xs text-concord-muted opacity-0 transition hover:bg-concord-panel hover:text-concord-text group-hover:opacity-100 disabled:opacity-100"
                    aria-label={`Hide conversation with ${conversation.other_user.username}`}
                  >
                    {hidingConversationId === conversation.id ? '...' : 'x'}
                  </button>
                </NavLink>
              ))}
            </div>
          </section>
        ) : (
          <CollapsibleSidebarGroup
            title="Text Channels"
            isExpanded={isTextChannelsExpanded}
            onToggle={() => setIsTextChannelsExpanded((value) => !value)}
            collapsedContent={
              selectedChannel ? (
                <div className="space-y-1">
                  <NavLink
                    to={getChannelRoute(params.serverId, selectedChannel.id)}
                    className="flex items-center rounded-xl bg-concord-panel-soft px-3 py-2 text-sm text-concord-text"
                  >
                    <span className="mr-3 text-base text-concord-accent">#</span>
                    {selectedChannel.name}
                  </NavLink>
                </div>
              ) : null
            }
          >

            {isLoadingChannels ? (
              <p className="px-2 text-sm text-concord-muted">Loading channels...</p>
            ) : null}

            {channelError ? (
              <p className="px-2 text-sm text-concord-danger">{channelError}</p>
            ) : null}

            {!isLoadingChannels && !channelError && activeChannels.length === 0 ? (
              <p className="px-2 text-sm text-concord-muted">
                No channels were returned for this server yet.
              </p>
            ) : null}

            <div className="space-y-1">
                {activeChannels.map((channel) => (
                  <NavLink
                    key={channel.id}
                    to={getChannelRoute(params.serverId, channel.id)}
                    className={({ isActive }) =>
                      [
                        'flex items-center rounded-xl px-3 py-2 text-sm transition',
                      isActive
                        ? 'bg-concord-panel-soft text-concord-text'
                        : 'text-concord-muted hover:bg-concord-panel-soft/70 hover:text-concord-text',
                    ].join(' ')
                  }
                >
                  <span className="mr-3 text-base text-concord-accent">#</span>
                  {channel.name}
                </NavLink>
              ))}
            </div>
          </CollapsibleSidebarGroup>
        )}
      </div>

      <div className="border-t border-concord-border/60 px-4 py-4">
        {isDmRoute ? (
          null
        ) : (
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            disabled={!params.serverId}
            className="w-full rounded-2xl border border-concord-accent/40 bg-concord-accent/12 px-4 py-3 text-sm font-semibold text-concord-text transition hover:border-concord-accent hover:bg-concord-accent/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Create channel
          </button>
        )}
      </div>
    </aside>
    {isDialogOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4">
        <div className="w-full max-w-md rounded-[2rem] border border-concord-border bg-concord-panel p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          {isDmRoute ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-concord-accent">
                Start Direct Message
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-concord-text">
                Pick a friend
              </h2>
              <p className="mt-3 text-sm leading-6 text-concord-muted">
                Start or reopen a private conversation with one of your accepted friends.
              </p>

              <div className="mt-6 flex flex-col gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-concord-muted">Search friends</span>
                  <input
                    value={dmSearch}
                    onChange={(event) => setDmSearch(event.target.value)}
                    className="w-full rounded-2xl border border-concord-border bg-concord-panel-alt px-4 py-3 text-concord-text outline-none transition focus:border-concord-accent"
                    placeholder="Search by username"
                    autoFocus
                  />
                </label>

                {friendsError ? (
                  <p className="rounded-2xl border border-concord-danger/30 bg-concord-danger/10 px-4 py-3 text-sm text-concord-danger">
                    {friendsError}
                  </p>
                ) : null}

                <div className="max-h-72 space-y-2 overflow-auto">
                  {isLoadingFriends ? (
                    <p className="text-sm text-concord-muted">Loading friends...</p>
                  ) : null}

                  {!isLoadingFriends && filteredFriends.length === 0 ? (
                    <p className="text-sm leading-6 text-concord-muted">
                      {availableFriends.length === 0
                        ? 'All accepted friends already have a visible conversation.'
                        : 'No friends match this search.'}
                    </p>
                  ) : null}

                  {filteredFriends.map((friend) => (
                    <button
                      key={friend.user_id}
                      type="button"
                      onClick={() => handleStartConversation(friend)}
                      disabled={isCreatingConversation}
                      className="flex w-full items-center gap-3 rounded-2xl border border-concord-border bg-concord-panel-alt px-4 py-3 text-left transition hover:border-concord-accent hover:bg-concord-panel-soft disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {friend.avatar_url ? (
                        <img
                          src={friend.avatar_url}
                          alt={friend.username}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-slate-950"
                          style={{ backgroundColor: friend.avatar_color || '#5ad1b2' }}
                        >
                          {friend.username.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-concord-text">{friend.username}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-2 flex flex-col gap-3 md:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setDmSearch('')
                      setIsDialogOpen(false)
                    }}
                    className="rounded-2xl border border-concord-border bg-concord-panel-alt px-5 py-3 text-sm font-semibold text-concord-text transition hover:border-concord-accent"
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-concord-accent">
                Create Channel
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-concord-text">
                Add a new channel
              </h2>
              <p className="mt-3 text-sm leading-6 text-concord-muted">
                Create a text channel inside {activeServer?.name ?? 'this server'}.
              </p>

              <form className="mt-6 flex flex-col gap-4" onSubmit={handleCreateChannel}>
                <label className="block">
                  <span className="mb-2 block text-sm text-concord-muted">Channel name</span>
                  <input
                    value={channelName}
                    onChange={(event) => setChannelName(event.target.value)}
                    className="w-full rounded-2xl border border-concord-border bg-concord-panel-alt px-4 py-3 text-concord-text outline-none transition focus:border-concord-accent"
                    placeholder="general"
                    autoFocus
                  />
                </label>

                {channelError ? (
                  <p className="rounded-2xl border border-concord-danger/30 bg-concord-danger/10 px-4 py-3 text-sm text-concord-danger">
                    {channelError}
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
                    disabled={isCreatingChannel || !channelName.trim()}
                    className="rounded-2xl bg-concord-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-concord-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isCreatingChannel ? 'Creating...' : 'Create channel'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    ) : null}
    </>
  )
}
