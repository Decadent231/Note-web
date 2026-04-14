<template>
  <div class="layout-shell">
    <aside class="layout-sidebar glass-panel">
      <div class="brand-block">
        <div class="brand-kicker">WORKSPACE</div>
        <div class="brand-title">Note Flow</div>
        <div class="brand-subtitle">个人工作笔记 + 密码管理 + 待办协作</div>
      </div>

      <el-menu
        class="nav-menu"
        :default-active="route.path"
        router
        background-color="transparent"
        text-color="var(--app-text-soft)"
        active-text-color="var(--app-text)"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>工作台</span>
        </el-menu-item>
        <el-menu-item index="/notes">
          <el-icon><Document /></el-icon>
          <span>工作笔记</span>
        </el-menu-item>
        <el-menu-item index="/vault">
          <el-icon><Lock /></el-icon>
          <span>密码保险箱</span>
        </el-menu-item>
        <el-menu-item index="/todos">
          <el-icon><List /></el-icon>
          <span>待办事项</span>
        </el-menu-item>
        <el-menu-item index="/profile">
          <el-icon><User /></el-icon>
          <span>个人中心</span>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-user-name">{{ userStore.user?.nickname }}</div>
          <div class="sidebar-user-email">{{ userStore.user?.email }}</div>
        </div>
      </div>
    </aside>

    <div class="layout-main">
      <header class="layout-header glass-panel">
        <div>
          <div class="header-title">{{ currentTitle }}</div>
          <div class="header-subtitle">已连接阿里云后端 · 101.201.235.13</div>
        </div>
        <div class="header-actions">
          <el-button circle @click="themeStore.toggleTheme()">
            <el-icon><component :is="themeStore.mode === 'dark' ? Sunny : Moon" /></el-icon>
          </el-button>
          <el-dropdown>
            <span class="user-chip">
              {{ userStore.user?.nickname }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/profile')">个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <main class="layout-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown, DataAnalysis, Document, List, Lock, Moon, Sunny, User } from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()

const currentTitle = computed(() => route.meta.title || '工作台')

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 18px;
  padding: 18px;
}

.layout-sidebar {
  border-radius: 28px;
  padding: 22px 18px;
  display: flex;
  flex-direction: column;
}

.brand-block {
  padding: 8px 10px 22px;
}

.brand-kicker {
  font-size: 12px;
  letter-spacing: 0.18em;
  color: var(--app-text-soft);
}

.brand-title {
  margin-top: 12px;
  font-size: 32px;
  font-weight: 800;
}

.brand-subtitle {
  margin-top: 10px;
  font-size: 14px;
  color: var(--app-text-soft);
  line-height: 1.7;
}

.nav-menu {
  border-right: none;
  background: transparent;
}

.nav-menu :deep(.el-menu-item) {
  margin-bottom: 8px;
  border-radius: 16px;
  height: 48px;
}

.nav-menu :deep(.is-active) {
  background: rgba(56, 189, 248, 0.14);
}

.sidebar-footer {
  margin-top: auto;
  padding: 14px 10px 4px;
}

.sidebar-user-name {
  font-size: 16px;
  font-weight: 700;
}

.sidebar-user-email {
  margin-top: 6px;
  color: var(--app-text-soft);
  font-size: 13px;
}

.layout-main {
  min-width: 0;
}

.layout-header {
  border-radius: 24px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.header-title {
  font-size: 26px;
  font-weight: 700;
}

.header-subtitle {
  margin-top: 8px;
  font-size: 13px;
  color: var(--app-text-soft);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-chip {
  min-width: 132px;
  height: 42px;
  padding: 0 14px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: var(--app-panel);
  border: 1px solid var(--app-border);
  cursor: pointer;
}

.layout-content {
  min-width: 0;
}

@media (max-width: 1080px) {
  .layout-shell {
    grid-template-columns: 1fr;
  }

  .layout-sidebar {
    padding-bottom: 12px;
  }
}
</style>
