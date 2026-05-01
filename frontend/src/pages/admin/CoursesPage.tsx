import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { coursesApi } from '@/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Course } from '@/types'
import { ALL_SUBJECTS, GRADE_LABELS } from '@/types'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

function CourseForm({ data, onSave, onCancel }: { data?: Course; onSave: (d: Partial<Course>) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Partial<Course>>({
    name: data?.name ?? '',
    course_type: data?.course_type ?? 'regular',
    subject_type: data?.subject_type ?? 'mixed',
    target_grades: data?.target_grades ?? [],
    subjects: data?.subjects ?? [],
    sessions_per_week: data?.sessions_per_week,
    periods_per_session: data?.periods_per_session,
    minutes_per_period: data?.minutes_per_period,
    total_days: data?.total_days,
    periods_per_day: data?.periods_per_day,
  })
  const set = (k: keyof Course, v: unknown) => setForm(f => ({ ...f, [k]: v }))
  const toggleGrade = (g: number) => {
    const curr = form.target_grades ?? []
    set('target_grades', curr.includes(g) ? curr.filter(x => x !== g) : [...curr, g].sort())
  }
  const toggleSubject = (s: string) => {
    const curr = form.subjects ?? []
    set('subjects', curr.includes(s) ? curr.filter(x => x !== s) : [...curr, s])
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-4 border rounded-md bg-muted/30">
      <div className="col-span-2"><Label>コース名 *</Label><Input value={form.name} onChange={e => set('name', e.target.value)} /></div>
      <div>
        <Label>コース種別</Label>
        <Select value={form.course_type} onChange={e => set('course_type', e.target.value as Course['course_type'])}>
          <option value="regular">通常</option>
          <option value="intensive">講習</option>
        </Select>
      </div>
      <div>
        <Label>文理区分</Label>
        <Select value={form.subject_type} onChange={e => set('subject_type', e.target.value as Course['subject_type'])}>
          <option value="liberal_arts">文系</option>
          <option value="science">理系</option>
          <option value="mixed">混合</option>
        </Select>
      </div>
      <div className="col-span-2">
        <Label>対象学年</Label>
        <div className="flex flex-wrap gap-1 mt-1">
          {Object.entries(GRADE_LABELS).map(([g, label]) => (
            <button key={g} type="button"
              onClick={() => toggleGrade(Number(g))}
              className={`px-2 py-1 text-xs rounded border ${form.target_grades?.includes(Number(g)) ? 'bg-primary text-white' : 'bg-white'}`}
            >{label}</button>
          ))}
        </div>
      </div>
      <div className="col-span-2">
        <Label>科目</Label>
        <div className="flex flex-wrap gap-1 mt-1">
          {ALL_SUBJECTS.map(s => (
            <button key={s} type="button"
              onClick={() => toggleSubject(s)}
              className={`px-2 py-1 text-xs rounded border ${form.subjects?.includes(s) ? 'bg-primary text-white' : 'bg-white'}`}
            >{s}</button>
          ))}
        </div>
      </div>
      {form.course_type === 'regular' ? (
        <>
          <div><Label>週回数</Label><Input type="number" min={1} value={form.sessions_per_week ?? ''} onChange={e => set('sessions_per_week', Number(e.target.value))} /></div>
          <div><Label>1回のコマ数</Label><Input type="number" min={1} value={form.periods_per_session ?? ''} onChange={e => set('periods_per_session', Number(e.target.value))} /></div>
          <div><Label>1コマの時間（分）</Label><Input type="number" min={30} value={form.minutes_per_period ?? ''} onChange={e => set('minutes_per_period', Number(e.target.value))} /></div>
        </>
      ) : (
        <>
          <div><Label>日数</Label><Input type="number" min={1} value={form.total_days ?? ''} onChange={e => set('total_days', Number(e.target.value))} /></div>
          <div><Label>1日のコマ数</Label><Input type="number" min={1} value={form.periods_per_day ?? ''} onChange={e => set('periods_per_day', Number(e.target.value))} /></div>
          <div><Label>1コマの時間（分）</Label><Input type="number" min={30} value={form.minutes_per_period ?? ''} onChange={e => set('minutes_per_period', Number(e.target.value))} /></div>
        </>
      )}
      <div className="col-span-2 flex gap-2">
        <Button size="sm" onClick={() => onSave(form)}>保存</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}><X className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}

export function CoursesPage() {
  const qc = useQueryClient()
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.list().then(r => r.data),
  })
  const [editing, setEditing] = useState<number | 'new' | null>(null)

  const createMutation = useMutation({ mutationFn: (d: Partial<Course>) => coursesApi.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); setEditing(null) } })
  const updateMutation = useMutation({ mutationFn: ({ id, ...d }: Partial<Course> & { id: number }) => coursesApi.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); setEditing(null) } })
  const deleteMutation = useMutation({ mutationFn: (id: number) => coursesApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }) })

  if (isLoading) return <p>読み込み中...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">コース管理</h2>
        <Button size="sm" onClick={() => setEditing('new')}><Plus className="h-4 w-4 mr-1" />追加</Button>
      </div>
      {editing === 'new' && <div className="mb-4"><CourseForm onSave={(d) => createMutation.mutate(d)} onCancel={() => setEditing(null)} /></div>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>コース名</TableHead>
            <TableHead>種別</TableHead>
            <TableHead>文理</TableHead>
            <TableHead>対象学年</TableHead>
            <TableHead>科目</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map(c => (
            <>
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell><Badge variant={c.course_type === 'regular' ? 'default' : 'warning'}>{c.course_type === 'regular' ? '通常' : '講習'}</Badge></TableCell>
                <TableCell>{c.subject_type === 'liberal_arts' ? '文系' : c.subject_type === 'science' ? '理系' : '混合'}</TableCell>
                <TableCell>{c.target_grades.map(g => GRADE_LABELS[g]).join(', ')}</TableCell>
                <TableCell>{c.subjects.slice(0, 4).join(', ')}{c.subjects.length > 4 ? '...' : ''}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(editing === c.id ? null : c.id)}><Pencil className="h-3 w-3" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { if (confirm('削除しますか？')) deleteMutation.mutate(c.id) }}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
              {editing === c.id && (
                <TableRow key={`edit-${c.id}`}>
                  <TableCell colSpan={6} className="p-0">
                    <CourseForm data={c} onSave={(d) => updateMutation.mutate({ id: c.id, ...d })} onCancel={() => setEditing(null)} />
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
