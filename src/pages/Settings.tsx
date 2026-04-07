import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsersTab } from '@/components/settings/UsersTab'
import { PermissionsTab } from '@/components/settings/PermissionsTab'
import { IntegrationsTab } from '@/components/settings/IntegrationsTab'
import { BackupTab } from '@/components/settings/BackupTab'
import { Users, Shield, Plug, HardDrive } from 'lucide-react'

export default function Settings() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          System Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage users, permissions, integrations and platform backups.
        </p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4 bg-slate-100 dark:bg-slate-800 p-1">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Plug className="w-4 h-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border">
            <UsersTab />
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border">
            <PermissionsTab />
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border">
            <IntegrationsTab />
          </div>
        </TabsContent>

        <TabsContent value="backup">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border">
            <BackupTab />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
