import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/components/AuthProvider'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { TeacherLayout } from '@/components/layout/TeacherLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { BlocksPage } from '@/pages/admin/BlocksPage'
import { ClassroomsPage } from '@/pages/admin/ClassroomsPage'
import { CoursesPage } from '@/pages/admin/CoursesPage'
import { RegularClassesPage } from '@/pages/admin/RegularClassesPage'
import { IntensiveClassesPage } from '@/pages/admin/IntensiveClassesPage'
import { TeachersPage } from '@/pages/admin/TeachersPage'
import { SchedulesPage } from '@/pages/admin/SchedulesPage'
import { ScheduleDetailPage } from '@/pages/admin/ScheduleDetailPage'
import { SurveysPage } from '@/pages/admin/SurveysPage'
import { TeacherSchedulePage } from '@/pages/teacher/SchedulePage'
import { TeacherSurveysPage } from '@/pages/teacher/SurveysPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/admin" element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="blocks" element={<BlocksPage />} />
              <Route path="classrooms" element={<ClassroomsPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="classes/regular" element={<RegularClassesPage />} />
              <Route path="classes/intensive" element={<IntensiveClassesPage />} />
              <Route path="teachers" element={<TeachersPage />} />
              <Route path="schedules" element={<SchedulesPage />} />
              <Route path="schedules/:id" element={<ScheduleDetailPage />} />
              <Route path="surveys" element={<SurveysPage />} />
            </Route>

            <Route path="/teacher" element={
              <ProtectedRoute role="teacher">
                <TeacherLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="schedule" replace />} />
              <Route path="schedule" element={<TeacherSchedulePage />} />
              <Route path="surveys" element={<TeacherSurveysPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
