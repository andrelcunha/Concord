import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function parseJwtPayload(token) {
  if (!token) {
    return {}
  }

  try {
    const payload = token.split('.')[1]
    const decodedPayload = JSON.parse(window.atob(payload))
    const user = decodedPayload.user ? JSON.parse(decodedPayload.user) : null

    return {
      userId: decodedPayload.sub ?? null,
      username: decodedPayload.username ?? '',
      user,
    }
  } catch (_error) {
    return {}
  }
}

export const useSessionStore = create(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      registerSuccessMessage: '',
      currentUser: null,
      setSession: ({ accessToken, refreshToken, expiresIn }) =>
        set(() => {
          const parsedJwt = parseJwtPayload(accessToken)
          const rawUser = parsedJwt.user ?? {}
          const username = rawUser.username ?? parsedJwt.username ?? ''
          const avatarUrl = rawUser.avatar_url ?? rawUser.avatarUrl ?? ''
          const avatarColor = rawUser.avatar_color ?? rawUser.avatarColor ?? '#5ad1b2'
          const userId = rawUser.user_id ?? rawUser.userId ?? parsedJwt.userId ?? null

          return {
            accessToken,
            refreshToken,
            expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : null,
            isAuthenticated: true,
            registerSuccessMessage: '',
            currentUser: username
              ? {
                  userId,
                  username,
                  avatarUrl,
                  avatarColor,
                }
              : null,
          }
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
          currentUser: null,
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
        currentUser: state.currentUser,
      }),
    },
  ),
)
