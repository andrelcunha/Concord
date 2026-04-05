import React from 'react'
import { useNavigate } from 'react-router-dom'

import { useDmStore } from '@/features/dm/store'
import { getDmRoute } from '@/lib/navigation'

function FriendsSkeleton() {
  return (
    <div className="rounded-[2rem] border border-concord-border bg-concord-panel/70 p-6">
      <div className="space-y-4">
        <div className="h-10 w-64 rounded-2xl bg-concord-panel-soft/75" />
        <div className="h-12 w-full rounded-2xl bg-concord-panel-soft/70" />
      </div>

      <div className="mt-6 space-y-3">
        <div className="h-4 w-24 rounded-full bg-concord-panel-soft/70" />
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="flex items-center gap-4 rounded-2xl border border-concord-border bg-concord-panel-alt/75 px-4 py-3"
          >
            <div className="h-11 w-11 rounded-full bg-concord-panel-soft/80" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-36 rounded-full bg-concord-panel-soft/80" />
              <div className="h-3 w-20 rounded-full bg-concord-panel-soft/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DmIndexPage() {
  const navigate = useNavigate()
  const friends = useDmStore((state) => state.friends)
  const isLoadingFriends = useDmStore((state) => state.isLoadingFriends)
  const friendsError = useDmStore((state) => state.friendsError)
  const fetchFriends = useDmStore((state) => state.fetchFriends)
  const blockedUsers = useDmStore((state) => state.blockedUsers)
  const isLoadingBlockedUsers = useDmStore((state) => state.isLoadingBlockedUsers)
  const blockedUsersError = useDmStore((state) => state.blockedUsersError)
  const fetchBlockedUsers = useDmStore((state) => state.fetchBlockedUsers)
  const searchedUsers = useDmStore((state) => state.searchedUsers)
  const isSearchingUsers = useDmStore((state) => state.isSearchingUsers)
  const searchUsersError = useDmStore((state) => state.searchUsersError)
  const searchUsers = useDmStore((state) => state.searchUsers)
  const sendFriendRequest = useDmStore((state) => state.sendFriendRequest)
  const pendingRequestUserIds = useDmStore((state) => state.pendingRequestUserIds)
  const createOrGetConversation = useDmStore((state) => state.createOrGetConversation)
  const removeFriend = useDmStore((state) => state.removeFriend)
  const blockUser = useDmStore((state) => state.blockUser)
  const unblockUser = useDmStore((state) => state.unblockUser)
  const friendActionByUserId = useDmStore((state) => state.friendActionByUserId)
  const isCreatingConversation = useDmStore((state) => state.isCreatingConversation)
  const [activeFilter, setActiveFilter] = React.useState('online')
  const [search, setSearch] = React.useState('')
  const [mode, setMode] = React.useState('friends')
  const [openMenuUserId, setOpenMenuUserId] = React.useState(null)

  React.useEffect(() => {
    fetchFriends()
    fetchBlockedUsers()
  }, [fetchBlockedUsers, fetchFriends])

  React.useEffect(() => {
    function refreshFriends() {
      fetchFriends({ silent: true })
    }

    window.addEventListener('focus', refreshFriends)
    document.addEventListener('visibilitychange', refreshFriends)

    return () => {
      window.removeEventListener('focus', refreshFriends)
      document.removeEventListener('visibilitychange', refreshFriends)
    }
  }, [fetchFriends])

  React.useEffect(() => {
    if (mode !== 'add-friend') {
      return
    }

    const timeout = window.setTimeout(() => {
      searchUsers(search)
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [mode, search, searchUsers])

  React.useEffect(() => {
    function closeMenu() {
      setOpenMenuUserId(null)
    }

    document.addEventListener('click', closeMenu)
    return () => {
      document.removeEventListener('click', closeMenu)
    }
  }, [])

  const normalizedSearch = search.trim().toLowerCase()
  const onlineFriends = friends
  const visibleFriends = (activeFilter === 'online' ? onlineFriends : friends).filter((friend) =>
    friend.username.toLowerCase().includes(normalizedSearch),
  )
  const visibleBlockedUsers = blockedUsers.filter((user) =>
    (user.user?.username ?? '').toLowerCase().includes(normalizedSearch),
  )

  async function handleOpenFriend(friend) {
    const conversation = await createOrGetConversation(friend.user_id)
    if (!conversation) {
      return
    }

    navigate(getDmRoute(conversation.id))
  }

  async function handleSendFriendRequest(user) {
    await sendFriendRequest(user.user_id)
  }

  async function handleRemoveFriend(event, userId) {
    event.stopPropagation()
    const removed = await removeFriend(userId)
    if (removed) {
      setOpenMenuUserId(null)
    }
  }

  async function handleBlockUser(event, userId) {
    event.stopPropagation()
    const blocked = await blockUser(userId)
    if (blocked) {
      setOpenMenuUserId(null)
    }
  }

  async function handleUnblockUser(event, userId) {
    event.stopPropagation()
    const unblocked = await unblockUser(userId)
    if (unblocked) {
      setOpenMenuUserId(null)
    }
  }

  if (isLoadingFriends && friends.length === 0) {
    return (
      <section className="mx-auto flex max-w-4xl flex-col gap-4">
        <FriendsSkeleton />
      </section>
    )
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col rounded-[2rem] border border-concord-border bg-concord-panel/70 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
      <div className="border-b border-concord-border/60 px-6 py-5">
        <div className="flex flex-wrap items-center gap-3 text-sm text-concord-muted">
          <span className="text-base font-semibold text-concord-text">Friends</span>
          <button
            type="button"
            onClick={() => setActiveFilter('online')}
            className={`rounded-full px-3 py-1.5 transition ${
              activeFilter === 'online'
                ? 'bg-concord-accent text-slate-950'
                : 'bg-concord-panel-alt text-concord-muted hover:text-concord-text'
            }`}
          >
            Online
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`rounded-full px-3 py-1.5 transition ${
              activeFilter === 'all'
                ? 'bg-concord-accent text-slate-950'
                : 'bg-concord-panel-alt text-concord-muted hover:text-concord-text'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('blocked')}
            className={`rounded-full px-3 py-1.5 transition ${
              activeFilter === 'blocked'
                ? 'bg-concord-accent text-slate-950'
                : 'bg-concord-panel-alt text-concord-muted hover:text-concord-text'
            }`}
          >
            Blocked
          </button>
          <button
            type="button"
            onClick={() => {
              setMode((currentMode) => (currentMode === 'add-friend' ? 'friends' : 'add-friend'))
              setSearch('')
            }}
            className={`rounded-full px-3 py-1.5 transition ${
              mode === 'add-friend'
                ? 'bg-concord-accent text-slate-950'
                : 'bg-concord-panel-alt text-concord-muted hover:text-concord-text'
            }`}
          >
            Add Friend
          </button>
        </div>
      </div>

      <div className="border-b border-concord-border/60 px-6 py-4">
        <label className="block">
          <span className="sr-only">Search friends</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="🔎 Search"
            className="w-full rounded-2xl border border-concord-border bg-concord-panel-alt px-4 py-3 text-sm text-concord-text outline-none transition focus:border-concord-accent"
          />
        </label>
      </div>

      <div className="flex-1 px-6 py-5">
        {mode === 'add-friend' ? (
          <>
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-concord-muted">
                Search Results
              </p>
            </div>

            {searchUsersError ? (
              <p className="rounded-2xl border border-concord-danger/30 bg-concord-danger/10 px-4 py-3 text-sm text-concord-danger">
                {searchUsersError}
              </p>
            ) : null}

            {isSearchingUsers ? (
              <p className="text-sm text-concord-muted">Searching users...</p>
            ) : null}

            {!isSearchingUsers && !searchUsersError && searchedUsers.length === 0 ? (
              <div className="rounded-2xl border border-concord-border bg-concord-panel-alt/80 px-5 py-6 text-sm leading-6 text-concord-muted">
                {search.trim()
                  ? 'No users match this search.'
                  : 'Search by username to find people and send a friend request.'}
              </div>
            ) : null}

            <div className="space-y-2">
              {searchedUsers.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center gap-4 rounded-2xl border border-concord-border bg-concord-panel-alt/70 px-4 py-3"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-slate-950"
                      style={{ backgroundColor: user.avatar_color || '#5ad1b2' }}
                    >
                      {user.username.slice(0, 1).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-concord-text">{user.username}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSendFriendRequest(user)}
                    disabled={Boolean(pendingRequestUserIds[String(user.user_id)])}
                    className="rounded-full bg-concord-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-concord-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pendingRequestUserIds[String(user.user_id)] ? 'Sending...' : 'Add'}
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-concord-muted">
                {activeFilter === 'online'
                  ? `Online - ${onlineFriends.length}`
                  : activeFilter === 'blocked'
                    ? `Blocked - ${blockedUsers.length}`
                    : `All - ${friends.length}`}
              </p>
            </div>

            {activeFilter === 'blocked' && blockedUsersError ? (
              <p className="rounded-2xl border border-concord-danger/30 bg-concord-danger/10 px-4 py-3 text-sm text-concord-danger">
                {blockedUsersError}
              </p>
            ) : null}

            {activeFilter !== 'blocked' && friendsError ? (
              <p className="rounded-2xl border border-concord-danger/30 bg-concord-danger/10 px-4 py-3 text-sm text-concord-danger">
                {friendsError}
              </p>
            ) : null}

            {activeFilter === 'blocked' && isLoadingBlockedUsers ? (
              <p className="text-sm text-concord-muted">Loading blocked users...</p>
            ) : null}

            {activeFilter === 'blocked' && !blockedUsersError && visibleBlockedUsers.length === 0 ? (
              <div className="rounded-2xl border border-concord-border bg-concord-panel-alt/80 px-5 py-6 text-sm leading-6 text-concord-muted">
                {search.trim() ? 'No blocked users match this search.' : 'Blocked users will appear here.'}
              </div>
            ) : null}

            {activeFilter !== 'blocked' && !friendsError && visibleFriends.length === 0 ? (
              <div className="rounded-2xl border border-concord-border bg-concord-panel-alt/80 px-5 py-6 text-sm leading-6 text-concord-muted">
                {search.trim()
                  ? 'No friends match this search.'
                  : 'Your accepted friends will appear here. Clicking one opens or starts a direct message.'}
              </div>
            ) : null}

            {activeFilter === 'blocked' ? (
              <div className="space-y-2">
                {visibleBlockedUsers.map((blockedUser) => (
                  <div
                    key={blockedUser.blocked_id}
                    className="flex items-center gap-4 rounded-2xl border border-concord-border bg-concord-panel-alt/70 px-4 py-3"
                  >
                    {blockedUser.user?.avatar_url ? (
                      <img
                        src={blockedUser.user.avatar_url}
                        alt={blockedUser.user.username}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-slate-950"
                        style={{ backgroundColor: blockedUser.user?.avatar_color || '#5ad1b2' }}
                      >
                        {(blockedUser.user?.username ?? '?').slice(0, 1).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-concord-text">
                        {blockedUser.user?.username ?? `User ${blockedUser.blocked_id}`}
                      </p>
                      <p className="mt-1 text-sm text-concord-muted">Blocked</p>
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setOpenMenuUserId((current) =>
                            current === blockedUser.blocked_id ? null : blockedUser.blocked_id,
                          )
                        }}
                        className="rounded-full px-3 py-2 text-concord-muted transition hover:bg-concord-panel hover:text-concord-text"
                        aria-label={`Open actions for ${blockedUser.user?.username ?? blockedUser.blocked_id}`}
                      >
                        ⋮
                      </button>

                      {openMenuUserId === blockedUser.blocked_id ? (
                        <div
                          className="absolute right-0 top-12 z-20 min-w-44 rounded-2xl border border-concord-border bg-concord-panel p-2 shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(event) => handleUnblockUser(event, blockedUser.blocked_id)}
                            disabled={Boolean(friendActionByUserId[String(blockedUser.blocked_id)])}
                            className="flex w-full rounded-xl px-3 py-2 text-left text-sm text-concord-text transition hover:bg-concord-panel-soft disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {friendActionByUserId[String(blockedUser.blocked_id)] === 'unblocking'
                              ? 'Unblocking...'
                              : 'Unblock'}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <div className="space-y-2">
              {visibleFriends.map((friend) => (
                <button
                  key={friend.user_id}
                  type="button"
                  onClick={() => handleOpenFriend(friend)}
                  disabled={isCreatingConversation}
                  className="flex w-full items-center gap-4 rounded-2xl border border-concord-border bg-concord-panel-alt/70 px-4 py-3 text-left transition hover:border-concord-accent hover:bg-concord-panel-soft disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {friend.avatar_url ? (
                    <img
                      src={friend.avatar_url}
                      alt={friend.username}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-slate-950"
                      style={{ backgroundColor: friend.avatar_color || '#5ad1b2' }}
                    >
                      {friend.username.slice(0, 1).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-concord-text">{friend.username}</p>
                    <p className="mt-1 text-sm text-concord-muted">Online</p>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        setOpenMenuUserId((current) => (current === friend.user_id ? null : friend.user_id))
                      }}
                      className="rounded-full px-3 py-2 text-concord-muted transition hover:bg-concord-panel hover:text-concord-text"
                      aria-label={`Open actions for ${friend.username}`}
                    >
                      ⋮
                    </button>

                    {openMenuUserId === friend.user_id ? (
                      <div
                        className="absolute right-0 top-12 z-20 min-w-44 rounded-2xl border border-concord-border bg-concord-panel p-2 shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(event) => handleRemoveFriend(event, friend.user_id)}
                          disabled={Boolean(friendActionByUserId[String(friend.user_id)])}
                          className="flex w-full rounded-xl px-3 py-2 text-left text-sm text-concord-text transition hover:bg-concord-panel-soft disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {friendActionByUserId[String(friend.user_id)] === 'removing'
                            ? 'Removing...'
                            : 'Remove Friend'}
                        </button>
                      <button
                        type="button"
                        onClick={(event) => handleBlockUser(event, friend.user_id)}
                        disabled={Boolean(friendActionByUserId[String(friend.user_id)])}
                        className="mt-1 flex w-full rounded-xl px-3 py-2 text-left text-sm text-concord-danger transition hover:bg-concord-danger/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {friendActionByUserId[String(friend.user_id)] === 'blocking'
                            ? 'Blocking...'
                            : 'Block'}
                      </button>
                      </div>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
