import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'

export default function HR() {
  const [productivity, setProductivity] = useState<any[]>([])
  const [absences, setAbsences] = useState<any[]>([])
  const [injuries, setInjuries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchHRData = async () => {
    setLoading(true)
    try {
      const [prodRes, absRes, injRes] = await Promise.all([
        supabase.from('hr_productivity').select('*').order('recorded_date', { ascending: false }),
        supabase.from('hr_absences').select('*').order('absence_date', { ascending: false }),
        supabase.from('hr_injuries').select('*').order('injury_date', { ascending: false }),
      ])

      if (prodRes.error) throw prodRes.error
      if (absRes.error) throw absRes.error
      if (injRes.error) throw injRes.error

      if (prodRes.data) setProductivity(prodRes.data)
      if (absRes.data) setAbsences(absRes.data)
      if (injRes.data) setInjuries(injRes.data)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHRData()
  }, [])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const parts = dateStr.split('T')[0].split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return dateStr
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recursos Humanos (HR)</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie produtividade, ausências e segurança do trabalho.
          </p>
        </div>
      </div>

      <Tabs defaultValue="productivity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="productivity">Produtividade</TabsTrigger>
          <TabsTrigger value="absences">Ausências</TabsTrigger>
          <TabsTrigger value="injuries">Incidentes</TabsTrigger>
        </TabsList>

        <TabsContent value="productivity">
          <Card>
            <CardHeader>
              <CardTitle>Produtividade</CardTitle>
              <CardDescription>
                Acompanhamento de horas trabalhadas e valor de produção.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Horas</TableHead>
                      <TableHead>Valor Produzido</TableHead>
                      <TableHead>Produtividade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : productivity.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Nenhum registro encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      productivity.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.employee_name}</TableCell>
                          <TableCell>{formatDate(item.recorded_date)}</TableCell>
                          <TableCell>{item.labour_hours}h</TableCell>
                          <TableCell>
                            {item.production_value
                              ? new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                }).format(item.production_value)
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {item.productivity_ratio !== null ? (
                              <Badge variant="outline" className="font-mono">
                                {Number(item.productivity_ratio).toFixed(2)}
                              </Badge>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="absences">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Ausências</CardTitle>
              <CardDescription>Registro de faltas justificadas e não justificadas.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Motivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : absences.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          Nenhum registro encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      absences.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.employee_name}</TableCell>
                          <TableCell>{formatDate(item.absence_date)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={item.absence_type === 'excused' ? 'default' : 'destructive'}
                            >
                              {item.absence_type === 'excused' ? 'Justificada' : 'Não Justificada'}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.reason}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="injuries">
          <Card>
            <CardHeader>
              <CardTitle>Segurança do Trabalho</CardTitle>
              <CardDescription>Registro de incidentes e acidentes (Injuries).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Severidade</TableHead>
                      <TableHead>Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : injuries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Nenhum registro encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      injuries.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.employee_name}</TableCell>
                          <TableCell>{formatDate(item.injury_date)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                item.injury_type === 'recordable' ? 'destructive' : 'secondary'
                              }
                            >
                              {item.injury_type === 'recordable'
                                ? 'Registrável'
                                : 'Não Registrável'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="capitalize">{item.severity_level}</span>
                          </TableCell>
                          <TableCell>{item.injury_description}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
