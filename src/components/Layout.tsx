import { Suspense, useEffect, useState } from 'react'
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

const AUTH_LOADING_MS = 500

// Loading curto ao entrar em login/cadastro (ex.: ao sair da plataforma) + fade-in da página
function AuthTransition() {
  const { pathname } = useLocation()
  const [readyPath, setReadyPath] = useState<string | null>(null)

  useEffect(() => {
    const id = window.setTimeout(() => setReadyPath(pathname), AUTH_LOADING_MS)
    return () => window.clearTimeout(id)
  }, [pathname])

  return (
    <RouteTransition>{readyPath === pathname ? <Outlet /> : <PageLoader />}</RouteTransition>
  )
}

export function GuestOnly() {
  const { user } = useApp()
  if (user) return <Navigate to="/" replace />
  return <AuthTransition />
}
