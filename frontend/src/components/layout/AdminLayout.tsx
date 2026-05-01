import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import {
  Building2, Users, BookOpen, CalendarDays,
  ClipboardList, LayoutDashboard, LogOut, GraduationCap
} from 'lucide-react'

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'ダッシュボード' },
  { to: '/admin/blocks', icon: Building2, label: 'ブロック管理' },
  { to: '/admin/classrooms', icon: Building2, label: '教室管理' },
  { to: '/admin/courses', icon: BookOpen, label: 'コース管理' },
  { to: '/admin/classes/regular', icon: GraduationCap, label: '通常クラス' },
  { to: '/admin/classes/intensive', icon: GraduationCap, label: '講習クラス' },
  { to: '/admin/teachers', icon: Users, label: '講師管理' },
  { to: '/admin/schedules', icon: CalendarDays, label: 'スケジュール' },
  { to: '/admin/surveys', icon: ClipboardList, label: 'アンケート' },
]

export function AdminLayout() {
  const { logout, user } = useAuth()

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold text-primary">学習塾管理</h1>
          <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn('flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t">
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent w-full"
          >
            <LogOut className="h-4 w-4" />
            ログアウト
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
