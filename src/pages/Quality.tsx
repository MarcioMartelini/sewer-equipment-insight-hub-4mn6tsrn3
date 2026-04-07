import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function Quality() {
  const [warrantyClaims, setWarrantyClaims] = useState<any[]>([])
  const [lateCardPulls, setLateCardPulls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [{ data: wc }, { data: lc }] = await Promise.all([
      supabase
        .from('quality_warranty_claims')
        .select('*, work_orders(wo_number)')
        .order('created_at', { ascending: false }),
      supabase
        .from('quality_late_card_pulls')
        .select('*, work_orders(wo_number)')
        .order('created_at', { ascending: false }),
    ])

    if (wc) setWarrantyClaims(wc)
    if (lc) setLateCardPulls(lc)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Qualidade</h2>
        <p className="text-slate-500">
          Gestão de Garantias e Retiradas de Componentes (Late Card Pulls)
        </p>
      </div>

      <Tabs defaultValue="warranty" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="warranty">Warranty Claims</TabsTrigger>
          <TabsTrigger value="late_card">Late Card Pulls</TabsTrigger>
        </TabsList>

        <TabsContent value="warranty" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Garantias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>WO</TableHead>
                      <TableHead>S/N</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Reportada</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : warrantyClaims.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          Nenhum sinistro registrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      warrantyClaims.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell className="font-medium">
                            {claim.work_orders?.wo_number || '-'}
                          </TableCell>
                          <TableCell>{claim.serial_number || '-'}</TableCell>
                          <TableCell>{claim.customer_name || '-'}</TableCell>
                          <TableCell>{claim.issue_category || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={claim.status === 'resolved' ? 'default' : 'secondary'}>
                              {claim.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {claim.reported_date
                              ? new Date(claim.reported_date).toLocaleDateString()
                              : '-'}
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

        <TabsContent value="late_card" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Late Card Pulls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>WO</TableHead>
                      <TableHead>Componente</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : lateCardPulls.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                          Nenhuma retirada registrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      lateCardPulls.map((pull) => (
                        <TableRow key={pull.id}>
                          <TableCell className="font-medium">
                            {pull.work_orders?.wo_number || '-'}
                          </TableCell>
                          <TableCell>{pull.component_name}</TableCell>
                          <TableCell>{pull.pull_reason || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={pull.status === 'resolved' ? 'default' : 'secondary'}>
                              {pull.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {pull.pull_date ? new Date(pull.pull_date).toLocaleDateString() : '-'}
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
      </Tabs>
    </div>
  )
}
