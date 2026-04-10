import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ShieldCheck, Activity, Key } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export function AdminDashboardTab() {
  const [stats, setStats] = useState({ users: 0, admins: 0, departments: 0 })

  useEffect(() => {
    async function loadStats() {
      const { data: users } = await supabase.from('users').select('role, department')
      if (users) {
        const admins = users.filter((u) => u.role === 'admin').length
        const depts = new Set(users.map((u) => u.department).filter(Boolean)).size
        setStats({ users: users.length, admins, departments: depts })
      }
    }
    loadStats()
  }, [])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
          Visão Geral do Sistema
        </h3>
        <p className="text-sm text-slate-500">
          Acompanhamento central de acessos e configurações da plataforma.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Registrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground mt-1">Contas ativas na plataforma</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
            <p className="text-xs text-muted-foreground mt-1">Com acesso total ao sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departamentos Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departments}</div>
            <p className="text-xs text-muted-foreground mt-1">Áreas em operação</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border flex items-start gap-4">
        <div className="bg-primary/10 p-2 rounded-full mt-1">
          <Key className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-medium text-slate-900 dark:text-slate-100">
            Controle Baseado em Funções (RBAC)
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            As políticas de segurança de dados (RLS) são aplicadas diretamente no banco de dados. Ao
            alterar a função de um usuário na aba "Usuários", o acesso dele aos dados de outros
            departamentos ou ações administrativas é atualizado instantaneamente em todo o sistema.
          </p>
        </div>
      </div>
    </div>
  )
}
