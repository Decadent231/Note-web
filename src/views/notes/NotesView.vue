<template>
  <div class="page-shell notes-page-shell">
    <div class="toolbar-row page-action-row">
      <div>
        <h1 class="page-title">工作笔记</h1>
        <p class="page-subtitle">支持拖动排序、详情查看、富文本编辑与分类标签管理。</p>
      </div>
      <el-button type="primary" size="large" @click="openCreate">新建笔记</el-button>
    </div>

    <div class="section-card filter-card">
      <div class="toolbar-row">
        <el-input v-model="query.keyword" placeholder="搜索标题 / 摘要 / 内容" clearable style="max-width: 280px;" />
        <el-input v-model="query.category" placeholder="分类" clearable style="max-width: 180px;" />
        <el-input v-model="query.tag" placeholder="标签" clearable style="max-width: 180px;" />
        <el-button @click="loadData">查询</el-button>
      </div>
    </div>

    <div class="notes-layout">
      <div class="section-card list-panel">
        <div class="panel-head">
          <div>
            <div class="panel-title">笔记列表</div>
            <div class="panel-subtitle">每条笔记只占一行，拖动行即可调整当前页顺序</div>
          </div>
          <el-tag type="info">{{ pagination.total }}</el-tag>
        </div>

        <div class="notes-list">
          <div
            v-for="(item, index) in tableData"
            :key="item.id"
            class="note-row"
            :class="{ active: selected?.id === item.id, dragging: dragState.id === item.id }"
            draggable="true"
            @click="selected = item"
            @dragstart="handleDragStart(item.id)"
            @dragover.prevent="handleDragOver(index)"
            @drop.prevent="handleDrop(index)"
            @dragend="handleDragEnd"
          >
            <div class="note-row-handle" aria-hidden="true">⋮⋮</div>

            <div class="note-row-main">
              <div class="note-row-line">
                <span class="note-row-title">{{ item.title }}</span>
                <span v-if="item.summary" class="note-row-summary">（{{ item.summary }}）</span>
                <span class="note-row-divider"></span>
                <span class="note-meta-chip">{{ item.category || '未分类' }}</span>
                <el-tag
                  v-for="tag in splitTags(item.tags)"
                  :key="tag"
                  size="small"
                  effect="plain"
                  class="note-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>

            <div class="note-row-side">
              <div class="note-row-time">{{ formatDate(item.updatedAt) }}</div>
              <div class="note-actions">
                <el-button text type="primary" @click.stop="openDetail(item)">详情</el-button>
                <el-button text type="primary" @click.stop="editItem(item)">编辑</el-button>
                <el-button text type="danger" @click.stop="removeItem(item.id)">删除</el-button>
              </div>
            </div>
          </div>

          <el-empty v-if="tableData.length === 0" description="暂无笔记" />
        </div>

        <div class="pagination-wrap">
          <el-pagination
            background
            layout="prev, pager, next, total"
            :total="pagination.total"
            :page-size="pagination.size"
            :current-page="pagination.current"
            @current-change="changePage"
          />
        </div>
      </div>

      <div class="section-card preview-panel">
        <el-button
          v-if="selected"
          class="preview-detail-button"
          link
          type="primary"
          @click="openDetail(selected)"
        >
          详情查看
        </el-button>

        <template v-if="selected">
          <div class="preview-body">
            <div class="preview-title">{{ selected.title }}</div>
            <div class="preview-tags">
              <el-tag effect="dark">{{ selected.category || '未分类' }}</el-tag>
              <el-tag
                v-for="tag in splitTags(selected.tags)"
                :key="tag"
                type="success"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
            </div>
            <div class="page-subtitle">{{ selected.summary || '暂无摘要' }}</div>
            <div class="preview-content ql-editor scrollbar-hidden" v-html="selected.content || '<p>暂无内容</p>'"></div>
          </div>
        </template>
        <el-empty v-else description="请选择一条笔记" />
      </div>
    </div>

    <el-dialog v-model="detailVisible" width="960px" class="detail-dialog">
      <template #header>
        <div class="detail-header">
          <div>
            <div class="detail-title">{{ detailItem?.title || '笔记详情' }}</div>
            <div class="page-subtitle">完整查看当前笔记内容与元信息</div>
          </div>
          <el-button v-if="detailItem" type="primary" plain @click="editItem(detailItem)">编辑笔记</el-button>
        </div>
      </template>
      <template v-if="detailItem">
        <div class="detail-meta">
          <el-tag effect="dark">{{ detailItem.category || '未分类' }}</el-tag>
          <el-tag
            v-for="tag in splitTags(detailItem.tags)"
            :key="tag"
            size="small"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
          <span class="detail-time">更新于 {{ formatDate(detailItem.updatedAt) }}</span>
        </div>
        <div v-if="detailItem.summary" class="detail-summary">{{ detailItem.summary }}</div>
        <div class="detail-content ql-editor scrollbar-hidden" v-html="detailItem.content || '<p>暂无内容</p>'"></div>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑笔记' : '新建笔记'" width="900px">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <div class="toolbar-row">
          <el-form-item label="标题" prop="title" style="flex: 1;">
            <el-input v-model="form.title" placeholder="输入笔记标题" />
          </el-form-item>
          <el-form-item label="分类" style="width: 180px;">
            <el-input v-model="form.category" placeholder="例如：项目复盘" />
          </el-form-item>
        </div>

        <div class="toolbar-row">
          <el-form-item label="标签" style="flex: 1;">
            <el-input v-model="form.tags" placeholder="多个标签用英文逗号分隔" />
          </el-form-item>
          <el-form-item label="摘要" style="flex: 1;">
            <el-input v-model="form.summary" placeholder="用于列表预览" />
          </el-form-item>
        </div>

        <el-form-item label="内容" prop="content">
          <div class="section-card editor-card" style="width: 100%;">
            <QuillEditor v-model:content="form.content" content-type="html" toolbar="full" theme="snow" />
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { QuillEditor } from '@vueup/vue-quill'
import { noteApi } from '@/api/note'

const NOTE_ORDER_KEY = 'note-font:notes-order'

const formRef = ref()
const dialogVisible = ref(false)
const detailVisible = ref(false)
const submitting = ref(false)
const selected = ref(null)
const detailItem = ref(null)
const tableData = ref([])
const dragState = reactive({ id: null, overIndex: -1 })
const pagination = reactive({ current: 1, size: 8, total: 0 })
const query = reactive({ keyword: '', category: '', tag: '' })

const form = reactive({
  id: null,
  title: '',
  category: '',
  tags: '',
  summary: '',
  content: ''
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

function formatDate(value) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'
}

function splitTags(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function readOrder() {
  try {
    return JSON.parse(window.localStorage.getItem(NOTE_ORDER_KEY) || '[]')
  } catch {
    return []
  }
}

function writeOrder(list) {
  window.localStorage.setItem(NOTE_ORDER_KEY, JSON.stringify(list.map((item) => item.id)))
}

function sortBySavedOrder(records) {
  const order = readOrder()
  if (!order.length) {
    return records
  }
  const orderMap = new Map(order.map((id, index) => [id, index]))
  return [...records].sort((a, b) => {
    const aIndex = orderMap.has(a.id) ? orderMap.get(a.id) : Number.MAX_SAFE_INTEGER
    const bIndex = orderMap.has(b.id) ? orderMap.get(b.id) : Number.MAX_SAFE_INTEGER
    if (aIndex === bIndex) {
      return dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf()
    }
    return aIndex - bIndex
  })
}

function syncSelected() {
  if (!tableData.value.length) {
    selected.value = null
    return
  }
  if (!selected.value) {
    selected.value = tableData.value[0]
    return
  }
  const current = tableData.value.find((item) => item.id === selected.value.id)
  selected.value = current || tableData.value[0]
}

function resetForm() {
  Object.assign(form, { id: null, title: '', category: '', tags: '', summary: '', content: '' })
}

function openCreate() {
  resetForm()
  dialogVisible.value = true
}

function openDetail(item) {
  detailItem.value = item
  detailVisible.value = true
}

function editItem(row) {
  Object.assign(form, row)
  detailVisible.value = false
  dialogVisible.value = true
}

function reorderNotes(sourceIndex, targetIndex) {
  if (sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0) {
    return
  }
  const next = [...tableData.value]
  const [moved] = next.splice(sourceIndex, 1)
  next.splice(targetIndex, 0, moved)
  tableData.value = next
  writeOrder(next)
  syncSelected()
}

function handleDragStart(id) {
  dragState.id = id
}

function handleDragOver(index) {
  dragState.overIndex = index
}

function handleDrop(index) {
  const sourceIndex = tableData.value.findIndex((item) => item.id === dragState.id)
  reorderNotes(sourceIndex, index)
  handleDragEnd()
}

function handleDragEnd() {
  dragState.id = null
  dragState.overIndex = -1
}

async function loadData() {
  const data = await noteApi.pageNotes({
    current: pagination.current,
    size: pagination.size,
    ...query
  })
  const records = sortBySavedOrder(data.records || [])
  tableData.value = records
  pagination.total = data.total || 0
  syncSelected()
}

function changePage(page) {
  pagination.current = page
  loadData()
}

async function submit() {
  await formRef.value.validate()
  submitting.value = true
  try {
    const payload = {
      title: form.title,
      category: form.category,
      tags: form.tags,
      summary: form.summary,
      content: form.content
    }
    if (form.id) {
      await noteApi.updateNote(form.id, payload)
      ElMessage.success('笔记更新成功')
    } else {
      await noteApi.createNote(payload)
      ElMessage.success('笔记创建成功')
    }
    dialogVisible.value = false
    await loadData()
  } finally {
    submitting.value = false
  }
}

async function removeItem(id) {
  await ElMessageBox.confirm('确定删除这条笔记吗？', '删除确认', { type: 'warning' })
  await noteApi.deleteNote(id)
  ElMessage.success('删除成功')
  if (detailItem.value?.id === id) {
    detailVisible.value = false
    detailItem.value = null
  }
  await loadData()
}

onMounted(loadData)
</script>

<style scoped>
.page-action-row {
  justify-content: space-between;
  margin-bottom: 18px;
}

.notes-page-shell {
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

.notes-layout {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(380px, 0.92fr);
  gap: 16px;
  align-items: start;
}

.list-panel,
.preview-panel {
  padding: 18px;
  height: 100%;
  min-height: 0;
}

.list-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.panel-title {
  font-size: 20px;
  font-weight: 700;
}

.panel-subtitle {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.notes-list {
  display: grid;
  gap: 10px;
  flex: 1;
  min-height: 0;
  align-content: start;
  align-items: start;
}

.note-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  min-height: 58px;
  padding: 12px 16px;
  border-radius: 18px;
  border: 1px solid var(--app-border);
  background: linear-gradient(155deg, color-mix(in srgb, var(--app-panel-strong) 88%, transparent), var(--app-panel));
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.07);
  cursor: grab;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.note-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 30px rgba(15, 23, 42, 0.1);
}

.note-row.active {
  border-color: color-mix(in srgb, var(--app-accent-2) 55%, var(--app-border));
  box-shadow: 0 18px 34px color-mix(in srgb, var(--app-accent-2) 18%, transparent);
}

.note-row.dragging {
  opacity: 0.68;
}

.note-row-handle {
  color: var(--el-text-color-placeholder);
  font-size: 20px;
  line-height: 1;
  letter-spacing: 2px;
}

.note-row-main {
  min-width: 0;
}

.note-row-line {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-row-title {
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.note-row-summary {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--app-text-soft);
  font-size: 13px;
}

.note-row-divider {
  flex-shrink: 0;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--app-text-soft);
  opacity: 0.7;
}

.note-meta-chip {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--app-accent-2) 12%, transparent);
  color: color-mix(in srgb, var(--app-accent-2) 76%, var(--app-text));
  font-weight: 600;
  font-size: 12px;
}

.note-tag {
  flex-shrink: 0;
  margin: 0;
}

.note-row-side {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.note-row-time {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  white-space: nowrap;
}

.note-actions {
  display: flex;
  justify-content: flex-end;
  gap: 2px;
}

.pagination-wrap {
  padding-top: 18px;
  margin-top: 12px;
}

.preview-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.preview-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.preview-detail-button {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 1;
}

.preview-title {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.25;
  margin-top: 0;
  padding-right: 72px;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0 16px;
}

.preview-content {
  margin-top: 18px;
  padding-right: 8px;
  flex: 1;
  min-height: 0;
  overflow: auto;
  line-height: 1.9;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.detail-title {
  font-size: 24px;
  font-weight: 800;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.detail-time {
  margin-left: auto;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.detail-summary {
  margin-bottom: 18px;
  color: var(--el-text-color-regular);
  line-height: 1.75;
}

.detail-content {
  max-height: 70vh;
  overflow: auto;
  padding-right: 10px;
  line-height: 1.9;
}

@media (max-width: 1280px) {
  .note-row {
    grid-template-columns: auto minmax(0, 1fr);
    align-items: start;
  }

  .note-row-side {
    grid-column: 2;
    justify-content: space-between;
    margin-top: 8px;
  }
}

@media (max-width: 1100px) {
  .notes-layout {
    grid-template-columns: 1fr;
    overflow: auto;
  }

  .detail-header {
    flex-direction: column;
  }

  .detail-time {
    margin-left: 0;
  }
}

@media (max-width: 720px) {
  .note-row-line {
    flex-wrap: nowrap;
  }

  .note-row-side {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .note-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

html.dark .note-row {
  background: linear-gradient(155deg, rgba(20, 31, 46, 0.96), rgba(12, 20, 31, 0.9));
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.28);
}

html.dark .note-row:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.34);
}
</style>
