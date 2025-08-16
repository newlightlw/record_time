import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, List, Search, Filter, Mic, Camera, Image, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import type { RecordType, AIAnalysis } from '../lib/supabase'

interface RecordWithAnalysis extends RecordType {
  ai_analyses: AIAnalysis[]
}

const History = () => {
  const { user } = useAuthStore()
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [records, setRecords] = useState<RecordWithAnalysis[]>([])
  const [filteredRecords, setFilteredRecords] = useState<RecordWithAnalysis[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<RecordWithAnalysis | null>(null)

  useEffect(() => {
    fetchRecords()
  }, [user])

  useEffect(() => {
    filterRecords()
  }, [records, searchQuery, typeFilter, selectedDate, viewMode])

  const fetchRecords = async () => {
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

      if (error) {
        console.error('Error fetching records:', error)
        return
      }

      setRecords(data || [])
    } catch (error) {
      console.error('Error fetching records:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterRecords = () => {
    let filtered = records

    // 按类型筛选
    if (typeFilter !== 'all') {
      filtered = filtered.filter(record => record.type === typeFilter)
    }

    // 按搜索关键词筛选
    if (searchQuery) {
      filtered = filtered.filter(record => 
        record.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.ai_analyses.some(analysis => 
          analysis.analysis_result.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // 日历模式下按日期筛选
    if (viewMode === 'calendar') {
      const selectedDateStr = selectedDate.toDateString()
      filtered = filtered.filter(record => 
        new Date(record.created_at).toDateString() === selectedDateStr
      )
    }

    setFilteredRecords(filtered)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'audio': return Mic
      case 'image': return Camera
      default: return Image
    }
  }

  const getRecordColor = (type: string) => {
    switch (type) {
      case 'audio': return 'bg-purple-100 text-purple-600'
      case 'image': return 'bg-blue-100 text-blue-600'
      default: return 'bg-green-100 text-green-600'
    }
  }

  // 生成日历
  const generateCalendar = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  const hasRecordsOnDate = (date: Date) => {
    return records.some(record => 
      new Date(record.created_at).toDateString() === date.toDateString()
    )
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    setSelectedDate(newDate)
  }

  const typeFilters = [
    { value: 'all', label: '全部', icon: Filter },
    { value: 'audio', label: '录音', icon: Mic },
    { value: 'image', label: '图片', icon: Camera },
    { value: 'text', label: '文字', icon: Image }
  ]

  return (
    <div className="p-4 space-y-6">
      {/* 顶部控制栏 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-lg border border-white/20"
      >
        {/* 视图切换 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                viewMode === 'calendar'
                  ? 'bg-white shadow-sm text-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">日历</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="text-sm font-medium">列表</span>
            </button>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索记录内容..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2 overflow-x-auto">
            {typeFilters.map((filter) => {
              const Icon = filter.icon
              const isActive = typeFilter === filter.value
              return (
                <button
                  key={filter.value}
                  onClick={() => setTypeFilter(filter.value)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? 'bg-purple-100 text-purple-600 border border-purple-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{filter.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* 日历视图 */}
      {viewMode === 'calendar' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20"
        >
          {/* 月份导航 */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <h3 className="text-lg font-semibold text-gray-800">
              {selectedDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
            </h3>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendar().map((date, index) => {
              const isCurrentMonth = date.getMonth() === selectedDate.getMonth()
              const isSelected = date.toDateString() === selectedDate.toDateString()
              const hasRecords = hasRecordsOnDate(date)
              const isToday = date.toDateString() === new Date().toDateString()
              
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDate(date)}
                  className={`relative p-2 rounded-xl text-sm transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-400 to-blue-400 text-white'
                      : isCurrentMonth
                      ? 'text-gray-800 hover:bg-gray-100'
                      : 'text-gray-400'
                  } ${
                    isToday && !isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : ''
                  }`}
                >
                  {date.getDate()}
                  {hasRecords && (
                    <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-purple-400'
                    }`} />
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* 记录列表 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: viewMode === 'calendar' ? 0.2 : 0.1 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {viewMode === 'calendar' 
            ? `${selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} 的记录`
            : '所有记录'
          }
        </h3>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="space-y-4">
            {filteredRecords.map((record, index) => {
              const Icon = getRecordIcon(record.type)
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedRecord(record)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getRecordColor(record.type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">
                          {viewMode === 'list' ? formatDate(record.created_at) : formatTime(record.created_at)}
                        </span>
                        {record.ai_analyses.length > 0 && (
                          <div className="flex items-center text-xs text-purple-600">
                            <Sparkles className="w-3 h-3 mr-1" />
                            已分析
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-800 text-sm line-clamp-2 mb-2">
                        {record.content || '图片记录'}
                      </p>
                      
                      {record.ai_analyses.length > 0 && (
                        <p className="text-xs text-gray-600 line-clamp-1">
                          {record.ai_analyses[0].analysis_result}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">
              {searchQuery || typeFilter !== 'all' 
                ? '没有找到匹配的记录' 
                : viewMode === 'calendar'
                ? '这一天还没有记录'
                : '还没有任何记录'
              }
            </p>
          </div>
        )}
      </motion.div>

      {/* 记录详情弹窗 */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedRecord(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">记录详情</h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getRecordColor(selectedRecord.type)}`}>
                    {(() => {
                      const Icon = getRecordIcon(selectedRecord.type)
                      return <Icon className="w-5 h-5" />
                    })()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {selectedRecord.type === 'audio' ? '语音记录' : 
                       selectedRecord.type === 'image' ? '图片记录' : '文字记录'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(selectedRecord.created_at)} {formatTime(selectedRecord.created_at)}
                    </div>
                  </div>
                </div>
                
                {selectedRecord.content && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">记录内容</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-xl">
                      {selectedRecord.content}
                    </p>
                  </div>
                )}
                
                {selectedRecord.ai_analyses.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                      AI 分析
                    </h4>
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-200">
                      <p className="text-gray-700 leading-relaxed">
                        {selectedRecord.ai_analyses[0].analysis_result}
                      </p>
                      {selectedRecord.ai_analyses[0].sentiment && (
                        <div className="mt-3 flex items-center space-x-2">
                          <span className="text-sm text-gray-600">情感倾向:</span>
                          <span className={`text-sm px-2 py-1 rounded-lg ${
                            selectedRecord.ai_analyses[0].sentiment === 'positive' 
                              ? 'bg-green-100 text-green-700'
                              : selectedRecord.ai_analyses[0].sentiment === 'negative'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {selectedRecord.ai_analyses[0].sentiment === 'positive' ? '积极' :
                             selectedRecord.ai_analyses[0].sentiment === 'negative' ? '消极' : '中性'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default History