<template>
  <div class="page-shell todo-page-shell">
    <div class="toolbar-row header-row">
      <div>
        <h1 class="page-title">待办事项</h1>
        <p class="page-subtitle">支持分栏拖动排序，拖到其他列时会同步更新状态。</p>
      </div>
      <el-button type="primary" size="large" @click="openCreate">新建待办</el-button>
    </div>

    <div class="section-card filter-card">
      <div class="toolbar-row">
        <el-select v-model="query.status" clearable placeholder="状态" style="width: 160px;">
          <el-option label="待处理" value="todo" />
          <el-option label="进行中" value="doing" />
          <el-option label="已完成" value="done" />
        </el-select>
        <el-select v-model="query.priority" clearable placeholder="优先级" style="width: 160px;">
          <el-option label="低" value="low" />
          <el-option label="中" value="medium" />
          <el-option label="高" value="high" />
        </el-select>
        <el-button @click="loadData">筛选</el-button>
      </div>
    </div>

    <div class="todo-grid">
      <div
        v-for="column in columns"
        :key="column.value"
        class="section-card todo-column"
        @dragover.prevent="handleColumnDragOver(column.value)"
        @drop.prevent="handleColumnDrop(column.value)"
      >
        <div class="column-head">
          <div>
            <div class="column-title">{{ column.label }}</div>
            <div class="column-subtitle">拖动卡片调整优先顺序</div>
          </div>
          <el-tag>{{ grouped[column.value].length }}</el-tag>
        </div>

        <div class="todo-list scrollbar-hidden">
          <div
            v-for="(item, index) in grouped[column.value]"
            :key="item.id"
            class="metric-card todo-card"
            :class="{ dragging: dragState.id === item.id }"
            draggable="true"
            @dragstart="handleDragStart(item)"
            @dragover.prevent="handleCardDragOver(column.value, index)"
            @drop.prevent="handleCardDrop(column.value, index)"
            @dragend="handleDragEnd"
          >
            <div class="todo-card-top">
              <div class="drag-indicator" aria-hidden="true">⋮⋮</div>
              <div class="todo-title-wrap">
                <div class="todo-title">{{ item.title }}</div>
                <div class="todo-meta">截止：{{ item.dueDate || '未设置' }}</div>
              </div>
              <el-tag :type="priorityType(item.priority)">{{ priorityLabel(item.priority) }}</el-tag>
            </div>

            <div class="page-subtitle todo-description">{{ item.description || '暂无描述' }}</div>
            <div class="todo-reminder">
              提醒：{{ item.reminderEnabled ? `${formatDateTime(item.reminderAt)} · ${item.reminderEmail || '默认账号邮箱'}` : '关闭' }}
            </div>

            <div class="toolbar-row todo-actions">
              <el-select :model-value="item.status" size="small" style="width: 120px;" @change="changeStatus(item, $event)">
                <el-option label="待处理" value="todo" />
                <el-option label="进行中" value="doing" />
                <el-option label="已完成" value="done" />
              </el-select>
              <div>
                <el-button text type="primary" @click="editItem(item)">编辑</el-button>
                <el-button text type="danger" @click="removeItem(item.id)">删除</el-button>
              </div>
            </div>
          </div>

          <el-empty v-if="grouped[column.value].length === 0" :description="`暂无${column.label}`" />
        </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑待办' : '新建待办'" width="760px">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="4" />
        </el-form-item>
        <div class="toolbar-row">
          <el-form-item label="状态" style="flex: 1;">
            <el-select v-model="form.status" style="width: 100%;">
              <el-option label="待处理" value="todo" />
              <el-option label="进行中" value="doing" />
              <el-option label="已完成" value="done" />
            </el-select>
          </el-form-item>
          <el-form-item label="优先级" style="flex: 1;">
            <el-select v-model="form.priority" style="width: 100%;">
              <el-option label="低" value="low" />
              <el-option label="中" value="medium" />
              <el-option label="高" value="high" />
            </el-select>
          </el-form-item>
          <el-form-item label="截止日期" style="flex: 1;">
            <el-date-picker v-model="form.dueDate" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
          </el-form-item>
        </div>

        <div class="section-card reminder-card">
          <div class="toolbar-row reminder-head">
            <div>
              <div class="reminder-title">邮件提醒</div>
              <div class="page-subtitle">开启后，到达提醒时间会由后端自动发送邮件。</div>
            </div>
            <el-switch v-model="form.reminderEnabled" />
          </div>

          <div v-if="form.reminderEnabled" class="reminder-fields">
            <div class="toolbar-row">
              <el-form-item label="提醒时间" prop="reminderAt" style="flex: 1;">
                <el-date-picker
                  v-model="form.reminderAt"
                  type="datetime"
                  value-format="YYYY-MM-DDTHH:mm:ss"
                  placeholder="选择提醒时间"
                  style="width: 100%;"
                />
              </el-form-item>
              <el-form-item label="接收邮箱" style="flex: 1;">
                <el-input v-model="form.reminderEmail" placeholder="留空则默认发送到当前账号邮箱" />
              </el-form-item>
            </div>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { noteApi } from '@/api/note'

const TODO_ORDER_KEY = 'note-font:todo-order'

const columns = [
  { label: '待处理', value: 'todo' },
  { label: '进行中', value: 'doing' },
  { label: '已完成', value: 'done' }
]

const formRef = ref()
const dialogVisible = ref(false)
const submitting = ref(false)
const list = ref([])
const query = reactive({ status: '', priority: '' })
const dragState = reactive({
  id: null,
  fromStatus: '',
  targetStatus: '',
  targetIndex: -1
})
const form = reactive({
  id: null,
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
  reminderEnabled: false,
  reminderAt: '',
  reminderEmail: ''
})

const rules = {
  title: [{ required: true, message: '请输入待办标题', trigger: 'blur' }],
  reminderAt: [
    {
      validator: (_, value, callback) => {
        if (form.reminderEnabled && !value) {
          callback(new Error('开启提醒后必须设置提醒时间'))
          return
        }
        callback()
      },
      trigger: 'change'
    }
  ]
}

const grouped = computed(() => ({
  todo: list.value.filter((item) => item.status === 'todo'),
  doing: list.value.filter((item) => item.status === 'doing'),
  done: list.value.filter((item) => item.status === 'done')
}))

function readOrder() {
  try {
    return JSON.parse(window.localStorage.getItem(TODO_ORDER_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeOrder() {
  const payload = columns.reduce((accumulator, column) => {
    accumulator[column.value] = grouped.value[column.value].map((item) => item.id)
    return accumulator
  }, {})
  window.localStorage.setItem(TODO_ORDER_KEY, JSON.stringify(payload))
}

function sortBySavedOrder(records) {
  const saved = readOrder()
  return columns.flatMap((column) => {
    const items = records.filter((item) => item.status === column.value)
    const order = saved[column.value] || []
    const orderMap = new Map(order.map((id, index) => [id, index]))
    return [...items].sort((a, b) => {
      const aIndex = orderMap.has(a.id) ? orderMap.get(a.id) : Number.MAX_SAFE_INTEGER
      const bIndex = orderMap.has(b.id) ? orderMap.get(b.id) : Number.MAX_SAFE_INTEGER
      if (aIndex === bIndex) {
        return dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf()
      }
      return aIndex - bIndex
    })
  })
}

function formatDateTime(value) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '未设置'
}

function priorityLabel(value) {
  return { low: '低', medium: '中', high: '高' }[value] || value
}

function priorityType(value) {
  return { low: 'info', medium: 'warning', high: 'danger' }[value] || 'info'
}

function resetForm() {
  Object.assign(form, {
    id: null,
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    reminderEnabled: false,
    reminderAt: '',
    reminderEmail: ''
  })
}

function openCreate() {
  resetForm()
  dialogVisible.value = true
}

function editItem(item) {
  Object.assign(form, {
    ...item,
    reminderEnabled: Boolean(item.reminderEnabled),
    reminderAt: item.reminderAt || '',
    reminderEmail: item.reminderEmail || ''
  })
  dialogVisible.value = true
}

function rebuildList(groups) {
  list.value = columns.flatMap((column) => groups[column.value])
  writeOrder()
}

function handleDragStart(item) {
  dragState.id = item.id
  dragState.fromStatus = item.status
  dragState.targetStatus = item.status
  dragState.targetIndex = -1
}

function handleCardDragOver(status, index) {
  dragState.targetStatus = status
  dragState.targetIndex = index
}

function handleColumnDragOver(status) {
  dragState.targetStatus = status
  if (dragState.targetIndex < 0) {
    dragState.targetIndex = grouped.value[status].length
  }
}

async function applyDragMove(status, index) {
  const moved = list.value.find((item) => item.id === dragState.id)
  if (!moved) {
    return
  }

  const groups = {
    todo: [...grouped.value.todo],
    doing: [...grouped.value.doing],
    done: [...grouped.value.done]
  }

  const sourceList = groups[moved.status]
  const sourceIndex = sourceList.findIndex((item) => item.id === moved.id)
  if (sourceIndex >= 0) {
    sourceList.splice(sourceIndex, 1)
  }

  const targetList = groups[status]
  const targetIndex = Math.max(0, Math.min(index, targetList.length))
  const nextItem = { ...moved, status }
  targetList.splice(targetIndex, 0, nextItem)
  rebuildList(groups)

  if (moved.status !== status) {
    await noteApi.updateTodoStatus(moved.id, status)
    const target = list.value.find((item) => item.id === moved.id)
    if (target) {
      target.status = status
    }
    ElMessage.success('待办已移动到新的状态列')
  }
}

async function handleCardDrop(status, index) {
  await applyDragMove(status, index)
  handleDragEnd()
}

async function handleColumnDrop(status) {
  await applyDragMove(status, dragState.targetIndex >= 0 ? dragState.targetIndex : grouped.value[status].length)
  handleDragEnd()
}

function handleDragEnd() {
  dragState.id = null
  dragState.fromStatus = ''
  dragState.targetStatus = ''
  dragState.targetIndex = -1
}

async function loadData() {
  const data = await noteApi.listTodos(query)
  list.value = sortBySavedOrder(data || [])
  writeOrder()
}

async function submit() {
  await formRef.value.validate()
  submitting.value = true
  try {
    const payload = { ...form }
    delete payload.id
    if (!payload.reminderEnabled) {
      payload.reminderAt = null
      payload.reminderEmail = ''
    }
    if (form.id) {
      await noteApi.updateTodo(form.id, payload)
      ElMessage.success('待办已更新')
    } else {
      await noteApi.createTodo(payload)
      ElMessage.success('待办已创建')
    }
    dialogVisible.value = false
    await loadData()
  } finally {
    submitting.value = false
  }
}

async function changeStatus(item, status) {
  await noteApi.updateTodoStatus(item.id, status)
  item.status = status
  list.value = sortBySavedOrder(list.value)
  writeOrder()
  ElMessage.success('状态已更新')
}

async function removeItem(id) {
  await ElMessageBox.confirm('确定删除这条待办吗？', '删除确认', { type: 'warning' })
  await noteApi.deleteTodo(id)
  list.value = list.value.filter((item) => item.id !== id)
  writeOrder()
  ElMessage.success('删除成功')
}

onMounted(loadData)
</script>

<style scoped>
.header-row {
  justify-content: space-between;
  margin-bottom: 18px;
}

.todo-page-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.filter-card {
  padding: 18px;
  margin-bottom: 18px;
}

.todo-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.todo-column {
  padding: 18px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.column-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.column-title {
  font-size: 20px;
  font-weight: 700;
}

.column-subtitle {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.todo-list {
  display: grid;
  gap: 12px;
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 6px;
  align-content: start;
  align-items: start;
}

.todo-card {
  padding: 16px;
  border-radius: 18px;
  cursor: grab;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.todo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.12);
}

.todo-card.dragging {
  opacity: 0.7;
}

.todo-card-top {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: start;
}

.drag-indicator {
  margin-top: 2px;
  color: var(--el-text-color-placeholder);
  font-size: 20px;
  line-height: 1;
  letter-spacing: 2px;
}

.todo-title-wrap {
  min-width: 0;
}

.todo-title {
  font-weight: 700;
  font-size: 16px;
}

.todo-meta {
  margin-top: 6px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.todo-description {
  margin-top: 12px;
  line-height: 1.75;
}

.todo-reminder {
  margin-top: 10px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.todo-actions {
  justify-content: space-between;
  margin-top: 12px;
}

.reminder-card {
  padding: 16px;
}

.reminder-head {
  justify-content: space-between;
}

.reminder-title {
  font-size: 18px;
  font-weight: 700;
}

.reminder-fields {
  margin-top: 16px;
}

@media (max-width: 1100px) {
  .todo-page-shell {
    overflow: auto;
  }

  .todo-grid {
    grid-template-columns: 1fr;
    overflow: visible;
  }

  .todo-column {
    min-height: auto;
  }

  .todo-list {
    overflow: visible;
  }
}
</style>
