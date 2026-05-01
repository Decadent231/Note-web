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

  globalSearch: (keyword) => http.get('/note/search', { params: { keyword } }),

  // Calendar
  createEvent: (payload) => http.post('/note/calendar', payload),
  updateEvent: (id, payload) => http.put(`/note/calendar/${id}`, payload),
  deleteEvent: (id) => http.delete(`/note/calendar/${id}`),
  getEvent: (id) => http.get(`/note/calendar/${id}`),
  listEventsByMonth: (year, month) => http.get('/note/calendar', { params: { year, month } }),
  listEventsByRange: (startDate, endDate) => http.get('/note/calendar/range', { params: { startDate, endDate } }),
  listEventsToday: () => http.get('/note/calendar/today'),

  // Wiki Spaces
  createWikiSpace: (payload) => http.post('/note/wiki/spaces', payload),
  updateWikiSpace: (id, payload) => http.put(`/note/wiki/spaces/${id}`, payload),
  deleteWikiSpace: (id) => http.delete(`/note/wiki/spaces/${id}`),
  listWikiSpaces: () => http.get('/note/wiki/spaces'),
  getWikiSpace: (id) => http.get(`/note/wiki/spaces/${id}`),

  // Wiki Pages
  createWikiPage: (payload) => http.post('/note/wiki/pages', payload),
  updateWikiPage: (id, payload) => http.put(`/note/wiki/pages/${id}`, payload),
  deleteWikiPage: (id) => http.delete(`/note/wiki/pages/${id}`),
  getWikiPage: (id) => http.get(`/note/wiki/pages/${id}`),
  listWikiPages: (spaceId) => http.get(`/note/wiki/spaces/${spaceId}/pages`),
  getWikiPageTree: (spaceId) => http.get(`/note/wiki/spaces/${spaceId}/tree`),

  // File Assets
  uploadFile: (formData) => http.post('/note/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  pageFiles: (params) => http.get('/note/files', { params }),
  getFile: (id) => http.get(`/note/files/${id}`),
  updateFile: (id, params) => http.put(`/note/files/${id}`, null, { params }),
  deleteFile: (id) => http.delete(`/note/files/${id}`),
  listFileFolders: () => http.get('/note/files/folders'),
  fileStorageStats: () => http.get('/note/files/stats'),

  // Dashboard
  dashboardOverview: () => http.get('/note/dashboard/overview'),
  dashboardWeeklyReport: () => http.get('/note/dashboard/weekly-report'),
  dashboardKnowledgeGrowth: (params) => http.get('/note/dashboard/knowledge-growth', { params }),
  dashboardActivityHeatmap: (params) => http.get('/note/dashboard/activity-heatmap', { params }),
  dashboardTopTodos: (params) => http.get('/note/dashboard/top-todos', { params }),

  // Note-File links
  linkNoteFiles: (noteId, fileIds) => http.post(`/note/notes/${noteId}/files`, fileIds),
  unlinkNoteFile: (noteId, fileId) => http.delete(`/note/notes/${noteId}/files/${fileId}`),
  listNoteFiles: (noteId) => http.get(`/note/notes/${noteId}/files`),
  listFileNotes: (fileId) => http.get(`/note/files/${fileId}/notes`)
}
