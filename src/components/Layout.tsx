import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Bell,
  LayoutDashboard,
  Settings,
  FileBarChart,
  HandCoins,
  Wrench,
  ShoppingCart,
  Factory,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Vendas', url: '/sales', icon: HandCoins },
  { title: 'Engenharia', url: '/engineering', icon: Wrench },
  { title: 'Compras', url: '/purchasing', icon: ShoppingCart },
  { title: 'Produção', url: '/production', icon: Factory },
  { title: 'Relatórios', url: '/relatorios', icon: FileBarChart },
  { title: 'Configurações', url: '/configuracoes', icon: Settings },
]

export default function Layout() {
  const location = useLocation()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <Sidebar variant="inset" className="border-r border-slate-200 bg-white">
          <div className="flex h-14 items-center px-4 font-bold text-slate-900 border-b border-slate-100">
            <span className="text-indigo-600 mr-2">✦</span> WO Sync
          </div>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV_ITEMS.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        className="hover:text-indigo-600 hover:bg-indigo-50 data-[active=true]:bg-indigo-100 data-[active=true]:text-indigo-700 font-medium"
                      >
                        <Link to={item.url}>
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-slate-50">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-slate-900 hidden sm:block">
                Registro de Work Orders
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-slate-500 hover:text-indigo-600">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-slate-900 leading-none">Ana Silva</p>
                  <p className="text-xs text-slate-500 mt-1">Gerente de Produção</p>
                </div>
                <Avatar className="h-9 w-9 border border-slate-200">
                  <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=4" />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700">AS</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
