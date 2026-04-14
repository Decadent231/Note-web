import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import { storage } from '@/utils/storage'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: storage.get('note-font-token', ''),
    user: storage.get('note-font-user', null)
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token)
  },
  actions: {
    setSession(token, user) {
      this.token = token
      this.user = user
      storage.set('note-font-token', token)
      storage.set('note-font-user', user)
    },
    updateUser(user) {
      this.user = user
      storage.set('note-font-user', user)
    },
    async login(payload) {
      const data = await authApi.login(payload)
      this.setSession(data.token, data.userInfo)
      return data
    },
    async refreshUser() {
      if (!this.token) return null
      const user = await authApi.getCurrentUser()
      this.user = user
      storage.set('note-font-user', user)
      return user
    },
    logout() {
      this.token = ''
      this.user = null
      storage.remove('note-font-token')
      storage.remove('note-font-user')
    }
  }
})
