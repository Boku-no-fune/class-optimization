import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { schedulesApi, classroomsApi } from '@/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Schedule } from '@/types'
import { Play, Trash2, Pencil } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = { draft: '作成中', approved: '承認済', published: '公開済' }
const STATUS_VARIANTS: Record<string, 'secondary' | 'warning' | 'success'> = { draft: 'secondary', approved: 'warning', published: 'success' }

function OptimizePanel() {
  const qc = useQueryClient()
  const { data: classrooms = [] } = useQuery({ queryKey: ['classrooms'], queryFn: () => classroomsApi.list().then(r => r.data) })
  const [params, setParams] = useState({ classroom_id: 0, year: new Date().getFullYear(), valid_from: '', valid_to: '' })
  const [result, setResult] = useState<{ proposals: unknown[]; warnings: unknown[] } | null>(null)

  const optimizeMutation = useMutation({
    mutationFn: () => schedulesApi.optimize(params).then(r => r.data),
    onSuccess: (data) => { setResult(data); qc.invalidateQueries({ queryKey: ['schedules'] }) },
  })

  return (
    <Card className="mb-6">
      <CardHeader><CardTitle>スケジュール最適化</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div>
            <Label>教室</Label>
            <Select value={params.classroom_id.toString()} onChange={e => setParams(p => ({ ...p, classroom_id: Number(e.target.value) }))}>
              <option value="0">選択...</option>
              {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div>
            <Label>年度</Label>
            <Input type="number" value={params.year} onChange={e => setParams(p => ({ ...p, year: Number(e.target.value) }))} />
          </div>
          <div>
            <Label>開始日</Label>
            <Input type="date" value={params.valid_from} onChange={e => setParams(p => ({ ...p, valid_from: e.target.value }))} />
          </div>
          <div>
            <Label>終了日</Label>
            <Input type="date" value={params.valid_to} onChange={e => setParams(p => ({ ...p, valid_to: e.target.value }))} />
          </div>
        </div>
        <Button onClick={() => optimizeMutation.mutate()} disabled={!params.classroom_id || optimizeMutation.isPending}>
          <Play className="h-4 w-4 mr-2" />
          {optimizeMutation.isPending ? '最適化中...' : '最適化実行'}
        </Button>

        {result && (
          <div className="mt-4">
            <p className="text-sm font-medium text-green-700 mb-2">最適化完了: {result.proposals.length} クラス処理</p>
            {result.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-xs font-medium text-yellow-800 mb-1">警告 ({result.warnings.length}件)</p>
                {(result.warnings as Array<{class_name?: string; type?: string; details?: string; key?: string}>).map((w, i) => (
                  <p key={i} className="text-xs text-yellow-700">
                    {w.class_name && `[${w.class_name}] `}{w.details || w.key}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function SchedulesPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => schedulesApi.list().then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => schedulesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] }),
  })

  if (isLoading) return <p>読み込み中...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">スケジュール管理</h2>
      </div>
      <OptimizePanel />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>教室</TableHead>
            <TableHead>年度</TableHead>
            <TableHead>種別</TableHead>
            <TableHead>期間</TableHead>
            <TableHead>ステータス</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((s: Schedule) => (
            <TableRow key={s.id}>
              <TableCell>{s.classroom?.name}</TableCell>
              <TableCell>{s.year}</TableCell>
              <TableCell>{s.schedule_type === 'regular' ? '通常' : '講習'}</TableCell>
              <TableCell>{s.valid_from} ～ {s.valid_to}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANTS[s.status]}>{STATUS_LABELS[s.status]}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/admin/schedules/${s.id}`)}>
                    <Pencil className="h-3 w-3 mr-1" />編集
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm('削除しますか？')) deleteMutation.mutate(s.id) }}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
