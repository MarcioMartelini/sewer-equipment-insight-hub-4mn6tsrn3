import { useState } from 'react'
import { format } from 'date-fns'
import { Check, Filter, CheckCircle2, BellRing } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useNotifications } from '@/hooks/use-notifications'

export default function Notifications() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications()
  const [filterType, setFilterType] = useState<string>('all')

  const filteredNotifications = notifications.filter(
    (n) => filterType === 'all' || n.type === filterType,
  )

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Sales':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
      case 'Engineering':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
      case 'Purchasing':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
      case 'Production':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
      case 'Quality':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
      case 'HR':
        return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800'
      case 'System':
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Notifications & Alerts
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your system alerts and updates in real-time.
          </p>
        </div>
        <Button
          onClick={markAllAsRead}
          variant="outline"
          className="shrink-0 bg-white dark:bg-slate-950"
        >
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
          Mark all as read
        </Button>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BellRing className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Notifications Center</CardTitle>
                <CardDescription>View and filter all your notifications.</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-slate-950">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Purchasing">Purchasing</SelectItem>
                  <SelectItem value="Production">Production</SelectItem>
                  <SelectItem value="Quality">Quality</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="System">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[120px] pl-6">Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-[180px]">Date/Time</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="text-right pr-6 w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <p>No notifications found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredNotifications.map((notification) => (
                  <TableRow
                    key={notification.id}
                    className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      !notification.is_read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <TableCell className="pl-6 py-4">
                      <Badge
                        variant="outline"
                        className={`${getTypeColor(notification.type)} font-medium`}
                      >
                        {notification.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <span
                        className={`block max-w-[400px] lg:max-w-[600px] truncate ${!notification.is_read ? 'font-medium text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}
                        title={notification.message}
                      >
                        {notification.message}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="py-4">
                      {!notification.is_read ? (
                        <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-transparent">
                          Unread
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-transparent"
                        >
                          Read
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6 py-4">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-8 px-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                        >
                          <Check className="w-4 h-4 mr-1.5" />
                          Mark as read
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
