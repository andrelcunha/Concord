import React from 'react'
import { useNavigate } from 'react-router-dom'

import { AuthShell } from '@/features/auth/AuthShell'
import { useSessionStore } from '@/lib/sessionStore'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useSessionStore((state) => state.login)

  function handleSubmit(event) {
    event.preventDefault()
    login()
    navigate('/app', { replace: true })
  }

  return (
    <AuthShell
      title="Welcome back"
      description="This is a placeholder auth screen for Sprint 1. The route is real, but backend auth wiring comes later."
      submitLabel="Enter placeholder app"
      alternateLabel="Need an account?"
      alternateTo="/register"
      onSubmit={handleSubmit}
    />
  )
}
