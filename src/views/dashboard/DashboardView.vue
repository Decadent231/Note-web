<template>
  <div class="page-shell">
    <div>
      <h1 class="page-title">工作台</h1>
      <p class="page-subtitle">这里汇总笔记、保险箱、待办三类数据，方便快速进入今天的工作上下文。</p>
    </div>

    <div class="metric-grid" style="margin-top: 20px;">
      <div class="metric-card">
        <div class="metric-label">笔记总数</div>
        <div class="metric-value">{{ metrics.noteCount }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">分类数量</div>
        <div class="metric-value">{{ metrics.categoryCount }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">保险箱记录</div>
        <div class="metric-value">{{ metrics.vaultCount }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">未完成待办</div>
        <div class="metric-value">{{ metrics.todoOpenCount }}</div>
      </div>
    </div>

    <div class="split-grid" style="margin-top: 18px;">
      <div class="section-card" style="padding: 18px 18px 8px;">
        <div class="toolbar-row" style="justify-content: space-between; margin-bottom: 12px;">
          <div>
            <div style="font-size: 20px; font-weight: 700;">最近更新的笔记</div>
            <div class="page-subtitle">优先查看最近活跃内容</div>
          </div>
          <el-button text type="primary" @click="router.push('/notes')">进入笔记</el-button>
        </div>

        <el-empty v-if="recentNotes.length === 0" description="还没有笔记" />
        <div v-else class="recent-notes-scroll scrollbar-hidden">
          <el-timeline>
            <el-timeline-item
              v-for="item in recentNotes"
              :key="item.id"
              :timestamp="formatDate(item.updatedAt)"
              placement="top"
            >
              <div style="font-weight: 700;">{{ item.title }}</div>
              <div class="page-subtitle">{{ item.category || '未分类' }} · {{ item.tags || '无标签' }}</div>
              <div style="margin-top: 8px; line-height: 1.8;">{{ item.summary || stripHtml(item.content).slice(0, 80) }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>

      <div style="display: grid; gap: 18px;">
        <div class="section-card" style="padding: 18px;">
          <div style="font-size: 20px; font-weight: 700;">待办快照</div>
          <div class="page-subtitle" style="margin-bottom: 14px;">按状态快速浏览任务情况</div>
          <el-progress :percentage="todoCompletion" :stroke-width="10" striped striped-flow />
          <div style="margin-top: 16px; display: grid; gap: 12px;">
            <div class="toolbar-row" style="justify-content: space-between;">
              <span>待处理</span>
              <strong>{{ todoStats.todo }}</strong>
            </div>
            <div class="toolbar-row" style="justify-content: space-between;">
              <span>进行中</span>
              <strong>{{ todoStats.doing }}</strong>
            </div>
            <div class="toolbar-row" style="justify-content: space-between;">
              <span>已完成</span>
              <strong>{{ todoStats.done }}</strong>
            </div>
          </div>
        </div>

        <div class="section-card" style="padding: 18px;">
          <div style="font-size: 20px; font-weight: 700;">保险箱分类</div>
          <div class="page-subtitle" style="margin-bottom: 14px;">优先管理账号密集的分类</div>
          <el-empty v-if="vaultGroups.length === 0" description="还没有保险箱记录" />
          <div v-else style="display: grid; gap: 12px;">
            <div
              v-for="item in vaultGroups"
              :key="item.name"
              class="metric-card"
              style="padding: 14px;"
            >
              <div class="toolbar-row" style="justify-content: space-between;">
                <span>{{ item.name }}</span>
                <strong>{{ item.count }} 条</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { noteApi } from '@/api/note'

const router = useRouter()
const recentNotes = ref([])
const vaultItems = ref([])
const todoItems = ref([])
const metrics = reactive({
  noteCount: 0,
  categoryCount: 0,
  vaultCount: 0,
  todoOpenCount: 0
})

const todoStats = computed(() => ({
  todo: todoItems.value.filter((item) => item.status === 'todo').length,
  doing: todoItems.value.filter((item) => item.status === 'doing').length,
  done: todoItems.value.filter((item) => item.status === 'done').length
}))

const todoCompletion = computed(() => {
  if (!todoItems.value.length) return 0
  return Math.round((todoStats.value.done / todoItems.value.length) * 100)
})

const vaultGroups = computed(() => {
  const map = new Map()
  vaultItems.value.forEach((item) => {
    const key = item.category || '未分类'
    map.set(key, (map.get(key) || 0) + 1)
  })
  return [...map.entries()].map(([name, count]) => ({ name, count }))
})

function stripHtml(html = '') {
  return html.replace(/<[^>]+>/g, '').trim()
}

function formatDate(value) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'
}

async function loadData() {
  const [noteData, vaultData, todoData] = await Promise.all([
    noteApi.pageNotes({ current: 1, size: 6 }),
    noteApi.listVaultItems({}),
    noteApi.listTodos({})
  ])

  recentNotes.value = noteData.records || []
  vaultItems.value = vaultData || []
  todoItems.value = todoData || []

  metrics.noteCount = noteData.total || 0
  metrics.categoryCount = new Set((noteData.records || []).map((item) => item.category).filter(Boolean)).size
  metrics.vaultCount = vaultItems.value.length
  metrics.todoOpenCount = todoItems.value.filter((item) => item.status !== 'done').length
}

onMounted(loadData)
</script>

<style scoped>
.recent-notes-scroll {
  max-height: 520px;
  overflow: auto;
  padding-right: 6px;
}

@media (max-width: 1080px) {
  .recent-notes-scroll {
    max-height: 420px;
  }
}
</style>
