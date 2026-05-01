import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { teachersApi, classroomsApi } from '@/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Teacher } from '@/types'
import { ALL_SUBJECTS, WEEKDAY_LABELS } from '@/types'
import { Pencil, Trash2, Plus, X } from 'lucide-react'

const WEEKDAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

function TeacherForm({ data, onSave, onCancel }: { data?: Teacher; onSave: (d: Partial<Teacher>) => void; onCancel: () => void }) {
  const { data: classrooms = [] } = useQuery({ queryKey: ['classrooms'], queryFn: () => classroomsApi.list().then(r => r.data) })
  const [form, setForm] = useState<Partial<Teacher>>({
    employee_number: data?.employee_number ?? '',
    name: data?.name ?? '',
    gender: data?.gender ?? 'male',
    classroom_id: data?.classroom_id,
    job_type: data?.job_type ?? '',
    subject_category: data?.subject_category ?? 'liberal_arts',
    teachable_subjects: data?.teachable_subjects ?? [],
    teachable_course_types: data?.teachable_course_types ?? [],
    years_of_service: data?.years_of_service,
    academic_score: data?.academic_score ?? 50,
    management_score: data?.management_score ?? 50,
    attrition_risk_score: data?.attrition_risk_score ?? 5,
    available_weekdays: data?.available_weekdays ?? {},
  })

  const set = (k: keyof Teacher, v: unknown) => setForm(f => ({ ...f, [k]: v }))
  const toggleSubject = (s: string) => {
    const curr = form.teachable_subjects ?? []
    set('teachable_subjects', curr.includes(s) ? curr.filter(x => x !== s) : [...curr, s])
  }
  const toggleCourseType = (ct: string) => {
    const curr = form.teachable_course_types ?? []
    set('teachable_course_types', curr.includes(ct) ? curr.filter(x => x !== ct) : [...curr, ct])
  }
  const setWeekday = (key: string, available: boolean, from?: string, to?: string) => {
    const wd = { ...(form.available_weekdays ?? {}) }
    wd[key] = available ? { from: from ?? '09:00', to: to ?? '21:00' } : null
    set('available_weekdays', wd)
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-4 border rounded-md bg-muted/30">
      <div><Label>社員番号 *</Label><Input value={form.employee_number} onChange={e => set('employee_number', e.target.value)} /></div>
      <div><Label>氏名 *</Label><Input value={form.name} onChange={e => set('name', e.target.value)} /></div>
      <div>
        <Label>性別</Label>
        <Select value={form.gender} onChange={e => set('gender', e.target.value)}>
          <option value="male">男性</option>
          <option value="female">女性</option>
          <option value="other">その他</option>
        </Select>
      </div>
      <div>
        <Label>所属教室 *</Label>
        <Select value={form.classroom_id?.toString()} onChange={e => set('classroom_id', Number(e.target.value))}>
          <option value="">選択...</option>
          {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </div>
      <div><Label>職種</Label><Input value={form.job_type} onChange={e => set('job_type', e.target.value)} /></div>
      <div>
        <Label>科目区分</Label>
        <Select value={form.subject_category} onChange={e => set('subject_category', e.target.value as 'liberal_arts' | 'science')}>
          <option value="liberal_arts">文系</option>
          <option value="science">理系</option>
        </Select>
      </div>
      <div className="col-span-2">
        <Label>指導可能科目</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {ALL_SUBJECTS.map(s => (
            <button key={s} type="button"
              onClick={() => toggleSubject(s)}
              className={`px-2 py-1 text-xs rounded-full border ${form.teachable_subjects?.includes(s) ? 'bg-primary text-white' : 'bg-white'}`}
            >{s}</button>
          ))}
        </div>
      </div>
      <div className="col-span-2">
        <Label>指導可能コース種別</Label>
        <div className="flex gap-2 mt-1">
          {['regular', 'intensive'].map(ct => (
            <button key={ct} type="button"
              onClick={() => toggleCourseType(ct)}
              className={`px-3 py-1 text-xs rounded-full border ${form.teachable_course_types?.includes(ct) ? 'bg-primary text-white' : 'bg-white'}`}
            >{ct === 'regular' ? '通常' : '講習'}</button>
          ))}
        </div>
      </div>
      <div className="col-span-2">
        <Label>勤務可能曜日</Label>
        <div className="grid grid-cols-7 gap-1 mt-1">
          {WEEKDAY_KEYS.map((key, i) => {
            const slot = form.available_weekdays?.[key]
            const available = !!slot
            return (
              <div key={key} className="text-xs">
                <button type="button"
                  onClick={() => setWeekday(key, !available)}
                  className={`w-full py-1 rounded ${available ? 'bg-primary text-white' : 'bg-gray-100'}`}
                >{WEEKDAY_LABELS[i]}</button>
                {available && (
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <input type="time" value={slot.from} onChange={e => setWeekday(key, true, e.target.value, slot.to)}
                      className="w-full text-xs border rounded px-1 py-0.5" />
                    <input type="time" value={slot.to} onChange={e => setWeekday(key, true, slot.from, e.target.value)}
                      className="w-full text-xs border rounded px-1 py-0.5" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <div><Label>教務スコア (0-100)</Label><Input type="number" min={0} max={100} value={form.academic_score} onChange={e => set('academic_score', Number(e.target.value))} /></div>
      <div><Label>生徒管理スコア (0-100)</Label><Input type="number" min={0} max={100} value={form.management_score} onChange={e => set('management_score', Number(e.target.value))} /></div>
      <div><Label>離脱リスクスコア (0-100)</Label><Input type="number" min={0} max={100} value={form.attrition_risk_score} onChange={e => set('attrition_risk_score', Number(e.target.value))} /></div>
      <div><Label>勤続年数</Label><Input type="number" min={0} value={form.years_of_service ?? ''} onChange={e => set('years_of_service', Number(e.target.value))} /></div>
      <div className="col-span-2 flex gap-2">
        <Button size="sm" onClick={() => onSave(form)}>保存</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}><X className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}

export function TeachersPage() {
  const qc = useQueryClient()
  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => teachersApi.list().then(r => r.data),
  })
  const [editing, setEditing] = useState<number | 'new' | null>(null)

  const createMutation = useMutation({
    mutationFn: (d: Partial<Teacher>) => teachersApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); setEditing(null) },
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: Partial<Teacher> & { id: number }) => teachersApi.update(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); setEditing(null) },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => teachersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teachers'] }),
  })

  if (isLoading) return <p>読み込み中...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">講師管理</h2>
        <Button size="sm" onClick={() => setEditing('new')}><Plus className="h-4 w-4 mr-1" />追加</Button>
      </div>
      {editing === 'new' && (
        <div className="mb-4">
          <TeacherForm onSave={(d) => createMutation.mutate(d)} onCancel={() => setEditing(null)} />
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>社員番号</TableHead>
            <TableHead>氏名</TableHead>
            <TableHead>所属教室</TableHead>
            <TableHead>区分</TableHead>
            <TableHead>指導科目</TableHead>
            <TableHead>教務/管理</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map(t => (
            <>
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs">{t.employee_number}</TableCell>
                <TableCell>{t.name}</TableCell>
                <TableCell>{t.classroom?.name}</TableCell>
                <TableCell>
                  <Badge variant={t.subject_category === 'liberal_arts' ? 'secondary' : 'warning'}>
                    {t.subject_category === 'liberal_arts' ? '文系' : '理系'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {t.teachable_subjects.slice(0, 3).map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                    {t.teachable_subjects.length > 3 && <Badge variant="secondary">+{t.teachable_subjects.length - 3}</Badge>}
                  </div>
                </TableCell>
                <TableCell>{t.academic_score}/{t.management_score}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(editing === t.id ? null : t.id)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => {
                      if (confirm('削除しますか？')) deleteMutation.mutate(t.id)
                    }}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {editing === t.id && (
                <TableRow key={`edit-${t.id}`}>
                  <TableCell colSpan={7} className="p-0">
                    <TeacherForm data={t} onSave={(d) => updateMutation.mutate({ id: t.id, ...d })} onCancel={() => setEditing(null)} />
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
