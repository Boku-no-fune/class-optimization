import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { schedulesApi, teachersApi, regularClassesApi, scheduleEntriesApi } from '@/api/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Teacher, RegularClass, ScheduleEntry } from '@/types'
import { WEEKDAY_LABELS } from '@/types'
import {
  ArrowLeft, Save, CheckCircle, CalendarDays, Eye,
  AlertTriangle, Pencil, X, Check,
} from 'lucide-react'

// --- 型 ---
type SlotItem = { class_id: number; subject: string; teacher_id: number | null }
type WeekTemplate = Record<string, SlotItem[]>
type TwoWeekTemplate = { week1: WeekTemplate; week2: WeekTemplate }

const WEEKDAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

const STATUS_LABELS: Record<string, string> = { draft: '作成中', approved: '承認済', published: '公開済' }
const STATUS_VARIANTS: Record<string, 'secondary' | 'warning' | 'success'> = {
  draft: 'secondary', approved: 'warning', published: 'success',
}

// テンプレートをデフォルト構造に正規化（存在しない曜日は []）
function normalizeTemplate(raw: unknown): TwoWeekTemplate {
  const tpl = (raw ?? {}) as Record<string, Record<string, SlotItem[]>>
  return {
    week1: Object.fromEntries(WEEKDAY_KEYS.map(k => [k, tpl.week1?.[k] ?? []])),
    week2: Object.fromEntries(WEEKDAY_KEYS.map(k => [k, tpl.week2?.[k] ?? []])),
  }
}

// ---- 担当講師セレクタ ----
function TeacherSelect({
  value,
  teachers,
  onChange,
}: {
  value: number | null
  teachers: Teacher[]
  onChange: (id: number | null) => void
}) {
  return (
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
      className="w-full text-xs border rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
    >
      <option value="">未割当</option>
      {teachers.map(t => (
        <option key={t.id} value={t.id}>
          {t.name}（{t.subject_category === 'liberal_arts' ? '文' : '理'}）
        </option>
      ))}
    </select>
  )
}

// ---- 1コマ分の表示 ----
function SlotCard({
  slot,
  className,
  teachers,
  editable,
  onTeacherChange,
}: {
  slot: SlotItem
  className: string
  teachers: Teacher[]
  editable: boolean
  onTeacherChange: (id: number | null) => void
}) {
  const teacher = teachers.find(t => t.id === slot.teacher_id)
  const unassigned = slot.teacher_id === null

  return (
    <div className={`rounded border px-2 py-1.5 mb-1 text-xs ${unassigned ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center gap-1 mb-0.5">
        {unassigned && <AlertTriangle className="h-3 w-3 text-yellow-500 flex-shrink-0" />}
        <span className="font-medium text-gray-700 truncate">{className}</span>
        <span className="ml-auto text-primary font-semibold">{slot.subject}</span>
      </div>
      {editable ? (
        <TeacherSelect value={slot.teacher_id} teachers={teachers} onChange={onTeacherChange} />
      ) : (
        <p className={`truncate ${unassigned ? 'text-yellow-600' : 'text-gray-500'}`}>
          {teacher ? teacher.name : '未割当'}
        </p>
      )}
    </div>
  )
}

// ---- 2週間カレンダータブ ----
function TemplateEditor({
  template,
  teachers,
  classes,
  editable,
  onUpdate,
}: {
  template: TwoWeekTemplate
  teachers: Teacher[]
  classes: RegularClass[]
  editable: boolean
  onUpdate: (next: TwoWeekTemplate) => void
}) {
  const classMap = Object.fromEntries(classes.map(c => [c.id, c.name]))

  const updateSlot = (
    week: 'week1' | 'week2',
    weekday: string,
    idx: number,
    teacherId: number | null,
  ) => {
    const next: TwoWeekTemplate = {
      week1: { ...template.week1, [weekday]: [...(template.week1[weekday] ?? [])] },
      week2: { ...template.week2, [weekday]: [...(template.week2[weekday] ?? [])] },
    }
    next[week][weekday] = next[week][weekday].map((s, i) =>
      i === idx ? { ...s, teacher_id: teacherId } : s,
    )
    onUpdate(next)
  }

  // 少なくとも一方の週にスロットがある曜日だけ表示
  const activeDays = WEEKDAY_KEYS.filter(
    k => (template.week1[k]?.length ?? 0) > 0 || (template.week2[k]?.length ?? 0) > 0,
  )

  if (activeDays.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        スロットが設定されていません。クラスの科目パターンを確認してください。
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border px-3 py-2 text-sm font-medium text-left w-16">曜日</th>
            <th className="border px-3 py-2 text-sm font-medium text-center">第1週</th>
            <th className="border px-3 py-2 text-sm font-medium text-center">第2週</th>
          </tr>
        </thead>
        <tbody>
          {activeDays.map(key => {
            const dayIdx = WEEKDAY_KEYS.indexOf(key)
            const slots1 = template.week1[key] ?? []
            const slots2 = template.week2[key] ?? []
            return (
              <tr key={key} className="align-top">
                <td className="border px-3 py-2 text-sm font-medium text-center bg-gray-50">
                  {WEEKDAY_LABELS[dayIdx]}
                </td>
                {(['week1', 'week2'] as const).map(week => {
                  const slots = week === 'week1' ? slots1 : slots2
                  return (
                    <td key={week} className="border px-2 py-2 min-w-48">
                      {slots.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">なし</p>
                      ) : (
                        slots.map((slot, idx) => (
                          <SlotCard
                            key={idx}
                            slot={slot}
                            className={classMap[slot.class_id] ?? `クラスID:${slot.class_id}`}
                            teachers={teachers}
                            editable={editable}
                            onTeacherChange={id => updateSlot(week, key, idx, id)}
                          />
                        ))
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ---- 展開済みエントリ一覧 + 個別編集 ----
function EntryList({
  entries,
  teachers,
}: {
  entries: ScheduleEntry[]
  teachers: Teacher[]
}) {
  const qc = useQueryClient()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTeacherId, setEditTeacherId] = useState<number | null>(null)
  const [editNote, setEditNote] = useState('')

  const updateMutation = useMutation({
    mutationFn: ({ id, teacher_id, note }: { id: number; teacher_id: number | null; note: string }) =>
      scheduleEntriesApi.update(id, { teacher_id: teacher_id ?? undefined, note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule'] })
      setEditingId(null)
    },
  })

  const startEdit = (entry: ScheduleEntry) => {
    setEditingId(entry.id)
    setEditTeacherId(entry.teacher_id ?? null)
    setEditNote(entry.note ?? '')
  }

  if (entries.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        スケジュールがまだ展開されていません。<br />
        「スケジュール展開」ボタンを押してください。
      </div>
    )
  }

  // 日付でグループ化
  const byDate = entries.reduce<Record<string, ScheduleEntry[]>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = []
    acc[e.date].push(e)
    return acc
  }, {})

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>日付</TableHead>
          <TableHead>科目</TableHead>
          <TableHead>開始</TableHead>
          <TableHead>終了</TableHead>
          <TableHead>担当講師</TableHead>
          <TableHead>メモ</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).flatMap(([date, dayEntries]) =>
          dayEntries.map((e, i) => {
            const teacher = teachers.find(t => t.id === e.teacher_id)
            const isEditing = editingId === e.id
            return (
              <TableRow key={e.id} className={e.is_modified ? 'bg-blue-50' : ''}>
                {i === 0 ? (
                  <TableCell rowSpan={dayEntries.length} className="font-medium align-top border-r">
                    {new Date(date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })}
                  </TableCell>
                ) : null}
                <TableCell>
                  <span className="font-medium">{e.subject}</span>
                  {e.is_modified && <Badge variant="secondary" className="ml-1 text-xs">修正済</Badge>}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {e.start_time ? String(e.start_time).slice(0, 5) : '-'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {e.end_time ? String(e.end_time).slice(0, 5) : '-'}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <TeacherSelect
                      value={editTeacherId}
                      teachers={teachers}
                      onChange={setEditTeacherId}
                    />
                  ) : (
                    <span className={teacher ? '' : 'text-yellow-600'}>
                      {teacher ? teacher.name : '未割当'}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <input
                      value={editNote}
                      onChange={e => setEditNote(e.target.value)}
                      placeholder="メモ"
                      className="w-full text-xs border rounded px-1.5 py-1"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">{e.note}</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {isEditing ? (
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="ghost"
                        onClick={() => updateMutation.mutate({ id: e.id, teacher_id: editTeacherId, note: editNote })}>
                        <Check className="h-3 w-3 text-green-600" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => startEdit(e)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}

// ---- メインページ ----
export function ScheduleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<'template' | 'entries'>('template')
  const [template, setTemplate] = useState<TwoWeekTemplate | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['schedule', id],
    queryFn: () => schedulesApi.get(Number(id)).then(r => r.data),
    enabled: !!id,
  })

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => teachersApi.list().then(r => r.data),
  })

  const { data: classes = [] } = useQuery({
    queryKey: ['regular_classes', schedule?.classroom_id],
    queryFn: () => regularClassesApi.list({ classroom_id: schedule?.classroom_id }).then(r => r.data),
    enabled: !!schedule?.classroom_id,
  })

  // スケジュールが読み込まれたらテンプレートを初期化
  useEffect(() => {
    if (schedule && !isDirty) {
      setTemplate(normalizeTemplate(schedule.two_week_template))
    }
  }, [schedule, isDirty])

  const saveMutation = useMutation({
    mutationFn: () =>
      schedulesApi.update(Number(id), { two_week_template: template as Record<string, unknown> }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule', id] })
      qc.invalidateQueries({ queryKey: ['schedules'] })
      setIsDirty(false)
    },
  })

  const approveMutation = useMutation({
    mutationFn: () => schedulesApi.update(Number(id), { status: 'approved' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedule', id] }),
  })

  const expandMutation = useMutation({
    mutationFn: () => schedulesApi.expand(Number(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule', id] })
      setActiveTab('entries')
    },
  })

  const publishMutation = useMutation({
    mutationFn: () => schedulesApi.update(Number(id), { status: 'published' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedule', id] }),
  })

  if (isLoading || !schedule || !template) return <p className="p-6">読み込み中...</p>

  const entries = (schedule as unknown as { schedule_entries?: ScheduleEntry[] }).schedule_entries ?? []
  const unassignedCount = Object.values(template).flatMap(week =>
    Object.values(week as WeekTemplate).flat()
  ).filter(s => s.teacher_id === null).length

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate('/admin/schedules')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />スケジュール一覧
          </button>
          <h2 className="text-2xl font-bold">
            {schedule.classroom?.name} — {schedule.year}年度
            <Badge variant={STATUS_VARIANTS[schedule.status]} className="ml-3 text-sm">
              {STATUS_LABELS[schedule.status]}
            </Badge>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            期間: {schedule.valid_from} ～ {schedule.valid_to}
          </p>
        </div>

        {/* ステータスワークフロー */}
        <div className="flex items-center gap-2">
          {isDirty && (
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              <Save className="h-4 w-4 mr-1" />
              {saveMutation.isPending ? '保存中...' : '変更を保存'}
            </Button>
          )}
          {schedule.status === 'draft' && (
            <Button variant="outline" onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}>
              <CheckCircle className="h-4 w-4 mr-1" />承認する
            </Button>
          )}
          {schedule.status === 'approved' && (
            <>
              <Button variant="outline" onClick={() => expandMutation.mutate()} disabled={expandMutation.isPending}>
                <CalendarDays className="h-4 w-4 mr-1" />
                {expandMutation.isPending ? '展開中...' : 'スケジュール展開'}
              </Button>
              <Button variant="outline" onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending}>
                <Eye className="h-4 w-4 mr-1" />講師に公開
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 未割当警告バナー */}
      {unassignedCount > 0 && (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-md px-4 py-2 text-sm text-yellow-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{unassignedCount}コマに担当講師が割り当てられていません。</span>
        </div>
      )}

      {/* タブ */}
      <div className="border-b flex gap-0">
        {([
          { key: 'template', label: '2週間テンプレート' },
          { key: 'entries', label: `展開済みスケジュール（${entries.length}件）` },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'template' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>2週間サイクルの担当講師設定</span>
              <span className="text-xs font-normal text-muted-foreground">
                ドロップダウンで担当を変更し、「変更を保存」で確定します
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TemplateEditor
              template={template}
              teachers={teachers}
              classes={classes}
              editable={schedule.status !== 'published'}
              onUpdate={next => {
                setTemplate(next)
                setIsDirty(true)
              }}
            />
            {isDirty && (
              <div className="mt-4 flex justify-end">
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  <Save className="h-4 w-4 mr-1" />
                  {saveMutation.isPending ? '保存中...' : '変更を保存'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'entries' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>展開済みスケジュール</span>
              <span className="text-xs font-normal text-muted-foreground">
                各コマの担当講師を個別に変更できます（変更済コマは青背景）
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EntryList entries={entries} teachers={teachers} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
