import { Suspense } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { Header } from './Header'
import { PageLoader } from './PageLoader'
import { RouteTransition } from './RouteTransition'

export function ProtectedLayout() {
  const { user } = useApp()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return (
    <>
      <Header />
      <RouteTransition>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </RouteTransition>
    </>
  )
}

export function PublicLayout() {
  return (
    <>
      <Header />
      <RouteTransition>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </RouteTransition>
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
