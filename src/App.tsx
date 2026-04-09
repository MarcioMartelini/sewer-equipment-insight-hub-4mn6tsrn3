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
import HR from './pages/HR'
import HighManagement from './pages/HighManagement'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import WorkOrderDetail from './pages/WorkOrderDetail'
import QuoteDetail from './pages/QuoteDetail'
import CustomerDetail from './pages/CustomerDetail'
import SalespersonDetail from './pages/SalespersonDetail'
import { AuthProvider, useAuth } from './hooks/use-auth'
import { GlobalNotificationWatcher } from './components/GlobalNotificationWatcher'
import logoUrl from './assets/design-sem-nome-70de8.png'

const GlobalPrintStyles = () => (
  <style>
    {`
      @media print {
        @page {
          margin-top: 25mm;
          margin-bottom: 15mm;
        }
        .global-print-header {
          display: flex !important;
          position: fixed;
          top: -20mm;
          left: 0;
          width: 100%;
          height: 15mm;
          align-items: flex-start;
          justify-content: space-between;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 2mm;
          z-index: 9999;
        }
        .global-print-header img {
          max-height: 15mm;
          object-fit: contain;
          margin-left: auto;
        }
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `}
  </style>
)

const PrintHeader = () => (
  <div className="hidden global-print-header">
    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginTop: 'auto' }}>
      Generated on {new Date().toLocaleDateString()}
    </span>
    <img src={logoUrl} alt="Sewer Equipment Insight HUB" />
  </div>
)

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth()
  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  return (
    <>
      <GlobalNotificationWatcher />
      {children}
    </>
  )
}

const App = () => (
  <AuthProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <GlobalPrintStyles />
      <PrintHeader />
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
            <Route path="/relatorios" element={<Reports />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/configuracoes" element={<Settings />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/engineering" element={<Engineering />} />
            <Route path="/purchasing" element={<Purchasing />} />
            <Route path="/production" element={<Production />} />
            <Route path="/production/:subDepartment" element={<Production />} />
            <Route path="/quality" element={<Quality />} />
            <Route path="/hr" element={<HR />} />
            <Route path="/high-management" element={<HighManagement />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/notificacoes" element={<Notifications />} />
            <Route path="/work-orders/:id" element={<WorkOrderDetail />} />
            <Route path="/sales/quotes/:id" element={<QuoteDetail />} />
            <Route path="/sales/customers/:id" element={<CustomerDetail />} />
            <Route path="/sales/salespersons/:id" element={<SalespersonDetail />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
