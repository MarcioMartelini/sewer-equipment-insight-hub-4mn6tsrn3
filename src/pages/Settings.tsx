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
import {
  Users,
  Shield,
  Plug,
  HardDrive,
  ShieldAlert,
  Palette,
  Loader2,
  Lock,
  Unlock,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function Settings() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false)
  const [unlockPassword, setUnlockPassword] = useState('')
  const [unlockError, setUnlockError] = useState('')
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [activeTab, setActiveTab] = useState('appearance')

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

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email) return
    setIsUnlocking(true)
    setUnlockError('')

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: unlockPassword,
    })

    if (error) {
      setUnlockError('Senha incorreta. Tente novamente.')
    } else {
      setIsAdminUnlocked(true)
      setActiveTab('dashboard')
      setUnlockPassword('')
    }
    setIsUnlocking(false)
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 bg-slate-100 dark:bg-slate-800 p-1 flex flex-wrap h-auto gap-1">
          {isAdmin && !isAdminUnlocked && (
            <TabsTrigger
              value="admin_locked"
              className="flex items-center gap-2 text-amber-600 dark:text-amber-500 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400"
            >
              <Lock className="w-4 h-4" />
              Admin (Bloqueado)
            </TabsTrigger>
          )}
          {isAdmin && isAdminUnlocked && (
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

        {isAdmin && !isAdminUnlocked && (
          <TabsContent value="admin_locked">
            <div className="bg-white dark:bg-slate-950 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 max-w-md mx-auto mt-10">
              <form onSubmit={handleUnlock} className="space-y-6">
                <div className="text-center space-y-3 mb-6">
                  <div className="bg-amber-100 dark:bg-amber-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Acesso Restrito
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Confirme sua senha para acessar e gerenciar as configurações administrativas.
                  </p>
                </div>

                <div className="space-y-3 text-left">
                  <Label htmlFor="password">Senha de Administrador</Label>
                  <Input
                    id="password"
                    type="password"
                    value={unlockPassword}
                    onChange={(e) => setUnlockPassword(e.target.value)}
                    placeholder="Sua senha de acesso"
                    required
                  />
                  {unlockError && <p className="text-sm font-medium text-red-500">{unlockError}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900"
                  disabled={isUnlocking || !unlockPassword}
                >
                  {isUnlocking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verificando...
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 mr-2" /> Desbloquear Acesso
                    </>
                  )}
                </Button>
              </form>
            </div>
          </TabsContent>
        )}

        {isAdmin && isAdminUnlocked && (
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
