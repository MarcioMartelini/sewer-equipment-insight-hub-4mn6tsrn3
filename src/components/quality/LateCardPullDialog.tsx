import { useEffect, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  date: z.string().min(1, 'A data é obrigatória'),
  part_number: z.string().min(1, 'O PN é obrigatório'),
  area_supervisor: z.string().min(1, 'O supervisor é obrigatório'),
  occurrence_description: z.string().min(1, 'A descrição é obrigatória'),
  status: z.string().optional().default('pending'),
})

type LateCardPullDialogProps = {
  dialogState: 'create' | 'edit' | 'view' | null
  setDialogState: (state: 'create' | 'edit' | 'view' | null) => void
  pull: any
  onSaved: () => void
}

export function LateCardPullDialog({
  dialogState,
  setDialogState,
  pull,
  onSaved,
}: LateCardPullDialogProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [supervisors, setSupervisors] = useState<{ id: string; full_name: string }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      part_number: '',
      area_supervisor: '',
      occurrence_description: '',
      status: 'pending',
    },
  })

  useEffect(() => {
    if (dialogState) {
      form.reset({
        date: pull?.date || new Date().toISOString().split('T')[0],
        part_number: pull?.part_number || '',
        area_supervisor: pull?.area_supervisor || '',
        occurrence_description: pull?.occurrence_description || '',
        status: pull?.status || 'pending',
      })
    }
  }, [dialogState, pull, form])

  useEffect(() => {
    const fetchSupervisors = async () => {
      const { data } = await supabase.from('users').select('id, full_name').order('full_name')
      if (data) setSupervisors(data)
    }
    fetchSupervisors()
  }, [])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (dialogState === 'view') return

    setIsSubmitting(true)
    const dataToSave = dialogState === 'create' ? { ...values, created_by: user?.id } : values
    const req =
      dialogState === 'create'
        ? supabase.from('late_card_pulls').insert(dataToSave)
        : supabase.from('late_card_pulls').update(dataToSave).eq('id', pull?.id)

    const { error } = await req
    setIsSubmitting(false)

    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Salvo com sucesso' })
      setDialogState(null)
      onSaved()
    }
  }

  return (
    <Dialog open={!!dialogState} onOpenChange={(o) => !o && setDialogState(null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {dialogState === 'create'
              ? 'Novo Late Card Pull'
              : dialogState === 'edit'
                ? 'Editar Late Card Pull'
                : 'Detalhes do Late Card Pull'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={dialogState === 'view'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="part_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PN (Part Number)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o PN..."
                        disabled={dialogState === 'view'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="area_supervisor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supervisor</FormLabel>
                    <Select
                      disabled={dialogState === 'view'}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um supervisor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {supervisors.map((s) => (
                          <SelectItem key={s.id} value={s.full_name}>
                            {s.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="occurrence_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ocorrência</FormLabel>
                    <FormControl>
                      <Textarea disabled={dialogState === 'view'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {dialogState !== 'create' && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        disabled={dialogState === 'view'}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="N/A">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setDialogState(null)}>
                Fechar
              </Button>
              {dialogState !== 'view' && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
