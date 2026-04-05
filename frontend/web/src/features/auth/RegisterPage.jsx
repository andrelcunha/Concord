import React from 'react'
import { useNavigate } from 'react-router-dom'

import { registerRequest } from '@/features/auth/api'
import { AuthShell } from '@/features/auth/AuthShell'
import { useSessionStore } from '@/lib/sessionStore'

export function RegisterPage() {
  const navigate = useNavigate()
  const setRegisterSuccessMessage = useSessionStore((state) => state.setRegisterSuccessMessage)
  const clearRegisterSuccessMessage = useSessionStore((state) => state.clearRegisterSuccessMessage)
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    clearRegisterSuccessMessage()
  }, [clearRegisterSuccessMessage])

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const data = await registerRequest({
        username,
        password,
      })
      setRegisterSuccessMessage(`Registered as ${data.username}. You can log in now.`)
      navigate('/login', { replace: true })
    } catch (error) {
      setErrorMessage(error.response?.data?.error ?? 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Create your Concord account"
      description="Create an account against the real backend auth API. Later auth slices will add refresh handling and richer session behavior."
      submitLabel="Create account"
      alternateLabel="Already have an account?"
      alternateTo="/login"
      onSubmit={handleSubmit}
      username={username}
      password={password}
      onUsernameChange={setUsername}
      onPasswordChange={setPassword}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      successMessage=""
    />
  )
}
