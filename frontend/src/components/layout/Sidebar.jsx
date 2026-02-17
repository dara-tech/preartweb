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
  'flex items-center gap-3 rounded-md py-2 text-[13px] font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset';

const linkClass = (collapsed, isActive) =>
  cn(
    linkBase,
    collapsed ? 'justify-center px-0' : 'pl-3 pr-2',
    isActive
      ? 'bg-primary/5 text-primary dark:bg-primary/10'
      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
  );

const submenuItemClass = (isActive) =>
  cn(
    'flex items-center gap-2.5 rounded-md py-1.5 pl-9 pr-2 text-[13px] font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
    isActive
      ? 'bg-primary/5 text-primary dark:bg-primary/10'
      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
  );

const SubmenuDot = ({ isActive }) => (
  <span className={cn('h-1 w-1 shrink-0 rounded-full', isActive ? 'bg-primary' : 'bg-muted-foreground/40')} aria-hidden />
);

function NavSection({ label, collapsed, children, showDivider }) {
  if (collapsed) return <>{children}</>;
  return (
    <div className={cn('flex flex-col', showDivider && 'border-t border-border pt-3 mt-1')}>
      {label && (
        <p className="mb-1.5 px-3 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/60">
          {label}
        </p>
      )}
      <div className="flex flex-col gap-0.5">{children}</div>
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
    ['/analytics', '/indicators', '/infant-report', '/mortality-retention-indicators', '/analytics-admin', '/indicator-management', '/query-editor-admin', '/indicators/dashboard'].some((p) => location.pathname.startsWith(p) || location.pathname === p)
  );
  const [adultOpen, setAdultOpen] = useState(() => location.pathname.startsWith('/patients/adult') || location.pathname.startsWith('/visits/adult'));
  const [childOpen, setChildOpen] = useState(() => location.pathname.startsWith('/patients/child') || location.pathname.startsWith('/visits/child'));
  const [infantOpen, setInfantOpen] = useState(() => location.pathname.startsWith('/patients/infant') || location.pathname.startsWith('/visits/infant'));

  const isViewer = user?.role === 'viewer';
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  const isDataManager = user?.role === 'data_manager';
  const isReportsActive = location.pathname.startsWith('/reports');
  const isReportActive = ['/indicators', '/infant-report', '/mortality-retention-indicators', '/analytics-admin', '/indicator-management', '/query-editor-admin', '/indicators/dashboard'].some(
    (p) => location.pathname === p || location.pathname.startsWith(p)
  );

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (loading || !user) return null;
  if (isViewer) return null;

  const groupClass = (isActive) =>
    cn(
      linkBase,
      'w-full text-left',
      isCollapsed ? 'justify-center px-0' : 'pl-3 pr-2',
      isActive
        ? 'bg-primary/5 text-primary dark:bg-primary/10'
        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
    );

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-border bg-card transition-[width,transform] duration-200 ease-out lg:static lg:inset-auto',
          isMobileOpen ? 'translate-x-0 w-60' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'lg:w-16' : 'lg:w-60'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex h-14 shrink-0 items-center border-b border-border px-3',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-card text-sm font-semibold">
                P
              </div>
              <span className="text-sm font-semibold text-foreground">PreART</span>
            </div>
          )}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setIsCollapsed((c) => !c)}
              className="hidden rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 lg:block"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-2 py-3">
          {/* label={!isCollapsed ? 'Main' : null} - commented out */}
          <NavSection label={null} collapsed={isCollapsed} showDivider={false}>
            {!isDataManager && (
              <NavLink to="/dashboard" className={({ isActive }) => linkClass(isCollapsed, isActive)} title={isCollapsed ? t('nav.dashboard') : undefined}>
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{t('nav.dashboard')}</span>}
              </NavLink>
            )}
            {!isDataManager && (
              <NavLink to="/patients" className={({ isActive }) => linkClass(isCollapsed, isActive)} title={isCollapsed ? t('nav.patientList') : undefined}>
                <Users className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{t('nav.patientList')}</span>}
              </NavLink>
            )}

            {!isDataManager &&
              (isCollapsed ? (
                <NavLink to="/patients/adult" className={({ isActive }) => linkClass(true, isActive)} title={t('nav.adultPatients')}>
                  <User className="h-4 w-4 shrink-0" />
                </NavLink>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setAdultOpen((o) => !o)}
                    className={groupClass(location.pathname.startsWith('/patients/adult') || location.pathname.startsWith('/visits/adult'))}
                  >
                    <User className="h-4 w-4 shrink-0" />
                    <span className="truncate">{t('nav.adultPatients')}</span>
                    {adultOpen ? <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                  </button>
                  {adultOpen && (
                    <div className="flex flex-col gap-0.5">
                      <NavLink to="/patients/adult" className={({ isActive }) => submenuItemClass(isActive)}>
                        {({ isActive }) => (
                          <>
                            <SubmenuDot isActive={isActive} />
                            <span className="truncate">{t('patients.personalInfo')}</span>
                          </>
                        )}
                      </NavLink>
                      <NavLink to="/visits/adult" className={({ isActive }) => submenuItemClass(isActive)}>
                        {({ isActive }) => (
                          <>
                            <SubmenuDot isActive={isActive} />
                            <span className="truncate">{t('nav.visits')}</span>
                          </>
                        )}
                      </NavLink>
                    </div>
                  )}
                </>
              ))}

            {!isDataManager &&
              (isCollapsed ? (
                <NavLink to="/patients/child" className={({ isActive }) => linkClass(true, isActive)} title={t('nav.childPatients')}>
                  <Heart className="h-4 w-4 shrink-0" />
                </NavLink>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setChildOpen((o) => !o)}
                    className={groupClass(location.pathname.startsWith('/patients/child') || location.pathname.startsWith('/visits/child'))}
                  >
                    <Heart className="h-4 w-4 shrink-0" />
                    <span className="truncate">{t('nav.childPatients')}</span>
                    {childOpen ? <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                  </button>
                  {childOpen && (
                    <div className="flex flex-col gap-0.5">
                      <NavLink to="/patients/child" className={({ isActive }) => submenuItemClass(isActive)}>
                        {({ isActive }) => (
                          <>
                            <SubmenuDot isActive={isActive} />
                            <span className="truncate">{t('patients.personalInfo')}</span>
                          </>
                        )}
                      </NavLink>
                      <NavLink to="/visits/child" className={({ isActive }) => submenuItemClass(isActive)}>
                        {({ isActive }) => (
                          <>
                            <SubmenuDot isActive={isActive} />
                            <span className="truncate">{t('nav.visits')}</span>
                          </>
                        )}
                      </NavLink>
                    </div>
                  )}
                </>
              ))}

            {!isDataManager &&
              (isCollapsed ? (
                <NavLink to="/patients/infant" className={({ isActive }) => linkClass(true, isActive)} title={t('nav.infantPatients')}>
                  <Baby className="h-4 w-4 shrink-0" />
                </NavLink>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setInfantOpen((o) => !o)}
                    className={groupClass(location.pathname.startsWith('/patients/infant') || location.pathname.startsWith('/visits/infant'))}
                  >
                    <Baby className="h-4 w-4 shrink-0" />
                    <span className="truncate">{t('nav.infantPatients')}</span>
                    {infantOpen ? <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                  </button>
                  {infantOpen && (
                    <div className="flex flex-col gap-0.5">
                      <NavLink to="/patients/infant" className={({ isActive }) => submenuItemClass(isActive)}>
                        {({ isActive }) => (
                          <>
                            <SubmenuDot isActive={isActive} />
                            <span className="truncate">{t('patients.personalInfo')}</span>
                          </>
                        )}
                      </NavLink>
                      <NavLink to="/visits/infant" className={({ isActive }) => submenuItemClass(isActive)}>
                        {({ isActive }) => (
                          <>
                            <SubmenuDot isActive={isActive} />
                            <span className="truncate">{t('nav.visits')}</span>
                          </>
                        )}
                      </NavLink>
                    </div>
                  )}
                </>
              ))}

            <NavLink to="/import-data" className={({ isActive }) => linkClass(isCollapsed, isActive)} title={isCollapsed ? t('nav.importExport') : undefined}>
              <Upload className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span className="truncate">{t('nav.importExport')}</span>}
            </NavLink>

            {!isDataManager && (
              <>
                <NavLink to="/lab-tests" className={({ isActive }) => linkClass(isCollapsed, isActive)} title={isCollapsed ? t('nav.labTests') : undefined}>
                  <FlaskConical className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{t('nav.labTests')}</span>}
                </NavLink>
                <NavLink to="/patient-tests" className={({ isActive }) => linkClass(isCollapsed, isActive)} title={isCollapsed ? t('nav.patientTests') : undefined}>
                  <Activity className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{t('nav.patientTests')}</span>}
                </NavLink>
                <NavLink to="/infant-tests" className={({ isActive }) => linkClass(isCollapsed, isActive)} title={isCollapsed ? t('nav.infantTests') : undefined}>
                  <Baby className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{t('nav.infantTests')}</span>}
                </NavLink>
              </>
            )}

            {isAdmin && (
              <NavLink to="/role-management" className={({ isActive }) => linkClass(isCollapsed, isActive)} title={isCollapsed ? t('nav.administration') : undefined}>
                <Shield className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{t('nav.administration')}</span>}
              </NavLink>
            )}
          </NavSection>

          <NavSection label={!isCollapsed ? 'Reports' : null} collapsed={isCollapsed} showDivider>
            {isCollapsed ? (
              <NavLink to="/reports/adult-child" className={({ isActive }) => linkClass(true, isActive)} title="Report">
                <FileText className="h-4 w-4 shrink-0" />
              </NavLink>
            ) : (
              <>
                <button type="button" onClick={() => setReportsMenuOpen((o) => !o)} className={groupClass(isReportsActive)}>
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">Report</span>
                  {reportsMenuOpen ? <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                </button>
                {reportsMenuOpen && (
                  <div className="flex flex-col gap-0.5">
                    <NavLink to="/reports/adult-child" className={({ isActive }) => submenuItemClass(isActive)}>
                      {({ isActive }) => (
                        <>
                          <SubmenuDot isActive={isActive} />
                          <span className="truncate">Adult and Child</span>
                        </>
                      )}
                    </NavLink>
                    <NavLink to="/reports/infants" className={({ isActive }) => submenuItemClass(isActive)}>
                      {({ isActive }) => (
                        <>
                          <SubmenuDot isActive={isActive} />
                          <span className="truncate">Infants</span>
                        </>
                      )}
                    </NavLink>
                    <NavLink to="/reports/pntt" className={({ isActive }) => submenuItemClass(isActive)}>
                      {({ isActive }) => (
                        <>
                          <SubmenuDot isActive={isActive} />
                          <span className="truncate">PNTT</span>
                        </>
                      )}
                    </NavLink>
                  </div>
                )}
              </>
            )}
          </NavSection>

          <NavSection label={!isCollapsed ? 'Analytics' : null} collapsed={isCollapsed} showDivider>
            {isCollapsed ? (
              <NavLink to="/indicators" className={({ isActive }) => linkClass(true, isActive)} title={t('nav.analytics')}>
                <BarChart2 className="h-4 w-4 shrink-0" />
              </NavLink>
            ) : (
              <>
                <button type="button" onClick={() => setReportOpen((o) => !o)} className={groupClass(isReportActive)}>
                  <BarChart2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t('nav.analytics')}</span>
                  {reportOpen ? <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                </button>
                {reportOpen && (
                  <div className="flex flex-col gap-0.5">
                    <NavLink to="/indicators" className={({ isActive }) => submenuItemClass(isActive)}>
                      {({ isActive }) => (
                        <>
                          <SubmenuDot isActive={isActive} />
                          <span className="truncate">{t('nav.indicators')}</span>
                        </>
                      )}
                    </NavLink>
                    <NavLink to="/infant-report" className={({ isActive }) => submenuItemClass(isActive)}>
                      {({ isActive }) => (
                        <>
                          <SubmenuDot isActive={isActive} />
                          <span className="truncate">Infant Report</span>
                        </>
                      )}
                    </NavLink>
                    <NavLink to="/mortality-retention-indicators" className={({ isActive }) => submenuItemClass(isActive)}>
                      {({ isActive }) => (
                        <>
                          <SubmenuDot isActive={isActive} />
                          <span className="truncate">{t('nav.mortalityRetention')}</span>
                        </>
                      )}
                    </NavLink>
                    {isAdmin && (
                      <>
                        <NavLink to="/analytics-admin" className={({ isActive }) => submenuItemClass(isActive)}>
                          {({ isActive }) => (
                            <>
                              <SubmenuDot isActive={isActive} />
                              <span className="truncate">{t('nav.administration')}</span>
                            </>
                          )}
                        </NavLink>
                        <NavLink to="/indicator-management" className={({ isActive }) => submenuItemClass(isActive)}>
                          {({ isActive }) => (
                            <>
                              <SubmenuDot isActive={isActive} />
                              <span className="truncate">{t('nav.indicatorManagement')}</span>
                            </>
                          )}
                        </NavLink>
                        <NavLink to="/query-editor-admin" className={({ isActive }) => submenuItemClass(isActive)}>
                          {({ isActive }) => (
                            <>
                              <SubmenuDot isActive={isActive} />
                              <span className="truncate">{t('nav.queryEditor')}</span>
                            </>
                          )}
                        </NavLink>
                      </>
                    )}
                    {!isDataManager && (
                      <NavLink to="/indicators/dashboard" className={({ isActive }) => submenuItemClass(isActive)}>
                        {({ isActive }) => (
                          <>
                            <SubmenuDot isActive={isActive} />
                            <span className="truncate">Visualization</span>
                          </>
                        )}
                      </NavLink>
                    )}
                  </div>
                )}
              </>
            )}
          </NavSection>

          <div className="mt-auto border-t border-border pt-3">
            <button
              type="button"
              onClick={handleLogout}
              title={isCollapsed ? 'Log out' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-md py-2 text-[13px] font-medium text-muted-foreground outline-none transition-colors hover:bg-destructive/5 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                isCollapsed ? 'justify-center px-0' : 'pl-3 pr-2'
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span className="truncate">Log out</span>}
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
