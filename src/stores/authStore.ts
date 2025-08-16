import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { UserProfile } from '../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ error?: string }>
  fetchProfile: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        set({ user: session.user, session })
        await get().fetchProfile()
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      set({ loading: false })
    }

    // 监听认证状态变化
    supabase.auth.onAuthStateChange(async (event, session) => {
      set({ user: session?.user ?? null, session })
      
      if (session?.user) {
        await get().fetchProfile()
      } else {
        set({ profile: null })
      }
    })
  },

  signUp: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: '注册失败，请稍后重试' }
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: '登录失败，请稍后重试' }
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut()
      set({ user: null, session: null, profile: null })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  },

  fetchProfile: async () => {
    const { user } = get()
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        return
      }

      set({ profile: data })
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  },

  updateProfile: async (profileData: Partial<UserProfile>) => {
    const { user } = get()
    if (!user) return { error: '用户未登录' }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        return { error: error.message }
      }

      set({ profile: data })
      
      // 如果是新用户首次创建画像，创建示例数据
      if (!get().profile) {
        await supabase.rpc('create_sample_data_for_user', {
          user_uuid: user.id
        })
      }
      
      return {}
    } catch (error) {
      return { error: '更新个人信息失败' }
    }
  },
}))