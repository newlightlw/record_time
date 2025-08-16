import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Camera, Image, Send, Square, Play, Pause, Upload, Sparkles } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'

const Record = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, profile } = useAuthStore()
  
  const [recordType, setRecordType] = useState(searchParams.get('type') || 'audio')
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [textContent, setTextContent] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState('')
  const [loading, setLoading] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        // 停止所有音频轨道
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('无法访问麦克风，请检查权限设置')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const simulateAIAnalysis = async (content: string, type: string) => {
    // 模拟AI分析过程
    setIsAnalyzing(true)
    
    // 模拟分析延迟
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 根据用户画像生成模拟分析
    const mbti = profile?.mbti || 'INFP'
    const occupation = profile?.occupation || '用户'
    
    let analysis = ''
    
    if (type === 'audio' || type === 'text') {
      analysis = `基于你的${mbti}性格类型和${occupation}职业背景，这段记录体现了你的思考模式。`
      
      if (content.includes('工作') || content.includes('项目')) {
        analysis += '你在工作中展现出了专业的态度和积极的心态。'
      }
      
      if (content.includes('学习') || content.includes('思考')) {
        analysis += '你对学习和自我提升的重视体现了持续成长的心态。'
      }
      
      analysis += `作为${mbti}类型的人，你的这种表达方式很符合你的性格特征。`
    } else {
      analysis = `这张图片记录了你生活中的一个瞬间。作为${mbti}类型的${occupation}，你善于捕捉生活中的美好细节，这体现了你对生活的热爱和观察力。`
    }
    
    setAnalysisResult(analysis)
    setIsAnalyzing(false)
  }

  const handleSubmit = async () => {
    if (!user) return
    
    setLoading(true)
    
    try {
      let content = ''
      let fileUrl = ''
      
      // 处理不同类型的内容
      if (recordType === 'audio' && audioBlob) {
        // 模拟语音转文本
        content = textContent || '语音记录内容（模拟转换）'
        // 这里应该上传音频文件到Supabase Storage
      } else if (recordType === 'text') {
        content = textContent
      } else if ((recordType === 'image' || recordType === 'screenshot') && selectedFile) {
        content = '图片记录'
        // 这里应该上传图片文件到Supabase Storage
      }
      
      if (!content && !selectedFile) {
        alert('请添加记录内容')
        return
      }
      
      // 保存记录到数据库
      const { data: record, error: recordError } = await supabase
        .from('records')
        .insert({
          user_id: user.id,
          type: recordType,
          content,
          file_url: fileUrl
        })
        .select()
        .single()
      
      if (recordError) {
        throw recordError
      }
      
      // 生成AI分析
      await simulateAIAnalysis(content, recordType)
      
      // 保存AI分析结果
      const { error: analysisError } = await supabase
        .from('ai_analyses')
        .insert({
          record_id: record.id,
          analysis_result: analysisResult,
          sentiment: 'positive',
          keywords: ['记录', '生活', '思考']
        })
      
      if (analysisError) {
        console.error('Error saving analysis:', analysisError)
      }
      
      // 保存成功后的处理
      alert('记录保存成功！AI分析已完成。')
      
      // 重置表单状态
      setTextContent('')
      setAudioBlob(null)
      setAudioUrl('')
      setSelectedFile(null)
      setPreviewUrl('')
      setAnalysisResult('')
      setIsAnalyzing(false)
      
      // 导航回首页
      navigate('/')
      
    } catch (error) {
      console.error('Error saving record:', error)
      alert('保存失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const recordTypes = [
    { type: 'audio', icon: Mic, label: '录音' },
    { type: 'text', icon: Image, label: '文字' },
    { type: 'image', icon: Camera, label: '拍照' },
    { type: 'screenshot', icon: Upload, label: '上传' }
  ]

  return (
    <div className="p-4 space-y-6">
      {/* 类型选择 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">选择记录类型</h2>
        <div className="grid grid-cols-4 gap-3">
          {recordTypes.map((item) => {
            const Icon = item.icon
            const isActive = recordType === item.type
            return (
              <motion.button
                key={item.type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRecordType(item.type)}
                className={`p-3 rounded-2xl border-2 transition-all duration-300 ${
                  isActive
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <Icon className={`w-6 h-6 mx-auto mb-2 ${
                  isActive ? 'text-purple-600' : 'text-gray-600'
                }`} />
                <div className={`text-sm font-medium ${
                  isActive ? 'text-purple-600' : 'text-gray-600'
                }`}>
                  {item.label}
                </div>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* 录制区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20"
      >
        {recordType === 'audio' && (
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">语音记录</h3>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gradient-to-r from-purple-400 to-blue-400 hover:shadow-xl'
              }`}
            >
              {isRecording ? (
                <Square className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </motion.button>
            
            <p className="text-gray-600">
              {isRecording ? '录制中...' : '点击开始录制'}
            </p>
            
            {audioUrl && (
              <div className="mt-4">
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/webm" />
                </audio>
              </div>
            )}
            
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="语音转文本内容将显示在这里，您也可以手动编辑..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              rows={4}
            />
          </div>
        )}

        {recordType === 'text' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">文字记录</h3>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="在这里输入你的想法、感受或今天发生的事情..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              rows={8}
            />
          </div>
        )}

        {(recordType === 'image' || recordType === 'screenshot') && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {recordType === 'image' ? '拍照记录' : '上传图片'}
            </h3>
            
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full h-48 object-cover rounded-2xl mx-auto"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-2xl"
                  >
                    重新选择
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-12 border-2 border-dashed border-gray-300 rounded-2xl hover:border-purple-400 transition-colors"
                >
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {recordType === 'image' ? '点击拍照' : '点击上传图片'}
                  </p>
                </motion.button>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* AI分析结果 */}
      <AnimatePresence>
        {(isAnalyzing || analysisResult) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl p-6 border border-purple-200"
          >
            <div className="flex items-center mb-4">
              <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">AI 分析</h3>
            </div>
            
            {isAnalyzing ? (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                <span className="text-gray-600">AI 正在分析中...</span>
              </div>
            ) : (
              <p className="text-gray-700 leading-relaxed">{analysisResult}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 提交按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex space-x-4"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/')}
          className="flex-1 py-4 bg-gray-100 text-gray-700 font-medium rounded-2xl"
        >
          取消
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading || (!textContent && !audioBlob && !selectedFile)}
          className="flex-1 py-4 bg-gradient-to-r from-purple-400 to-blue-400 text-white font-medium rounded-2xl shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>保存记录</span>
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  )
}

export default Record