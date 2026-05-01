import http from './http'

export const noteApi = {
  pageNotes: (params) => http.get('/note/notes', { params }),
  getNote: (id) => http.get(`/note/notes/${id}`),
  createNote: (payload) => http.post('/note/notes', payload),
  updateNote: (id, payload) => http.put(`/note/notes/${id}`, payload),
  deleteNote: (id) => http.delete(`/note/notes/${id}`),

  listTrash: () => http.get('/note/notes/trash'),
  restoreNote: (id) => http.put(`/note/notes/${id}/restore`),
  permanentlyDeleteNote: (id) => http.delete(`/note/notes/${id}/permanent`),
  emptyTrash: () => http.delete('/note/notes/trash/empty'),

  togglePin: (id) => http.put(`/note/notes/${id}/pin`),
  toggleStar: (id) => http.put(`/note/notes/${id}/star`),
  listStarred: () => http.get('/note/notes/starred'),

  listVaultItems: (params) => http.get('/note/vault-items', { params }),
  getVaultItem: (id) => http.get(`/note/vault-items/${id}`),
  createVaultItem: (payload) => http.post('/note/vault-items', payload),
  updateVaultItem: (id, payload) => http.put(`/note/vault-items/${id}`, payload),
  deleteVaultItem: (id) => http.delete(`/note/vault-items/${id}`),

  listTodos: (params) => http.get('/note/todos', { params }),
  getTodo: (id) => http.get(`/note/todos/${id}`),
  createTodo: (payload) => http.post('/note/todos', payload),
  updateTodo: (id, payload) => http.put(`/note/todos/${id}`, payload),
  updateTodoStatus: (id, status) => http.put(`/note/todos/${id}/status`, { status }),
  deleteTodo: (id) => http.delete(`/note/todos/${id}`),

  listTemplates: () => http.get('/note/templates'),
  getTemplate: (id) => http.get(`/note/templates/${id}`),
  createTemplate: (payload) => http.post('/note/templates', payload),
  updateTemplate: (id, payload) => http.put(`/note/templates/${id}`, payload),
  deleteTemplate: (id) => http.delete(`/note/templates/${id}`),

  listActivityLogs: (params) => http.get('/note/activity-logs', { params }),
  listRecentLogs: (params) => http.get('/note/activity-logs/recent', { params }),
  activityModuleStats: () => http.get('/note/activity-logs/stats/modules'),
  activityDailyStats: (params) => http.get('/note/activity-logs/stats/daily', { params }),

  globalSearch: (keyword) => http.get('/note/search', { params: { keyword } })
}
