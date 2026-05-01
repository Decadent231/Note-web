<template>
  <div class="page-shell">
    <div style="margin-bottom: 18px;">
      <h1 class="page-title">操作日志</h1>
      <p class="page-subtitle">记录所有模块的操作历史，便于回溯和审计。</p>
    </div>

    <div class="section-card" style="padding: 18px; margin-bottom: 18px;">
      <div class="toolbar-row">
        <el-select v-model="moduleFilter" clearable placeholder="按模块筛选" style="width: 180px;" @change="loadData">
          <el-option label="笔记" value="note" />
          <el-option label="保险箱" value="vault" />
          <el-option label="待办" value="todo" />
        </el-select>
      </div>
    </div>

    <div class="section-card" style="padding: 18px;">
      <el-timeline v-if="logs.length > 0">
        <el-timeline-item
          v-for="log in logs"
          :key="log.id"
          :timestamp="formatDate(log.createdAt)"
          placement="top"
        >
          <div style="display: flex; align-items: center; gap: 8px;">
            <el-tag size="small" effect="dark">{{ moduleLabel(log.module) }}</el-tag>
            <span style="font-weight: 700;">{{ actionLabel(log.action) }}</span>
            <span style="color: var(--el-text-color-secondary);">{{ log.detail || '' }}</span>
          </div>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="暂无操作记录" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { noteApi } from '@/api/note'

const moduleFilter = ref('')
const logs = ref([])

function formatDate(value) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'
}

function moduleLabel(value) {
  return { note: '笔记', vault: '保险箱', todo: '待办' }[value] || value
}

function actionLabel(value) {
  return { create: '创建', update: '更新', delete: '删除', restore: '恢复', export: '导出' }[value] || value
}

async function loadData() {
  const params = { limit: 100 }
  if (moduleFilter.value) {
    params.module = moduleFilter.value
  }
  logs.value = await noteApi.listActivityLogs(params)
}

onMounted(loadData)
</script>
