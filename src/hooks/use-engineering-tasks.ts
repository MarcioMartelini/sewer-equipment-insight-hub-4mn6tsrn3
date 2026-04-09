import { useState, useEffect, useCallback } from 'react'
import {
  getEngineeringTasks,
  updateEngineeringStatus,
  assignEngineeringTask,
  EngineeringType,
  EngineeringTask,
} from '@/services/engineering'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

export function useEngineeringTasks(type: EngineeringType) {
  const [tasks, setTasks] = useState<EngineeringTask[]>([])
  const [users, setUsers] = useState<{ id: string; full_name: string }[]>([])
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

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name')
        .order('full_name')
      if (!error && data) {
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
    fetchUsers()
  }, [fetchTasks, fetchUsers])

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

  const handleAssignTask = async (id: string, userId: string | null) => {
    try {
      await assignEngineeringTask(id, userId)
      toast({ title: 'Task assigned successfully' })
      await fetchTasks()
    } catch (error: any) {
      toast({
        title: 'Error assigning task',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  return { tasks, users, loading, handleUpdateStatus, handleAssignTask, refetch: fetchTasks }
}
