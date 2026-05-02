<template>
  <div class="layout-shell">
    <div class="mobile-topbar">
      <el-button class="hamburger-btn" text @click="drawerVisible = true">
        <el-icon :size="22"><Operation /></el-icon>
      </el-button>
      <span class="mobile-topbar-title">Note Flow</span>
      <el-button class="mobile-search-btn" text @click="searchVisible = true">
        <el-icon :size="20"><Search /></el-icon>
      </el-button>
    </div>

    <aside class="layout-sidebar glass-panel" :class="{ 'drawer-visible': drawerVisible }">
      <div class="drawer-overlay" @click="drawerVisible = false"></div>
      <div class="sidebar-inner">
        <div class="brand-block">
          <div class="mobile-drawer-close">
            <el-button text @click="drawerVisible = false">
              <el-icon :size="20"><Close /></el-icon>
            </el-button>
          </div>
          <div class="brand-kicker">WORKSPACE</div>
          <div class="brand-title">Note Flow</div>
          <div class="brand-subtitle">个人工作笔记 + 密码管理 + 待办协作</div>
        </div>

        <div class="search-trigger" @click="searchVisible = true; drawerVisible = false">
          <el-icon><Search /></el-icon>
          <span>搜索...</span>
          <span class="search-trigger-shortcut">⌘K</span>
        </div>

        <el-menu
          class="nav-menu"
          :default-active="route.path"
          router
          background-color="transparent"
          text-color="var(--app-text-soft)"
          active-text-color="var(--app-text)"
          @select="drawerVisible = false"
        >
          <div class="nav-group">
            <div class="nav-group-label">效率工具</div>
            <el-menu-item index="/dashboard">
              <el-icon><DataAnalysis /></el-icon>
              <span>工作台</span>
            </el-menu-item>
            <el-menu-item index="/todos">
              <el-icon><List /></el-icon>
              <span>待办事项</span>
            </el-menu-item>
            <el-menu-item index="/calendar">
              <el-icon><Calendar /></el-icon>
              <span>日程日历</span>
            </el-menu-item>
          </div>

          <div class="nav-group">
            <div class="nav-group-label">知识管理</div>
            <el-menu-item index="/notes">
              <el-icon><Document /></el-icon>
              <span>工作笔记</span>
            </el-menu-item>
            <el-menu-item index="/wiki">
              <el-icon><Collection /></el-icon>
              <span>知识库</span>
            </el-menu-item>
            <el-menu-item index="/files">
              <el-icon><FolderOpened /></el-icon>
              <span>文件库</span>
            </el-menu-item>
          </div>

          <div class="nav-group">
            <div class="nav-group-label">安全与系统</div>
            <el-menu-item index="/vault">
              <el-icon><Lock /></el-icon>
              <span>密码保险箱</span>
            </el-menu-item>
            <el-menu-item index="/trash">
              <el-icon><Delete /></el-icon>
              <span>回收站</span>
            </el-menu-item>
            <el-menu-item index="/activity">
              <el-icon><Timer /></el-icon>
              <span>操作日志</span>
            </el-menu-item>
            <el-menu-item index="/profile">
              <el-icon><User /></el-icon>
              <span>个人中心</span>
            </el-menu-item>
          </div>
        </el-menu>

        <div class="sidebar-footer">
          <div class="sidebar-footer-row">
            <div class="sidebar-user">
              <div class="sidebar-user-name">{{ userStore.user?.nickname }}</div>
              <div class="sidebar-user-email">{{ userStore.user?.email }}</div>
            </div>
            <el-button class="theme-fab" circle @click="themeStore.toggleTheme()">
              <el-icon><component :is="themeStore.mode === 'dark' ? Sunny : Moon" /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </aside>

    <div class="layout-main">
      <main class="layout-content scrollbar-hidden">
        <router-view />
      </main>
    </div>

    <GlobalSearch v-model="searchVisible" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DataAnalysis, Delete, Document, List, Lock, Moon, Sunny, Timer, User, Search, Calendar, Collection, FolderOpened, Operation, Close } from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import GlobalSearch from '@/components/GlobalSearch.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()
const searchVisible = ref(false)
const drawerVisible = ref(false)

watch(() => route.path, () => {
  drawerVisible.value = false
})

function handleKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    searchVisible.value = !searchVisible.value
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.mobile-topbar {
  display: none;
}

.mobile-drawer-close {
  display: none;
}

.drawer-overlay {
  display: none;
}

.layout-shell {
  height: 100vh;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 18px;
  padding: 18px;
  overflow: hidden;
}

.layout-sidebar {
  border-radius: 28px;
  padding: 22px 18px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
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

.search-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 10px 18px;
  padding: 10px 14px;
  border-radius: 14px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

.search-trigger:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 0 0 1px var(--el-color-primary-light-8);
}

.search-trigger-shortcut {
  margin-left: auto;
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color-lighter);
}

.nav-menu {
  border-right: none;
  background: transparent;
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 4px;
}

.nav-menu :deep(.el-menu-item) {
  margin-bottom: 8px;
  border-radius: 16px;
  height: 48px;
}

.nav-menu :deep(.is-active) {
  background: rgba(56, 189, 248, 0.14);
}

.nav-group {
  margin-bottom: 8px;
}

.nav-group-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--el-text-color-placeholder);
  padding: 12px 14px 6px;
  text-transform: uppercase;
}

.sidebar-footer {
  margin-top: auto;
  padding: 14px 10px 4px;
}

.sidebar-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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
  min-height: 0;
  overflow: hidden;
}

.layout-content {
  min-width: 0;
  height: 100%;
  overflow: auto;
  padding-right: 4px;
}

.theme-fab {
  width: 58px;
  height: 58px;
  border: 1px solid color-mix(in srgb, var(--app-accent-2) 28%, var(--app-border));
  background: linear-gradient(160deg, var(--app-panel-strong), color-mix(in srgb, var(--app-panel) 82%, transparent));
  color: var(--app-text);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(18px);
  flex-shrink: 0;
}

.theme-fab :deep(.el-icon) {
  font-size: 22px;
}

.theme-fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 42px rgba(15, 23, 42, 0.24);
}

@media (max-width: 768px) {
  .layout-shell {
    display: flex;
    flex-direction: column;
    padding: 0;
    gap: 0;
    overflow: visible;
    height: auto;
    min-height: 100vh;
  }

  .mobile-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: var(--app-panel);
    border-bottom: 1px solid var(--app-border);
    backdrop-filter: blur(18px);
    position: sticky;
    top: 0;
    z-index: 100;
    flex-shrink: 0;
  }

  .mobile-topbar-title {
    font-size: 18px;
    font-weight: 800;
  }

  .hamburger-btn {
    padding: 8px;
  }

  .mobile-search-btn {
    padding: 8px;
  }

  .layout-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    z-index: 1000;
    border-radius: 0;
    padding: 0;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }

  .layout-sidebar.drawer-visible {
    transform: translateX(0);
  }

  .drawer-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: -1;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
  }

  .drawer-visible .drawer-overlay {
    opacity: 1;
    pointer-events: auto;
  }

  .sidebar-inner {
    padding: 22px 18px;
    overflow: auto;
    height: 100%;
  }

  .mobile-drawer-close {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 4px;
  }

  .layout-main {
    flex: 1;
    min-height: 0;
    overflow: visible;
  }

  .layout-content {
    height: auto;
    overflow: visible;
    padding-right: 0;
    padding-bottom: 32px;
  }

  .search-trigger-shortcut {
    display: none;
  }
}
</style>
