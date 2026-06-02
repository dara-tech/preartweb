import { NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogOut, Moon, Sun, Maximize2, Minimize2, FileText, Search, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const mainNavItemClass = ({ isActive }) =>
  cn(
    'inline-flex h-9 min-h-9 items-center gap-1 border border-transparent px-2.5 text-[11px] font-medium leading-none transition-colors',
    isActive ? 'border-primary/30 bg-sidebar-active text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
  )

const subNavItemClass = ({ isActive }) =>
  cn(
    'inline-flex h-9 min-h-9 items-center gap-1 border border-transparent px-2.5 text-[11px] font-medium leading-none transition-colors',
    isActive ? 'border-border bg-muted text-foreground font-medium' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
  )

export default function TopNavbar({
  theme,
  onToggleTheme,
  isFullscreen,
  onToggleFullscreen,
  onDownloadSqlWorkbench,
  downloadingWorkbench,
}) {
  const { t } = useTranslation()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin'
  const isDataManager = user?.role === 'data_manager'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const isReports = location.pathname.startsWith('/reports')
  const isAnalyticsAdmin = location.pathname.startsWith('/analytics-admin')
  const isUserManagement = location.pathname.startsWith('/role-management')
  const mainSection = isReports
    ? 'reports'
    : isAnalyticsAdmin
      ? 'analytics-admin'
      : isUserManagement
        ? 'users'
        : 'home'

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-card">
      <header className="flex h-9 items-center px-2 py-1 sm:px-3">
        <NavLink
          to="/dashboard"
          className="mr-1 inline-flex h-9 min-h-9 items-center px-2 text-[11px] font-semibold leading-none tracking-tight text-foreground"
        >
          PreART
        </NavLink>

        <div className="mr-1 h-4 w-px bg-border" />

        <nav className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
          <NavLink to="/dashboard" end className={mainNavItemClass}>
            Home
          </NavLink>
          <NavLink to="/reports/adult-child" className={() => mainNavItemClass({ isActive: mainSection === 'reports' })}>
            Reports
          </NavLink>
          {isAdmin && (
            <>
              <NavLink to="/analytics-admin" className={() => mainNavItemClass({ isActive: mainSection === 'analytics-admin' })}>
                Analytics Admin
              </NavLink>
              <NavLink to="/role-management" className={() => mainNavItemClass({ isActive: mainSection === 'users' })}>
                User
              </NavLink>
            </>
          )}
        </nav>

        <div className="ml-2 flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="inline-flex h-9 w-9 items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onDownloadSqlWorkbench}
            disabled={downloadingWorkbench}
            className="inline-flex h-9 min-h-9 items-center justify-center px-2.5 text-[11px] font-medium leading-none text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            aria-label="Download scripts"
          >
            <FileText className="mr-1 h-3 w-3" />
            Script
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-9 min-h-9 items-center gap-1 px-2.5 text-[11px] font-medium leading-none text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </div>
      </header>

      <div className="flex h-9 items-center border-t border-border/60 px-2 py-1 sm:px-3">
        <nav className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
          {mainSection === 'home' && (
            <>
              <NavLink to="/dashboard" end className={subNavItemClass}>
                {t('nav.dashboard')}
              </NavLink>
              <NavLink to="/import-data" className={subNavItemClass}>
                {t('nav.importExport')}
              </NavLink>
              {!isDataManager && (
                <>
                  <NavLink to="/lab-tests" className={subNavItemClass}>
                    {t('nav.labTests')}
                  </NavLink>
                  <NavLink to="/patient-tests" className={subNavItemClass}>
                    {t('nav.patientTests')}
                  </NavLink>
                  <NavLink to="/infant-tests" className={subNavItemClass}>
                    {t('nav.infantTests')}
                  </NavLink>
                </>
              )}
            </>
          )}

          {mainSection === 'reports' && (
            <>
              <NavLink to="/reports/adult-child" className={subNavItemClass}>
                Adult/Child
              </NavLink>
              <NavLink to="/reports/infants" className={subNavItemClass}>
                Infants
              </NavLink>
              <NavLink to="/reports/pntt" className={subNavItemClass}>
                PNTT
              </NavLink>
            </>
          )}

          {mainSection === 'analytics-admin' && (
            <div className="flex w-full items-center gap-2">
              <Select
                value={searchParams.get('view') || 'data'}
                onValueChange={(value) => {
                  const next = new URLSearchParams(searchParams)
                  if (value === 'data') next.delete('view')
                  else next.set('view', value)
                  setSearchParams(next, { replace: true })
                }}
              >
                <SelectTrigger className="h-8 w-[160px] border-border/80 bg-background text-xs">
                  <SelectValue placeholder="Analytics Data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data">Analytics Data</SelectItem>
                  <SelectItem value="yearly">Yearly Analytics</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative min-w-[220px] flex-1">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
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
                  className="h-8 border-border/80 bg-background pl-8 text-xs"
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
                className="h-8 w-[140px] border-border/80 bg-background text-xs"
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
                <SelectTrigger className="h-8 w-[120px] border-border/80 bg-background text-xs">
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
                <SelectTrigger className="h-8 w-[110px] border-border/80 bg-background text-xs">
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
                className="inline-flex h-8 items-center justify-center bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Apply
              </button>
            </div>
          )}

          {mainSection === 'users' && (
            <div className="flex w-full items-center gap-1.5">
              <div className="flex items-center">
                <span className="inline-flex h-6 w-6 items-center justify-center border border-border/80 bg-muted/20">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                </span>
              </div>
              <div className="relative min-w-[220px] flex-1">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchParams.get('q') || ''}
                  onChange={(e) => {
                    const next = new URLSearchParams(searchParams)
                    const v = e.target.value
                    if (v) next.set('q', v)
                    else next.delete('q')
                    setSearchParams(next, { replace: true })
                  }}
                  placeholder="Search username, name, email..."
                  className="h-8 border-border/80 bg-background pl-8 text-xs"
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
                <SelectTrigger className="h-8 w-[140px] border-border/80 bg-background text-xs">
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
                <SelectTrigger className="h-8 w-[140px] border-border/80 bg-background text-xs">
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
                className="inline-flex h-8 items-center justify-center bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                + Create User
              </button>
            </div>
          )}

        </nav>
      </div>
    </div>
  )
}
