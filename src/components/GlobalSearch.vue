<template>
  <el-dialog
    v-model="visible"
    :show-close="false"
    width="640px"
    class="global-search-dialog"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    @closed="reset"
  >
    <div class="search-box">
      <el-icon class="search-icon"><Search /></el-icon>
      <input
        ref="inputRef"
        v-model="keyword"
        class="search-input"
        placeholder="搜索笔记、保险箱、待办..."
        @input="onSearch"
        @keydown.down.prevent="moveDown"
        @keydown.up.prevent="moveUp"
        @keydown.enter.prevent="selectActive"
        @keydown.esc.prevent="visible = false"
      />
      <span class="search-shortcut">ESC</span>
    </div>

    <div class="search-results" v-if="keyword.trim()">
      <div v-if="loading" class="search-status">搜索中...</div>
      <template v-else-if="hasResults">
        <div v-if="results.notes.length" class="result-group">
          <div class="group-title">
            <el-icon><Document /></el-icon>
            笔记
            <el-tag size="small" type="info">{{ results.notes.length }}</el-tag>
          </div>
          <div
            v-for="item in results.notes"
            :key="'note-' + item.id"
            class="result-item"
            :class="{ active: activeKey === 'note-' + item.id }"
            @click="navigate('note', item.id)"
            @mouseenter="activeKey = 'note-' + item.id"
          >
            <el-icon class="result-icon"><Document /></el-icon>
            <div class="result-info">
              <div class="result-title">{{ item.title }}</div>
              <div v-if="item.subtitle" class="result-subtitle">{{ item.subtitle }}</div>
            </div>
          </div>
        </div>

        <div v-if="results.vaultItems.length" class="result-group">
          <div class="group-title">
            <el-icon><Lock /></el-icon>
            保险箱
            <el-tag size="small" type="info">{{ results.vaultItems.length }}</el-tag>
          </div>
          <div
            v-for="item in results.vaultItems"
            :key="'vault-' + item.id"
            class="result-item"
            :class="{ active: activeKey === 'vault-' + item.id }"
            @click="navigate('vault', item.id)"
            @mouseenter="activeKey = 'vault-' + item.id"
          >
            <el-icon class="result-icon"><Lock /></el-icon>
            <div class="result-info">
              <div class="result-title">{{ item.title }}</div>
              <div v-if="item.subtitle" class="result-subtitle">{{ item.subtitle }}</div>
            </div>
          </div>
        </div>

        <div v-if="results.todos.length" class="result-group">
          <div class="group-title">
            <el-icon><Finished /></el-icon>
            待办
            <el-tag size="small" type="info">{{ results.todos.length }}</el-tag>
          </div>
          <div
            v-for="item in results.todos"
            :key="'todo-' + item.id"
            class="result-item"
            :class="{ active: activeKey === 'todo-' + item.id }"
            @click="navigate('todo', item.id)"
            @mouseenter="activeKey = 'todo-' + item.id"
          >
            <el-icon class="result-icon"><Finished /></el-icon>
            <div class="result-info">
              <div class="result-title">{{ item.title }}</div>
              <div v-if="item.subtitle" class="result-subtitle">{{ item.subtitle }}</div>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="search-status">无匹配结果</div>
    </div>
    <div v-else class="search-hint">
      <span>输入关键词搜索笔记、保险箱和待办</span>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Document, Lock, Finished } from '@element-plus/icons-vue'
import { noteApi } from '@/api/note'

const visible = defineModel({ type: Boolean, default: false })

const router = useRouter()
const inputRef = ref(null)
const keyword = ref('')
const loading = ref(false)
const results = ref({ notes: [], vaultItems: [], todos: [] })
const activeKey = ref('')
let searchTimer = null

const flatKeys = computed(() => {
  const keys = []
  results.value.notes.forEach(n => keys.push('note-' + n.id))
  results.value.vaultItems.forEach(v => keys.push('vault-' + v.id))
  results.value.todos.forEach(t => keys.push('todo-' + t.id))
  return keys
})

const hasResults = computed(() =>
  results.value.notes.length + results.value.vaultItems.length + results.value.todos.length > 0
)

watch(visible, (val) => {
  if (val) {
    nextTick(() => inputRef.value?.focus())
  }
})

function onSearch() {
  clearTimeout(searchTimer)
  const kw = keyword.value.trim()
  if (!kw) {
    results.value = { notes: [], vaultItems: [], todos: [] }
    activeKey.value = ''
    return
  }
  searchTimer = setTimeout(async () => {
    loading.value = true
    try {
      results.value = await noteApi.globalSearch(kw)
      if (flatKeys.value.length) {
        activeKey.value = flatKeys.value[0]
      }
    } catch {
      results.value = { notes: [], vaultItems: [], todos: [] }
    } finally {
      loading.value = false
    }
  }, 300)
}

function moveDown() {
  const keys = flatKeys.value
  if (!keys.length) return
  const idx = keys.indexOf(activeKey.value)
  activeKey.value = keys[(idx + 1) % keys.length]
}

function moveUp() {
  const keys = flatKeys.value
  if (!keys.length) return
  const idx = keys.indexOf(activeKey.value)
  activeKey.value = keys[(idx - 1 + keys.length) % keys.length]
}

function selectActive() {
  if (!activeKey.value) return
  const [module, idStr] = activeKey.value.split('-')
  navigate(module, Number(idStr))
}

function navigate(module, id) {
  visible.value = false
  const routeMap = { note: '/notes', vault: '/vault', todo: '/todo' }
  router.push(routeMap[module] || '/notes')
}

function reset() {
  keyword.value = ''
  results.value = { notes: [], vaultItems: [], todos: [] }
  activeKey.value = ''
  loading.value = false
}

defineExpose({ show: () => { visible.value = true } })
</script>

<style scoped>
.global-search-dialog {
  --el-dialog-padding-primary: 0;
}

.global-search-dialog :deep(.el-dialog__header) {
  display: none;
}

.global-search-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.search-icon {
  font-size: 20px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  color: var(--el-text-color-primary);
  line-height: 1.5;
}

.search-input::placeholder {
  color: var(--el-text-color-placeholder);
}

.search-shortcut {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  border: 1px solid var(--el-border-color-lighter);
}

.search-results {
  max-height: 420px;
  overflow: auto;
  padding: 8px 0;
}

.search-hint {
  padding: 24px 20px;
  text-align: center;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

.search-status {
  padding: 20px 20px;
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.result-group {
  margin-bottom: 4px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--el-text-color-secondary);
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background 0.15s;
}

.result-item:hover,
.result-item.active {
  background: var(--el-fill-color-light);
}

.result-icon {
  font-size: 16px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
