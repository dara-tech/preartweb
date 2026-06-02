import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { LogOut, Moon, Sun, Maximize2, Minimize2, FileText, Menu, Search, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'
import Sidebar from './Sidebar'
import AppPageShell from './AppPageShell'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const getPageTitle = (pathname) => {
  if (pathname === '/dashboard') return 'Dashboard'
  if (pathname.startsWith('/patients/adult')) return 'Adult Patients'
  if (pathname.startsWith('/patients/child')) return 'Child Patients'
  if (pathname.startsWith('/patients/infant')) return 'Infant Patients'
  if (pathname === '/patients') return 'Patients'
  if (pathname.startsWith('/visits/adult')) return 'Adult Visits'
  if (pathname.startsWith('/visits/child')) return 'Child Visits'
  if (pathname.startsWith('/visits/infant')) return 'Infant Visits'
  if (pathname === '/import-data') return 'Import & Export'
  if (pathname === '/role-management') return 'User Management'
  if (pathname === '/lab-tests') return 'Lab Tests'
  if (pathname === '/patient-tests') return 'Patient Tests'
  if (pathname === '/infant-tests') return 'Infant Tests'
  if (pathname === '/indicators' || pathname === '/reports/adult-child') return 'Adult & Child Report'
  if (pathname === '/infant-report' || pathname === '/reports/infants') return 'Infants Report'
  if (pathname === '/reports/pntt') return 'PNTT Report'
  if (pathname === '/mortality-retention-indicators') return 'Mortality & Retention'
  if (pathname === '/cqi-dashboard') return 'CQI Dashboard'
  if (pathname === '/cqi-comparison') return 'CQI Comparison'
  if (pathname === '/idpoor-duplicated-artid') return 'ID Poor & Duplicated ART ID'
  if (pathname === '/analytics-admin') return 'Analytics Admin'
  if (pathname === '/indicator-management') return 'Indicator Management'
  if (pathname === '/query-editor-admin') return 'Query Editor'
  if (pathname === '/indicators/dashboard') return 'Visualization'
  return 'PreART'
}

export default function MainLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const [theme, setTheme] = useState('light')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [downloadingWorkbench, setDownloadingWorkbench] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const isAnalyticsAdmin = location.pathname.startsWith('/analytics-admin')
  const isUserManagement = location.pathname.startsWith('/role-management')

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
    <div className="flex h-screen w-screen overflow-hidden bg-card font-poppins">
      {/* Professional Sidebar Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden bg-background">
        {/* Top Header Panel */}
        <header className="flex h-10 shrink-0 items-center justify-between border-b border-border/80 bg-card px-2 sm:px-3 z-30">
          <div className="flex items-center gap-2 min-w-0">
            {/* Hamburger menu for mobile viewports */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <span className="text-[11px] font-semibold text-foreground truncate">
              {getPageTitle(location.pathname)}
            </span>
          </div>

          {/* Context-Specific Dynamic Filters & Controls */}
          <div className="hidden md:flex flex-1 items-center justify-center px-4 max-w-4xl gap-2">
            {isAnalyticsAdmin && (
              <div className="flex w-full items-center gap-1.5 justify-end">
                <Select
                  value={searchParams.get('view') || 'data'}
                  onValueChange={(value) => {
                    const next = new URLSearchParams(searchParams)
                    if (value === 'data') next.delete('view')
                    else next.set('view', value)
                    setSearchParams(next, { replace: true })
                  }}
                >
                  <SelectTrigger className="h-7 w-[120px] border-border/80 bg-background text-[10px]">
                    <SelectValue placeholder="Analytics Data" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data">Analytics Data</SelectItem>
                    <SelectItem value="yearly">Yearly Analytics</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative min-w-[150px] max-w-[200px] flex-1">
                  <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchParams.get('indicator') || ''}
                    onChange={(e) => {
                      const next = new URLSearchParams(searchParams)
                      const v = e.target.value
                      if (v) next.set('indicator', v)
                      else next.delete('indicator')
                      setSearchParams(next, { replace: true })
                    }}
                    placeholder="Indicator ID..."
                    className="h-7 border-border/80 bg-background pl-7 text-[10px]"
                  />
                </div>
                <Input
                  value={searchParams.get('site') || ''}
                  onChange={(e) => {
                    const next = new URLSearchParams(searchParams)
                    const v = e.target.value
                    if (v) next.set('site', v)
                    else next.delete('site')
                    setSearchParams(next, { replace: true })
                  }}
                  placeholder="Site code..."
                  className="h-7 w-[80px] border-border/80 bg-background text-[10px]"
                />
                <Select
                  value={searchParams.get('year') || 'all'}
                  onValueChange={(value) => {
                    const next = new URLSearchParams(searchParams)
                    if (value === 'all') next.delete('year')
                    else next.set('year', value)
                    setSearchParams(next, { replace: true })
                  }}
                >
                  <SelectTrigger className="h-7 w-[90px] border-border/80 bg-background text-[10px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={searchParams.get('quarter') || 'all'}
                  onValueChange={(value) => {
                    const next = new URLSearchParams(searchParams)
                    if (value === 'all') next.delete('quarter')
                    else next.set('quarter', value)
                    setSearchParams(next, { replace: true })
                  }}
                >
                  <SelectTrigger className="h-7 w-[80px] border-border/80 bg-background text-[10px]">
                    <SelectValue placeholder="Quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="1">Q1</SelectItem>
                    <SelectItem value="2">Q2</SelectItem>
                    <SelectItem value="3">Q3</SelectItem>
                    <SelectItem value="4">Q4</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('analytics-apply-filters'))
                    }
                  }}
                  className="inline-flex h-7 items-center justify-center bg-primary px-3 text-[10px] font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Apply
                </button>
              </div>
            )}

            {isUserManagement && (
              <div className="flex w-full items-center gap-1.5 justify-end">
                <div className="flex items-center">
                  <span className="inline-flex h-6 w-6 items-center justify-center border border-border/80 bg-muted/20">
                    <Shield className="h-3 w-3 text-primary" />
                  </span>
                </div>
                <div className="relative min-w-[150px] max-w-[240px] flex-1">
                  <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchParams.get('q') || ''}
                    onChange={(e) => {
                      const next = new URLSearchParams(searchParams)
                      const v = e.target.value
                      if (v) next.set('q', v)
                      else next.delete('q')
                      setSearchParams(next, { replace: true })
                    }}
                    placeholder="Search username, name..."
                    className="h-7 border-border/80 bg-background pl-7 text-[10px]"
                  />
                </div>
                <Select
                  value={searchParams.get('role') || 'all'}
                  onValueChange={(value) => {
                    const next = new URLSearchParams(searchParams)
                    if (value === 'all') next.delete('role')
                    else next.set('role', value)
                    setSearchParams(next, { replace: true })
                  }}
                >
                  <SelectTrigger className="h-7 w-[100px] border-border/80 bg-background text-[10px]">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="data_manager">Data Manager</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={searchParams.get('status') || 'all'}
                  onValueChange={(value) => {
                    const next = new URLSearchParams(searchParams)
                    if (value === 'all') next.delete('status')
                    else next.set('status', value)
                    setSearchParams(next, { replace: true })
                  }}
                >
                  <SelectTrigger className="h-7 w-[100px] border-border/80 bg-background text-[10px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('open-create-user'))
                    }
                  }}
                  className="inline-flex h-7 items-center justify-center bg-primary px-3 text-[10px] font-medium text-primary-foreground hover:bg-primary/90"
                >
                  + Create User
                </button>
              </div>
            )}
          </div>

          {/* Global Utility Controls (Theme, Fullscreen, Scripts) */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleToggleTheme}
              className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={handleDownloadSqlWorkbench}
              disabled={downloadingWorkbench}
              className="inline-flex h-8 items-center justify-center px-2 text-[10px] font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              aria-label="Download scripts"
            >
              <FileText className="mr-1 h-3.5 w-3.5" />
              <span className="hidden sm:inline">Script</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-8 items-center justify-center px-2 text-[10px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="Log out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        {/* Scrollable Layout Content Viewport */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <AppPageShell wide>
            <Outlet />
          </AppPageShell>
        </div>
      </div>
    </div>
  )
}
