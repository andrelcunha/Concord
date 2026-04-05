import React from 'react'
import { useNavigate } from 'react-router-dom'

import { loginRequest } from '@/features/auth/api'
import { AuthShell } from '@/features/auth/AuthShell'
import { useSessionStore } from '@/lib/sessionStore'

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useSessionStore((state) => state.setSession)
  const clearRegisterSuccessMessage = useSessionStore((state) => state.clearRegisterSuccessMessage)
  const registerSuccessMessage = useSessionStore((state) => state.registerSuccessMessage)
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    return () => {
      clearRegisterSuccessMessage()
    }
  }, [clearRegisterSuccessMessage])

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const data = await loginRequest({
        username,
        password,
      })
      setSession({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: 15 * 60,
      })
      navigate('/app', { replace: true })
    } catch (error) {
      setErrorMessage(error.response?.data?.error ?? 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in against the real backend auth API. Session persistence and route protection now use the same state model the later app slices will build on."
      submitLabel="Log in"
      alternateLabel="Need an account?"
      alternateTo="/register"
      onSubmit={handleSubmit}
      username={username}
      password={password}
      onUsernameChange={setUsername}
      onPasswordChange={setPassword}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      successMessage={registerSuccessMessage}
    />
  )
}
