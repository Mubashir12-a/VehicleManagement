import { Navigate, Route, Routes } from 'react-router-dom'
import AuthModal from './components/auth/AuthModal'
import ProfileModal from './components/auth/ProfileModal'
import DashboardLayout from './components/layout/DashboardLayout'
import { AuthProvider } from './context/AuthContext'
import { FleetProvider } from './hooks/useFleetData'
import AnalyticsPage from './pages/AnalyticsPage'
import DashboardPage from './pages/DashboardPage'
import FinanceHistoryPage from './pages/FinanceHistoryPage'
import FuelHistoryPage from './pages/FuelHistoryPage'
import ImportantDatesPage from './pages/ImportantDatesPage'
import MaintenancePage from './pages/MaintenancePage'
import ModificationsPage from './pages/ModificationsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <AuthProvider>
      <FleetProvider>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/fuel-history" element={<FuelHistoryPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/important-dates" element={<ImportantDatesPage />} />
            <Route path="/modifications" element={<ModificationsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/finance-history" element={<FinanceHistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <AuthModal />
        <ProfileModal />
      </FleetProvider>
    </AuthProvider>
  )
}
