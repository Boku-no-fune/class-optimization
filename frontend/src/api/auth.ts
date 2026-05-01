import { apiClient } from './client'
import type { User } from '@/types'

export interface LoginParams {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
}

export const authApi = {
  login: (params: LoginParams) =>
    apiClient.post<LoginResponse>('/auth/sign_in', { user: params }),

  logout: () =>
    apiClient.delete('/auth/sign_out'),
}
