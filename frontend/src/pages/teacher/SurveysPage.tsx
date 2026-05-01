import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { teacherApi } from '@/api/teacher'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { SurveyDelivery } from '@/types'
import { WEEKDAY_LABELS } from '@/types'
import { ClipboardCheck } from 'lucide-react'

function WeeklyAnswerForm({ delivery, onSave }: { delivery: SurveyDelivery; onSave: (answers: Record<string, unknown>) => void }) {
  const WEEKDAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const existing = delivery.survey_response?.answers ?? {}
  const [answers, setAnswers] = useState<Record<string, unknown>>(existing)

  const setDay = (key: string, available: boolean, from?: string, to?: string) => {
    setAnswers(a => ({
      ...a,
      [key]: available ? { available: true, from: from ?? '09:00', to: to ?? '21:00' } : { available: false },
    }))
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-2">
        {WEEKDAY_KEYS.map((key, i) => {
          const slot = answers[key] as { available?: boolean; from?: string; to?: string } | undefined
          const available = slot?.available === true
          return (
            <div key={key} className="text-xs text-center">
              <button type="button"
                onClick={() => setDay(key, !available)}
                className={`w-full py-2 rounded-md font-medium ${available ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
              >{WEEKDAY_LABELS[i]}</button>
              {available && (
                <div className="mt-1 space-y-0.5">
                  <input type="time" value={slot?.from ?? '09:00'} onChange={e => setDay(key, true, e.target.value, slot?.to)}
                    className="w-full text-xs border rounded px-1 py-0.5" />
                  <input type="time" value={slot?.to ?? '21:00'} onChange={e => setDay(key, true, slot?.from, e.target.value)}
                    className="w-full text-xs border rounded px-1 py-0.5" />
                </div>
              )}
            </div>
          )
        })}
      </div>
      <Button size="sm" onClick={() => onSave(answers)}>
        <ClipboardCheck className="h-4 w-4 mr-1" />回答を保存
      </Button>
    </div>
  )
}

export function TeacherSurveysPage() {
  const qc = useQueryClient()
  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ['teacher_surveys'],
    queryFn: () => teacherApi.getSurveys().then(r => r.data),
  })
  const [responding, setResponding] = useState<number | null>(null)

  const respondMutation = useMutation({
    mutationFn: ({ id, answers }: { id: number; answers: Record<string, unknown> }) => {
      const delivery = deliveries.find(d => d.id === id)
      return delivery?.survey_response
        ? teacherApi.updateResponse(id, answers)
        : teacherApi.respond(id, answers)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teacher_surveys'] }); setResponding(null) },
  })

  if (isLoading) return <p>読み込み中...</p>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">アンケート</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>タイトル</TableHead>
            <TableHead>種別</TableHead>
            <TableHead>締切</TableHead>
            <TableHead>回答状況</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.map((d: SurveyDelivery) => (
            <>
              <TableRow key={d.id}>
                <TableCell>{d.survey?.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{d.survey?.survey_type === 'weekly_availability' ? '週次' : 'スポット'}</Badge>
                </TableCell>
                <TableCell>
                  {d.survey?.deadline
                    ? new Date(d.survey.deadline) < new Date()
                      ? <Badge variant="destructive">締切超過</Badge>
                      : new Date(d.survey.deadline).toLocaleDateString('ja')
                    : '-'}
                </TableCell>
                <TableCell>
                  {d.survey_response?.submitted_at
                    ? <Badge variant="success">回答済</Badge>
                    : <Badge variant="secondary">未回答</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => setResponding(responding === d.id ? null : d.id)}>
                    {d.survey_response ? '回答変更' : '回答する'}
                  </Button>
                </TableCell>
              </TableRow>
              {responding === d.id && (
                <TableRow key={`respond-${d.id}`}>
                  <TableCell colSpan={5}>
                    <Card>
                      <CardHeader><CardTitle className="text-sm">{d.survey?.title}</CardTitle></CardHeader>
                      <CardContent>
                        {d.survey?.survey_type === 'weekly_availability' && (
                          <WeeklyAnswerForm
                            delivery={d}
                            onSave={(answers) => respondMutation.mutate({ id: d.id, answers })}
                          />
                        )}
                      </CardContent>
                    </Card>
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
