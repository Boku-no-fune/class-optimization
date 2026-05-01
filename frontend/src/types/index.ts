export interface User {
  id: number
  email: string
  role: 'admin' | 'teacher'
  teacher_id: number | null
}

export interface Block {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface Classroom {
  id: number
  code: string
  name: string
  block_id: number
  block?: Block
  address?: string
  nearest_station?: string
}

export interface Course {
  id: number
  name: string
  course_type: 'regular' | 'intensive'
  subject_type: 'liberal_arts' | 'science' | 'mixed'
  target_grades: number[]
  subjects: string[]
  sessions_per_week?: number
  periods_per_session?: number
  minutes_per_period?: number
  total_days?: number
  periods_per_day?: number
}

export interface Teacher {
  id: number
  employee_number: string
  name: string
  gender: 'male' | 'female' | 'other'
  classroom_id: number
  classroom?: Classroom
  job_type?: string
  subject_category: 'liberal_arts' | 'science'
  teachable_subjects: string[]
  teachable_course_types: string[]
  years_of_service?: number
  available_weekdays: Record<string, { from: string; to: string } | null>
  academic_score: number
  management_score: number
  attrition_risk_score: number
}

export interface RegularClass {
  id: number
  year: number
  name: string
  grade: number
  course_id: number
  course?: Course
  classroom_id: number
  classroom?: Classroom
  weekdays: number[]
  subject_pattern: Record<string, Record<string, Array<{ subject: string; periods: number }>>>
  teacher_assignments: Record<string, unknown>
  recommended_academic_score?: number
  recommended_management_score?: number
}

export interface IntensiveClass {
  id: number
  year: number
  intensive_name: string
  name: string
  grade: number
  course_id: number
  course?: Course
  classroom_id: number
  classroom?: Classroom
  subjects: string[]
  schedule_slots: Array<{ date: string; start_time: string; slots: Array<{ period: number; subject: string }> }>
  teacher_assignments: Record<string, unknown>
  recommended_academic_score?: number
  recommended_management_score?: number
}

export interface ScheduleEntry {
  id: number
  schedule_id: number
  class_id: number
  class_type: string
  date: string
  start_time?: string
  end_time?: string
  subject?: string
  teacher_id?: number
  teacher?: Teacher
  is_modified: boolean
  note?: string
}

export interface Schedule {
  id: number
  classroom_id: number
  classroom?: Classroom
  year: number
  schedule_type: 'regular' | 'intensive'
  status: 'draft' | 'approved' | 'published'
  two_week_template: Record<string, unknown>
  valid_from?: string
  valid_to?: string
  schedule_entries?: ScheduleEntry[]
}

export interface Survey {
  id: number
  survey_type: 'weekly_availability' | 'spot_availability'
  title: string
  description?: string
  target_weekdays: number[]
  target_slots: unknown[]
  deadline?: string
  created_by_id: number
}

export interface SurveyDelivery {
  id: number
  survey_id: number
  survey?: Survey
  teacher_id: number
  teacher?: Teacher
  survey_response?: SurveyResponse
}

export interface SurveyResponse {
  id: number
  survey_delivery_id: number
  answers: Record<string, unknown>
  submitted_at?: string
}

export const GRADE_LABELS: Record<number, string> = {
  1: '小1', 2: '小2', 3: '小3',
  4: '小4', 5: '小5', 6: '小6',
  7: '中1', 8: '中2', 9: '中3',
}

export const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

export const ALL_SUBJECTS = ['英語', '国語', '社会', '適性文系', '算数', '数学', '理科', '適性理系']
