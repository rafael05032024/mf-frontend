import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CreatorOnly, GuestOnly, ProtectedLayout, PublicLayout } from './components/Layout'
import { LivenessEvents } from './components/LivenessEvents'
import { PageLoader } from './components/PageLoader'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

const ProfileDetail = lazy(() => import('./pages/ProfileDetail'))
const Account = lazy(() => import('./pages/Account'))
const Subscriptions = lazy(() => import('./pages/Subscriptions'))
const EditProfile = lazy(() => import('./pages/EditProfile'))
const Wallet = lazy(() => import('./pages/Wallet'))
const Recharge = lazy(() => import('./pages/Recharge'))
const Withdraw = lazy(() => import('./pages/Withdraw'))
const BecomeCreator = lazy(() => import('./pages/BecomeCreator'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Post = lazy(() => import('./pages/Post'))

export default function App() {
  return (
    <BrowserRouter>
      <LivenessEvents />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Register />} />
          </Route>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/perfil/:handle" element={<ProfileDetail />} />
          </Route>
          <Route element={<ProtectedLayout />}>
            <Route path="/conta" element={<Account />} />
            <Route path="/conta/assinaturas" element={<Subscriptions />} />
            <Route path="/conta/editar" element={<EditProfile />} />
            <Route path="/conta/carteira" element={<Wallet />} />
            <Route path="/conta/carteira/recarregar" element={<Recharge />} />
            <Route path="/conta/criador" element={<BecomeCreator />} />
            <Route element={<CreatorOnly />}>
              <Route path="/conta/carteira/resgatar" element={<Withdraw />} />
              <Route path="/conta/controle" element={<Dashboard />} />
              <Route path="/postar" element={<Post />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
