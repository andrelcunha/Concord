import React from 'react'
import { useParams } from 'react-router-dom'

import { useChatStore } from '@/features/chat/store'
import { useChannelsStore } from '@/features/channels/store'
import { useServersStore } from '@/features/servers/store'
import { useSessionStore } from '@/lib/sessionStore'

function formatMessageTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function getMessageInitial(username) {
  return username?.slice(0, 1).toUpperCase() || '?'
}

function isSameAuthorBlock(currentMessage, previousMessage) {
  if (!previousMessage) {
    return false
  }

  return currentMessage.username === previousMessage.username
}

export function ChannelPage() {
  const { serverId, channelId } = useParams()
  const servers = useServersStore((state) => state.servers)
  const channelsByServerId = useChannelsStore((state) => state.channelsByServerId)
  const messagesByChannelId = useChatStore((state) => state.messagesByChannelId)
  const loadingByChannelId = useChatStore((state) => state.loadingByChannelId)
  const errorByChannelId = useChatStore((state) => state.errorByChannelId)
  const connectionStateByChannelId = useChatStore((state) => state.connectionStateByChannelId)
  const addOptimisticMessage = useChatStore((state) => state.addOptimisticMessage)
  const markOptimisticMessageFailed = useChatStore((state) => state.markOptimisticMessageFailed)
  const reconcileIncomingMessage = useChatStore((state) => state.reconcileIncomingMessage)
  const setConnectionState = useChatStore((state) => state.setConnectionState)
  const accessToken = useSessionStore((state) => state.accessToken)
  const currentUser = useSessionStore((state) => state.currentUser)
  const server = servers.find((item) => String(item.id) === serverId)
  const channels = channelsByServerId[String(serverId)] ?? []
  const channel = channels.find((item) => String(item.id) === channelId)
  const messages = messagesByChannelId[String(channelId)] ?? []
  const isLoadingMessages = loadingByChannelId[String(channelId)]
  const messageError = errorByChannelId[String(channelId)]
  const connectionState = connectionStateByChannelId[String(channelId)] ?? 'idle'
  const [draftMessage, setDraftMessage] = React.useState('')
  const [sendError, setSendError] = React.useState('')
  const [reconnectNonce, setReconnectNonce] = React.useState(0)
  const socketRef = React.useRef(null)
  const reconnectTimeoutRef = React.useRef(null)
  const messagesContainerRef = React.useRef(null)

  React.useEffect(() => {
    setDraftMessage('')
    setSendError('')
  }, [channelId])

  React.useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) {
      return
    }

    container.scrollTop = container.scrollHeight
  }, [messages.length, channelId])

  React.useEffect(() => {
    if (!channelId || !accessToken || !channel) {
      return undefined
    }

    const websocketUrl = new URL('/api/ws', import.meta.env.VITE_WS_URL)
    websocketUrl.searchParams.set('channel_id', channelId)
    websocketUrl.searchParams.set('token', accessToken)

    setConnectionState(channelId, 'connecting')
    const socket = new WebSocket(websocketUrl.toString())
    socketRef.current = socket

    socket.onopen = () => {
      setConnectionState(channelId, 'connected')
      setSendError('')
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }

    socket.onmessage = (event) => {
      try {
        const parsedMessage = JSON.parse(event.data)
        reconcileIncomingMessage(channelId, parsedMessage, currentUser?.username ?? '')
      } catch (_error) {
        setSendError('Received an unreadable live message payload.')
      }
    }

    socket.onerror = () => {
      setSendError('The live connection ran into a problem. Trying again soon...')
    }

    socket.onclose = () => {
      setConnectionState(channelId, 'disconnected')
      reconnectTimeoutRef.current = window.setTimeout(() => {
        setReconnectNonce((value) => value + 1)
      }, 2000)
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      socket.close()
      socketRef.current = null
    }
  }, [
    accessToken,
    channel,
    channelId,
    currentUser?.username,
    reconnectNonce,
    reconcileIncomingMessage,
    setConnectionState,
  ])

  function handleSendMessage(event) {
    event.preventDefault()
    setSendError('')

    const content = draftMessage.trim()
    if (!content) {
      return
    }

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setSendError('Live connection is not ready yet.')
      return
    }

    const optimisticId = `optimistic-${channelId}-${Date.now()}`

    addOptimisticMessage(channelId, {
      id: optimisticId,
      channel_id: Number(channelId),
      user_id: -1,
      content,
      username: currentUser?.username ?? 'You',
      created_at: new Date().toISOString(),
      avatar_url: currentUser?.avatarUrl ?? '',
      avatar_color: currentUser?.avatarColor ?? '#5ad1b2',
      optimisticState: 'sending',
    })

    try {
      socketRef.current.send(
        JSON.stringify({
          content,
        }),
      )
      setDraftMessage('')
    } catch (_error) {
      markOptimisticMessageFailed(channelId, optimisticId)
      setSendError('Could not send the message through the live connection.')
    }
  }

  function handleReconnect() {
    setSendError('')
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    setReconnectNonce((value) => value + 1)
  }

  if (!channel) {
    return (
      <section className="mx-auto max-w-4xl rounded-[2rem] border border-concord-border bg-concord-panel/70 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-concord-accent">
          Channel Unavailable
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-concord-text">
          This route does not match a loaded channel
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-concord-muted">
          The server navigation is real now, but this specific channel is not present in the current
          backend response for server {serverId}. The sidebar is still the right place to recover to
          a valid destination.
        </p>
      </section>
    )
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="rounded-[2rem] border border-concord-border bg-concord-panel/70 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-concord-accent">
          Message History
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-concord-text">
          {server?.name ?? `Server ${serverId}`} · #{channel.name}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-concord-muted">
          Message history comes from the real backend route, and this slice adds basic live sending
          and WebSocket updates to complete the first end-to-end chat loop.
        </p>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-concord-border bg-concord-panel/70 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col gap-2 border-b border-concord-border/60 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-concord-muted">
            Channel #{channel.name} · {messages.length} loaded message{messages.length === 1 ? '' : 's'}
          </p>
          <div className="flex items-center gap-3">
            <p
              className={`text-xs font-semibold uppercase tracking-[0.24em] ${
                connectionState === 'connected'
                  ? 'text-concord-accent'
                  : connectionState === 'connecting'
                    ? 'text-amber-300'
                    : 'text-concord-danger'
              }`}
            >
              Live state: {connectionState}
            </p>
            {connectionState !== 'connected' ? (
              <button
                type="button"
                onClick={handleReconnect}
                className="rounded-full border border-concord-border bg-concord-panel-alt px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-concord-text transition hover:border-concord-accent"
              >
                Reconnect
              </button>
            ) : null}
          </div>
        </div>

        <div
          ref={messagesContainerRef}
          className="flex max-h-[34rem] flex-col gap-4 overflow-y-auto px-4 py-4 md:px-6 md:py-6"
        >
          {isLoadingMessages ? (
            <p className="text-sm text-concord-muted">Loading message history...</p>
          ) : null}

          {messageError ? (
            <p className="rounded-2xl border border-concord-danger/30 bg-concord-danger/10 px-4 py-3 text-sm text-concord-danger">
              {messageError}
            </p>
          ) : null}

          {!isLoadingMessages && !messageError && messages.length === 0 ? (
            <div className="rounded-[1.5rem] border border-concord-border bg-concord-panel-alt/80 px-5 py-6 text-sm leading-6 text-concord-muted">
              No messages have been returned for this channel yet. Once someone sends a message, it
              will appear here.
            </div>
          ) : null}

          {!isLoadingMessages &&
            !messageError &&
            messages.map((message, index) => {
              const grouped = isSameAuthorBlock(message, messages[index - 1])

              return (
              <article
                key={message.id}
                className={`flex rounded-[1.5rem] border px-3 py-3 transition hover:border-concord-border/60 hover:bg-concord-panel-alt/50 ${
                  message.optimisticState === 'failed'
                    ? 'border-concord-danger/30 bg-concord-danger/5'
                    : 'border-transparent'
                } ${grouped ? 'gap-4' : 'gap-4'}`}
              >
                {grouped ? (
                  <div className="h-11 w-11 shrink-0" />
                ) : message.avatar_url ? (
                  <img
                    src={message.avatar_url}
                    alt={message.username}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-slate-950"
                    style={{ backgroundColor: message.avatar_color || '#5ad1b2' }}
                  >
                    {getMessageInitial(message.username)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  {!grouped ? (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-semibold text-concord-text">{message.username}</span>
                      <span className="text-xs uppercase tracking-[0.22em] text-concord-muted">
                        {formatMessageTime(message.created_at)}
                      </span>
                      {message.optimisticState ? (
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${
                            message.optimisticState === 'failed'
                              ? 'text-concord-danger'
                              : 'text-concord-accent'
                          }`}
                        >
                          {message.optimisticState}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  <p className={`${grouped ? '' : 'mt-2'} whitespace-pre-wrap text-sm leading-7 text-concord-text/92`}>
                    {message.content}
                  </p>
                </div>
              </article>
              )
            })}
        </div>

        <div className="border-t border-concord-border/60 px-4 py-4 md:px-6">
          <form className="flex flex-col gap-3" onSubmit={handleSendMessage}>
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-concord-muted">
              Send a message
            </label>
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={draftMessage}
                onChange={(event) => setDraftMessage(event.target.value)}
                placeholder={`Message #${channel.name}`}
                className="min-w-0 flex-1 rounded-2xl border border-concord-border bg-concord-panel-alt px-4 py-3 text-sm text-concord-text outline-none transition focus:border-concord-accent"
              />
              <button
                type="submit"
                className="rounded-2xl bg-concord-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-concord-accent-strong"
              >
                Send
              </button>
            </div>
            {sendError ? (
              <p className="text-sm text-concord-danger">{sendError}</p>
            ) : (
              <p className="text-sm text-concord-muted">
                This slice adds optimistic sending, automatic reconnect attempts, and a manual
                reconnect escape hatch.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
