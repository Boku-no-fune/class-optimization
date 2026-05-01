import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { blocksApi, classroomsApi, teachersApi, surveysApi } from '@/api/admin'
import { Building2, Users, ClipboardList, GraduationCap } from 'lucide-react'

export function DashboardPage() {
  const { data: blocks } = useQuery({ queryKey: ['blocks'], queryFn: () => blocksApi.list().then(r => r.data) })
  const { data: classrooms } = useQuery({ queryKey: ['classrooms'], queryFn: () => classroomsApi.list().then(r => r.data) })
  const { data: teachers } = useQuery({ queryKey: ['teachers'], queryFn: () => teachersApi.list().then(r => r.data) })
  const { data: surveys } = useQuery({ queryKey: ['surveys'], queryFn: () => surveysApi.list().then(r => r.data) })

  const stats = [
    { label: 'ブロック数', value: blocks?.length ?? 0, icon: Building2 },
    { label: '教室数', value: classrooms?.length ?? 0, icon: GraduationCap },
    { label: '講師数', value: teachers?.length ?? 0, icon: Users },
    { label: 'アンケート数', value: surveys?.length ?? 0, icon: ClipboardList },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">ダッシュボード</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
