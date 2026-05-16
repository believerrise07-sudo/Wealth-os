import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useSupabaseData<T = any>(tableName: string) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data: result, error: err } = await supabase
        .from(tableName)
        .select('*')
      if (err) throw err
      setData(result || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`public:${tableName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        () => {
          fetchData()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [tableName])

  const insertData = async (record: T) => {
    try {
      setError(null)
      const { data: result, error: err } = await supabase
        .from(tableName)
        .insert([record])
        .select()
      if (err) throw err
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to insert data'
      setError(message)
      throw err
    }
  }

  const updateData = async (id: string | number, updates: Partial<T>) => {
    try {
      setError(null)
      const { data: result, error: err } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
      if (err) throw err
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update data'
      setError(message)
      throw err
    }
  }

  const deleteData = async (id: string | number) => {
    try {
      setError(null)
      const { error: err } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
      if (err) throw err
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete data'
      setError(message)
      throw err
    }
  }

  return {
    data,
    loading,
    error,
    fetchData,
    insertData,
    updateData,
    deleteData,
  }
}
