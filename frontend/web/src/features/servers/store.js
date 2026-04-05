import { create } from 'zustand'

import {
  createServerRequest,
  discoverServersRequest,
  joinServerRequest,
  listServersRequest,
} from '@/features/servers/api'

export const useServersStore = create((set, get) => ({
  servers: [],
  discoverableServers: [],
  isLoading: false,
  isCreating: false,
  isDiscovering: false,
  joiningServerId: null,
  errorMessage: '',
  discoverErrorMessage: '',
  hasLoaded: false,
  fetchServers: async () => {
    if (get().isLoading) {
      return
    }

    set({
      isLoading: true,
      errorMessage: '',
    })

    try {
      const data = await listServersRequest()
      set({
        servers: data.servers ?? [],
        isLoading: false,
        hasLoaded: true,
      })
    } catch (error) {
      set({
        isLoading: false,
        hasLoaded: true,
        errorMessage: error.response?.data?.error ?? 'Failed to load servers',
      })
    }
  },
  createServer: async ({ name, isPublic }) => {
    if (get().isCreating) {
      return null
    }

    set({
      isCreating: true,
      errorMessage: '',
    })

    try {
      const server = await createServerRequest({
        name,
        is_public: isPublic,
      })

      set((state) => ({
        servers: [...state.servers, server],
        isCreating: false,
      }))

      return server
    } catch (error) {
      set({
        isCreating: false,
        errorMessage: error.response?.data?.error ?? 'Failed to create server',
      })
      return null
    }
  },
  discoverServers: async (query = '') => {
    if (get().isDiscovering) {
      return
    }

    set({
      isDiscovering: true,
      discoverErrorMessage: '',
    })

    try {
      const data = await discoverServersRequest(query)
      set({
        discoverableServers: data.servers ?? [],
        isDiscovering: false,
      })
    } catch (error) {
      set({
        isDiscovering: false,
        discoverErrorMessage: error.response?.data?.error ?? 'Failed to discover servers',
      })
    }
  },
  joinServer: async (server) => {
    if (!server || get().joiningServerId) {
      return false
    }

    set({
      joiningServerId: server.id,
      discoverErrorMessage: '',
    })

    try {
      await joinServerRequest(server.id)
      set((state) => ({
        servers: [...state.servers, server],
        discoverableServers: state.discoverableServers.filter((item) => item.id !== server.id),
        joiningServerId: null,
      }))
      return true
    } catch (error) {
      set({
        joiningServerId: null,
        discoverErrorMessage: error.response?.data?.error ?? 'Failed to join server',
      })
      return false
    }
  },
  clearServers: () =>
    set({
      servers: [],
      discoverableServers: [],
      isLoading: false,
      isCreating: false,
      isDiscovering: false,
      joiningServerId: null,
      errorMessage: '',
      discoverErrorMessage: '',
      hasLoaded: false,
    }),
}))
