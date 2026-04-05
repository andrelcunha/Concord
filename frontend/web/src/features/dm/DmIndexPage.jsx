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
  const searchedUsers = useDmStore((state) => state.searchedUsers)
  const isSearchingUsers = useDmStore((state) => state.isSearchingUsers)
  const searchUsersError = useDmStore((state) => state.searchUsersError)
  const searchUsers = useDmStore((state) => state.searchUsers)
  const sendFriendRequest = useDmStore((state) => state.sendFriendRequest)
  const pendingRequestUserIds = useDmStore((state) => state.pendingRequestUserIds)
  const createOrGetConversation = useDmStore((state) => state.createOrGetConversation)
  const isCreatingConversation = useDmStore((state) => state.isCreatingConversation)
  const [activeFilter, setActiveFilter] = React.useState('online')
  const [search, setSearch] = React.useState('')
  const [mode, setMode] = React.useState('friends')

  React.useEffect(() => {
    fetchFriends()
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

  const normalizedSearch = search.trim().toLowerCase()
  const onlineFriends = friends
  const visibleFriends = (activeFilter === 'online' ? onlineFriends : friends).filter((friend) =>
    friend.username.toLowerCase().includes(normalizedSearch),
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
                {activeFilter === 'online' ? `Online - ${onlineFriends.length}` : `All - ${friends.length}`}
              </p>
            </div>

            {friendsError ? (
              <p className="rounded-2xl border border-concord-danger/30 bg-concord-danger/10 px-4 py-3 text-sm text-concord-danger">
                {friendsError}
              </p>
            ) : null}

            {!friendsError && visibleFriends.length === 0 ? (
              <div className="rounded-2xl border border-concord-border bg-concord-panel-alt/80 px-5 py-6 text-sm leading-6 text-concord-muted">
                {search.trim()
                  ? 'No friends match this search.'
                  : 'Your accepted friends will appear here. Clicking one opens or starts a direct message.'}
              </div>
            ) : null}

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
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
