import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import AuthPage from './pages/Auth'
import Sales from './pages/Sales'
import Engineering from './pages/Engineering'
import Purchasing from './pages/Purchasing'
import Production from './pages/Production'
import Quality from './pages/Quality'
import { AuthProvider, useAuth } from './hooks/use-auth'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth()
  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

const App = () => (
  <AuthProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider delayDuration={300}>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Index />} />
            <Route path="/relatorios" element={<Index />} />
            <Route path="/configuracoes" element={<Index />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/engineering" element={<Engineering />} />
            <Route path="/purchasing" element={<Purchasing />} />
            <Route path="/production" element={<Production />} />
            <Route path="/quality" element={<Quality />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
