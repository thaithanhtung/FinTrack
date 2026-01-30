import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

if (!isSupabaseConfigured()) {
  console.error('❌ Supabase chưa được cấu hình!')
  console.error('Vui lòng thêm vào file .env.local:')
  console.error('  VITE_SUPABASE_URL=https://xxx.supabase.co')
  console.error('  VITE_SUPABASE_ANON_KEY=eyJ...')
}

export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || ''
)
