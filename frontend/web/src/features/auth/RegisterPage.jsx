import React from 'react'
import { useNavigate } from 'react-router-dom'

import { AuthShell } from '@/features/auth/AuthShell'
import { useSessionStore } from '@/lib/sessionStore'

export function RegisterPage() {
  const navigate = useNavigate()
  const login = useSessionStore((state) => state.login)

  function handleSubmit(event) {
    event.preventDefault()
    login()
    navigate('/app', { replace: true })
  }

  return (
    <AuthShell
      title="Create your Concord account"
      description="Registration is still a placeholder in Sprint 1. We keep the route and the screen now so the product shape stays stable."
      submitLabel="Continue to placeholder app"
      alternateLabel="Already have an account?"
      alternateTo="/login"
      onSubmit={handleSubmit}
    />
  )
}
