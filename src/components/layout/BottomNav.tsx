import { NavLink } from 'react-router-dom'
import { Home, LineChart, Calculator, Bell } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Trang chủ' },
  { to: '/charts', icon: LineChart, label: 'Biểu đồ' },
  { to: '/converter', icon: Calculator, label: 'Quy đổi' },
  { to: '/alerts', icon: Bell, label: 'Cảnh báo' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe">
      <div className="max-w-lg mx-auto px-2">
        <div className="flex items-center justify-around">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 px-4 min-w-[64px] transition-colors ${
                  isActive 
                    ? 'text-gold-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-gold-100' : ''}`}>
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="text-xs font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
