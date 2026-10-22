import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import { Spinner } from './components/ui'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import CalendarPage from './pages/Calendar'

const Events = lazy(() => import('./pages/Events'))
const Roster = lazy(() => import('./pages/Roster'))
const Resources = lazy(() => import('./pages/Resources'))
const Scores = lazy(() => import('./pages/Scores'))
const Announcements = lazy(() => import('./pages/Announcements'))
const Settings = lazy(() => import('./pages/Settings'))

const page = (el) => <Suspense fallback={<Spinner />}>{el}</Suspense>

export default function App() {
  const { user, member, loading } = useAuth()

  if (loading) return <Spinner />
  if (!user) return <AuthPage />
  if (!member) return <Onboarding />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="events" element={page(<Events />)} />
        <Route path="roster" element={page(<Roster />)} />
        <Route path="resources" element={page(<Resources />)} />
        <Route path="scores" element={page(<Scores />)} />
        <Route path="announcements" element={page(<Announcements />)} />
        <Route path="calendar" element={page(<CalendarPage />)} />
        <Route path="settings" element={page(<Settings />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
