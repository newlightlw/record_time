import { Outlet, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Calendar, Settings, Mic, User } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

const Layout = () => {
  const location = useLocation()
  const { user, signOut } = useAuthStore()

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/record', icon: Mic, label: '记录' },
    { path: '/history', icon: Calendar, label: '历史' },
    { path: '/settings', icon: Settings, label: '设置' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* 顶部导航栏 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-800">日记助手</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link
              to="/profile"
              className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors"
            >
              <User className="w-5 h-5 text-purple-600" />
            </Link>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-md mx-auto min-h-[calc(100vh-140px)] pb-20">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* 底部导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-purple-100">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <Icon 
                      className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-purple-600' : 'text-gray-400'
                      }`} 
                    />
                    <span 
                      className={`text-xs mt-1 transition-colors ${
                        isActive ? 'text-purple-600 font-medium' : 'text-gray-400'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Layout