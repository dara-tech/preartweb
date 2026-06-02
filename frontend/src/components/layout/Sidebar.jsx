import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  User,
  Heart,
  Baby,
  Upload,
  BarChart2,
  Shield,
  FlaskConical,
  Activity,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  ChevronRight,
  X,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const linkBase =
  'flex items-center gap-2.5 rounded-none py-1.5 text-[12px] transition-colors duration-100 outline-none focus-visible:ring-1 focus-visible:ring-ring';

const navActive = 'border-primary bg-sidebar-active text-primary font-medium';
const navIdle =
  'border-transparent text-sidebar-foreground/75 hover:bg-sidebar-active/60 hover:text-sidebar-foreground';

const linkClass = (collapsed, isActive) =>
  cn(
    linkBase,
    collapsed ? 'justify-center border-l-0 px-0' : 'border-l-[3px] pl-[9px] pr-2',
    isActive ? (collapsed ? 'bg-sidebar-active text-primary' : navActive) : navIdle
  );

const submenuItemClass = (isActive) =>
  cn(
    'flex items-center gap-2 rounded-none py-1 pr-2 pl-3 ml-[18px] border-l border-sidebar-border text-[12px] transition-colors duration-100',
    isActive
      ? 'border-l-primary bg-sidebar-active/80 font-medium text-primary'
      : 'text-muted-foreground hover:bg-sidebar-active/50 hover:text-sidebar-foreground'
  );

const groupClass = (collapsed, isActive) =>
  cn(
    linkBase,
    'w-full text-left',
    collapsed ? 'justify-center border-l-0 px-0' : 'border-l-[3px] pl-[9px] pr-2',
    isActive ? (collapsed ? 'bg-sidebar-active text-primary' : navActive) : navIdle
  );

function NavSection({ label, collapsed, children, showDivider }) {
  if (collapsed) return <>{children}</>;
  return (
    <div className={cn('flex flex-col', showDivider && 'mt-2 border-t border-sidebar-border pt-2')}>
      {label && (
        <p className="mb-1 px-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      )}
      <div className="flex flex-col gap-px">{children}</div>
    </div>
  );
}

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading } = useAuth();
  const [reportsMenuOpen, setReportsMenuOpen] = useState(() => location.pathname.startsWith('/reports'));
  const [reportOpen, setReportOpen] = useState(() =>
    ['/analytics', '/indicators', '/infant-report', '/mortality-retention-indicators', '/analytics-admin', '/indicator-management', '/query-editor-admin', '/indicators/dashboard', '/cqi-dashboard', '/cqi-comparison', '/idpoor-duplicated-artid'].some((p) => location.pathname.startsWith(p) || location.pathname === p)
  );
  const [adultOpen, setAdultOpen] = useState(() => location.pathname.startsWith('/patients/adult') || location.pathname.startsWith('/visits/adult'));
  const [childOpen, setChildOpen] = useState(() => location.pathname.startsWith('/patients/child') || location.pathname.startsWith('/visits/child'));
  const [infantOpen, setInfantOpen] = useState(() => location.pathname.startsWith('/patients/infant') || location.pathname.startsWith('/visits/infant'));

  const isViewer = user?.role === 'viewer';
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  const isDataManager = user?.role === 'data_manager';
  const isReportsActive = location.pathname.startsWith('/reports');
  const isReportActive = ['/indicators', '/infant-report', '/mortality-retention-indicators', '/analytics-admin', '/indicator-management', '/query-editor-admin', '/indicators/dashboard', '/cqi-dashboard', '/cqi-comparison', '/idpoor-duplicated-artid'].some(
    (p) => location.pathname === p || location.pathname.startsWith(p)
  );

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (loading || !user) return null;

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/35 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-[width,transform] duration-200 ease-out lg:static lg:inset-auto',
          isMobileOpen ? 'w-[208px] translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'lg:w-14' : 'lg:w-[208px]'
        )}
      >
        <div
          className={cn(
            'flex h-8 shrink-0 items-center border-b border-sidebar-border bg-sidebar',
            isCollapsed ? 'justify-center px-0' : 'justify-between px-3'
          )}
        >
          {!isCollapsed && (
            <div className="flex min-w-0 items-center gap-1.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-primary text-[10px] font-semibold text-primary-foreground">
                P
              </div>
              <span className="block truncate text-[12px] font-medium tracking-tight text-sidebar-foreground">PreART</span>
            </div>
          )}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setIsCollapsed((c) => !c)}
              className="hidden rounded-none p-1 text-muted-foreground hover:bg-sidebar-active hover:text-foreground lg:inline-flex"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="rounded-none p-1 text-muted-foreground hover:bg-sidebar-active hover:text-foreground lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav flex flex-1 flex-col overflow-y-auto overflow-x-hidden py-1.5">
          <NavSection label={!isCollapsed ? 'Reports' : null} collapsed={isCollapsed} showDivider={false}>
            {isCollapsed ? (
              <NavLink to="/reports/adult-child" className={({ isActive }) => linkClass(true, isActive)} title="Report">
                <FileText className="h-4 w-4 shrink-0 opacity-80" />
              </NavLink>
            ) : (
              <>
                <button type="button" onClick={() => setReportsMenuOpen((o) => !o)} className={groupClass(isCollapsed, isReportsActive)}>
                  <FileText className="h-4 w-4 shrink-0 opacity-80" />
                  <span className="truncate">Report</span>
                  {reportsMenuOpen ? <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 opacity-50" /> : <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 opacity-50" />}
                </button>
                {reportsMenuOpen && (
                  <div className="flex flex-col gap-px">
                    <NavLink to="/reports/adult-child" className={({ isActive }) => submenuItemClass(isActive)}>
                      <span className="truncate">Adult and Child</span>
                    </NavLink>
                    <NavLink to="/reports/infants" className={({ isActive }) => submenuItemClass(isActive)}>
                      <span className="truncate">Infants</span>
                    </NavLink>
                    <NavLink to="/reports/pntt" className={({ isActive }) => submenuItemClass(isActive)}>
                      <span className="truncate">PNTT</span>
                    </NavLink>
                    <NavLink to="/reports/country-analytics" className={({ isActive }) => submenuItemClass(isActive)}>
                      <span className="truncate">Country Analytics</span>
                    </NavLink>
                  </div>
                )}
              </>
            )}
          </NavSection>

          {isAdmin && (
            <NavSection label={!isCollapsed ? 'Management' : null} collapsed={isCollapsed} showDivider>
              <NavLink to="/analytics-admin" className={({ isActive }) => linkClass(isCollapsed, isActive)} title={isCollapsed ? 'Analytic Admin' : undefined}>
                <BarChart2 className="h-4 w-4 shrink-0 opacity-80" />
                {!isCollapsed && <span className="truncate">Analytic Admin</span>}
              </NavLink>
              <NavLink to="/role-management" className={({ isActive }) => linkClass(isCollapsed, isActive)} title={isCollapsed ? 'User' : undefined}>
                <Shield className="h-4 w-4 shrink-0 opacity-80" />
                {!isCollapsed && <span className="truncate">User</span>}
              </NavLink>
            </NavSection>
          )}

          <div className="mt-auto border-t border-sidebar-border p-2">
            {!isCollapsed && (
              <div className="mb-2 px-2 py-1 bg-muted/40 border border-border/30 text-[11px]">
                <div className="font-semibold text-foreground truncate">{user?.username}</div>
                <div className="text-[9px] font-medium text-muted-foreground truncate uppercase tracking-wider mt-0.5">{user?.role?.replace('_', ' ')}</div>
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              title={isCollapsed ? `Log out (${user?.username})` : undefined}
              className={cn(
                linkBase,
                'w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
                isCollapsed ? 'justify-center border-l-0 px-0' : 'border-l-[3px] border-transparent pl-[9px] pr-2'
              )}
            >
              <LogOut className="h-4 w-4 shrink-0 opacity-80" />
              {!isCollapsed && <span className="truncate">Log out</span>}
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
