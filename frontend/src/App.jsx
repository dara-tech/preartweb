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
import InfantReport from './pages/InfantReport'
import ReportPNTTPage from './pages/ReportPNTTPage'
import MortalityRetentionIndicators from './pages/MortalityRetentionIndicators'
import AnalyticsAdmin from './pages/admin/AnalyticsAdmin'
import CQIDashboard from './pages/CQIDashboard'
import CQIPeriodComparison from './pages/CQIPeriodComparison'
import IndicatorManagement from './pages/admin/IndicatorManagement'
import QueryEditorAdmin from './pages/admin/QueryEditorAdmin'
import LabTestResultsPage from './pages/LabTestResults'
import PatientTestsPage from './pages/PatientTests'
import InfantTestsPage from './pages/InfantTests'
import IDpoorDuplicatedARTId from './pages/IDpoorDuplicatedARTId'
import MainLayout from './components/layout/MainLayout'
import ReportLayout from './components/layout/ReportLayout'
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

  const getDefaultRoute = () => {
    if (user?.role === 'viewer') return '/indicators'
    if (user?.role === 'data_manager') return '/import-data'
    return '/dashboard'
  }

  return (
    <SiteProvider>
      <AnalyticsToast />
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to={getDefaultRoute()} replace />} />
          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="patients" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <PatientList />
            </ProtectedRoute>
          } />
          <Route path="patients/adult" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdultPatientForm />
            </ProtectedRoute>
          } />
          <Route path="patients/adult/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdultPatientForm />
            </ProtectedRoute>
          } />
          <Route path="patients/child" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <ChildPatientForm />
            </ProtectedRoute>
          } />
          <Route path="patients/child/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <ChildPatientForm />
            </ProtectedRoute>
          } />
          <Route path="patients/infant" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <InfantPatientForm />
            </ProtectedRoute>
          } />
          <Route path="patients/infant/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <InfantPatientForm />
            </ProtectedRoute>
          } />
          <Route path="visits/adult" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdultVisitList />
            </ProtectedRoute>
          } />
          <Route path="visits/adult/new" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdultVisitForm />
            </ProtectedRoute>
          } />
          <Route path="visits/adult/:clinicId" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdultVisitForm />
            </ProtectedRoute>
          } />
          <Route path="visits/adult/:clinicId/:visitId" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdultVisitForm />
            </ProtectedRoute>
          } />
          <Route path="visits/child" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <ChildVisitList />
            </ProtectedRoute>
          } />
          <Route path="visits/child/new" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <ChildVisitForm />
            </ProtectedRoute>
          } />
          <Route path="visits/child/:clinicId" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <ChildVisitForm />
            </ProtectedRoute>
          } />
          <Route path="visits/child/:clinicId/:visitId" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <ChildVisitForm />
            </ProtectedRoute>
          } />
          <Route path="visits/infant" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <InfantVisitList />
            </ProtectedRoute>
          } />
          <Route path="visits/infant/new" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <InfantVisitForm />
            </ProtectedRoute>
          } />
          <Route path="visits/infant/:clinicId" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <InfantVisitForm />
            </ProtectedRoute>
          } />
          <Route path="visits/infant/:clinicId/:visitId" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <InfantVisitForm />
            </ProtectedRoute>
          } />
          <Route path="data-management" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <DataManagement />
            </ProtectedRoute>
          } />
          <Route path="role-management" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <RoleManagement />
            </ProtectedRoute>
          } />
          <Route path="import-data" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'data_manager']}>
              <DataImportExport />
            </ProtectedRoute>
          } />
          <Route path="lab-tests" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'data_manager', 'doctor', 'nurse', 'data_entry', 'site_manager']}>
              <LabTestResultsPage />
            </ProtectedRoute>
          } />
          <Route path="patient-tests" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'data_manager', 'doctor', 'nurse', 'data_entry', 'site_manager']}>
              <PatientTestsPage />
            </ProtectedRoute>
          } />
          <Route path="infant-tests" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'data_manager', 'doctor', 'nurse', 'data_entry', 'site_manager']}>
              <InfantTestsPage />
            </ProtectedRoute>
          } />
          <Route element={<ReportLayout />}>
            <Route path="indicators" element={<IndicatorsReport />} />
            <Route path="infant-report" element={<InfantReport />} />
            <Route path="reports" element={<Navigate to="/reports/adult-child" replace />} />
            <Route path="reports/adult-child" element={<IndicatorsReport />} />
            <Route path="reports/infants" element={<InfantReport />} />
            <Route path="reports/pntt" element={<ReportPNTTPage />} />
            <Route path="mortality-retention-indicators" element={<MortalityRetentionIndicators />} />
          </Route>
          <Route path="cqi-dashboard" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'data_manager', 'doctor', 'nurse', 'data_entry', 'site_manager', 'viewer']}>
              <CQIDashboard />
            </ProtectedRoute>
          } />
          <Route path="cqi-comparison" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'data_manager', 'doctor', 'nurse', 'data_entry', 'site_manager', 'viewer']}>
              <CQIPeriodComparison />
            </ProtectedRoute>
          } />
          <Route path="idpoor-duplicated-artid" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'data_manager', 'doctor', 'nurse', 'data_entry', 'site_manager', 'viewer']}>
              <IDpoorDuplicatedARTId />
            </ProtectedRoute>
          } />
          <Route path="analytics-admin" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AnalyticsAdmin />
            </ProtectedRoute>
          } />
          <Route path="indicator-management" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <IndicatorManagement />
            </ProtectedRoute>
          } />
          <Route path="query-editor-admin" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <QueryEditorAdmin />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
        </Route>
      </Routes>
    </SiteProvider>
  )
}

export default App
