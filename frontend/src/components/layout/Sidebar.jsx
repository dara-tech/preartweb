import React, { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from '../../contexts/AuthContext'

const IconBase = ({ children, className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

const IconDashboard = ({ className }) => (
  <IconBase className={className}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="11" width="7" height="10" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </IconBase>
)

const IconPeople = ({ className }) => (
  <IconBase className={className}>
    <circle cx="8" cy="8" r="3" />
    <circle cx="16" cy="10" r="3" />
    <path d="M4 19c0-2.5 2-4.5 4-4.5h0" />
    <path d="M12 21c0-2.8 1.8-5 4.5-5H17" />
  </IconBase>
)

const IconPerson = ({ className }) => (
  <IconBase className={className}>
    <circle cx="12" cy="7.5" r="3.5" />
    <path d="M5 20.5c1.7-4.2 4.3-6.5 7-6.5s5.3 2.3 7 6.5" />
  </IconBase>
)

const IconChildCare = ({ className }) => (
  <IconBase className={className}>
    <circle cx="12" cy="9" r="3" />
    <path d="M6 21c1.2-3.5 3.6-5.5 6-5.5s4.8 2 6 5.5" />
    <path d="M5 9a7 7 0 0 1 14 0" />
  </IconBase>
)

const IconFavorite = ({ className }) => (
  <IconBase className={className}>
    <path d="M12 20.5 6.5 16A5 5 0 0 1 6 8.5a4.2 4.2 0 0 1 6-0.4 4.2 4.2 0 0 1 6 0.4A5 5 0 0 1 17.5 16Z" />
  </IconBase>
)

const IconLogout = ({ className }) => (
  <IconBase className={className}>
    <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </IconBase>
)

const IconChevronLeft = ({ className = "w-4 h-4" }) => (
  <IconBase className={className}>
    <path d="M15 4 8 12l7 8" />
  </IconBase>
)

const IconChevronRight = ({ className = "w-4 h-4" }) => (
  <IconBase className={className}>
    <path d="M9 4l7 8-7 8" />
  </IconBase>
)

const IconClose = ({ className = "w-4 h-4" }) => (
  <IconBase className={className}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </IconBase>
)

const IconExpandLess = ({ className = "w-4 h-4" }) => (
  <IconBase className={className}>
    <polyline points="6 14 12 8 18 14" />
  </IconBase>
)

const IconExpandMore = ({ className = "w-4 h-4" }) => (
  <IconBase className={className}>
    <polyline points="6 10 12 16 18 10" />
  </IconBase>
)

const IconUpload = ({ className }) => (
  <IconBase className={className}>
    <path d="M12 3v12" />
    <path d="m7 8 5-5 5 5" />
    <path d="M4 16v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2" />
  </IconBase>
)

const IconBarChart = ({ className }) => (
  <IconBase className={className}>
    <path d="M4 21V10" />
    <path d="M10 21V3" />
    <path d="M16 21v-6" />
    <path d="M22 21v-12" />
  </IconBase>
)

const IconAssessment = ({ className }) => (
  <IconBase className={className}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M8 4v-.5a2.5 2.5 0 0 1 5 0V4" />
    <path d="M8 12h8" />
    <path d="M8 16h5" />
    <path d="M8 8h8" />
  </IconBase>
)

const IconSecurity = ({ className }) => (
  <IconBase className={className}>
    <path d="M12 3 4 6v5c0 5.25 3.35 10.2 8 11 4.65-.8 8-5.75 8-11V6Z" />
    <path d="M12 11v4" />
    <path d="M12 8h0" />
  </IconBase>
)

const IconBiotech = ({ className }) => (
  <IconBase className={className}>
    <path d="M7 3h10" />
    <path d="M9 3v12a3 3 0 0 0 6 0V3" />
    <path d="M5 9h4" />
    <path d="M15 9h4" />
    <path d="M8 21h8" />
  </IconBase>
)

const IconMonitorHeart = ({ className }) => (
  <IconBase className={className}>
    <rect x="3" y="4" width="18" height="14" rx="2" />
    <path d="M3 12h3l2-3 2 6 2-4 2 3h5" />
  </IconBase>
)

const IconSettings = ({ className }) => (
  <IconBase className={className}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </IconBase>
)

const IconDatabase = ({ className }) => (
  <IconBase className={className}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
  </IconBase>
)

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, loading } = useAuth()
  const [expandedMenus, setExpandedMenus] = useState({})

  // Memoized user role check for performance
  const isViewer = useMemo(() => user?.role === 'viewer', [user?.role])
  const isAdmin = useMemo(() => 
    user?.role === 'super_admin' || user?.role === 'admin', 
    [user?.role]
  )
  const isDataManager = useMemo(() => user?.role === 'data_manager', [user?.role])
  const isDataEntry = useMemo(() => 
    user?.role === 'data_entry' || user?.role === 'doctor' || user?.role === 'nurse' || user?.role === 'site_manager',
    [user?.role]
  )

  // Memoized navigation items for better performance
  const navigationItems = useMemo(() => {
    if (!user || isViewer) return []
    const items = []

    // Dashboard - show for all except viewers and data managers
    if (!isViewer && !isDataManager) {
      items.push({
        name: 'Dashboard',
        href: '/dashboard',
        icon: IconDashboard,
        current: location.pathname === '/dashboard',
        category: 'main'
      })
    }

    // Data Manager specific menu - only data management and reports
    if (isDataManager) {
      items.push(
        {
          name: 'Data Management',
          href: '/import-data',
          icon: IconUpload,
          current: location.pathname.startsWith('/import-data'),
          category: 'data'
        }
      )
    } else if (!isViewer) {
      // Data entry sections - hide for viewers and data managers
      items.push(
        {
          name: 'All Patients',
          href: '/patients',
          icon: IconPeople,
          current: location.pathname === '/patients',
          category: 'patients'
        },
        {
          name: 'Adult',
          icon: IconPerson,
          current: location.pathname.startsWith('/patients/adult') || location.pathname.startsWith('/visits/adult'),
          hasSubmenu: true,
          category: 'patients',
          submenu: [
            {
              name: 'Initial Form',
              href: '/patients/adult',
              current: location.pathname.startsWith('/patients/adult') && !location.pathname.startsWith('/visits/adult'),
            },
            {
              name: 'Visits',
              href: '/visits/adult',
              current: location.pathname.startsWith('/visits/adult'),
            }
          ]
        },
        {
          name: 'Child',
          icon: IconFavorite,
          current: location.pathname.startsWith('/patients/child') || location.pathname.startsWith('/visits/child'),
          hasSubmenu: true,
          category: 'patients',
          submenu: [
            {
              name: 'Initial Form',
              href: '/patients/child',
              current: location.pathname.startsWith('/patients/child') && !location.pathname.startsWith('/visits/child'),
            },
            {
              name: 'Visits',
              href: '/visits/child',
              current: location.pathname.startsWith('/visits/child'),
            }
          ]
        },
        {
          name: 'Infant',
          icon: IconChildCare,
          current: location.pathname.startsWith('/patients/infant') || location.pathname.startsWith('/visits/infant'),
          hasSubmenu: true,
          category: 'patients',
          submenu: [
            {
              name: 'Initial Form',
              href: '/patients/infant',
              current: location.pathname.startsWith('/patients/infant') && !location.pathname.startsWith('/visits/infant'),
            },
            {
              name: 'Visits',
              href: '/visits/infant',
              current: location.pathname.startsWith('/visits/infant'),
            }
          ]
        },
        {
          name: 'Import Data',
          href: '/import-data',
          icon: IconUpload,
          current: location.pathname.startsWith('/import-data'),
          category: 'data'
        },
        {
          name: 'Lab Test Results',
          href: '/lab-tests',
          icon: IconBiotech,
          current: location.pathname.startsWith('/lab-tests'),
          category: 'data'
        },
        {
          name: 'Patient Tests',
          href: '/patient-tests',
          icon: IconMonitorHeart,
          current: location.pathname.startsWith('/patient-tests'),
          category: 'data'
        },
        {
          name: 'Infant Tests',
          href: '/infant-tests',
          icon: IconChildCare,
          current: location.pathname.startsWith('/infant-tests'),
          category: 'data'
        }
      )
    }

    // Role Management - Only show for admin and super_admin
    if (isAdmin) {
      items.push({
        name: 'Role Management',
        href: '/role-management',
        icon: IconSecurity,
        current: location.pathname.startsWith('/role-management'),
        category: 'admin'
      })
    }

    // Analytics & Reports - always show
    items.push({
      name: 'Analytics & Reports',
      icon: IconBarChart,
      current: location.pathname.startsWith('/analytics') || location.pathname.startsWith('/indicators') || location.pathname.startsWith('/mortality-retention-indicators') || location.pathname.startsWith('/cqi-admin') || location.pathname.startsWith('/query-editor-admin'),
      hasSubmenu: true,
      category: 'reports',
      submenu: [
        {
          name: 'Indicators Report',
          href: '/indicators',
          icon: IconAssessment,
          current: location.pathname === '/indicators'
        },
        {
          name: 'Mortality & Retention',
          href: '/mortality-retention-indicators',
          icon: IconMonitorHeart,
          current: location.pathname === '/mortality-retention-indicators'
        },
        // Analytics Admin - only for admin and super_admin
        ...(isAdmin ? [{
          name: 'Analytics Admin',
          href: '/analytics-admin',
          icon: IconBarChart,
          current: location.pathname === '/analytics-admin'
        }] : []),
        // CQI Admin removed
        // Indicator Management - only for admin and super_admin
        ...(isAdmin ? [{
          name: 'Indicator Control',
          href: '/indicator-management',
          icon: IconSettings,
          current: location.pathname === '/indicator-management'
        }] : []),
        // Query Editor Admin - only for admin and super_admin
        ...(isAdmin ? [{
          name: 'Query Editor',
          href: '/query-editor-admin',
          icon: IconDatabase,
          current: location.pathname === '/query-editor-admin'
        }] : []),
        // Indicators Dashboard - hide for viewers and data managers
        ...(isViewer || isDataManager ? [] : [{
          name: 'Visualization',
          href: '/indicators/dashboard',
          icon: IconBarChart,
          current: location.pathname === '/indicators/dashboard'
        }]),
      ]
    })

    return items
  }, [isViewer, isAdmin, isDataManager, isDataEntry, location.pathname])

  // Don't render sidebar until user data is loaded
  if (loading || !user) {
    return null
  }

  // Hide sidebar completely for viewers
  if (isViewer) {
    return null
  }

  const handleLogout = () => {
    logout()
  }

  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }))
  }

  const handleNavigation = (href, item) => {
    // For viewers, if they click on Analytics & Reports, navigate directly to indicators
    if (isViewer && item?.name === 'Analytics & Reports') {
      navigate('/indicators')
    } else {
      navigate(href)
    }
    setIsMobileOpen(false)
  }

  const handleMenuClick = (item) => {
    if (isCollapsed) {
      // For collapsed sidebar, handle special cases
      if (isViewer && item.name === 'Analytics & Reports') {
        handleNavigation('/indicators', item)
      } else if (item.hasSubmenu && item.submenu?.length > 0) {
        // Navigate to first submenu item
        handleNavigation(item.submenu[0].href, item.submenu[0])
      } else {
        handleNavigation(item.href, item)
      }
    } else {
      // For expanded sidebar, toggle submenu
      if (item.hasSubmenu) {
        toggleMenu(item.name)
      } else {
        handleNavigation(item.href, item)
      }
    }
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0  bg-opacity-50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-card border-r border-border transform transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-card/50">
            {!isCollapsed ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-none flex items-center justify-center shadow-sm">
                  <span className="text-primary-foreground font-bold text-sm">P</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-semibold text-card-foreground truncate">PreART System</h1>

                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <div className="w-8 h-8 bg-primary rounded-none flex items-center justify-center shadow-sm">
                  <span className="text-primary-foreground font-bold text-sm">P</span>
                </div>
              </div>
            )}
            
            {/* Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex w-8 h-8 p-0 rounded-none hover:bg-accent/50"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <IconChevronRight className="w-4 h-4" />
              ) : (
                <IconChevronLeft className="w-4 h-4" />
              )}
            </Button>
            
            {/* Mobile Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden w-8 h-8 p-0 rounded-none hover:bg-accent/50"
              title="Close sidebar"
            >
              <IconClose className="w-4 h-4" />
            </Button>
          </div>

          {/* User Profile */}
          {/* <div className="p-4 border-b border-border bg-muted/20">
            {!isCollapsed ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded-none flex items-center justify-center ring-2 ring-border">
                  <MdPerson className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">
                    {user?.fullName || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.username || 'admin'}
                  </p>
                  {isViewer && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-none text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-1">
                      View Only
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-10 h-10 bg-muted rounded-none flex items-center justify-center ring-2 ring-border">
                  <MdPerson className="w-5 h-5 text-muted-foreground" />
                </div>
                {isViewer && (
                  <div className="w-2 h-2 bg-blue-500 rounded-none" title="View Only Access" />
                )}
              </div>
            )}
          </div> */}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-hide">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isExpanded = expandedMenus[item.name]
              
              if (item.hasSubmenu) {
                return (
                  <div key={item.name} className="space-y-1">
                    <Button
                      variant={item.current ? "primary" : "ghost"}
                      className={`
                        w-full justify-start text-left h-11 px-3 rounded-none transition-all duration-200
                        ${isCollapsed ? 'px-2' : 'px-3'}
                        ${item.current 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-card-foreground hover:bg-accent hover:text-accent-foreground'
                        }
                      `}
                      onClick={() => handleMenuClick(item)}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left font-medium">{item.name}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                          {isExpanded ? (
                            <IconExpandLess className="w-4 h-4 ml-2 flex-shrink-0" />
                          ) : (
                            <IconExpandMore className="w-4 h-4 ml-2 flex-shrink-0" />
                          )}
                        </>
                      )}
                    </Button>
                    
                    {/* Submenu */}
                    {!isCollapsed && isExpanded && item.submenu && (
                      <div className="ml-6 space-y-1 border-l-2 border-border/50 pl-4">
                        {item.submenu.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <Button
                              key={subItem.name}
                              variant={subItem.current ? "primary" : "ghost"}
                              className={`
                                w-full justify-start text-left h-9 px-3 text-sm rounded-none transition-all duration-200
                                ${subItem.current 
                                  ? ' text-primary border border-primary/20 shadow-sm' 
                                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                }
                              `}
                              onClick={() => handleNavigation(subItem.href, subItem)}
                            >
                              {SubIcon ? (
                                <SubIcon className="w-4 h-4 mr-3 flex-shrink-0" />
                              ) : (
                                <div className="w-2 h-2 rounded-none bg-current opacity-40 mr-3 flex-shrink-0"></div>
                              )}
                              <span className="flex-1 text-left">{subItem.name}</span>
                              {subItem.badge && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  {subItem.badge}
                                </Badge>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )
              }
              
              return (
                <Button
                  key={item.name}
                  variant={item.current ? "default" : "ghost"}
                  className={`
                    w-full justify-start text-left h-11 px-3 rounded-none transition-all duration-200
                    ${isCollapsed ? 'px-2' : 'px-3'}
                    ${item.current 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-card-foreground hover:bg-accent hover:text-accent-foreground'
                    }
                  `}
                  onClick={() => handleMenuClick(item)}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left font-medium">{item.name}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-muted/10">
            <Button
              variant="ghost"
              className={`
                w-full justify-start text-left h-11 px-3 rounded-none text-card-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200
                ${isCollapsed ? 'px-2' : 'px-3'}
              `}
              onClick={handleLogout}
              title={isCollapsed ? 'Logout' : undefined}
            >
              <IconLogout className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && <span className="font-medium">Logout</span>}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
