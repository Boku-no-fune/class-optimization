import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { intensiveClassesApi, coursesApi, classroomsApi } from '@/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { IntensiveClass } from '@/types'
import { ALL_SUBJECTS, GRADE_LABELS } from '@/types'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

function IntensiveClassForm({ data, onSave, onCancel }: { data?: IntensiveClass; onSave: (d: Partial<IntensiveClass>) => void; onCancel: () => void }) {
  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: () => coursesApi.list().then(r => r.data) })
  const { data: classrooms = [] } = useQuery({ queryKey: ['classrooms'], queryFn: () => classroomsApi.list().then(r => r.data) })
  const intensiveCourses = courses.filter(c => c.course_type === 'intensive')
  const [form, setForm] = useState<Partial<IntensiveClass>>({
    year: data?.year ?? new Date().getFullYear(),
    intensive_name: data?.intensive_name ?? '',
    name: data?.name ?? '',
    grade: data?.grade ?? 5,
    course_id: data?.course_id,
    classroom_id: data?.classroom_id,
    subjects: data?.subjects ?? [],
    recommended_academic_score: data?.recommended_academic_score,
    recommended_management_score: data?.recommended_management_score,
  })
  const set = (k: keyof IntensiveClass, v: unknown) => setForm(f => ({ ...f, [k]: v }))
  const toggleSubject = (s: string) => {
    const curr = form.subjects ?? []
    set('subjects', curr.includes(s) ? curr.filter(x => x !== s) : [...curr, s])
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-4 border rounded-md bg-muted/30">
      <div><Label>年度</Label><Input type="number" value={form.year} onChange={e => set('year', Number(e.target.value))} /></div>
      <div><Label>講習名</Label><Input value={form.intensive_name} onChange={e => set('intensive_name', e.target.value)} placeholder="夏期講習2026" /></div>
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
          {intensiveCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </div>
      <div>
        <Label>教室</Label>
        <Select value={form.classroom_id?.toString()} onChange={e => set('classroom_id', Number(e.target.value))}>
          <option value="">選択...</option>
          {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
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
      <div><Label>推奨教務スコア</Label><Input type="number" min={0} max={100} value={form.recommended_academic_score ?? ''} onChange={e => set('recommended_academic_score', Number(e.target.value))} /></div>
      <div><Label>推奨管理スコア</Label><Input type="number" min={0} max={100} value={form.recommended_management_score ?? ''} onChange={e => set('recommended_management_score', Number(e.target.value))} /></div>
      <div className="col-span-2 flex gap-2">
        <Button size="sm" onClick={() => onSave(form)}>保存</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}><X className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}

export function IntensiveClassesPage() {
  const qc = useQueryClient()
  const { data: classes = [], isLoading } = useQuery({ queryKey: ['intensive_classes'], queryFn: () => intensiveClassesApi.list().then(r => r.data) })
  const [editing, setEditing] = useState<number | 'new' | null>(null)

  const createMutation = useMutation({ mutationFn: (d: Partial<IntensiveClass>) => intensiveClassesApi.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['intensive_classes'] }); setEditing(null) } })
  const updateMutation = useMutation({ mutationFn: ({ id, ...d }: Partial<IntensiveClass> & { id: number }) => intensiveClassesApi.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['intensive_classes'] }); setEditing(null) } })
  const deleteMutation = useMutation({ mutationFn: (id: number) => intensiveClassesApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['intensive_classes'] }) })

  if (isLoading) return <p>読み込み中...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">講習クラス管理</h2>
        <Button size="sm" onClick={() => setEditing('new')}><Plus className="h-4 w-4 mr-1" />追加</Button>
      </div>
      {editing === 'new' && <div className="mb-4"><IntensiveClassForm onSave={(d) => createMutation.mutate(d)} onCancel={() => setEditing(null)} /></div>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>年度</TableHead>
            <TableHead>講習名</TableHead>
            <TableHead>クラス名</TableHead>
            <TableHead>学年</TableHead>
            <TableHead>教室</TableHead>
            <TableHead>科目</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map(c => (
            <>
              <TableRow key={c.id}>
                <TableCell>{c.year}</TableCell>
                <TableCell>{c.intensive_name}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{GRADE_LABELS[c.grade]}</TableCell>
                <TableCell>{c.classroom?.name}</TableCell>
                <TableCell>{c.subjects.join(', ')}</TableCell>
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
                    <IntensiveClassForm data={c} onSave={(d) => updateMutation.mutate({ id: c.id, ...d })} onCancel={() => setEditing(null)} />
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
