import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
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
import { useNotifications } from '@/hooks/use-notifications'
import { useAuth } from '@/hooks/use-auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  Users,
  Wrench,
  Briefcase,
  LineChart,
  Settings as SettingsIcon,
  Bell,
  FileText,
  User,
  UserCircle,
  LogOut,
} from 'lucide-react'

function NotificationsBadge() {
  const { unreadCount } = useNotifications()
  if (unreadCount === 0) return null
  return (
    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
    </span>
  )
}

import companyLogo from '@/assets/sewer-equipment-blue-fill-white-gray-globe-blue-gray-text-white-border-1024x1024-26940.webp'
import appLogo from '@/assets/image-ea73b.png'

const navigation = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', icon: LayoutDashboard, url: '/' },
      { title: 'High Management', icon: LineChart, url: '/high-management' },
      { title: 'Reports', icon: FileText, url: '/reports' },
    ],
  },
  {
    title: 'Departments',
    items: [
      { title: 'Sales', icon: Briefcase, url: '/sales' },
      { title: 'Engineering', icon: Wrench, url: '/engineering' },
      { title: 'Production', icon: Factory, url: '/production' },
      { title: 'Quality', icon: ShieldCheck, url: '/quality' },
      { title: 'Purchasing', icon: ShoppingCart, url: '/purchasing' },
      { title: 'HR', icon: Users, url: '/hr' },
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
  {
    title: 'System',
    items: [{ title: 'Settings', icon: SettingsIcon, url: '/configuracoes' }],
  },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleSwitchProfile = async () => {
    await signOut()
    navigate('/login')
  }

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
            <div className="ml-auto flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 outline-none"
                    title="Account Menu"
                  >
                    <User className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-auto min-w-[14rem] max-w-[24rem]">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-normal break-all">
                        {user?.email || 'Account'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground pt-1">
                        Manage your session
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSwitchProfile} className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Enter with another profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                to="/notifications"
                className="relative p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Bell className="w-5 h-5" />
                <NotificationsBadge />
              </Link>
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
