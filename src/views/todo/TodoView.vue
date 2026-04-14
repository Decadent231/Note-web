<template>
  <div class="page-shell">
    <div class="toolbar-row" style="justify-content: space-between; margin-bottom: 18px;">
      <div>
        <h1 class="page-title">待办事项</h1>
        <p class="page-subtitle">支持状态切换、优先级、截止日期和邮件提醒配置。</p>
      </div>
      <el-button type="primary" size="large" @click="openCreate">新建待办</el-button>
    </div>

    <div class="section-card" style="padding: 18px; margin-bottom: 18px;">
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
      <div v-for="column in columns" :key="column.value" class="section-card todo-column">
        <div class="toolbar-row" style="justify-content: space-between; margin-bottom: 14px;">
          <div style="font-size: 20px; font-weight: 700;">{{ column.label }}</div>
          <el-tag>{{ grouped[column.value].length }}</el-tag>
        </div>
        <div class="todo-list">
          <div v-for="item in grouped[column.value]" :key="item.id" class="metric-card todo-card">
            <div class="toolbar-row" style="justify-content: space-between;">
              <div style="font-weight: 700;">{{ item.title }}</div>
              <el-tag :type="priorityType(item.priority)">{{ priorityLabel(item.priority) }}</el-tag>
            </div>
            <div class="page-subtitle" style="margin-top: 10px;">{{ item.description || '暂无描述' }}</div>
            <div class="page-subtitle" style="margin-top: 10px;">截止：{{ item.dueDate || '未设置' }}</div>
            <div class="page-subtitle" style="margin-top: 6px;">
              提醒：{{ item.reminderEnabled ? `开启 · ${formatDateTime(item.reminderAt)} · ${item.reminderEmail || '默认账号邮箱'}` : '关闭' }}
            </div>
            <div class="toolbar-row" style="justify-content: space-between; margin-top: 12px;">
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

        <div class="section-card" style="padding: 16px;">
          <div class="toolbar-row" style="justify-content: space-between;">
            <div>
              <div style="font-size: 18px; font-weight: 700;">邮件提醒</div>
              <div class="page-subtitle">开启后，到达提醒时间会由后端自动发送邮件。</div>
            </div>
            <el-switch v-model="form.reminderEnabled" />
          </div>

          <div v-if="form.reminderEnabled" style="margin-top: 16px;">
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
                <el-input v-model="form.reminderEmail" placeholder="留空默认发送到当前账号邮箱" />
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

async function loadData() {
  list.value = await noteApi.listTodos(query)
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
  ElMessage.success('状态已更新')
  await loadData()
}

async function removeItem(id) {
  await ElMessageBox.confirm('确定删除这条待办吗？', '删除确认', { type: 'warning' })
  await noteApi.deleteTodo(id)
  ElMessage.success('删除成功')
  await loadData()
}

onMounted(loadData)
</script>

<style scoped>
.todo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.todo-column {
  padding: 18px;
}

.todo-list {
  display: grid;
  gap: 12px;
}

.todo-card {
  padding: 16px;
}

@media (max-width: 1100px) {
  .todo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
