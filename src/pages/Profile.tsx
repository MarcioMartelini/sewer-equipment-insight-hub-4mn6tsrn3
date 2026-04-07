import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import {
  User,
  Mail,
  Building,
  Shield,
  Clock,
  Activity,
  Settings,
  KeyRound,
  Camera,
  Loader2,
} from 'lucide-react'
import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export default function Profile() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [profile, setProfile] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setEditName(data.full_name || '')
        setEditEmail(data.email || '')
      }
    }

    const fetchActivities = async () => {
      const { data } = await supabase
        .from('audit_log')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(10)
      if (data) setActivities(data)
    }

    fetchProfile()
    fetchActivities()
  }, [user])

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (editEmail !== profile.email) {
      const { error: authError } = await supabase.auth.updateUser({ email: editEmail })
      if (authError) {
        toast({ title: 'Erro', description: authError.message, variant: 'destructive' })
        return
      }
    }

    const { error } = await supabase
      .from('users')
      .update({
        full_name: editName,
        email: editEmail,
      })
      .eq('id', user.id)

    if (error) {
      toast({ title: 'Erro', description: 'Erro ao atualizar perfil.', variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso.' })
      setProfile((prev: any) => ({ ...prev, full_name: editName, email: editEmail }))
      setIsEditModalOpen(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email) return

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (signInError) {
      toast({ title: 'Erro', description: 'Senha atual incorreta.', variant: 'destructive' })
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      toast({ title: 'Erro', description: 'Erro ao atualizar senha.', variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Senha atualizada com sucesso.' })
      setIsPasswordModalOpen(false)
      setCurrentPassword('')
      setNewPassword('')
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para fazer upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id)

      if (updateError) {
        throw updateError
      }

      setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }))
      toast({ title: 'Sucesso', description: 'Foto de perfil atualizada.' })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const handlePreferenceChange = async (key: string, value: boolean) => {
    if (!user) return
    setProfile((prev: any) => ({ ...prev, [key]: value }))
    const { error } = await supabase
      .from('users')
      .update({ [key]: value })
      .eq('id', user.id)
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar preferência.', variant: 'destructive' })
      setProfile((prev: any) => ({ ...prev, [key]: !value }))
    } else {
      toast({ title: 'Sucesso', description: 'Preferências de notificação salvas.' })
    }
  }

  if (!profile) return null

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Meu Perfil</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative group">
                  <Avatar className="w-24 h-24 border">
                    <AvatarImage src={profile.avatar_url} className="object-cover" />
                    <AvatarFallback className="text-2xl uppercase">
                      {profile.full_name?.substring(0, 2) || 'US'}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className={cn(
                      'absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full cursor-pointer transition-opacity',
                      uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                    )}
                  >
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6" />
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </div>

                <div className="space-y-4 flex-1 w-full">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <User className="w-4 h-4" /> Nome
                    </p>
                    <p className="font-medium">{profile.full_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email
                    </p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <Building className="w-4 h-4" /> Departamento
                    </p>
                    <p className="font-medium">{profile.department || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Função (Role)
                    </p>
                    <p className="font-medium capitalize">{profile.role || 'User'}</p>
                  </div>
                </div>
              </div>

              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-4">
                    Editar Perfil
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Dados Pessoais</DialogTitle>
                    <DialogDescription>Atualize seu nome e endereço de email.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleEditProfile} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditModalOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">Salvar Alterações</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Alterar Senha
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Alterar Senha</DialogTitle>
                    <DialogDescription>
                      Digite sua senha atual e a nova senha para atualizar.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleChangePassword} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Senha Atual</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nova Senha</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsPasswordModalOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">Atualizar Senha</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Preferências de Notificação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>Gerencie como e quando você deseja ser alertado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba atualizações importantes na sua caixa de entrada.
                  </p>
                </div>
                <Switch
                  checked={profile.email_notifications ?? true}
                  onCheckedChange={(v) => handlePreferenceChange('email_notifications', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificações no Sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostra alertas diretamente na plataforma (sininho).
                  </p>
                </div>
                <Switch
                  checked={profile.system_notifications ?? true}
                  onCheckedChange={(v) => handlePreferenceChange('system_notifications', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Alertas Críticos</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas imediatos sobre falhas e métricas fora do padrão.
                  </p>
                </div>
                <Switch
                  checked={profile.critical_alerts ?? true}
                  onCheckedChange={(v) => handlePreferenceChange('critical_alerts', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Resumo Diário</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba um email com o compilado das pendências do dia.
                  </p>
                </div>
                <Switch
                  checked={profile.daily_summary ?? false}
                  onCheckedChange={(v) => handlePreferenceChange('daily_summary', v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Atividade Recente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Atividade Recente
              </CardTitle>
              <CardDescription>Suas últimas 10 ações no sistema.</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 last:pb-0 gap-2"
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {activity.action}
                        </p>
                        {activity.description && (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {activity.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-slate-400 gap-1 whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {activity.timestamp
                          ? format(new Date(activity.timestamp), 'dd/MM/yyyy HH:mm')
                          : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500">
                  Nenhuma atividade registrada recentemente.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
