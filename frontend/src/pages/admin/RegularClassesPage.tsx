import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { regularClassesApi, coursesApi, classroomsApi } from '@/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { RegularClass } from '@/types'
import { GRADE_LABELS, WEEKDAY_LABELS } from '@/types'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

function RegularClassForm({ data, onSave, onCancel }: { data?: RegularClass; onSave: (d: Partial<RegularClass>) => void; onCancel: () => void }) {
  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: () => coursesApi.list().then(r => r.data) })
  const { data: classrooms = [] } = useQuery({ queryKey: ['classrooms'], queryFn: () => classroomsApi.list().then(r => r.data) })
  const regularCourses = courses.filter(c => c.course_type === 'regular')
  const [form, setForm] = useState<Partial<RegularClass>>({
    year: data?.year ?? new Date().getFullYear(),
    name: data?.name ?? '',
    grade: data?.grade ?? 5,
    course_id: data?.course_id,
    classroom_id: data?.classroom_id,
    weekdays: data?.weekdays ?? [],
    recommended_academic_score: data?.recommended_academic_score,
    recommended_management_score: data?.recommended_management_score,
  })
  const set = (k: keyof RegularClass, v: unknown) => setForm(f => ({ ...f, [k]: v }))
  const toggleWeekday = (d: number) => {
    const curr = form.weekdays ?? []
    set('weekdays', curr.includes(d) ? curr.filter(x => x !== d) : [...curr, d].sort())
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-4 border rounded-md bg-muted/30">
      <div><Label>年度</Label><Input type="number" value={form.year} onChange={e => set('year', Number(e.target.value))} /></div>
      <div><Label>クラス名 *</Label><Input value={form.name} onChange={e => set('name', e.target.value)} /></div>
      <div>
        <Label>学年</Label>
        <Select value={form.grade?.toString()} onChange={e => set('grade', Number(e.target.value))}>
          {Object.entries(GRADE_LABELS).map(([g, label]) => <option key={g} value={g}>{label}</option>)}
        </Select>
      </div>
      <div>
        <Label>コース</Label>
        <Select value={form.course_id?.toString()} onChange={e => set('course_id', Number(e.target.value))}>
          <option value="">選択...</option>
          {regularCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </div>
      <div>
        <Label>教室</Label>
        <Select value={form.classroom_id?.toString()} onChange={e => set('classroom_id', Number(e.target.value))}>
          <option value="">選択...</option>
          {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </div>
      <div>
        <Label>授業曜日</Label>
        <div className="flex gap-1 mt-1">
          {WEEKDAY_LABELS.map((label, i) => (
            <button key={i} type="button"
              onClick={() => toggleWeekday(i)}
              className={`w-8 h-8 text-xs rounded ${form.weekdays?.includes(i) ? 'bg-primary text-white' : 'bg-gray-100'}`}
            >{label}</button>
          ))}
        </div>
      </div>
      <div><Label>推奨教務スコア</Label><Input type="number" min={0} max={100} value={form.recommended_academic_score ?? ''} onChange={e => set('recommended_academic_score', Number(e.target.value))} /></div>
      <div><Label>推奨管理スコア</Label><Input type="number" min={0} max={100} value={form.recommended_management_score ?? ''} onChange={e => set('recommended_management_score', Number(e.target.value))} /></div>
      <div className="col-span-2 flex gap-2">
        <Button size="sm" onClick={() => onSave(form)}>保存</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}><X className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}

export function RegularClassesPage() {
  const qc = useQueryClient()
  const { data: classes = [], isLoading } = useQuery({ queryKey: ['regular_classes'], queryFn: () => regularClassesApi.list().then(r => r.data) })
  const [editing, setEditing] = useState<number | 'new' | null>(null)

  const createMutation = useMutation({ mutationFn: (d: Partial<RegularClass>) => regularClassesApi.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['regular_classes'] }); setEditing(null) } })
  const updateMutation = useMutation({ mutationFn: ({ id, ...d }: Partial<RegularClass> & { id: number }) => regularClassesApi.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['regular_classes'] }); setEditing(null) } })
  const deleteMutation = useMutation({ mutationFn: (id: number) => regularClassesApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['regular_classes'] }) })

  if (isLoading) return <p>読み込み中...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">通常クラス管理</h2>
        <Button size="sm" onClick={() => setEditing('new')}><Plus className="h-4 w-4 mr-1" />追加</Button>
      </div>
      {editing === 'new' && <div className="mb-4"><RegularClassForm onSave={(d) => createMutation.mutate(d)} onCancel={() => setEditing(null)} /></div>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>年度</TableHead>
            <TableHead>クラス名</TableHead>
            <TableHead>学年</TableHead>
            <TableHead>教室</TableHead>
            <TableHead>授業曜日</TableHead>
            <TableHead>推奨スコア</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map(c => (
            <>
              <TableRow key={c.id}>
                <TableCell>{c.year}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{GRADE_LABELS[c.grade]}</TableCell>
                <TableCell>{c.classroom?.name}</TableCell>
                <TableCell>{c.weekdays.map(d => WEEKDAY_LABELS[d]).join(', ')}</TableCell>
                <TableCell>{c.recommended_academic_score}/{c.recommended_management_score}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(editing === c.id ? null : c.id)}><Pencil className="h-3 w-3" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { if (confirm('削除しますか？')) deleteMutation.mutate(c.id) }}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
              {editing === c.id && (
                <TableRow key={`edit-${c.id}`}>
                  <TableCell colSpan={7} className="p-0">
                    <RegularClassForm data={c} onSave={(d) => updateMutation.mutate({ id: c.id, ...d })} onCancel={() => setEditing(null)} />
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
