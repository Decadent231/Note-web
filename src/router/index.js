import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    component: () => import('@/layout/AppLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'dashboard', component: () => import('@/views/dashboard/DashboardView.vue'), meta: { title: '工作台' } },
      { path: 'notes', name: 'notes', component: () => import('@/views/notes/NotesView.vue'), meta: { title: '工作笔记' } },
      { path: 'vault', name: 'vault', component: () => import('@/views/vault/VaultView.vue'), meta: { title: '密码保险箱' } },
      { path: 'todos', name: 'todos', component: () => import('@/views/todo/TodoView.vue'), meta: { title: '待办事项' } },
      { path: 'trash', name: 'trash', component: () => import('@/views/trash/TrashView.vue'), meta: { title: '回收站' } },
      { path: 'calendar', name: 'calendar', component: () => import('@/views/calendar/CalendarView.vue'), meta: { title: '日程日历' } },
      { path: 'wiki', name: 'wiki', component: () => import('@/views/wiki/WikiView.vue'), meta: { title: '知识库' } },
      { path: 'wiki/:spaceId', name: 'wiki-space', component: () => import('@/views/wiki/WikiSpaceView.vue'), meta: { title: '知识库空间' } },
      { path: 'files', name: 'files', component: () => import('@/views/files/FileAssetView.vue'), meta: { title: '文件库' } },
      { path: 'activity', name: 'activity', component: () => import('@/views/activity/ActivityView.vue'), meta: { title: '操作日志' } },
      { path: 'profile', name: 'profile', component: () => import('@/views/profile/ProfileView.vue'), meta: { title: '个人中心' } }
    ]
  },
  { path: '/login', name: 'login', component: () => import('@/views/auth/LoginView.vue'), meta: { guestOnly: true, title: '登录' } },
  { path: '/register', name: 'register', component: () => import('@/views/auth/RegisterView.vue'), meta: { guestOnly: true, title: '注册' } }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to) => {
  const userStore = useUserStore()
  document.title = `${to.meta.title || '工作笔记与个人效率管理系统'}`

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    return '/login'
  }

  if (to.meta.guestOnly && userStore.isAuthenticated) {
    return '/dashboard'
  }

  if (userStore.isAuthenticated && !userStore.user) {
    try {
      await userStore.refreshUser()
    } catch {
      userStore.logout()
      return '/login'
    }
  }

  return true
})

export default router
