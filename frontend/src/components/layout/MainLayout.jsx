import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, LogOut, Moon, Sun, Maximize2, Minimize2, Download, FileText } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'
import Sidebar from './Sidebar'

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isViewer = user?.role === 'viewer'
  const showSidebar = !isViewer
  const [theme, setTheme] = useState('light')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [downloadingWorkbench, setDownloadingWorkbench] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = stored || (prefersDark ? 'dark' : 'light')
    setTheme(initial)
  }, [])

  // Apply theme to document root
  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme)
    }
  }, [theme])

  // Track fullscreen state
  useEffect(() => {
    const handleChange = () => {
      if (typeof document === 'undefined') return
      setIsFullscreen(!!document.fullscreenElement)
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('fullscreenchange', handleChange)
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('fullscreenchange', handleChange)
      }
    }
  }, [])

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const handleToggleFullscreen = () => {
    if (typeof document === 'undefined') return
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  const handleViewerDownload = () => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent('viewer-download'))
  }

  const handleDownloadSqlWorkbench = async () => {
    if (typeof window === 'undefined') return
    try {
      setDownloadingWorkbench(true)
      const res = await api.get('/apiv1/scripts/scripts/download-sql-workbench', {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'sql-workbench.zip'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download sql-workbench failed:', err)
      let msg = err?.message || 'Failed to download sql-workbench'
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text()
          const json = JSON.parse(text)
          msg = json?.message || json?.error || msg
        } catch (_) {
          msg = 'Download failed (server error). See console for details.'
        }
      } else if (err?.response?.data?.message) {
        msg = err.response.data.message
      }
      window.alert(msg)
    } finally {
      setDownloadingWorkbench(false)
    }
  }

  return (
    <div className="flex h-screen min-h-screen bg-background">
      <Sidebar
        isCollapsed={collapsed}
        setIsCollapsed={setCollapsed}
        isMobileOpen={mobileOpen}
        setIsMobileOpen={setMobileOpen}
      />
      <main className="flex min-w-0 flex-1 flex-col overflow-auto">
        {isViewer && (
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4">
            <span className="text-sm font-medium text-foreground">PreART</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleTheme}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
           
              <button
                type="button"
                onClick={handleDownloadSqlWorkbench}
                disabled={downloadingWorkbench}
                className="inline-flex h-8 items-center justify-center rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                aria-label="Download scripts"
              >
                <FileText className="h-3 w-3 mr-1" />
                <span>Script</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </header>
        )}
        {showSidebar && (
          <header className="flex h-14 shrink-0 items-center border-b border-border bg-card/50 px-4 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </header>
        )}
        <div className="flex-1 px-4 py-4 sm:px-6 sm:py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
