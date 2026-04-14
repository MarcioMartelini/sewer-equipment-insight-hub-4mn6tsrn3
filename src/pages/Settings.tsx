import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsersTab } from '@/components/settings/UsersTab'
import { PermissionsTab } from '@/components/settings/PermissionsTab'
import { IntegrationsTab } from '@/components/settings/IntegrationsTab'
import { BackupTab } from '@/components/settings/BackupTab'
import { AdminDashboardTab } from '@/components/settings/AdminDashboardTab'
import { AppearanceTab } from '@/components/settings/AppearanceTab'
import { Users, Shield, Plug, HardDrive, ShieldAlert, Palette, Loader2 } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      if (!user) return
      try {
        const { data } = await supabase.from('users').select('role').eq('id', user.id).single()

        setIsAdmin(data?.role === 'admin')
      } catch (error) {
        console.error('Error fetching user role:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {isAdmin ? 'Admin & Configurações' : 'Configurações'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {isAdmin
            ? 'Centro de comando do sistema: gerencie acessos, permissões e configurações globais.'
            : 'Gerencie suas preferências de uso do sistema.'}
        </p>
      </div>

      <Tabs defaultValue={isAdmin ? 'dashboard' : 'appearance'} className="w-full">
        <TabsList className="mb-4 bg-slate-100 dark:bg-slate-800 p-1 flex flex-wrap h-auto gap-1">
          {isAdmin && (
            <>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Admin Dashboard
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="permissions" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Permissões
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2">
                <Plug className="w-4 h-4" />
                Integrações
              </TabsTrigger>
              <TabsTrigger value="backup" className="flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                Backup
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Aparência
          </TabsTrigger>
        </TabsList>

        {isAdmin && (
          <>
            <TabsContent value="dashboard">
              <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <AdminDashboardTab />
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <UsersTab />
              </div>
            </TabsContent>

            <TabsContent value="permissions">
              <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <PermissionsTab />
              </div>
            </TabsContent>

            <TabsContent value="integrations">
              <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <IntegrationsTab />
              </div>
            </TabsContent>

            <TabsContent value="backup">
              <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <BackupTab />
              </div>
            </TabsContent>
          </>
        )}

        <TabsContent value="appearance">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <AppearanceTab />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
