import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Palette, Shield, LogOut, ChevronRight, Edit3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

const Settings = () => {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuthStore()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/auth')
  }

  const settingsSections = [
    {
      title: '个人信息',
      items: [
        {
          icon: User,
          label: '个人画像',
          description: '编辑 MBTI、职业等个人信息',
          action: () => navigate('/profile'),
          showChevron: true
        },
        {
          icon: Edit3,
          label: '账户信息',
          description: user?.email || '未设置邮箱',
          showChevron: false
        }
      ]
    },
    {
      title: '应用设置',
      items: [
        {
          icon: Bell,
          label: '通知设置',
          description: '管理推送通知偏好',
          action: () => {},
          showChevron: true
        },
        {
          icon: Palette,
          label: 'AI 分析风格',
          description: '调整 AI 分析的详细程度',
          action: () => {},
          showChevron: true
        }
      ]
    },
    {
      title: '隐私与安全',
      items: [
        {
          icon: Shield,
          label: '数据隐私',
          description: '管理数据使用和隐私设置',
          action: () => {},
          showChevron: true
        }
      ]
    }
  ]

  return (
    <div className="p-4 space-y-6">
      {/* 用户信息卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-3xl p-6 border border-purple-200"
      >
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800">
              {profile?.occupation || '用户'}
            </h2>
            <p className="text-sm text-gray-600 mb-1">{user?.email}</p>
            {profile?.mbti && (
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-lg">
                  {profile.mbti}
                </span>
                {profile.occupation && (
                  <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded-lg">
                    {profile.occupation}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* 设置选项 */}
      {settingsSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * (sectionIndex + 1) }}
          className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{section.title}</h3>
          
          <div className="space-y-3">
            {section.items.map((item, itemIndex) => {
              const Icon = item.icon
              return (
                <motion.button
                  key={item.label}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={item.action}
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all duration-300 flex items-center space-x-4"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-800">{item.label}</div>
                    <div className="text-sm text-gray-600">{item.description}</div>
                  </div>
                  
                  {item.showChevron && (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      ))}

      {/* 退出登录 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full p-4 bg-red-50 rounded-2xl border border-red-100 hover:bg-red-100 transition-all duration-300 flex items-center space-x-4"
        >
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-600" />
          </div>
          
          <div className="flex-1 text-left">
            <div className="font-medium text-red-600">退出登录</div>
            <div className="text-sm text-red-500">退出当前账户</div>
          </div>
        </motion.button>
      </motion.div>

      {/* 退出确认弹窗 */}
      {showLogoutConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2">确认退出</h3>
              <p className="text-gray-600 mb-6">确定要退出当前账户吗？</p>
              
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-2xl"
                >
                  取消
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="flex-1 py-3 bg-red-500 text-white font-medium rounded-2xl"
                >
                  确认退出
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 版本信息 */}
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">AI 日记助手 v1.0.0</p>
        <p className="text-xs text-gray-400 mt-1">让记录更有意义</p>
      </div>
    </div>
  )
}

export default Settings