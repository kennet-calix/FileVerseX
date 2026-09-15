import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import AppLayout from '../layouts/AppLayout'

import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'

import DashboardPage from '../pages/dashboard/DashboardPage'
import FilesPage from '../pages/files/FilesPage'
import CollectionsPage from '../pages/collections/CollectionsPage'
import CollectionDetailPage from '../pages/collections/CollectionDetailPage'
import PublicationsPage from '../pages/publications/PublicationsPage'
import StatisticsPage from '../pages/statistics/StatisticsPage'
import ReportsPage from '../pages/reports/ReportsPage'
import AdminPage from '../pages/admin/AdminPage'
import ProfilePage from '../pages/profile/ProfilePage'

import ProtectedRoute from './ProtectedRoute'

function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      {/* RUTAS PÚBLICAS */}
      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
      />

      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />

      {/* RUTAS PROTEGIDAS */}
      <Route
        element={<ProtectedRoute />}
      >
        <Route
          element={<AppLayout />}
        >
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/files"
            element={<FilesPage />}
          />

          <Route
            path="/collections"
            element={<CollectionsPage />}
          />

          <Route
            path="/collections/:id"
            element={<CollectionDetailPage />}
          />

          <Route
            path="/publications"
            element={<PublicationsPage />}
          />

          <Route
            path="/statistics"
            element={<StatisticsPage />}
          />

          <Route
            path="/reports"
            element={<ReportsPage />}
          />

          <Route
            path="/profile"
            element={<ProfilePage />}
          />

          <Route
            path="/admin"
            element={<AdminPage />}
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  )
}

export default AppRouter