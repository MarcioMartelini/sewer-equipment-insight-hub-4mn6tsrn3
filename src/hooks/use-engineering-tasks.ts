import { useState, useEffect, useCallback } from 'react'
import {
  getEngineeringTasks,
  updateEngineeringStatus,
  EngineeringType,
  EngineeringTask,
} from '@/services/engineering'
import { useToast } from '@/hooks/use-toast'

export function useEngineeringTasks(type: EngineeringType) {
  const [tasks, setTasks] = useState<EngineeringTask[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getEngineeringTasks(type)
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

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateEngineeringStatus(type, id, status)
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
