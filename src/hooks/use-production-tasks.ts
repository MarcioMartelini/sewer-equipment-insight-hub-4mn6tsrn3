import { useState, useEffect, useCallback } from 'react'
import {
  getProductionTasks,
  updateProductionStatus,
  ProductionType,
  ProductionTask,
} from '@/services/production'
import { useToast } from '@/hooks/use-toast'

export function useProductionTasks(type: ProductionType) {
  const [tasks, setTasks] = useState<ProductionTask[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProductionTasks(type)
      setTasks(data)
    } catch (error: any) {
      toast({
        title: 'Error fetching tasks',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [type, toast])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleUpdateStatus = async (id: string, status: string, comment?: string) => {
    try {
      await updateProductionStatus(type, id, status, comment)
      toast({ title: 'Status updated successfully' })
      await fetchTasks()
    } catch (error: any) {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  return { tasks, loading, handleUpdateStatus }
}
