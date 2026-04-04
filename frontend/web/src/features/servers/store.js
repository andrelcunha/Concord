import { create } from 'zustand'

import { createServerRequest, listServersRequest } from '@/features/servers/api'

export const useServersStore = create((set, get) => ({
  servers: [],
  isLoading: false,
  isCreating: false,
  errorMessage: '',
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
  clearServers: () =>
    set({
      servers: [],
      isLoading: false,
      isCreating: false,
      errorMessage: '',
      hasLoaded: false,
    }),
}))
