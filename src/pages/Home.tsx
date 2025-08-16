import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, Camera, Image, Plus, Clock, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import type { RecordType, AIAnalysis } from '../lib/supabase'

interface RecordWithAnalysis extends RecordType {
  ai_analyses: AIAnalysis[]
}

const Home = () => {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const [recentRecords, setRecentRecords] = useState<RecordWithAnalysis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentRecords()
  }, [user])

  const fetchRecentRecords = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('records')
        .select(`
          *,
          ai_analyses(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error fetching records:', error)
        return
      }

      setRecentRecords(data || [])
    } catch (error) {
      console.error('Error fetching records:', error)
    } finally {
      setLoading(false)
    }
  }

  const recordTypes = [
    {
      type: 'audio',
      icon: Mic,
      label: '录音',
      description: '语音记录想法',
      color: 'from-purple-400 to-pink-400',
      bgColor: 'bg-purple-50'
    },
    {
      type: 'image',
      icon: Camera,
      label: '拍照',
      description: '拍摄生活瞬间',
      color: 'from-blue-400 to-cyan-400',
      bgColor: 'bg-blue-50'
    },
    {
      type: 'screenshot',
      icon: Image,
      label: '截图',
      description: '上传图片内容',
      color: 'from-green-400 to-teal-400',
      bgColor: 'bg-green-50'
    }
  ]

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return '刚刚'
    if (diffInHours < 24) return `${diffInHours}小时前`
    if (diffInHours < 48) return '昨天'
    return `${Math.floor(diffInHours / 24)}天前`
  }

  const handleRecordType = (type: string) => {
    navigate(`/record?type=${type}`)
  }

  return (
    <div className="p-4 space-y-6">
      {/* 欢迎区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-6"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {profile ? `你好，${profile.occupation || '朋友'}` : '欢迎回来'}
        </h1>
        <p className="text-gray-600">
          {profile ? '今天想记录什么呢？' : '开始记录你的生活片段吧'}
        </p>
      </motion.div>

      {/* 快速记录按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-purple-600" />
          快速记录
        </h2>
        
        <div className="grid grid-cols-3 gap-4">
          {recordTypes.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.button
                key={item.type}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRecordType(item.type)}
                className={`${item.bgColor} p-4 rounded-2xl border border-white/50 transition-all duration-300 hover:shadow-lg`}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm font-medium text-gray-800">{item.label}</div>
                <div className="text-xs text-gray-600 mt-1">{item.description}</div>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* 最近记录 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          最近记录
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : recentRecords.length > 0 ? (
          <div className="space-y-4">
            {recentRecords.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate('/history')}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      record.type === 'audio' ? 'bg-purple-100' :
                      record.type === 'image' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {record.type === 'audio' && <Mic className="w-4 h-4 text-purple-600" />}
                      {record.type === 'image' && <Camera className="w-4 h-4 text-blue-600" />}
                      {record.type === 'text' && <Image className="w-4 h-4 text-green-600" />}
                    </div>
                    <span className="text-sm text-gray-600">{formatTime(record.created_at)}</span>
                  </div>
                </div>
                
                <p className="text-gray-800 text-sm mb-2 line-clamp-2">
                  {record.content || '图片记录'}
                </p>
                
                {record.ai_analyses && record.ai_analyses.length > 0 && (
                  <div className="flex items-center text-xs text-purple-600">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI 分析已完成
                  </div>
                )}
              </motion.div>
            ))}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/history')}
              className="w-full py-3 text-purple-600 font-medium rounded-2xl border border-purple-200 hover:bg-purple-50 transition-all duration-300"
            >
              查看全部记录
            </motion.button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">还没有记录</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/record')}
              className="px-6 py-3 bg-gradient-to-r from-purple-400 to-blue-400 text-white font-medium rounded-2xl shadow-lg"
            >
              开始第一条记录
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* 个人画像提示 */}
      {!profile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-3xl p-6 border border-purple-200"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-400 rounded-xl mx-auto mb-3 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">完善个人画像</h3>
            <p className="text-sm text-gray-600 mb-4">
              设置你的 MBTI、职业等信息，让 AI 分析更加个性化
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/profile')}
              className="px-6 py-3 bg-gradient-to-r from-purple-400 to-blue-400 text-white font-medium rounded-2xl shadow-lg"
            >
              立即设置
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Home