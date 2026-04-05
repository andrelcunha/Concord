import { create } from 'zustand'

import { listServersRequest } from '@/features/servers/api'

export const useServersStore = create((set, get) => ({
  servers: [],
  isLoading: false,
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
  clearServers: () =>
    set({
      servers: [],
      isLoading: false,
      errorMessage: '',
      hasLoaded: false,
    }),
}))
