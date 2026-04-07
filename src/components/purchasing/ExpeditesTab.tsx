import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import EditStatusModal from './EditStatusModal'

export default function ExpeditesTab({ woFilter }: { woFilter: string }) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<any>(null)
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    let query = supabase.from('purchasing_expedites').select('*, work_orders!inner(wo_number)')

    if (woFilter) {
      query = query.ilike('work_orders.wo_number', `%${woFilter}%`)
    }

    const { data: result, error } = await query.order('created_at', { ascending: false })

    if (error) {
      toast({
        title: 'Error fetching expedites',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      setData(result || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData()
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [woFilter])

  const handleStatusUpdate = async (newStatus: string) => {
    if (!editingItem) return

    const { error } = await supabase
      .from('purchasing_expedites')
      .update({ status: newStatus })
      .eq('id', editingItem.id)

    if (error) {
      toast({ title: 'Error updating status', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Status updated successfully' })
      setEditingItem(null)
      fetchData()
    }
  }

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase()
    if (s === 'complete') return 'bg-green-500 hover:bg-green-600'
    if (s === 'at risk') return 'bg-yellow-500 hover:bg-yellow-600'
    if (s === 'delayed') return 'bg-red-500 hover:bg-red-600'
    if (s === 'on track') return 'bg-blue-500 hover:bg-blue-600'
    if (s === 'parked') return 'bg-gray-500 hover:bg-gray-600'
    return 'bg-slate-300 text-slate-800 hover:bg-slate-400'
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>WO Number</TableHead>
            <TableHead>Component Type</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Expedite Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                Loading...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No expedites found
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.work_orders?.wo_number}</TableCell>
                <TableCell>{item.component_type}</TableCell>
                <TableCell>{item.expedite_reason}</TableCell>
                <TableCell>{item.expedite_date || '-'}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadge(item.status)}>
                    {item.status || 'Not started'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>
                    Edit Status
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {editingItem && (
        <EditStatusModal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          currentStatus={editingItem.status || 'not started'}
          onSave={handleStatusUpdate}
        />
      )}
    </div>
  )
}
