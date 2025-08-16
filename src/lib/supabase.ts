import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库类型定义
export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  mbti?: string
  occupation?: string
  personality?: string
  current_work?: string
  additional_info?: { [key: string]: any }
  updated_at: string
}

export interface RecordType {
  id: string
  user_id: string
  type: 'audio' | 'image' | 'text'
  content?: string
  file_url?: string
  created_at: string
}

export interface AIAnalysis {
  id: string
  record_id: string
  analysis_result: string
  sentiment?: string
  keywords?: string[]
  created_at: string
}