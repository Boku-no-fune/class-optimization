import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { teacherApi } from '@/api/teacher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { WEEKDAY_LABELS } from '@/types'

export function TeacherSchedulePage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const { data: entries = [] } = useQuery({
    queryKey: ['teacher_schedule', year, month],
    queryFn: () => teacherApi.getSchedule({ year, month }).then(r => r.data),
  })

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDay = new Date(year, month - 1, 1).getDay()

  const entriesByDate = entries.reduce<Record<string, typeof entries>>((acc, e) => {
    const key = e.date
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">スケジュール</h2>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium w-24 text-center">{year}年{month}月</span>
          <Button size="sm" variant="ghost" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayEntries = entriesByDate[dateStr] ?? []
          return (
            <div key={day} className={`min-h-20 border rounded-md p-1 ${dayEntries.length ? 'border-primary/30 bg-primary/5' : ''}`}>
              <p className="text-xs font-medium mb-1">{day}</p>
              {dayEntries.map(e => (
                <div key={e.id} className="text-xs bg-primary text-primary-foreground rounded px-1 py-0.5 mb-0.5 truncate">
                  {e.subject}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
