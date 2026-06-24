import api from './api'
import type { User } from '../types'

export const authService = {
  async login(cif: string, password: string): Promise<User> {
    const { data } = await api.post<User>('/auth/login', { cif, password })
    return data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>('/auth/me')
    return data
  },
}
