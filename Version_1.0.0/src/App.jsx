import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout'
import { FleetProvider } from './hooks/useFleetData'
import AnalyticsPage from './pages/AnalyticsPage'
import DashboardPage from './pages/DashboardPage'
import FinanceHistoryPage from './pages/FinanceHistoryPage'
import FuelHistoryPage from './pages/FuelHistoryPage'
import ImportantDatesPage from './pages/ImportantDatesPage'
import MaintenancePage from './pages/MaintenancePage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <FleetProvider>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/fuel-history" element={<FuelHistoryPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/important-dates" element={<ImportantDatesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/finance-history" element={<FinanceHistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </FleetProvider>
  )
}
