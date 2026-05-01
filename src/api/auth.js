import http from './http'

export const authApi = {
  sendCode: (email) => http.post('/user/auth/send-code', { email }),
  register: (payload) => http.post('/user/auth/register', payload),
  login: (payload) => http.post('/user/auth/login', payload),
  getCurrentUser: () => http.get('/user/users/me'),
  updateProfile: (payload) => http.put('/user/users/profile', payload),
  changePassword: (payload) => http.put('/user/users/password', payload),
  verifyPassword: (password) => http.post('/user/users/verify-password', { password })
}
