import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { surveysApi, teachersApi, classroomsApi } from '@/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Survey, Teacher } from '@/types'
import { WEEKDAY_LABELS } from '@/types'
import { Plus, Send, BarChart2, Trash2, X } from 'lucide-react'

function SurveyForm({ onSave, onCancel }: { onSave: (d: Partial<Survey>) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Partial<Survey>>({
    survey_type: 'weekly_availability',
    title: '',
    description: '',
    target_weekdays: [],
    deadline: '',
  })
  const set = (k: keyof Survey, v: unknown) => setForm(f => ({ ...f, [k]: v }))
  const toggleWeekday = (d: number) => {
    const curr = form.target_weekdays ?? []
    set('target_weekdays', curr.includes(d) ? curr.filter(x => x !== d) : [...curr, d].sort())
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-4 border rounded-md bg-muted/30">
      <div className="col-span-2"><Label>タイトル *</Label><Input value={form.title} onChange={e => set('title', e.target.value)} /></div>
      <div>
        <Label>種別</Label>
        <Select value={form.survey_type} onChange={e => set('survey_type', e.target.value as Survey['survey_type'])}>
          <option value="weekly_availability">週次勤務可能曜日調査</option>
          <option value="spot_availability">スポット勤務可能日調査</option>
        </Select>
      </div>
      <div><Label>締切</Label><Input type="datetime-local" value={form.deadline} onChange={e => set('deadline', e.target.value)} /></div>
      <div className="col-span-2"><Label>説明</Label><Input value={form.description} onChange={e => set('description', e.target.value)} /></div>
      {form.survey_type === 'weekly_availability' && (
        <div className="col-span-2">
          <Label>対象曜日</Label>
          <div className="flex gap-1 mt-1">
            {WEEKDAY_LABELS.map((label, i) => (
              <button key={i} type="button"
                onClick={() => toggleWeekday(i)}
                className={`w-8 h-8 text-xs rounded ${form.target_weekdays?.includes(i) ? 'bg-primary text-white' : 'bg-gray-100'}`}
              >{label}</button>
            ))}
          </div>
        </div>
      )}
      <div className="col-span-2 flex gap-2">
        <Button size="sm" onClick={() => onSave(form)}>保存</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}><X className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}

function DeliverPanel({ surveyId, onClose }: { surveyId: number; onClose: () => void }) {
  const qc = useQueryClient()
  const { data: teachers = [] } = useQuery({ queryKey: ['teachers'], queryFn: () => teachersApi.list().then(r => r.data) })
  const { data: classrooms = [] } = useQuery({ queryKey: ['classrooms'], queryFn: () => classroomsApi.list().then(r => r.data) })
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [filterClassroom, setFilterClassroom] = useState<number | null>(null)

  const filteredTeachers = filterClassroom ? teachers.filter((t: Teacher) => t.classroom_id === filterClassroom) : teachers
  const toggleAll = () => setSelectedIds(selectedIds.length === filteredTeachers.length ? [] : filteredTeachers.map((t: Teacher) => t.id))
  const toggle = (id: number) => setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id])

  const deliverMutation = useMutation({
    mutationFn: () => surveysApi.deliver(surveyId, selectedIds),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['surveys'] }); onClose() },
  })

  return (
    <Card className="mt-4">
      <CardHeader><CardTitle className="text-sm">配信対象講師を選択</CardTitle></CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-3">
          <Select value={filterClassroom?.toString() ?? ''} onChange={e => setFilterClassroom(e.target.value ? Number(e.target.value) : null)} className="w-40">
            <option value="">全教室</option>
            {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Button size="sm" variant="outline" onClick={toggleAll}>全選択/解除</Button>
        </div>
        <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto mb-3">
          {filteredTeachers.map((t: Teacher) => (
            <label key={t.id} className="flex items-center gap-1 text-xs cursor-pointer">
              <input type="checkbox" checked={selectedIds.includes(t.id)} onChange={() => toggle(t.id)} />
              {t.name}
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => deliverMutation.mutate()} disabled={!selectedIds.length}>
            <Send className="h-3 w-3 mr-1" />{selectedIds.length}名に配信
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>キャンセル</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SurveyResults({ surveyId }: { surveyId: number }) {
  const { data } = useQuery({ queryKey: ['survey_results', surveyId], queryFn: () => surveysApi.results(surveyId).then(r => r.data) })
  if (!data) return <p className="text-sm text-muted-foreground">読み込み中...</p>
  return (
    <div className="p-3 bg-muted/30 rounded mt-2 text-sm">
      <p>配信数: {data.total_sent} / 回答数: {data.responded}</p>
    </div>
  )
}

export function SurveysPage() {
  const qc = useQueryClient()
  const { data: surveys = [], isLoading } = useQuery({ queryKey: ['surveys'], queryFn: () => surveysApi.list().then(r => r.data) })
  const [creating, setCreating] = useState(false)
  const [delivering, setDelivering] = useState<number | null>(null)
  const [showResults, setShowResults] = useState<number | null>(null)

  const createMutation = useMutation({ mutationFn: (d: Partial<Survey>) => surveysApi.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['surveys'] }); setCreating(false) } })
  const deleteMutation = useMutation({ mutationFn: (id: number) => surveysApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['surveys'] }) })

  if (isLoading) return <p>読み込み中...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">アンケート管理</h2>
        <Button size="sm" onClick={() => setCreating(true)}><Plus className="h-4 w-4 mr-1" />作成</Button>
      </div>
      {creating && <div className="mb-4"><SurveyForm onSave={(d) => createMutation.mutate(d)} onCancel={() => setCreating(false)} /></div>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>タイトル</TableHead>
            <TableHead>種別</TableHead>
            <TableHead>締切</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {surveys.map((s: Survey) => (
            <>
              <TableRow key={s.id}>
                <TableCell>{s.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{s.survey_type === 'weekly_availability' ? '週次' : 'スポット'}</Badge>
                </TableCell>
                <TableCell>{s.deadline ? new Date(s.deadline).toLocaleDateString('ja') : '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button size="sm" variant="outline" onClick={() => setDelivering(delivering === s.id ? null : s.id)}>
                      <Send className="h-3 w-3 mr-1" />配信
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowResults(showResults === s.id ? null : s.id)}>
                      <BarChart2 className="h-3 w-3 mr-1" />結果
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { if (confirm('削除しますか？')) deleteMutation.mutate(s.id) }}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {delivering === s.id && (
                <TableRow key={`deliver-${s.id}`}>
                  <TableCell colSpan={4} className="p-0">
                    <DeliverPanel surveyId={s.id} onClose={() => setDelivering(null)} />
                  </TableCell>
                </TableRow>
              )}
              {showResults === s.id && (
                <TableRow key={`results-${s.id}`}>
                  <TableCell colSpan={4}><SurveyResults surveyId={s.id} /></TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
