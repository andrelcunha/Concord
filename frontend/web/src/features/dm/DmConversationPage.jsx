import React from 'react'
import { useParams } from 'react-router-dom'

import { useDmStore } from '@/features/dm/store'
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

function MessageSkeleton({ grouped = false, widthClass = 'w-64' }) {
  return (
    <article className="flex gap-4 rounded-[1.5rem] px-3 py-3">
      {grouped ? (
        <div className="h-11 w-11 shrink-0" />
      ) : (
        <div className="h-11 w-11 shrink-0 rounded-full bg-concord-panel-soft/80" />
      )}

      <div className="min-w-0 flex-1">
        {!grouped ? (
          <div className="flex items-center gap-3">
            <div className="h-4 w-28 rounded-full bg-concord-panel-soft/80" />
            <div className="h-3 w-16 rounded-full bg-concord-panel-soft/60" />
          </div>
        ) : null}
        <div className={`${grouped ? '' : 'mt-3'} h-4 rounded-full bg-concord-panel-soft/75 ${widthClass}`} />
      </div>
    </article>
  )
}

export function DmConversationPage() {
  const { conversationId } = useParams()
  const conversations = useDmStore((state) => state.conversations)
  const fetchConversation = useDmStore((state) => state.fetchConversation)
  const fetchMessagesForConversation = useDmStore((state) => state.fetchMessagesForConversation)
  const messagesByConversationId = useDmStore((state) => state.messagesByConversationId)
  const loadingByConversationId = useDmStore((state) => state.loadingByConversationId)
  const errorByConversationId = useDmStore((state) => state.errorByConversationId)
  const connectionStateByConversationId = useDmStore((state) => state.connectionStateByConversationId)
  const addOptimisticMessage = useDmStore((state) => state.addOptimisticMessage)
  const markOptimisticMessageFailed = useDmStore((state) => state.markOptimisticMessageFailed)
  const reconcileIncomingMessage = useDmStore((state) => state.reconcileIncomingMessage)
  const setConnectionState = useDmStore((state) => state.setConnectionState)
  const accessToken = useSessionStore((state) => state.accessToken)
  const currentUser = useSessionStore((state) => state.currentUser)

  const conversation =
    conversations.find((item) => String(item.id) === conversationId) ?? null
  const hasConversation = Boolean(conversation)
  const messages = messagesByConversationId[String(conversationId)] ?? []
  const isLoadingMessages = loadingByConversationId[String(conversationId)]
  const messageError = errorByConversationId[String(conversationId)]
  const isBlocked = messageError === 'direct message is blocked'
  const connectionState = connectionStateByConversationId[String(conversationId)] ?? 'idle'
  const [draftMessage, setDraftMessage] = React.useState('')
  const [sendError, setSendError] = React.useState('')
  const [reconnectNonce, setReconnectNonce] = React.useState(0)
  const socketRef = React.useRef(null)
  const reconnectTimeoutRef = React.useRef(null)
  const messagesContainerRef = React.useRef(null)

  React.useEffect(() => {
    if (conversationId) {
      fetchConversation(conversationId)
      fetchMessagesForConversation(conversationId)
    }
  }, [conversationId, fetchConversation, fetchMessagesForConversation])

  React.useEffect(() => {
    setDraftMessage('')
    setSendError('')
  }, [conversationId])

  React.useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) {
      return
    }

    container.scrollTop = container.scrollHeight
  }, [messages.length, conversationId])

  React.useEffect(() => {
    if (!conversationId || !accessToken || !hasConversation || isBlocked) {
      return undefined
    }

    const websocketUrl = new URL('/api/dms/ws', import.meta.env.VITE_WS_URL)
    websocketUrl.searchParams.set('conversation_id', conversationId)
    websocketUrl.searchParams.set('token', accessToken)

    setConnectionState(conversationId, 'connecting')
    const socket = new WebSocket(websocketUrl.toString())
    socketRef.current = socket

    socket.onopen = () => {
      setConnectionState(conversationId, 'connected')
      setSendError('')
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }

    socket.onmessage = (event) => {
      try {
        const parsedMessage = JSON.parse(event.data)
        reconcileIncomingMessage(conversationId, parsedMessage, currentUser?.username ?? '')
      } catch (_error) {
        setSendError('Received an unreadable live message payload.')
      }
    }

    socket.onerror = () => {
      setSendError('The live connection ran into a problem. Trying again soon...')
    }

    socket.onclose = () => {
      setConnectionState(conversationId, 'disconnected')
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
    conversationId,
    currentUser?.username,
    hasConversation,
    isBlocked,
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

    if (isBlocked) {
      setSendError('This direct message is blocked.')
      return
    }

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setSendError('Live connection is not ready yet.')
      return
    }

    const optimisticId = `optimistic-${conversationId}-${Date.now()}`

    addOptimisticMessage(conversationId, {
      id: optimisticId,
      conversation_id: Number(conversationId),
      user_id: -1,
      content,
      username: currentUser?.username ?? 'You',
      created_at: new Date().toISOString(),
      avatar_url: currentUser?.avatarUrl ?? '',
      avatar_color: currentUser?.avatarColor ?? '#5ad1b2',
      optimisticState: 'sending',
    })

    try {
      socketRef.current.send(JSON.stringify({ content }))
      setDraftMessage('')
    } catch (_error) {
      markOptimisticMessageFailed(conversationId, optimisticId)
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

  if (!conversation) {
    return (
      <section className="mx-auto max-w-4xl rounded-[2rem] border border-concord-border bg-concord-panel/70 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-concord-accent">
          Conversation Unavailable
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-concord-text">
          This direct message is not available
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-concord-muted">
          The conversation may be hidden or you might not have access to it anymore. Use the sidebar to open another direct message.
        </p>
      </section>
    )
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        {!isBlocked && (connectionState === 'connecting' || connectionState === 'disconnected') ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-concord-border bg-concord-panel-alt/70 px-4 py-3">
            <p
              className={`text-sm ${
                connectionState === 'connecting' ? 'text-amber-300' : 'text-concord-danger'
              }`}
            >
              {connectionState === 'connecting'
                ? 'Connecting to live updates...'
                : 'Live updates are disconnected.'}
            </p>
            <button
              type="button"
              onClick={handleReconnect}
              className="rounded-full border border-concord-border bg-concord-panel px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-concord-text transition hover:border-concord-accent"
            >
              Reconnect
            </button>
          </div>
        ) : null}

        <div
          ref={messagesContainerRef}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1 py-2 md:px-2 md:py-3"
        >
          {isLoadingMessages ? (
            <div className="flex flex-col gap-2">
              <MessageSkeleton widthClass="w-72 max-w-[70%]" />
              <MessageSkeleton grouped widthClass="w-56 max-w-[55%]" />
              <MessageSkeleton widthClass="w-80 max-w-[75%]" />
              <MessageSkeleton grouped widthClass="w-64 max-w-[60%]" />
            </div>
          ) : null}

          {isBlocked ? (
            <div className="rounded-[1.5rem] border border-concord-danger/30 bg-concord-danger/8 px-5 py-6 text-sm leading-6 text-concord-danger">
              This conversation is blocked. Messaging is unavailable while the block is in place.
            </div>
          ) : null}

          {messageError && !isBlocked ? (
            <p className="rounded-2xl border border-concord-danger/30 bg-concord-danger/10 px-4 py-3 text-sm text-concord-danger">
              {messageError}
            </p>
          ) : null}

          {!isLoadingMessages && !messageError && !isBlocked && messages.length === 0 ? (
            <div className="rounded-[1.5rem] border border-concord-border bg-concord-panel-alt/80 px-5 py-6 text-sm leading-6 text-concord-muted">
              No messages yet. Start the conversation with {conversation.other_user.username}.
            </div>
          ) : null}

          {!isLoadingMessages &&
            !messageError &&
            !isBlocked &&
            messages.map((message, index) => {
              const grouped = isSameAuthorBlock(message, messages[index - 1])

              return (
                <article
                  key={message.id}
                  className={`flex rounded-[1.5rem] border px-3 py-3 transition hover:border-concord-border/60 hover:bg-concord-panel-alt/50 ${
                    message.optimisticState === 'failed'
                      ? 'border-concord-danger/30 bg-concord-danger/5'
                      : 'border-transparent'
                  }`}
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

        <div className="mt-4 border-t border-concord-border/60 px-1 py-4 md:px-2">
          <form className="flex flex-col gap-3" onSubmit={handleSendMessage}>
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={draftMessage}
                onChange={(event) => setDraftMessage(event.target.value)}
                placeholder={
                  isBlocked
                    ? 'Messaging unavailable'
                    : `Message ${conversation.other_user.username}`
                }
                disabled={isBlocked}
                className="min-w-0 flex-1 rounded-2xl border border-concord-border bg-concord-panel-alt px-4 py-3 text-sm text-concord-text outline-none transition focus:border-concord-accent"
              />
              <button
                type="submit"
                disabled={isBlocked}
                className="rounded-2xl bg-concord-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-concord-accent-strong"
              >
                Send
              </button>
            </div>
            {sendError ? (
              <p className="text-sm text-concord-danger">{sendError}</p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  )
}
