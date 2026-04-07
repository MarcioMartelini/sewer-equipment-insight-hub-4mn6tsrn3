import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  Factory,
  ShieldCheck,
  ShoppingCart,
  Hammer,
  Paintbrush,
  Blocks,
  Package,
  CheckSquare,
  FlaskConical,
  ClipboardList,
} from 'lucide-react'

import companyLogo from '@/assets/sewer-equipment-blue-fill-white-gray-globe-blue-gray-text-white-border-1024x1024-26940.webp'
import appLogo from '@/assets/image-ea73b.png'

const navigation = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', icon: LayoutDashboard, url: '/' },
      { title: 'WO Registry', icon: ClipboardList, url: '/wo-registry-page' },
    ],
  },
  {
    title: 'Departments',
    items: [
      { title: 'Production', icon: Factory, url: '/production' },
      { title: 'Quality', icon: ShieldCheck, url: '/quality' },
      { title: 'Purchasing', icon: ShoppingCart, url: '/purchasing' },
    ],
  },
  {
    title: 'Production Areas',
    items: [
      { title: 'Weld Shop', icon: Hammer, url: '/production/weld-shop' },
      { title: 'Paint', icon: Paintbrush, url: '/production/paint' },
      { title: 'Sub-Assembly', icon: Blocks, url: '/production/sub-assembly' },
      { title: 'Warehouse', icon: Package, url: '/production/warehouse' },
      { title: 'Final Assembly', icon: CheckSquare, url: '/production/final-assembly' },
      { title: 'Tests', icon: FlaskConical, url: '/production/tests' },
    ],
  },
]

export default function Layout() {
  const location = useLocation()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-900">
        <Sidebar>
          <SidebarHeader className="p-4 border-b border-sidebar-border/50">
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="flex items-center justify-center w-full">
                <img
                  src={companyLogo}
                  alt="Sewer Equipment"
                  className="w-16 h-16 object-contain drop-shadow-sm"
                />
              </div>
              <div className="flex items-center justify-center w-full px-2">
                <img src={appLogo} alt="Insight HUB" className="h-5 object-contain" />
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            {navigation.map((group) => (
              <SidebarGroup key={group.title}>
                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const isActive =
                        location.pathname === item.url ||
                        (item.url !== '/' && location.pathname.startsWith(item.url))
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                            <Link to={item.url}>
                              <item.icon className="w-4 h-4" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 w-full min-w-0">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 sm:h-16 sm:px-6">
            <SidebarTrigger className="-ml-2" />
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2 font-semibold text-lg text-slate-800 dark:text-slate-200 capitalize">
              {location.pathname === '/' || location.pathname === ''
                ? 'Dashboard'
                : location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ')}
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
