import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Check, User, Briefcase, Heart, Target } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
  const { profile, updateProfile, user } = useAuthStore()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    mbti: '',
    occupation: '',
    personality: '',
    current_work: ''
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        mbti: profile.mbti || '',
        occupation: profile.occupation || '',
        personality: profile.personality || '',
        current_work: profile.current_work || ''
      })
    }
  }, [profile])

  const steps = [
    {
      title: 'MBTI 性格类型',
      icon: User,
      description: '选择你的 MBTI 性格类型，帮助 AI 更好地理解你',
      field: 'mbti',
      options: [
        { value: 'INTJ', label: 'INTJ - 建筑师', desc: '独立思考，追求完美' },
        { value: 'INTP', label: 'INTP - 思想家', desc: '逻辑分析，创新思维' },
        { value: 'ENTJ', label: 'ENTJ - 指挥官', desc: '天生领导，目标导向' },
        { value: 'ENTP', label: 'ENTP - 辩论家', desc: '机智灵活，善于创新' },
        { value: 'INFJ', label: 'INFJ - 提倡者', desc: '理想主义，富有洞察力' },
        { value: 'INFP', label: 'INFP - 调停者', desc: '价值驱动，富有创造力' },
        { value: 'ENFJ', label: 'ENFJ - 主人公', desc: '鼓舞他人，富有魅力' },
        { value: 'ENFP', label: 'ENFP - 竞选者', desc: '热情洋溢，富有想象力' },
        { value: 'ISTJ', label: 'ISTJ - 物流师', desc: '可靠务实，注重细节' },
        { value: 'ISFJ', label: 'ISFJ - 守护者', desc: '温暖体贴，乐于助人' },
        { value: 'ESTJ', label: 'ESTJ - 总经理', desc: '组织能力强，执行力佳' },
        { value: 'ESFJ', label: 'ESFJ - 执政官', desc: '善于合作，关心他人' },
        { value: 'ISTP', label: 'ISTP - 鉴赏家', desc: '实用主义，善于解决问题' },
        { value: 'ISFP', label: 'ISFP - 探险家', desc: '灵活适应，追求和谐' },
        { value: 'ESTP', label: 'ESTP - 企业家', desc: '行动派，善于应变' },
        { value: 'ESFP', label: 'ESFP - 表演者', desc: '活泼开朗，富有感染力' }
      ]
    },
    {
      title: '职业信息',
      icon: Briefcase,
      description: '告诉我们你的职业，让分析更贴近你的工作生活',
      field: 'occupation',
      isInput: true,
      placeholder: '例如：产品经理、软件工程师、设计师...'
    },
    {
      title: '性格特点',
      icon: Heart,
      description: '用几个词描述你的性格特点',
      field: 'personality',
      isTextarea: true,
      placeholder: '例如：内向、直觉、情感、感知...'
    },
    {
      title: '当前主要工作',
      icon: Target,
      description: '描述你目前的主要工作内容或项目',
      field: 'current_work',
      isTextarea: true,
      placeholder: '例如：负责一个移动应用的产品设计和用户体验优化...'
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await updateProfile(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        navigate('/')
      }
    } catch (err) {
      setError('保存失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon
  const isLastStep = currentStep === steps.length - 1
  const canProceed = formData[currentStepData.field as keyof typeof formData]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4">
      <div className="max-w-md mx-auto">
        {/* 进度指示器 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    index <= currentStep
                      ? 'bg-gradient-to-r from-purple-400 to-blue-400 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-1 mx-2 transition-all duration-300 ${
                      index < currentStep ? 'bg-gradient-to-r from-purple-400 to-blue-400' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            第 {currentStep + 1} 步，共 {steps.length} 步
          </p>
        </div>

        {/* 步骤内容 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20 mb-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentStepData.title}</h2>
              <p className="text-gray-600">{currentStepData.description}</p>
            </div>

            {/* 选项列表 */}
            {currentStepData.options && (
              <div className="space-y-3">
                {currentStepData.options.map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, [currentStepData.field]: option.value })}
                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                      formData[currentStepData.field as keyof typeof formData] === option.value
                        ? 'border-purple-400 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200 hover:bg-purple-25'
                    }`}
                  >
                    <div className="font-medium text-gray-800">{option.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{option.desc}</div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* 输入框 */}
            {currentStepData.isInput && (
              <input
                type="text"
                value={formData[currentStepData.field as keyof typeof formData]}
                onChange={(e) => setFormData({ ...formData, [currentStepData.field]: e.target.value })}
                placeholder={currentStepData.placeholder}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
              />
            )}

            {/* 文本域 */}
            {currentStepData.isTextarea && (
              <textarea
                value={formData[currentStepData.field as keyof typeof formData]}
                onChange={(e) => setFormData({ ...formData, [currentStepData.field]: e.target.value })}
                placeholder={currentStepData.placeholder}
                rows={4}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 resize-none"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* 错误信息 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-500 text-sm text-center bg-red-50 py-3 px-4 rounded-xl mb-4"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 导航按钮 */}
        <div className="flex space-x-4">
          {currentStep > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrev}
              className="flex-1 py-4 bg-gray-100 text-gray-700 font-medium rounded-2xl flex items-center justify-center space-x-2 transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>上一步</span>
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            disabled={!canProceed || loading}
            className="flex-1 py-4 bg-gradient-to-r from-purple-400 to-blue-400 text-white font-medium rounded-2xl flex items-center justify-center space-x-2 shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <span>{isLastStep ? '完成设置' : '下一步'}</span>
                {!isLastStep && <ChevronRight className="w-5 h-5" />}
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default Profile