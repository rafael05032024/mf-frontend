import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { Header } from './Header'

export function ProtectedLayout() {
  const { user } = useApp()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}

export function PublicLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}

export function CreatorOnly() {
  const { user } = useApp()
  if (user?.creatorStatus !== 'verified') return <Navigate to="/conta" replace />
  return <Outlet />
}

export function GuestOnly() {
  const { user } = useApp()
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}
