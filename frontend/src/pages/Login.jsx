import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react'

function Login() {
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
      console.log('Starting login...')
      const result = await login(credentials)
      console.log('Login result:', result)
      
      if (!result.success) {
        console.log('Login failed:', result.error)
        setError(result.error)
        setLoading(false)
      } else {
        console.log('Login successful, redirecting...')
        // The redirect will happen automatically when user state changes
        // No need to manually redirect here
      }
    } catch (error) {
      console.log('Login error:', error)
      setError('Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Circles */}
        <div className="absolute top-20 left-10 w-20 h-20 rounded-none animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16/15 rounded-none animate-bounce" style={{animationDelay: '1s', animationDuration: '3s'}}></div>
        <div className="absolute bottom-32 left-16 w-24 h-24/8 rounded-none animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-12 w-12 h-12/12 rounded-none animate-bounce" style={{animationDelay: '0.5s', animationDuration: '2.5s'}}></div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-32 left-1/4 w-8 h-8/20 rotate-45 animate-spin" style={{animationDuration: '8s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-6 h-6/15 rotate-12 animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 left-8 w-10 h-10 rounded-none animate-bounce" style={{animationDelay: '3s', animationDuration: '4s'}}></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-16 right-1/4 w-32 h-32 bg-gradient-to-r from-primary/5 to-primary/10 rounded-none blur-xl animate-pulse" style={{animationDelay: '2.5s'}}></div>
        <div className="absolute bottom-16 left-1/4 w-28 h-28 bg-gradient-to-r from-primary/8 to-primary/5 rounded-none blur-lg animate-bounce" style={{animationDelay: '1s', animationDuration: '5s'}}></div>
        
        {/* Moving Lines */}
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-1/3 right-0 w-px h-32 bg-gradient-to-b from-transparent via-primary/15 to-transparent animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Floating Dots */}
        <div className="absolute top-24 right-16 w-2 h-2/30 rounded-none animate-ping" style={{animationDelay: '0.8s'}}></div>
        <div className="absolute bottom-24 left-20 w-1.5 h-1.5/25 rounded-none animate-ping" style={{animationDelay: '2.2s'}}></div>
        <div className="absolute top-1/2 right-8 w-1 h-1/20 rounded-none animate-ping" style={{animationDelay: '3.5s'}}></div>
      </div>
      
      <div className="w-full max-w-sm space-y-6 relative z-10">
        {/* Header Section */}
        <div className="text-center space-y-4">
       
          <div>
            <h1 className="text-3xl font-bold text-foreground">PreART System</h1>
            <p className="text-muted-foreground mt-2">Reporting System </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
      
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
                <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div className="space-y-2">
              
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${
                    focusedField === 'username' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={credentials.username}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField('')}
                    disabled={loading}
                    className={`pl-10 h-12 transition-all duration-200 ${
                      focusedField === 'username' ? 'ring-2 ring-primary/20 border-primary' : ''
                    }`}
                    placeholder="Username"
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="space-y-2">
                
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${
                    focusedField === 'password' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={credentials.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    disabled={loading}
                    className={`pl-10 pr-10 h-12 transition-all duration-200 ${
                      focusedField === 'password' ? 'ring-2 ring-primary/20 border-primary' : ''
                    }`}
                    placeholder=" Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

         

              {/* Submit Button */}
              <Button 
                type="submit" 
             
                className=" bg-cyan-700 hover:from-primary/90 hover:to-secondary/90 text-white transition-all duration-300 w-full h-12 font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-none animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
        
        </div>
      </div>
    </div>
  )
}

export default Login
