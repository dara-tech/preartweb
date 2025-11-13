import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { useAuth } from '../../contexts/AuthContext'
import { ThemeToggle } from '../ui/theme-toggle'
import Sidebar from './Sidebar'

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { 
  MdMenu, 
  MdFullscreen, 
  MdFullscreenExit, 
  MdDownload, 
  MdLogout, 
  MdPerson, 
  MdSettings 
} from 'react-icons/md'

const AdvancedLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const { user, logout } = useAuth()

  // Check if user is a viewer
  const isViewer = user?.role === 'viewer'

  const handleLogout = () => {
    logout()
  }

  // Download all scripts function
  const downloadAllScripts = async () => {
    try {
      setIsDownloading(true)
      const token = localStorage.getItem('token')
      
      // Get API URL based on current hostname
      const getApiUrl = () => {
        const hostname = window.location.hostname
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return 'http://localhost:3001'
        } else {
          return `http://${hostname}:3001`
        }
      }
      const apiUrl = import.meta.env.VITE_API_URL || getApiUrl()
      
      console.log('Downloading scripts from:', apiUrl)
      console.log('Current hostname:', window.location.hostname)
      console.log('Full URL:', `${apiUrl}/apiv1/scripts/scripts/download-all`)
      
      // Test the API URL first
      try {
        const testResponse = await fetch(`${apiUrl}/health`, { method: 'GET' })
        console.log('Health check response:', testResponse.status)
      } catch (testError) {
        console.error('Health check failed:', testError)
      }
      
      const response = await fetch(`${apiUrl}/apiv1/scripts/scripts/download-all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Download failed:', response.status, errorText)
        throw new Error(`Failed to download scripts: ${response.status} - ${errorText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'artweb-analysis-scripts.zip'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error('Error downloading all scripts:', error)
      alert(`Failed to download scripts: ${error.message}\n\nPlease check:\n1. Backend server is running on port 3001\n2. Network connectivity\n3. Check browser console for details`)
    } finally {
      setIsDownloading(false)
    }
  }

  // Check if fullscreen is supported
  const isFullscreenSupported = () => {
    return !!(
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled
    )
  }

  // Enter fullscreen mode
  const enterFullscreen = async () => {
    const element = document.documentElement
    
    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen()
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen()
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen()
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen()
      }
    } catch (error) {
      console.error('Error entering fullscreen:', error)
    }
  }

  // Exit fullscreen mode
  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen()
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen()
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen()
      }
    } catch (error) {
      console.error('Error exiting fullscreen:', error)
    }
  }

  const toggleFullFrame = async () => {
    if (isFullscreen) {
      await exitFullscreen()
    } else {
      await enterFullscreen()
    }
  }

  // Handle fullscreen state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      )
      
      setIsFullscreen(isCurrentlyFullscreen)
      
      // Close mobile menu when entering fullscreen
      if (isCurrentlyFullscreen) {
        setIsMobileOpen(false)
      }
    }

    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    // Handle F11 key press
    const handleKeyDown = (event) => {
      if (event.key === 'F11') {
        event.preventDefault()
        toggleFullFrame()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen, toggleFullFrame])

  return (
    <div className={`min-h-screen bg-background transition-all duration-300 ${isFullscreen ? 'app-mode' : ''}`}>
      <div className={`flex h-screen ${isViewer ? 'flex-col' : ''}`}>
        {/* Sidebar - Hidden for viewers */}
        {!isViewer && (
          <Sidebar 
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
          />
        )}

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col overflow-hidden ${isViewer ? 'w-full' : ''}`}>
          {/* Top Header */}
          <header className={`bg-card/95 backdrop-blur-md border-b border-border/50 px-4 py-1   ${
            isFullscreen ? 'border-primary/30/5' : ''
          }`}>
            <div className="flex items-center justify-between">
              {/* Left Section */}
              <div className="flex items-center space-x-4">
                {/* App Mode Status Indicator */}
                {isFullscreen && (
                  <div className="flex items-center space-x-2 px-3 py-1.5 border border-primary/20 rounded-none text-xs font-medium text-primary">
                    <div className="w-2 h-2 rounded-none animate-pulse"></div>
                    <span>App Mode</span>
                  </div>
                )}
                
                {/* Mobile Menu Toggle */}
                {!isViewer && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileOpen(true)}
                    className="lg:hidden hover:bg-accent/80 rounded-none transition-all duration-200"
                  >
                    <MdMenu className="w-5 h-5 text-muted-foreground" />
                  </Button>
                )}
                
           
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-2">
                {/* Fullscreen Toggle */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleFullFrame}
                  className={`hover:bg-accent/80 transition-all duration-200 rounded-none ${
                    isFullscreen ? ' text-primary border border-primary/20' : ''
                  }`}
                  title={isFullscreen ? "Exit App Mode (F11)" : "Enter App Mode (F11)"}
                  disabled={!isFullscreenSupported()}
                >
                  {isFullscreen ? (
                    <MdFullscreenExit className="w-4 h-4" />
                  ) : (
                    <MdFullscreen className="w-4 h-4" />
                  )}
                </Button>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Viewer Actions */}
                {isViewer && (
                  <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-border/50">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={downloadAllScripts}
                      disabled={isDownloading}
                      className="hover: hover:text-primary hover:border-primary/30 transition-all duration-200 rounded-none"
                      title="Download Analysis Scripts"
                    >
                      {isDownloading ? (
                        <div className="animate-spin rounded-none h-4 w-4 border-2 border-primary border-t-transparent"></div>
                      ) : (
                        <MdDownload className="w-4 h-4" />
                      )}
                      <span className="ml-2 hidden sm:inline">Download Scripts</span>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleLogout}
                      className="hover:bg-destructive/10 hover:text-destructive transition-all duration-200 rounded-none cursor-pointer"
                      title="Sign Out"
                    >
                      <MdLogout className=" h-4 w-4 " />
                    </Button>
                  </div>
                )}

                {/* User Profile Menu */}
                {!isViewer && (
                  <DropdownMenu >
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="flex items-center space-x-3 px-3 py-2 h-auto hover:bg-accent/80 transition-all duration-200 rounded-none ml-2"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/40 rounded-none flex items-center justify-center shadow-sm ring-1 ring-border/50">
                          <MdPerson className="w-4 h-4 text-primary" />
                        </div>
                        <div className="hidden lg:block text-left">
                          <p className="text-sm font-medium text-foreground leading-tight">{user?.fullName || 'User'}</p>
                          <p className="text-xs text-muted-foreground capitalize">{user?.role || 'Administrator'}</p>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 shadow-lg border-border/50 ">
                      <DropdownMenuLabel className="font-medium">
                        <div className="flex flex-col space-y-1">
                          <span>{user?.fullName || 'User'}</span>
                          <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="hover:bg-accent/80 transition-colors cursor-pointer">
                        <MdPerson className="mr-3 h-4 w-4" />
                        <span>Profile Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-accent/80 transition-colors cursor-pointer">
                        <MdSettings className="mr-3 h-4 w-4" />
                        <span>Preferences</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleLogout} 
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                      >
                        <MdLogout className="mr-3 h-4 w-4 rounded-none text-destructive" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="h-full p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default AdvancedLayout
