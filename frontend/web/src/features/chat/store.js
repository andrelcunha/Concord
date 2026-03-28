import { create } from 'zustand'

import { listMessagesRequest } from '@/features/chat/api'

export const useChatStore = create((set, get) => ({
  messagesByChannelId: {},
  loadingByChannelId: {},
  errorByChannelId: {},
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
    }),
}))
