import { create } from 'zustand'

import { listChannelsRequest } from '@/features/channels/api'

export const useChannelsStore = create((set, get) => ({
  channelsByServerId: {},
  loadingByServerId: {},
  errorByServerId: {},
  fetchChannelsForServer: async (serverId) => {
    if (!serverId) {
      return
    }

    const key = String(serverId)
    const loadingByServerId = get().loadingByServerId
    if (loadingByServerId[key]) {
      return
    }

    set((state) => ({
      loadingByServerId: {
        ...state.loadingByServerId,
        [key]: true,
      },
      errorByServerId: {
        ...state.errorByServerId,
        [key]: '',
      },
    }))

    try {
      const data = await listChannelsRequest(serverId)
      set((state) => ({
        channelsByServerId: {
          ...state.channelsByServerId,
          [key]: data ?? [],
        },
        loadingByServerId: {
          ...state.loadingByServerId,
          [key]: false,
        },
      }))
    } catch (error) {
      set((state) => ({
        loadingByServerId: {
          ...state.loadingByServerId,
          [key]: false,
        },
        errorByServerId: {
          ...state.errorByServerId,
          [key]: error.response?.data?.error ?? 'Failed to load channels',
        },
      }))
    }
  },
  clearChannels: () =>
    set({
      channelsByServerId: {},
      loadingByServerId: {},
      errorByServerId: {},
    }),
}))
