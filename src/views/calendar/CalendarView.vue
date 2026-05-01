<template>
  <div class="page-shell calendar-page-shell">
    <div class="toolbar-row page-action-row">
      <div>
        <h1 class="page-title">日程日历</h1>
        <p class="page-subtitle">管理日程事件，直观掌控时间安排</p>
      </div>
      <div class="toolbar-row" style="gap: 8px;">
        <el-button @click="goToday">今天</el-button>
        <el-button type="primary" size="large" @click="openCreate()">新建日程</el-button>
      </div>
    </div>

    <div class="section-card calendar-card">
      <div class="calendar-header">
        <div class="calendar-nav">
          <el-button text @click="prevMonth">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <div class="calendar-month-label">{{ year }}年{{ month }}月</div>
          <el-button text @click="nextMonth">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="month">月视图</el-radio-button>
          <el-radio-button value="week">周视图</el-radio-button>
        </el-radio-group>
      </div>

      <div class="calendar-weekdays">
        <div v-for="d in weekdays" :key="d" class="weekday-cell">{{ d }}</div>
      </div>

      <div v-if="viewMode === 'month'" class="calendar-grid">
        <div
          v-for="(cell, i) in monthCells"
          :key="i"
          class="calendar-cell"
          :class="{ today: cell.isToday, outside: cell.outside, 'has-events': cell.events.length > 0 }"
          @click="cell.outside ? null : openCreate(cell.date)"
        >
          <div class="cell-day" :class="{ 'today-badge': cell.isToday }">{{ cell.day }}</div>
          <div class="cell-events">
            <div
              v-for="ev in cell.events.slice(0, 3)"
              :key="ev.id"
              class="event-chip"
              :style="{ background: ev.color || undefined }"
              @click.stop="openDetail(ev)"
            >
              {{ ev.title }}
            </div>
            <div v-if="cell.events.length > 3" class="event-more">+{{ cell.events.length - 3 }} 更多</div>
          </div>
        </div>
      </div>

      <div v-else class="calendar-week-grid">
        <div
          v-for="(cell, i) in weekCells"
          :key="i"
          class="week-cell"
          :class="{ today: cell.isToday }"
        >
          <div class="week-cell-head">
            <span class="week-day-name">{{ weekdays[i] }}</span>
            <span class="week-day-num" :class="{ 'today-badge': cell.isToday }">{{ cell.day }}</span>
          </div>
          <div class="week-cell-body">
            <div
              v-for="ev in cell.events"
              :key="ev.id"
              class="event-chip"
              :style="{ background: ev.color || undefined }"
              @click.stop="openDetail(ev)"
            >
              {{ ev.title }}
            </div>
            <el-button text type="primary" size="small" @click="openCreate(cell.date)" style="margin-top: 4px;">
              + 添加
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="detailVisible" title="日程详情" width="480px" destroy-on-close>
      <template v-if="detailEvent">
        <div class="event-detail">
          <div class="event-detail-title">{{ detailEvent.title }}</div>
          <div class="event-detail-meta">
            <el-tag v-if="detailEvent.allDay" type="info" size="small">全天</el-tag>
            <el-tag v-if="detailEvent.color" :color="detailEvent.color" size="small" style="color: #fff; border: none;">颜色</el-tag>
          </div>
          <div class="event-detail-row">开始：{{ formatDateTime(detailEvent.startTime) }}</div>
          <div v-if="detailEvent.endTime" class="event-detail-row">结束：{{ formatDateTime(detailEvent.endTime) }}</div>
          <div v-if="detailEvent.location" class="event-detail-row">📍 {{ detailEvent.location }}</div>
          <div v-if="detailEvent.description" class="event-detail-desc">{{ detailEvent.description }}</div>
        </div>
      </template>
      <template #footer>
        <el-button type="primary" plain @click="openEdit(detailEvent)">编辑</el-button>
        <el-button type="danger" plain @click="removeEvent(detailEvent.id)">删除</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑日程' : '新建日程'" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="日程标题" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="form.startTime" type="datetime" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="form.endTime" type="datetime" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="全天">
          <el-switch v-model="form.allDay" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="颜色">
          <div class="color-picker-row">
            <div
              v-for="c in colorOptions"
              :key="c"
              class="color-dot"
              :class="{ active: form.color === c }"
              :style="{ background: c }"
              @click="form.color = form.color === c ? null : c"
            />
          </div>
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="form.location" placeholder="可选" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">{{ form.id ? '保存' : '创建' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { noteApi } from '@/api/note'

const viewMode = ref('month')
const now = dayjs()
const year = ref(now.year())
const month = ref(now.month() + 1)
const events = ref([])
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const dialogVisible = ref(false)
const detailVisible = ref(false)
const detailEvent = ref(null)
const submitting = ref(false)
const formRef = ref(null)

const colorOptions = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#9b59b6', '#1abc9c']

const defaultForm = () => ({ id: null, title: '', startTime: null, endTime: null, allDay: 0, color: null, location: '', description: '' })
const form = reactive(defaultForm())
const rules = { title: [{ required: true, message: '请输入标题', trigger: 'blur' }], startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }] }

function formatDateTime(val) {
  return val ? dayjs(val).format('YYYY-MM-DD HH:mm') : ''
}

async function loadEvents() {
  const { data } = await noteApi.listEventsByMonth(year.value, month.value)
  events.value = data || []
}

function getEventsForDate(dateStr) {
  return events.value.filter(ev => {
    const s = dayjs(ev.startTime).format('YYYY-MM-DD')
    const e = ev.endTime ? dayjs(ev.endTime).format('YYYY-MM-DD') : s
    return dateStr >= s && dateStr <= e
  })
}

const monthCells = computed(() => {
  const first = dayjs(`${year.value}-${String(month.value).padStart(2, '0')}-01`)
  const startDay = first.day()
  const daysInMonth = first.daysInMonth()
  const todayStr = dayjs().format('YYYY-MM-DD')
  const cells = []
  for (let i = 0; i < startDay; i++) {
    const d = first.subtract(startDay - i, 'day')
    cells.push({ day: d.date(), date: d.format('YYYY-MM-DD'), outside: true, isToday: false, events: [] })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const d = first.date(i)
    const ds = d.format('YYYY-MM-DD')
    cells.push({ day: i, date: ds, outside: false, isToday: ds === todayStr, events: getEventsForDate(ds) })
  }
  while (cells.length < 42) {
    const d = first.date(daysInMonth).add(cells.length - startDay - daysInMonth + 1, 'day')
    cells.push({ day: d.date(), date: d.format('YYYY-MM-DD'), outside: true, isToday: false, events: [] })
  }
  return cells
})

const weekCells = computed(() => {
  const today = dayjs()
  const startOfWeek = today.startOf('week')
  const todayStr = today.format('YYYY-MM-DD')
  return Array.from({ length: 7 }, (_, i) => {
    const d = startOfWeek.add(i, 'day')
    const ds = d.format('YYYY-MM-DD')
    return { day: d.date(), date: ds, isToday: ds === todayStr, events: getEventsForDate(ds) }
  })
})

function prevMonth() {
  if (month.value === 1) { year.value--; month.value = 12 } else { month.value-- }
}
function nextMonth() {
  if (month.value === 12) { year.value++; month.value = 1 } else { month.value++ }
}
function goToday() {
  year.value = dayjs().year()
  month.value = dayjs().month() + 1
}

watch([year, month], loadEvents)
onMounted(loadEvents)

function openCreate(dateStr) {
  Object.assign(form, defaultForm())
  if (dateStr) {
    form.startTime = dayjs(dateStr).hour(9).minute(0).second(0).toDate()
    form.endTime = dayjs(dateStr).hour(10).minute(0).second(0).toDate()
  }
  dialogVisible.value = true
}

function openDetail(ev) {
  detailEvent.value = ev
  detailVisible.value = true
}

function openEdit(ev) {
  Object.assign(form, {
    id: ev.id,
    title: ev.title,
    startTime: ev.startTime ? new Date(ev.startTime) : null,
    endTime: ev.endTime ? new Date(ev.endTime) : null,
    allDay: ev.allDay || 0,
    color: ev.color,
    location: ev.location || '',
    description: ev.description || ''
  })
  detailVisible.value = false
  dialogVisible.value = true
}

async function submit() {
  await formRef.value.validate()
  submitting.value = true
  try {
    const payload = {
      title: form.title,
      startTime: form.startTime ? dayjs(form.startTime).format('YYYY-MM-DDTHH:mm:ss') : null,
      endTime: form.endTime ? dayjs(form.endTime).format('YYYY-MM-DDTHH:mm:ss') : null,
      allDay: form.allDay,
      color: form.color,
      location: form.location || null,
      description: form.description || null
    }
    if (form.id) {
      await noteApi.updateEvent(form.id, payload)
      ElMessage.success('日程已更新')
    } else {
      await noteApi.createEvent(payload)
      ElMessage.success('日程已创建')
    }
    dialogVisible.value = false
    await loadEvents()
  } finally {
    submitting.value = false
  }
}

async function removeEvent(id) {
  await ElMessageBox.confirm('确定删除此日程吗？', '删除确认', { type: 'warning' })
  await noteApi.deleteEvent(id)
  ElMessage.success('已删除')
  detailVisible.value = false
  await loadEvents()
}
</script>

<style scoped>
.calendar-page-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.page-action-row {
  justify-content: space-between;
  margin-bottom: 18px;
}

.calendar-card {
  flex: 1;
  min-height: 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.calendar-month-label {
  font-size: 22px;
  font-weight: 800;
  min-width: 140px;
  text-align: center;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 6px;
}

.weekday-cell {
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  padding: 8px 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);
  flex: 1;
  min-height: 0;
  gap: 1px;
  background: var(--el-border-color-lighter);
  border-radius: 12px;
  overflow: hidden;
}

.calendar-cell {
  background: var(--app-panel, var(--el-bg-color));
  padding: 6px 8px;
  min-height: 80px;
  cursor: pointer;
  transition: background 0.15s;
  overflow: hidden;
}

.calendar-cell:hover {
  background: var(--el-fill-color-light);
}

.calendar-cell.outside {
  opacity: 0.35;
  cursor: default;
}

.calendar-cell.today {
  background: color-mix(in srgb, var(--el-color-primary) 6%, var(--app-panel, var(--el-bg-color)));
}

.cell-day {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.today-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: #fff;
  font-size: 13px;
}

.cell-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-chip {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: var(--el-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: opacity 0.15s;
}

.event-chip:hover {
  opacity: 0.85;
}

.event-more {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  padding-left: 4px;
}

.calendar-week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  flex: 1;
  min-height: 0;
  gap: 1px;
  background: var(--el-border-color-lighter);
  border-radius: 12px;
  overflow: hidden;
}

.week-cell {
  background: var(--app-panel, var(--el-bg-color));
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  min-height: 200px;
}

.week-cell.today {
  background: color-mix(in srgb, var(--el-color-primary) 6%, var(--app-panel, var(--el-bg-color)));
}

.week-cell-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.week-day-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

.week-day-num {
  font-size: 15px;
  font-weight: 700;
}

.week-cell-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.event-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-detail-title {
  font-size: 20px;
  font-weight: 800;
}

.event-detail-meta {
  display: flex;
  gap: 8px;
}

.event-detail-row {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.event-detail-desc {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.color-picker-row {
  display: flex;
  gap: 8px;
}

.color-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent;
  transition: border-color 0.15s, transform 0.15s;
}

.color-dot:hover {
  transform: scale(1.15);
}

.color-dot.active {
  border-color: var(--el-text-color-primary);
}

@media (max-width: 900px) {
  .calendar-grid {
    grid-template-rows: repeat(6, auto);
  }

  .calendar-cell {
    min-height: 56px;
    padding: 4px;
  }

  .calendar-week-grid {
    grid-template-columns: 1fr;
  }

  .week-cell {
    min-height: 100px;
  }
}
</style>
