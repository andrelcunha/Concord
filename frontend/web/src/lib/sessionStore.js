import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSessionStore = create(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      registerSuccessMessage: '',
      setSession: ({ accessToken, refreshToken, expiresIn }) =>
        set({
          accessToken,
          refreshToken,
          expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : null,
          isAuthenticated: true,
          registerSuccessMessage: '',
        }),
      setRegisterSuccessMessage: (message) =>
        set({
          registerSuccessMessage: message,
        }),
      clearRegisterSuccessMessage: () =>
        set({
          registerSuccessMessage: '',
        }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
          registerSuccessMessage: '',
        }),
    }),
    {
      name: 'concord-session',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
        registerSuccessMessage: state.registerSuccessMessage,
      }),
    },
  ),
)
