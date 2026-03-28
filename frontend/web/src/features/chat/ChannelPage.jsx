import React from 'react'
import { useParams } from 'react-router-dom'

import { useChatStore } from '@/features/chat/store'
import { useChannelsStore } from '@/features/channels/store'
import { useServersStore } from '@/features/servers/store'

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

export function ChannelPage() {
  const { serverId, channelId } = useParams()
  const servers = useServersStore((state) => state.servers)
  const channelsByServerId = useChannelsStore((state) => state.channelsByServerId)
  const messagesByChannelId = useChatStore((state) => state.messagesByChannelId)
  const loadingByChannelId = useChatStore((state) => state.loadingByChannelId)
  const errorByChannelId = useChatStore((state) => state.errorByChannelId)
  const server = servers.find((item) => String(item.id) === serverId)
  const channels = channelsByServerId[String(serverId)] ?? []
  const channel = channels.find((item) => String(item.id) === channelId)
  const messages = messagesByChannelId[String(channelId)] ?? []
  const isLoadingMessages = loadingByChannelId[String(channelId)]
  const messageError = errorByChannelId[String(channelId)]

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
          This slice focuses on the read side of chat. The message history now comes from the real
          backend route, while live sending and WebSocket updates remain a later slice.
        </p>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-concord-border bg-concord-panel/70 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
        <div className="border-b border-concord-border/60 px-6 py-4">
          <p className="text-sm text-concord-muted">
            Channel #{channel.name} · {messages.length} loaded message{messages.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex flex-col gap-4 px-4 py-4 md:px-6 md:py-6">
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
            messages.map((message) => (
              <article
                key={message.id}
                className="flex gap-4 rounded-[1.5rem] border border-transparent px-3 py-3 transition hover:border-concord-border/60 hover:bg-concord-panel-alt/50"
              >
                {message.avatar_url ? (
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
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-semibold text-concord-text">{message.username}</span>
                    <span className="text-xs uppercase tracking-[0.22em] text-concord-muted">
                      {formatMessageTime(message.created_at)}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-concord-text/92">
                    {message.content}
                  </p>
                </div>
              </article>
            ))}
        </div>
      </div>
    </section>
  )
}
