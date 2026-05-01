import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { storage } from '@/utils/storage'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '',
  timeout: 60000
})

http.interceptors.request.use((config) => {
  const token = storage.get('note-font-token', '')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => {
    const payload = response.data
    if (payload?.code !== 200) {
      ElMessage.error(payload?.message || '请求失败')
      return Promise.reject(new Error(payload?.message || '请求失败'))
    }
    return payload.data
  },
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      storage.remove('note-font-token')
      storage.remove('note-font-user')
      if (router.currentRoute.value.path !== '/login') {
        ElMessage.error('登录状态已失效，请重新登录')
        router.push('/login')
      }
    } else {
      ElMessage.error(error?.response?.data?.message || error.message || '网络异常')
    }
    return Promise.reject(error)
  }
)

export default http
