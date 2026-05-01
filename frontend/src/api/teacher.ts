import { apiClient } from './client'
import type { ScheduleEntry, SurveyDelivery } from '@/types'

export const teacherApi = {
  getSchedule: (params?: { year?: number; month?: number }) =>
    apiClient.get<ScheduleEntry[]>('/teacher/schedules', { params }),

  getSurveys: () =>
    apiClient.get<SurveyDelivery[]>('/teacher/surveys'),

  getSurvey: (id: number) =>
    apiClient.get<SurveyDelivery>(`/teacher/surveys/${id}`),

  respond: (id: number, answers: Record<string, unknown>) =>
    apiClient.post(`/teacher/surveys/${id}/respond`, { answers }),

  updateResponse: (id: number, answers: Record<string, unknown>) =>
    apiClient.patch(`/teacher/surveys/${id}/respond`, { answers }),
}
