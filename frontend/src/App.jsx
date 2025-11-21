import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuth } from './contexts/AuthContext'
import { SiteProvider } from './contexts/SiteContext'
import AnalyticsToast from './components/analytics/AnalyticsToast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdultPatientForm from './pages/patients/InitialForm/Adult/AdultInitialForm'
import ChildPatientForm from './pages/patients/InitialForm/Child/ChildInitialForm'
import InfantPatientForm from './pages/patients/InitialForm/Infant/InfantInitialForm'
import PatientList from './pages/patients/PatientList'
import AdultVisitForm from './pages/patients/VisitForm/Adult/AdultVisitForm'
import AdultVisitList from './pages/patients/VisitForm/Adult/AdultVisitList'
import ChildVisitForm from './pages/patients/VisitForm/Child/ChildVisitForm'
import ChildVisitList from './pages/patients/VisitForm/Child/ChildVisitList'
import InfantVisitForm from './pages/patients/VisitForm/Infant/InfantVisitForm'
import InfantVisitList from './pages/patients/VisitForm/Infant/InfantVisitList'
import DataManagement from './pages/DataManagement'
import RoleManagement from './pages/RoleManagement'
import DataImportExport from './pages/DataManagement/components/DataImportExport'
import IndicatorsReport from './pages/indicators/IndicatorsReport'
import MortalityRetentionIndicators from './pages/MortalityRetentionIndicators'
import AnalyticsAdmin from './pages/admin/AnalyticsAdmin'
// CQI Admin removed
import IndicatorManagement from './pages/admin/IndicatorManagement'
import QueryEditorAdmin from './pages/admin/QueryEditorAdmin'
import LabTestResultsPage from './pages/LabTestResults'
import PatientTestsPage from './pages/PatientTests'
import InfantTestsPage from './pages/InfantTests'
import AdvancedLayout from './components/layout/AdvancedLayout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-lg text-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  // Determine default route based on user role
  const getDefaultRoute = () => {
    if (user?.role === 'viewer') {
      return '/indicators'
    }
    if (user?.role === 'data_manager') {
      return '/import-data'
    }
    return '/dashboard'
  }

  return (
    <SiteProvider>
      <AdvancedLayout>
        <AnalyticsToast />
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
          
          {/* Dashboard - Not accessible to viewers and data managers */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Patient Management - Not accessible to viewers */}
          <Route path="/patients" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <PatientList />
            </ProtectedRoute>
          } />
          <Route path="/patients/adult" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdultPatientForm />
            </ProtectedRoute>
          } />
          <Route path="/patients/adult/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdultPatientForm />
            </ProtectedRoute>
          } />
          <Route path="/patients/child" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <ChildPatientForm />
            </ProtectedRoute>
          } />
          <Route path="/patients/child/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <ChildPatientForm />
            </ProtectedRoute>
          } />
          <Route path="/patients/infant" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <InfantPatientForm />
            </ProtectedRoute>
          } />
          <Route path="/patients/infant/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <InfantPatientForm />
            </ProtectedRoute>
          } />
          
          {/* Visit Management - Not accessible to viewers */}
          <Route path="/visits/adult" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdultVisitList />
            </ProtectedRoute>
          } />
          <Route path="/visits/adult/new" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdultVisitForm />
            </ProtectedRoute>
          } />
          <Route path="/visits/adult/:clinicId" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdultVisitForm />
            </ProtectedRoute>
          } />
          <Route path="/visits/adult/:clinicId/:visitId" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdultVisitForm />
            </ProtectedRoute>
          } />
          <Route path="/visits/child" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <ChildVisitList />
            </ProtectedRoute>
          } />
          <Route path="/visits/child/new" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <ChildVisitForm />
            </ProtectedRoute>
          } />
          <Route path="/visits/child/:clinicId" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <ChildVisitForm />
            </ProtectedRoute>
          } />
          <Route path="/visits/child/:clinicId/:visitId" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <ChildVisitForm />
            </ProtectedRoute>
          } />
          <Route path="/visits/infant" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <InfantVisitList />
            </ProtectedRoute>
          } />
          <Route path="/visits/infant/new" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <InfantVisitForm />
            </ProtectedRoute>
          } />
          <Route path="/visits/infant/:clinicId" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <InfantVisitForm />
            </ProtectedRoute>
          } />
          <Route path="/visits/infant/:clinicId/:visitId" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <InfantVisitForm />
            </ProtectedRoute>
          } />
          
          {/* Data Management - Not accessible to viewers */}
          <Route path="/data-management" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <DataManagement />
            </ProtectedRoute>
          } />
          
          {/* Role Management - Only for super_admin and admin */}
          <Route path="/role-management" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <RoleManagement />
            </ProtectedRoute>
          } />
          
          {/* Import Data - Only for super_admin, admin, and data_manager */}
          <Route path="/import-data" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'data_manager']}>
              <DataImportExport />
            </ProtectedRoute>
          } />
          
          {/* Lab Test Results - Accessible to all authenticated users except viewers */}
          <Route path="/lab-tests" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'data_manager', 'doctor', 'nurse', 'data_entry', 'site_manager']}>
              <LabTestResultsPage />
            </ProtectedRoute>
          } />
          
          {/* Patient Tests - Accessible to all authenticated users except viewers */}
          <Route path="/patient-tests" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'data_manager', 'doctor', 'nurse', 'data_entry', 'site_manager']}>
              <PatientTestsPage />
            </ProtectedRoute>
          } />
          
          {/* Infant Tests - Accessible to all authenticated users except viewers */}
          <Route path="/infant-tests" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'data_manager', 'doctor', 'nurse', 'data_entry', 'site_manager']}>
              <InfantTestsPage />
            </ProtectedRoute>
          } />
          
          {/* Indicators - Accessible to all authenticated users */}
          <Route path="/indicators" element={<IndicatorsReport />} />
          
          {/* Mortality and Retention Indicators - Accessible to all authenticated users */}
          <Route path="/mortality-retention-indicators" element={<MortalityRetentionIndicators />} />
          
          {/* Analytics Admin - Only for super_admin and admin */}
          <Route path="/analytics-admin" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AnalyticsAdmin />
            </ProtectedRoute>
          } />
          
          {/* CQI Admin removed */}
          
          {/* Indicator Management - Only for super_admin and admin */}
          <Route path="/indicator-management" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <IndicatorManagement />
            </ProtectedRoute>
          } />
          
          {/* Query Editor Admin - Only for super_admin and admin */}
          <Route path="/query-editor-admin" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <QueryEditorAdmin />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
        </Routes>
      </AdvancedLayout>
    </SiteProvider>
  )
}

export default App