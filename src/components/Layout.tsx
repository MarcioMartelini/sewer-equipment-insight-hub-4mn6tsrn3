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
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'
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
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
} from 'lucide-react'

function NotificationsDropdown() {
  const { unreadCount, taskAlerts, notifications, markAsRead } = useNotifications()
  const navigate = useNavigate()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 outline-none"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <span className="font-semibold text-sm">Notifications</span>
          <Link
            to="/notifications"
            className="text-xs text-blue-600 hover:underline dark:text-blue-400 font-medium"
          >
            View all
          </Link>
        </div>
        <ScrollArea className="h-[320px]">
          {taskAlerts.length === 0 && notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-slate-400 dark:text-slate-500" />
              </div>
              <p>All caught up!</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {taskAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex flex-col gap-1.5 p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/work-orders/${alert.wo_id}`)}
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={
                        alert.is_overdue
                          ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50'
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50'
                      }
                    >
                      {alert.is_overdue ? 'Overdue' : 'Due Soon'}
                    </Badge>
                    <span className="text-xs font-medium text-slate-500">{alert.wo_number}</span>
                  </div>
                  <p className="text-sm font-medium leading-snug mt-0.5 text-slate-900 dark:text-slate-100">
                    {alert.task_name}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-1">
                    {alert.is_overdue ? (
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span>Due: {format(parseISO(alert.finish_date), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              ))}
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex flex-col gap-1 p-4 border-b border-slate-100 dark:border-slate-800 transition-colors ${!notification.is_read ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={`text-sm leading-snug ${!notification.is_read ? 'font-medium text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      {notification.message}
                    </p>
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="shrink-0 p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-400">
                    {format(new Date(notification.created_at), 'MMM dd, yyyy')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

import companyLogo from '@/assets/sewer-equipment-blue-fill-white-gray-globe-blue-gray-text-white-border-1024x1024-26940.webp'
import appLogo from '@/assets/image-ea73b.png'

const navigation = [
  {
    title: 'Overview',
    items: [{ title: 'Dashboard', icon: LayoutDashboard, url: '/' }],
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
  const [profile, setProfile] = useState<{
    full_name?: string
    role?: string
    avatar_url?: string
  } | null>(null)

  useEffect(() => {
    if (user?.id) {
      supabase
        .from('users')
        .select('full_name, role, avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data)
        })
    }
  }, [user?.id])

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
                    className="flex items-center gap-2 p-1 pr-3 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 outline-none"
                    title="Account Menu"
                  >
                    <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                      <AvatarImage
                        src={profile?.avatar_url || ''}
                        alt={profile?.full_name || 'User avatar'}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {profile?.full_name
                          ? profile.full_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .substring(0, 2)
                              .toUpperCase()
                          : user?.email?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start hidden sm:flex text-left">
                      <span className="text-sm font-medium leading-none text-slate-900 dark:text-slate-100">
                        {profile?.full_name || user?.email?.split('@')[0]}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1 capitalize">
                        {profile?.role || 'User'}
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-auto min-w-[14rem] max-w-[24rem]">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-normal break-all">
                        {profile?.full_name || 'Account'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground pt-1 break-all">
                        {user?.email}
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

              <NotificationsDropdown />
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
