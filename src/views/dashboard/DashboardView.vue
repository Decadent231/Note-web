<template>
  <div class="page-shell">
    <div>
      <h1 class="page-title">工作台</h1>
      <p class="page-subtitle">数据总览、效率报告与今日待办，快速进入工作上下文。</p>
    </div>

    <div class="metric-grid" style="margin-top: 20px;">
      <div class="metric-card">
        <div class="metric-label">笔记总数</div>
        <div class="metric-value">{{ metrics.noteCount }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">知识库页面</div>
        <div class="metric-value">{{ metrics.wikiPageCount }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">待办总数</div>
        <div class="metric-value">{{ metrics.todoTotal }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">完成率</div>
        <div class="metric-value">{{ todoCompletion }}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">保险箱记录</div>
        <div class="metric-value">{{ metrics.vaultCount }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">日程事件</div>
        <div class="metric-value">{{ metrics.calendarCount }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">文件数量</div>
        <div class="metric-value">{{ metrics.fileCount }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">文件总大小</div>
        <div class="metric-value">{{ formatSize(metrics.fileTotalSize) }}</div>
      </div>
    </div>

    <div class="split-grid" style="margin-top: 18px;">
      <div class="section-card" style="padding: 18px;">
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 14px;">本周效率报告</div>
        <div class="report-grid" v-if="weeklyReport">
          <div class="report-item">
            <div class="report-item-label">新增笔记</div>
            <div class="report-item-row">
              <span class="report-item-value">{{ weeklyReport.thisWeekNotes }}</span>
              <span class="report-item-delta" :class="deltaClass(weeklyReport.thisWeekNotes, weeklyReport.lastWeekNotes)">
                {{ deltaText(weeklyReport.thisWeekNotes, weeklyReport.lastWeekNotes) }}
              </span>
            </div>
            <div class="report-item-sub">上周 {{ weeklyReport.lastWeekNotes }}</div>
          </div>
          <div class="report-item">
            <div class="report-item-label">完成待办</div>
            <div class="report-item-row">
              <span class="report-item-value">{{ weeklyReport.thisWeekDone }}</span>
              <span class="report-item-delta" :class="deltaClass(weeklyReport.thisWeekDone, weeklyReport.lastWeekDone)">
                {{ deltaText(weeklyReport.thisWeekDone, weeklyReport.lastWeekDone) }}
              </span>
            </div>
            <div class="report-item-sub">上周 {{ weeklyReport.lastWeekDone }}</div>
          </div>
          <div class="report-item">
            <div class="report-item-label">操作次数</div>
            <div class="report-item-row">
              <span class="report-item-value">{{ weeklyReport.thisWeekActivities }}</span>
              <span class="report-item-delta" :class="deltaClass(weeklyReport.thisWeekActivities, weeklyReport.lastWeekActivities)">
                {{ deltaText(weeklyReport.thisWeekActivities, weeklyReport.lastWeekActivities) }}
              </span>
            </div>
            <div class="report-item-sub">上周 {{ weeklyReport.lastWeekActivities }}</div>
          </div>
        </div>
        <el-empty v-else description="加载中..." :image-size="40" />
      </div>

      <div class="section-card" style="padding: 18px;">
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 14px;">活动热力图（近 90 天）</div>
        <v-chart class="heatmap-chart" :option="heatmapOption" autoresize />
      </div>
    </div>

    <div class="split-grid" style="margin-top: 18px;">
      <div class="section-card" style="padding: 18px;">
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 14px;">近 14 天活动趋势</div>
        <v-chart class="trend-chart" :option="trendOption" autoresize />
      </div>

      <div class="section-card" style="padding: 18px;">
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 14px;">知识增长曲线（近 30 天）</div>
        <v-chart class="trend-chart" :option="knowledgeGrowthOption" autoresize />
      </div>
    </div>

    <div class="split-grid" style="margin-top: 18px;">
      <div class="section-card" style="padding: 18px;">
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 14px;">待办状态分布</div>
        <v-chart class="status-chart" :option="statusOption" autoresize />
      </div>

      <div class="section-card" style="padding: 18px;">
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 14px;">模块操作统计</div>
        <v-chart class="module-chart" :option="moduleOption" autoresize />
      </div>
    </div>

    <div class="split-grid" style="margin-top: 18px;">
      <div class="section-card" style="padding: 18px;">
        <div class="toolbar-row" style="justify-content: space-between; margin-bottom: 14px;">
          <div style="font-size: 20px; font-weight: 700;">优先待办</div>
          <el-button text type="primary" @click="router.push('/todos')">全部待办</el-button>
        </div>
        <div class="today-list scrollbar-hidden">
          <div v-for="item in topTodos" :key="item.id" class="today-item">
            <div class="today-item-top">
              <span class="today-title">{{ item.title }}</span>
              <el-tag size="small" :type="priorityType(item.priority)">{{ priorityLabel(item.priority) }}</el-tag>
            </div>
            <div class="today-meta">
              <template v-if="item.dueDate">截止：{{ item.dueDate }} · </template>
              状态：{{ statusLabel(item.status) }}
            </div>
          </div>
          <el-empty v-if="topTodos.length === 0" description="暂无待办" :image-size="60" />
        </div>
      </div>

      <div class="section-card" style="padding: 18px;">
        <div class="toolbar-row" style="justify-content: space-between; margin-bottom: 14px;">
          <div style="font-size: 20px; font-weight: 700;">今日待办提醒</div>
          <el-button text type="primary" @click="router.push('/todos')">全部待办</el-button>
        </div>
        <div class="today-list scrollbar-hidden">
          <div v-for="item in dueTodos" :key="item.id" class="today-item">
            <div class="today-item-top">
              <span class="today-title">{{ item.title }}</span>
              <el-tag size="small" :type="priorityType(item.priority)">{{ priorityLabel(item.priority) }}</el-tag>
            </div>
            <div class="today-meta">
              <template v-if="item.dueDate">截止：{{ item.dueDate }} · </template>
              <template v-if="item.reminderEnabled && item.reminderAt">提醒：{{ dayjs(item.reminderAt).format('MM-DD HH:mm') }} · </template>
              状态：{{ statusLabel(item.status) }}
            </div>
          </div>
          <el-empty v-if="dueTodos.length === 0" description="今日无待办提醒" :image-size="60" />
        </div>
      </div>
    </div>

    <div style="margin-top: 18px;">
      <div class="section-card" style="padding: 18px;">
        <div class="toolbar-row" style="justify-content: space-between; margin-bottom: 14px;">
          <div style="font-size: 20px; font-weight: 700;">最近操作记录</div>
          <el-button text type="primary" @click="router.push('/activity')">查看全部</el-button>
        </div>
        <el-timeline v-if="recentLogs.length > 0">
          <el-timeline-item
            v-for="log in recentLogs"
            :key="log.id"
            :timestamp="formatDate(log.createdAt)"
            placement="top"
          >
            <span style="font-weight: 700;">{{ moduleLabel(log.module) }}</span>
            <span style="margin: 0 6px; color: var(--el-text-color-secondary);">{{ actionLabel(log.action) }}</span>
            <span>{{ log.detail || '' }}</span>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无操作记录" :image-size="60" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart, BarChart, HeatmapChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, VisualMapComponent, CalendarComponent } from 'echarts/components'
import { noteApi } from '@/api/note'
import { useThemeStore } from '@/stores/theme'

use([CanvasRenderer, LineChart, PieChart, BarChart, HeatmapChart, GridComponent, TooltipComponent, LegendComponent, VisualMapComponent, CalendarComponent])

const router = useRouter()
const themeStore = useThemeStore()

const todoItems = ref([])
const recentLogs = ref([])
const dailyStats = ref({})
const moduleStats = ref({})
const weeklyReport = ref(null)
const knowledgeGrowth = ref({})
const heatmapData = ref({})
const topTodos = ref([])
const metrics = ref({
  noteCount: 0,
  vaultCount: 0,
  todoTotal: 0,
  wikiPageCount: 0,
  calendarCount: 0,
  fileCount: 0,
  fileTotalSize: 0
})

const isDark = computed(() => themeStore.mode === 'dark')
const axisTextColor = computed(() => isDark.value ? '#a0aec0' : '#666')
const chartBg = computed(() => 'transparent')

const todoStats = computed(() => ({
  todo: todoItems.value.filter((i) => i.status === 'todo').length,
  doing: todoItems.value.filter((i) => i.status === 'doing').length,
  done: todoItems.value.filter((i) => i.status === 'done').length
}))

const todoCompletion = computed(() => {
  if (!todoItems.value.length) return 0
  return Math.round((todoStats.value.done / todoItems.value.length) * 100)
})

const dueTodos = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  return todoItems.value.filter((i) => {
    if (i.status === 'done') return false
    if (i.dueDate && i.dueDate <= today) return true
    if (i.reminderEnabled && i.reminderAt) {
      return dayjs(i.reminderAt).format('YYYY-MM-DD') <= today
    }
    return false
  }).slice(0, 8)
})

function formatSize(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let s = bytes
  while (s >= 1024 && i < units.length - 1) { s /= 1024; i++ }
  return s.toFixed(i === 0 ? 0 : 1) + ' ' + units[i]
}

function deltaClass(current, last) {
  if (current > last) return 'delta-up'
  if (current < last) return 'delta-down'
  return 'delta-same'
}

function deltaText(current, last) {
  if (last === 0 && current === 0) return '—'
  if (last === 0) return '+∞'
  const pct = Math.round(((current - last) / last) * 100)
  if (pct > 0) return `+${pct}%`
  if (pct < 0) return `${pct}%`
  return '持平'
}

const trendOption = computed(() => {
  const dates = Object.keys(dailyStats.value)
  const values = Object.values(dailyStats.value)
  return {
    backgroundColor: chartBg.value,
    tooltip: { trigger: 'axis' },
    grid: { top: 20, bottom: 30, left: 40, right: 16 },
    xAxis: { type: 'category', data: dates.map((d) => d.slice(5)), axisLabel: { color: axisTextColor.value }, axisLine: { lineStyle: { color: '#4a5568' } } },
    yAxis: { type: 'value', minInterval: 1, axisLabel: { color: axisTextColor.value }, splitLine: { lineStyle: { color: isDark.value ? '#2d3748' : '#e2e8f0' } } },
    series: [{
      type: 'line',
      data: values,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { width: 3, color: '#38bdf8' },
      itemStyle: { color: '#38bdf8' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(56,189,248,0.35)' }, { offset: 1, color: 'rgba(56,189,248,0.02)' }] } }
    }]
  }
})

const knowledgeGrowthOption = computed(() => {
  const dates = Object.keys(knowledgeGrowth.value)
  const values = Object.values(knowledgeGrowth.value)
  return {
    backgroundColor: chartBg.value,
    tooltip: { trigger: 'axis' },
    grid: { top: 20, bottom: 30, left: 40, right: 16 },
    xAxis: { type: 'category', data: dates.map((d) => d.slice(5)), axisLabel: { color: axisTextColor.value, rotate: 45 }, axisLine: { lineStyle: { color: '#4a5568' } } },
    yAxis: { type: 'value', minInterval: 1, axisLabel: { color: axisTextColor.value }, splitLine: { lineStyle: { color: isDark.value ? '#2d3748' : '#e2e8f0' } } },
    series: [{
      type: 'line',
      data: values,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 3, color: '#a78bfa' },
      itemStyle: { color: '#a78bfa' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(167,139,250,0.35)' }, { offset: 1, color: 'rgba(167,139,250,0.02)' }] } }
    }]
  }
})

const heatmapOption = computed(() => {
  const data = []
  const dates = Object.keys(heatmapData.value)
  const startDate = dates.length > 0 ? dates[0] : dayjs().subtract(89, 'day').format('YYYY-MM-DD')
  for (const date of dates) {
    data.push([date, heatmapData.value[date] || 0])
  }
  const maxVal = Math.max(...Object.values(heatmapData.value), 1)
  return {
    backgroundColor: chartBg.value,
    tooltip: {
      formatter: (p) => `${p.data[0]}: ${p.data[1]} 次操作`
    },
    visualMap: {
      min: 0,
      max: maxVal,
      show: false,
      inRange: {
        color: isDark.value
          ? ['#1a1a2e', '#16213e', '#0f3460', '#38bdf8', '#22c55e']
          : ['#e8f5e9', '#c8e6c9', '#81c784', '#38a169', '#22543d']
      }
    },
    calendar: {
      top: 20,
      left: 40,
      right: 16,
      bottom: 10,
      cellSize: ['auto', 14],
      range: [startDate, dates.length > 0 ? dates[dates.length - 1] : dayjs().format('YYYY-MM-DD')],
      itemStyle: {
        borderWidth: 3,
        borderColor: isDark.value ? '#1a202c' : '#ffffff',
        borderRadius: 3
      },
      splitLine: { show: false },
      yearLabel: { show: false },
      monthLabel: { color: axisTextColor.value, fontSize: 11 },
      dayLabel: { color: axisTextColor.value, fontSize: 11, nameMap: ['日', '一', '二', '三', '四', '五', '六'] }
    },
    series: [{
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data
    }]
  }
})

const statusOption = computed(() => ({
  backgroundColor: chartBg.value,
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, textStyle: { color: axisTextColor.value } },
  series: [{
    type: 'pie',
    radius: ['45%', '70%'],
    avoidLabelOverlap: false,
    itemStyle: { borderRadius: 8 },
    label: { show: true, formatter: '{b}: {c}', color: axisTextColor.value },
    data: [
      { value: todoStats.value.todo, name: '待处理', itemStyle: { color: '#f59e0b' } },
      { value: todoStats.value.doing, name: '进行中', itemStyle: { color: '#38bdf8' } },
      { value: todoStats.value.done, name: '已完成', itemStyle: { color: '#22c55e' } }
    ].filter((i) => i.value > 0)
  }]
}))

const moduleOption = computed(() => ({
  backgroundColor: chartBg.value,
  tooltip: { trigger: 'axis' },
  grid: { top: 10, bottom: 30, left: 60, right: 16 },
  xAxis: { type: 'category', data: ['笔记', '保险箱', '待办'], axisLabel: { color: axisTextColor.value }, axisLine: { lineStyle: { color: '#4a5568' } } },
  yAxis: { type: 'value', minInterval: 1, axisLabel: { color: axisTextColor.value }, splitLine: { lineStyle: { color: isDark.value ? '#2d3748' : '#e2e8f0' } } },
  series: [{
    type: 'bar',
    barWidth: 40,
    itemStyle: { borderRadius: [8, 8, 0, 0] },
    data: [
      { value: moduleStats.value.note || 0, itemStyle: { color: '#a78bfa' } },
      { value: moduleStats.value.vault || 0, itemStyle: { color: '#f59e0b' } },
      { value: moduleStats.value.todo || 0, itemStyle: { color: '#38bdf8' } }
    ]
  }]
}))

function formatDate(value) {
  return value ? dayjs(value).format('MM-DD HH:mm') : '-'
}

function priorityLabel(value) {
  return { low: '低', medium: '中', high: '高' }[value] || value
}

function priorityType(value) {
  return { low: 'info', medium: 'warning', high: 'danger' }[value] || 'info'
}

function statusLabel(value) {
  return { todo: '待处理', doing: '进行中', done: '已完成' }[value] || value
}

function moduleLabel(value) {
  return { note: '笔记', vault: '保险箱', todo: '待办', file: '文件' }[value] || value
}

function actionLabel(value) {
  return { create: '创建了', update: '更新了', delete: '删除了', restore: '恢复了', export: '导出了' }[value] || value
}

async function loadData() {
  const [noteData, vaultData, todoData, logsData, dailyData, moduleData, overviewData, weeklyData, growthData, heatData, topTodoData] = await Promise.all([
    noteApi.pageNotes({ current: 1, size: 1 }),
    noteApi.listVaultItems({}),
    noteApi.listTodos({}),
    noteApi.listRecentLogs({ limit: 8 }),
    noteApi.activityDailyStats({ days: 14 }),
    noteApi.activityModuleStats(),
    noteApi.dashboardOverview(),
    noteApi.dashboardWeeklyReport(),
    noteApi.dashboardKnowledgeGrowth({ days: 30 }),
    noteApi.dashboardActivityHeatmap({ days: 90 }),
    noteApi.dashboardTopTodos({ limit: 8 })
  ])

  metrics.value = overviewData || {
    noteCount: noteData.total || 0,
    vaultCount: (vaultData || []).length,
    todoTotal: (todoData || []).length
  }
  todoItems.value = todoData || []
  recentLogs.value = logsData || []
  dailyStats.value = dailyData || {}
  moduleStats.value = moduleData || {}
  weeklyReport.value = weeklyData || null
  knowledgeGrowth.value = growthData || {}
  heatmapData.value = heatData || {}
  topTodos.value = topTodoData || []
}

onMounted(loadData)
</script>

<style scoped>
.trend-chart {
  width: 100%;
  height: 260px;
}

.status-chart {
  width: 100%;
  height: 260px;
}

.module-chart {
  width: 100%;
  height: 220px;
}

.heatmap-chart {
  width: 100%;
  height: 200px;
}

.today-list {
  max-height: 260px;
  overflow: auto;
  display: grid;
  gap: 10px;
  padding-right: 4px;
}

.today-item {
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid var(--app-border);
  background: linear-gradient(155deg, color-mix(in srgb, var(--app-panel-strong) 88%, transparent), var(--app-panel));
}

.today-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.today-title {
  font-weight: 700;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.today-meta {
  margin-top: 6px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.split-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 18px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 18px;
}

.report-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.report-item {
  padding: 16px;
  border-radius: 14px;
  border: 1px solid var(--app-border);
  background: linear-gradient(155deg, color-mix(in srgb, var(--app-panel-strong) 88%, transparent), var(--app-panel));
}

.report-item-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.report-item-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.report-item-value {
  font-size: 28px;
  font-weight: 800;
}

.report-item-delta {
  font-size: 13px;
  font-weight: 600;
}

.report-item-delta.delta-up {
  color: #22c55e;
}

.report-item-delta.delta-down {
  color: #ef4444;
}

.report-item-delta.delta-same {
  color: var(--el-text-color-secondary);
}

.report-item-sub {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
</style>
