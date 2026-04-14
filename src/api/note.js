import http from './http'

export const noteApi = {
  pageNotes: (params) => http.get('/note/notes', { params }),
  getNote: (id) => http.get(`/note/notes/${id}`),
  createNote: (payload) => http.post('/note/notes', payload),
  updateNote: (id, payload) => http.put(`/note/notes/${id}`, payload),
  deleteNote: (id) => http.delete(`/note/notes/${id}`),

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
  deleteTodo: (id) => http.delete(`/note/todos/${id}`)
}
