import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: storage.get('note-font-theme', 'dark')
  }),
  actions: {
    initTheme() {
      document.documentElement.classList.toggle('dark', this.mode === 'dark')
    },
    toggleTheme() {
      this.mode = this.mode === 'dark' ? 'light' : 'dark'
      storage.set('note-font-theme', this.mode)
      this.initTheme()
    }
  }
})
