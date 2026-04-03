import { create } from 'zustand'

import { listMessagesRequest } from '@/features/chat/api'

export const useChatStore = create((set, get) => ({
  messagesByChannelId: {},
  loadingByChannelId: {},
  errorByChannelId: {},
  connectionStateByChannelId: {},
  fetchMessagesForChannel: async (channelId) => {
    if (!channelId) {
      return
    }

    const key = String(channelId)
    if (get().loadingByChannelId[key]) {
      return
    }

    set((state) => ({
      loadingByChannelId: {
        ...state.loadingByChannelId,
        [key]: true,
      },
      errorByChannelId: {
        ...state.errorByChannelId,
        [key]: '',
      },
    }))

    try {
      const data = await listMessagesRequest(channelId)
      set((state) => ({
        messagesByChannelId: {
          ...state.messagesByChannelId,
          [key]: data ?? [],
        },
        loadingByChannelId: {
          ...state.loadingByChannelId,
          [key]: false,
        },
      }))
    } catch (error) {
      set((state) => ({
        loadingByChannelId: {
          ...state.loadingByChannelId,
          [key]: false,
        },
        errorByChannelId: {
          ...state.errorByChannelId,
          [key]: error.response?.data?.error ?? 'Failed to load messages',
        },
      }))
    }
  },
  clearMessages: () =>
    set({
      messagesByChannelId: {},
      loadingByChannelId: {},
      errorByChannelId: {},
      connectionStateByChannelId: {},
    }),
  appendMessage: (channelId, message) =>
    set((state) => {
      const key = String(channelId)
      const existingMessages = state.messagesByChannelId[key] ?? []
      const alreadyPresent = existingMessages.some((item) => item.id === message.id)

      if (alreadyPresent) {
        return state
      }

      return {
        messagesByChannelId: {
          ...state.messagesByChannelId,
          [key]: [...existingMessages, message],
        },
      }
    }),
  addOptimisticMessage: (channelId, message) =>
    set((state) => {
      const key = String(channelId)
      const existingMessages = state.messagesByChannelId[key] ?? []

      return {
        messagesByChannelId: {
          ...state.messagesByChannelId,
          [key]: [...existingMessages, message],
        },
      }
    }),
  markOptimisticMessageFailed: (channelId, optimisticId) =>
    set((state) => {
      const key = String(channelId)
      const existingMessages = state.messagesByChannelId[key] ?? []

      return {
        messagesByChannelId: {
          ...state.messagesByChannelId,
          [key]: existingMessages.map((message) =>
            message.id === optimisticId
              ? {
                  ...message,
                  optimisticState: 'failed',
                }
              : message,
          ),
        },
      }
    }),
  reconcileIncomingMessage: (channelId, message, currentUsername) =>
    set((state) => {
      const key = String(channelId)
      const existingMessages = state.messagesByChannelId[key] ?? []

      const optimisticIndex = existingMessages.findIndex(
        (item) =>
          String(item.id).startsWith('optimistic-') &&
          item.content === message.content &&
          item.username === currentUsername,
      )

      if (optimisticIndex >= 0) {
        const nextMessages = [...existingMessages]
        nextMessages[optimisticIndex] = message

        return {
          messagesByChannelId: {
            ...state.messagesByChannelId,
            [key]: nextMessages,
          },
        }
      }

      const alreadyPresent = existingMessages.some((item) => item.id === message.id)
      if (alreadyPresent) {
        return state
      }

      return {
        messagesByChannelId: {
          ...state.messagesByChannelId,
          [key]: [...existingMessages, message],
        },
      }
    }),
  setConnectionState: (channelId, connectionState) =>
    set((state) => ({
      connectionStateByChannelId: {
        ...state.connectionStateByChannelId,
        [String(channelId)]: connectionState,
      },
    })),
}))
