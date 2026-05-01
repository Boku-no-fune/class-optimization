import { apiClient } from './client'
import type { Block, Classroom, Course, Teacher, RegularClass, IntensiveClass, Schedule, ScheduleEntry, Survey } from '@/types'

// Blocks
export const blocksApi = {
  list: () => apiClient.get<Block[]>('/admin/blocks'),
  get: (id: number) => apiClient.get<Block>(`/admin/blocks/${id}`),
  create: (data: Partial<Block>) => apiClient.post<Block>('/admin/blocks', { block: data }),
  update: (id: number, data: Partial<Block>) => apiClient.patch<Block>(`/admin/blocks/${id}`, { block: data }),
  delete: (id: number) => apiClient.delete(`/admin/blocks/${id}`),
}

// Classrooms
export const classroomsApi = {
  list: () => apiClient.get<Classroom[]>('/admin/classrooms'),
  get: (id: number) => apiClient.get<Classroom>(`/admin/classrooms/${id}`),
  create: (data: Partial<Classroom>) => apiClient.post<Classroom>('/admin/classrooms', { classroom: data }),
  update: (id: number, data: Partial<Classroom>) => apiClient.patch<Classroom>(`/admin/classrooms/${id}`, { classroom: data }),
  delete: (id: number) => apiClient.delete(`/admin/classrooms/${id}`),
}

// Courses
export const coursesApi = {
  list: () => apiClient.get<Course[]>('/admin/courses'),
  get: (id: number) => apiClient.get<Course>(`/admin/courses/${id}`),
  create: (data: Partial<Course>) => apiClient.post<Course>('/admin/courses', { course: data }),
  update: (id: number, data: Partial<Course>) => apiClient.patch<Course>(`/admin/courses/${id}`, { course: data }),
  delete: (id: number) => apiClient.delete(`/admin/courses/${id}`),
}

// Teachers
export const teachersApi = {
  list: (params?: { classroom_id?: number; subject_category?: string }) =>
    apiClient.get<Teacher[]>('/admin/teachers', { params }),
  get: (id: number) => apiClient.get<Teacher>(`/admin/teachers/${id}`),
  create: (data: Partial<Teacher>) => apiClient.post<Teacher>('/admin/teachers', { teacher: data }),
  update: (id: number, data: Partial<Teacher>) => apiClient.patch<Teacher>(`/admin/teachers/${id}`, { teacher: data }),
  delete: (id: number) => apiClient.delete(`/admin/teachers/${id}`),
}

// Regular Classes
export const regularClassesApi = {
  list: (params?: { classroom_id?: number; year?: number }) =>
    apiClient.get<RegularClass[]>('/admin/regular_classes', { params }),
  get: (id: number) => apiClient.get<RegularClass>(`/admin/regular_classes/${id}`),
  create: (data: Partial<RegularClass>) => apiClient.post<RegularClass>('/admin/regular_classes', { regular_class: data }),
  update: (id: number, data: Partial<RegularClass>) => apiClient.patch<RegularClass>(`/admin/regular_classes/${id}`, { regular_class: data }),
  delete: (id: number) => apiClient.delete(`/admin/regular_classes/${id}`),
}

// Intensive Classes
export const intensiveClassesApi = {
  list: (params?: { classroom_id?: number; year?: number }) =>
    apiClient.get<IntensiveClass[]>('/admin/intensive_classes', { params }),
  get: (id: number) => apiClient.get<IntensiveClass>(`/admin/intensive_classes/${id}`),
  create: (data: Partial<IntensiveClass>) => apiClient.post<IntensiveClass>('/admin/intensive_classes', { intensive_class: data }),
  update: (id: number, data: Partial<IntensiveClass>) => apiClient.patch<IntensiveClass>(`/admin/intensive_classes/${id}`, { intensive_class: data }),
  delete: (id: number) => apiClient.delete(`/admin/intensive_classes/${id}`),
}

// Schedules
export const schedulesApi = {
  list: (params?: { classroom_id?: number }) => apiClient.get<Schedule[]>('/admin/schedules', { params }),
  get: (id: number) => apiClient.get<Schedule>(`/admin/schedules/${id}`),
  optimize: (params: { classroom_id: number; year: number; class_ids?: number[]; valid_from?: string; valid_to?: string }) =>
    apiClient.post('/admin/schedules/optimize', params),
  update: (id: number, data: Partial<Schedule>) => apiClient.patch<Schedule>(`/admin/schedules/${id}`, { schedule: data }),
  expand: (id: number) => apiClient.post(`/admin/schedules/${id}/expand`),
  delete: (id: number) => apiClient.delete(`/admin/schedules/${id}`),
}

// Schedule Entries
export const scheduleEntriesApi = {
  get: (id: number) => apiClient.get<ScheduleEntry>(`/admin/schedule_entries/${id}`),
  update: (id: number, data: Partial<ScheduleEntry>) =>
    apiClient.patch<ScheduleEntry>(`/admin/schedule_entries/${id}`, { schedule_entry: data }),
}

// Surveys
export const surveysApi = {
  list: () => apiClient.get<Survey[]>('/admin/surveys'),
  get: (id: number) => apiClient.get<Survey>(`/admin/surveys/${id}`),
  create: (data: Partial<Survey>) => apiClient.post<Survey>('/admin/surveys', { survey: data }),
  update: (id: number, data: Partial<Survey>) => apiClient.patch<Survey>(`/admin/surveys/${id}`, { survey: data }),
  delete: (id: number) => apiClient.delete(`/admin/surveys/${id}`),
  deliver: (id: number, teacher_ids: number[]) =>
    apiClient.post(`/admin/surveys/${id}/deliver`, { teacher_ids }),
  results: (id: number) => apiClient.get(`/admin/surveys/${id}/results`),
}

// CSV Imports
export const importsApi = {
  teachers: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post('/admin/imports/teachers', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  classrooms: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post('/admin/imports/classrooms', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  courses: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post('/admin/imports/courses', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}
