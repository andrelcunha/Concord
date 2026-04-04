import React from 'react'
import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { AppHomePage } from '@/features/home/AppHomePage'
import { ChannelPage } from '@/features/chat/ChannelPage'
import { DmIndexPage } from '@/features/dm/DmIndexPage'
import { DmConversationPage } from '@/features/dm/DmConversationPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { ServerPage } from '@/features/servers/ServerPage'
import { useSessionStore } from '@/lib/sessionStore'

function RootRedirect() {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)
  return <Navigate to={isAuthenticated ? '/app' : '/login'} replace />
}

function ProtectedRoute() {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/app',
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <AppHomePage />,
          },
          {
            path: 'servers/:serverId',
            element: <ServerPage />,
          },
          {
            path: 'servers/:serverId/channels/:channelId',
            element: <ChannelPage />,
          },
          {
            path: 'dm',
            element: <DmIndexPage />,
          },
          {
            path: 'dm/:conversationId',
            element: <DmConversationPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
