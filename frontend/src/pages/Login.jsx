import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react'

function Login() {
  const { t } = useTranslation()
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState('')
  const { login } = useAuth()

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await login(credentials)
      if (!result.success) {
        setError(result.error)
        setLoading(false)
      }
    } catch (err) {
      setError(t('auth.loginFailed'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-6 relative">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-primary/[0.04]" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,hsl(var(--primary)/0.06),transparent)]" aria-hidden />

      <div className="w-full max-w-[400px] space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            {t('common.appName')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('auth.loginTitle')}
          </p>
        </div>

        {/* Card */}
        <Card className="border border-border">
          <CardContent className="pt-6 pb-6 sm:pt-8 sm:pb-8">
            {error && (
              <Alert variant="destructive" className="mb-5">
                <AlertDescription className="text-destructive">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-foreground">
                  {t('auth.username')}
                </Label>
                <div className="relative">
                  <User
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                      focusedField === 'username' ? 'text-primary' : 'text-muted-foreground'
                    }`}
                    aria-hidden
                  />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    value={credentials.username}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField('')}
                    disabled={loading}
                    className={`pl-10 h-11 rounded-md border-input bg-background ${
                      focusedField === 'username' ? 'ring-2 ring-border border-border' : ''
                    }`}
                    placeholder={t('auth.username')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  {t('auth.password')}
                </Label>
                <div className="relative">
                  <Lock
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                      focusedField === 'password' ? 'text-primary' : 'text-muted-foreground'
                    }`}
                    aria-hidden
                  />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={credentials.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    disabled={loading}
                    className={`pl-10 pr-10 h-11 rounded-md border-input bg-background ${
                      focusedField === 'password' ? 'ring-2 ring-border border-border' : ''
                    }`}
                    placeholder={t('auth.password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                    disabled={loading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full h-11 rounded-md font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" aria-hidden />
                    <span>{t('auth.loggingIn')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('auth.loginButton')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          {t('auth.secureLogin')}
        </p>
      </div>
    </div>
  )
}

export default Login
