<template>
  <div class="page-shell">
    <div class="toolbar-row" style="justify-content: space-between; margin-bottom: 18px;">
      <div>
        <h1 class="page-title">笔记回收站</h1>
        <p class="page-subtitle">已删除的笔记会保留在这里，可以恢复或彻底删除。</p>
      </div>
      <el-button type="danger" plain :disabled="list.length === 0" @click="emptyAll">清空回收站</el-button>
    </div>

    <div class="section-card trash-card">
      <div v-for="item in list" :key="item.id" class="trash-row">
        <div class="trash-row-main">
          <div class="trash-title">{{ item.title }}</div>
          <div class="trash-meta">
            <span>{{ item.category || '未分类' }}</span>
            <span>·</span>
            <span>删除于 {{ formatDate(item.deletedAt) }}</span>
          </div>
        </div>
        <div class="trash-actions">
          <el-button text type="primary" @click="restoreItem(item.id)">恢复</el-button>
          <el-button text type="danger" @click="removePermanently(item.id)">彻底删除</el-button>
        </div>
      </div>
      <el-empty v-if="list.length === 0" description="回收站为空" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { noteApi } from '@/api/note'

const list = ref([])

function formatDate(value) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'
}

async function loadData() {
  list.value = await noteApi.listTrash()
}

async function restoreItem(id) {
  await noteApi.restoreNote(id)
  ElMessage.success('笔记已恢复')
  await loadData()
}

async function removePermanently(id) {
  await ElMessageBox.confirm('彻底删除后无法恢复，确定吗？', '彻底删除', { type: 'error' })
  await noteApi.permanentlyDeleteNote(id)
  ElMessage.success('已彻底删除')
  await loadData()
}

async function emptyAll() {
  await ElMessageBox.confirm('将清空所有已删除笔记，此操作不可恢复。', '清空回收站', { type: 'error' })
  await noteApi.emptyTrash()
  ElMessage.success('回收站已清空')
  await loadData()
}

onMounted(loadData)
</script>

<style scoped>
.trash-card {
  padding: 18px;
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.trash-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  border-radius: 14px;
  border: 1px solid var(--app-border);
  background: linear-gradient(155deg, color-mix(in srgb, var(--app-panel-strong) 88%, transparent), var(--app-panel));
  margin-bottom: 10px;
}

.trash-row-main {
  min-width: 0;
  flex: 1;
}

.trash-title {
  font-weight: 700;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trash-meta {
  margin-top: 6px;
  display: flex;
  gap: 6px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.trash-actions {
  flex-shrink: 0;
  display: flex;
  gap: 4px;
}

@media (max-width: 768px) {
  .trash-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
  }

  .trash-actions {
    align-self: flex-end;
  }

  .trash-meta {
    flex-wrap: wrap;
    gap: 4px;
  }
}
</style>
