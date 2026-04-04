import { create } from 'zustand'

import { createChannelRequest, listChannelsRequest } from '@/features/channels/api'

export const useChannelsStore = create((set, get) => ({
  channelsByServerId: {},
  loadingByServerId: {},
  errorByServerId: {},
  creatingByServerId: {},
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
  createChannel: async ({ serverId, name }) => {
    if (!serverId) {
      return null
    }

    const key = String(serverId)
    if (get().creatingByServerId[key]) {
      return null
    }

    set((state) => ({
      creatingByServerId: {
        ...state.creatingByServerId,
        [key]: true,
      },
      errorByServerId: {
        ...state.errorByServerId,
        [key]: '',
      },
    }))

    try {
      const channel = await createChannelRequest({
        name,
        server_id: Number(serverId),
      })

      set((state) => {
        const existingChannels = state.channelsByServerId[key] ?? []
        return {
          channelsByServerId: {
            ...state.channelsByServerId,
            [key]: [...existingChannels, channel],
          },
          creatingByServerId: {
            ...state.creatingByServerId,
            [key]: false,
          },
        }
      })

      return channel
    } catch (error) {
      set((state) => ({
        creatingByServerId: {
          ...state.creatingByServerId,
          [key]: false,
        },
        errorByServerId: {
          ...state.errorByServerId,
          [key]: error.response?.data?.error ?? 'Failed to create channel',
        },
      }))
      return null
    }
  },
  clearChannels: () =>
    set({
      channelsByServerId: {},
      loadingByServerId: {},
      errorByServerId: {},
      creatingByServerId: {},
    }),
}))
